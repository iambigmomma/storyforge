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

async function uploadToSpace(imageBuffer, fileName, bucketName) {
    return new Promise((resolve, reject) => {
      const params = {
        Body: imageBuffer,
        Bucket: bucketName,
        Key: fileName,
        ACL: "public-read", // Making the image publicly accessible
      }

      s3.putObject(params, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(
            // Return the CDN endpoint for better UX
            `https://${bucketName}.fra1.cdn.digitaloceanspaces.com/${fileName}`
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

  const requestBody = {
    prompt: `children's illustration style, ${imageDescription}, cinematic photo, 4k, highly detailed, uhd image, intricate details, detailed scene background, detailed, 8k, trending, amazing art, colorful, <lora:child_illustration_book_sdxl:1>`,
    negative_prompt: "easynegativev2 ng_deepnegative_v1_75t",
    steps: 35,
    cfg_scale: 7,
    width: 768,
    height: 768,
    restore_faces: true,
    sampler_index: "DPM++ SDE Karras",
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
  const imageBuffer = Buffer.from(responseBody.images[0], 'base64');

  // Generate a unique filename for the image
  const fileName = imageName+`.jpg`;

  // Use the user's DO Space bucket name or a default bucket name
//   const bucketName = userProfile.bucketName || "default-bucket-name";
  const bucketName = "child-illustration-book"


  try {
    // // Deduct a token from the user's availableTokens
    await db.collection('users').updateOne(
        {
            auth0Id: user.sub,
        },
        {
            $inc: {
                availableTokens: -1,
            },
        }
    );


    // Upload the image to DigitalOcean Spaces
    const imageCDNUrl = await uploadToSpace(imageBuffer, fileName, bucketName)

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

    res.status(200).json({
      // image_base64: responseBody.images[0],
      imageLink: imageCDNUrl,
      // image_info: responseBody.info,
      imageId: imageDocument.insertedId,
    })
  } catch (error) {
    console.error("Error uploading to DigitalOcean Spaces:", error);
    res.status(500).send("Failed to upload image to DigitalOcean Spaces.");
  }





});

