import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import { ObjectId } from "mongodb"
import clientPromise from "../../lib/mongodb"
import AWS from "aws-sdk"

// Configure the Spaces endpoint
const spacesEndpoint = new AWS.Endpoint("fra1.digitaloceanspaces.com") // Change this based on your region

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_ACCESS_KEY, // Make sure to have these keys stored securely
  secretAccessKey: process.env.DO_SECRET_KEY,
})

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const {
      user: { sub },
    } = await getSession(req, res)
    const client = await clientPromise
    const db = client.db("SDDesigner")
    const userProfile = await db.collection("users").findOne({
      auth0Id: sub,
    })

    const { imageId, imageLink } = req.body

    // Delete the image from the database
    await db.collection("images").deleteOne({
      userId: userProfile._id,
      _id: new ObjectId(imageId),
    })

    // Extract the file key from the image link. Assuming the link is something like https://your-space-name.nyc3.digitaloceanspaces.com/filename.extension
    const fileKey = imageLink.split("/").pop()

    // Delete the image from DigitalOcean Spaces
    await s3
      .deleteObject({
        Bucket: "child-illustration-book", // Replace with your space's name
        Key: fileKey,
      })
      .promise()

    res.status(200).json({ success: true })
  } catch (e) {
    console.log("ERROR TRYING TO DELETE AN IMAGE: ", e)
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
})
