import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import fetch from 'node-fetch'; // Ensure you have this installed or use another method to make HTTP requests
import clientPromise from '../../lib/mongodb';
import AWS from "aws-sdk";

// Configure the AWS SDK with DigitalOcean Spaces information
const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY,
  secretAccessKey: process.env.DO_SECRET_KEY
});

async function uploadToSpace(imageBuffer, fileName, bucketName, folderName) {
    return new Promise((resolve, reject) => {
      const filePath = folderName + "/" + fileName
      const params = {
        Body: imageBuffer,
        Bucket: bucketName,
        Key: filePath,
        ACL: "public-read", // Making the image publicly accessible
      }

      s3.putObject(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(
            // Return the CDN endpoint for better UX
            `https://${bucketName}.fra1.cdn.digitaloceanspaces.com/${filePath}`
          )
        }
      })
    })
  }

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res)
  const client = await clientPromise
  const db = client.db("SDDesigner")
  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub,
  })

  // if (!userProfile?.availableTokens) {
  //     res.status(403).send("Forbidden: Not enough tokens available.");
  //     return;
  // }

  const API_ENDPOINT = process.env.API_URL + "/sdapi/v1/txt2img"
  const { imageDescription, imageName } = req.body

  if (!imageDescription && !imageName) {
    res.status(422)
    return
  }

  // if (topic.length > 80) {
  //   res.status(422)
  //   return
  // }

  // const requestBody = {
  //   prompt: `children's illustration style, ${imageDescription}, cinematic photo, 4k, highly detailed, uhd image, intricate details, detailed scene background, detailed, 8k, trending, amazing art, colorful, <lora:child_illustration_book_sdxl:1>`,
  //   negative_prompt: "easynegativev2 ng_deepnegative_v1_75t",
  //   steps: 35,
  //   cfg_scale: 7,
  //   width: 768,
  //   height: 768,
  //   restore_faces: true,
  //   sampler_index: "DPM++ SDE Karras",
  // }
  const requestBody = {
    enable_hr: true,
    denoising_strength: 0.6,
    hr_scale: 2,
    hr_upscaler: "R-ESRGAN 4x+ Anime6B",
    hr_second_pass_steps: 20,
    hr_resize_x: 0,
    hr_resize_y: 0,
    hr_sampler_name: "",
    hr_prompt: "",
    hr_negative_prompt: "",
    prompt: `${imageDescription}`,
    negative_prompt:
      "(nsfw:1.5),verybadimagenegative_v1.3,ng_deepnegative_v1_75t,(ugly face:0.8),cross-eyed,sketches,(worst quality:2),(low quality:2),(normal quality:2),lowres,normal quality,((monochrome)),((grayscale)),skin spots,acnes,skin blemishes,bad anatomy,nsfw,, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    seed: -1,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: -1,
    seed_resize_from_w: -1,
    sampler_name: "Euler a",
    batch_size: 1,
    n_iter: 1,
    steps: 20,
    cfg_scale: 7,
    width: 512,
    height: 768,
    restore_faces: true,
    tiling: false,
    do_not_save_samples: false,
    do_not_save_grid: false,
    eta: 0,
    s_min_uncond: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: {},
    override_settings_restore_afterwards: true,
    script_args: [],
    sampler_index: "Euler a",
    script_name: "",
    send_images: true,
    save_images: false,
    alwayson_scripts: {},
  }

  // Sending request to the new API endpoint
  const imageResponse = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  if (!imageResponse.ok) {
    res.status(500).send("Failed to generate the image.")
    return
  }

  const responseBody = await imageResponse.json()
  // Convert the base64 image to a buffer
  const imageBuffer = Buffer.from(responseBody.images[0], "base64")

  // Generate a unique filename for the image
  const fileName = imageName + `.jpg`

  // Use the user's DO Space bucket name or a default bucket name
  //   const bucketName = userProfile.bucketName || "default-bucket-name";
  const bucketName = "storyforge"
  const folderName = userProfile.folderName

  // Upload the image to DigitalOcean Spaces
  const imageCDNUrl = await uploadToSpace(
    imageBuffer,
    fileName,
    bucketName,
    folderName
  )

  // Save the image link and other relevant info in MongoDB
  const imageDocument = await db.collection("images").insertOne({
    imageLink: imageCDNUrl,
    userId: userProfile._id,
    imageName: imageName || "",
    imageDescription: imageDescription || "",
    imageMeta: JSON.parse(responseBody.info) || "",
    created: new Date(),
    // You can add more fields from responseBody.info or other sources as needed
  })

  //  Deduct a token from the user's availableTokens once image generated successfully

  try {
    await db.collection("users").updateOne(
      {
        auth0Id: user.sub,
      },
      {
        $inc: {
          availableTokens: -1,
        },
      }
    )

    res.status(200).json({
      // image_base64: responseBody.images[0],
      imageLink: imageCDNUrl,
      // image_info: responseBody.info,
      imageId: imageDocument.insertedId,
    })
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces:", error)
    res.status(500).send("Failed to upload image to DigitalOcean Spaces.")
  }
});

