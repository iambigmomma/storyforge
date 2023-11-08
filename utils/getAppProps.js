// import { getSession } from "@auth0/nextjs-auth0"
// import clientPromise from "../lib/mongodb"

// export const getAppProps = async (ctx) => {
//   const userSession = await getSession(ctx.req, ctx.res)

//   // Check if there is a user session. If not, return early.
//   if (!userSession || !userSession.user) {
//     return {
//       availableTokens: 0,
//       images: [],
//       imageId: ctx.params?.imageId || null,
//     }
//   }

//   const client = await clientPromise
//   const db = client.db("SDDesigner")

//   // Try to find the user in the database.
//   let user = await db.collection("users").findOne({
//     auth0Id: userSession.user.sub,
//   })

//   // If the user does not exist, create them with 3 trial tokens.
//   if (!user) {
//     // Insert a new user document into the 'users' collection
//     const newUser = {
//       auth0Id: userSession.user.sub,
//       availableTokens: 3, // Assign 3 trial tokens
//       createdAt: new Date(),
//       email: userSession.user.email
//     }

//     // Insert the new user into the database
//     const result = await db.collection("users").insertOne(newUser)

//     // Use the insertedId to fetch the new user so we can use it in the return value
//     if (result.insertedId) {
//       user = await db.collection("users").findOne({ _id: result.insertedId })
//     }

//     // If for some reason the user still wasn't created, return default props
//     if (!user) {
//       return {
//         availableTokens: 0,
//         images: [],
//         imageId: ctx.params?.imageId || null,
//       }
//     }
//   }

//   // Fetch the images associated with the user
//   const images = await db
//     .collection("images")
//     .find({
//       userId: user._id,
//     })
//     .limit(5)
//     .sort({
//       created: -1,
//     })
//     .toArray()

//   // Map over the images to format the response
//   const imageProps = images.map(({ created, _id, userId, ...rest }) => ({
//     _id: _id.toString(),
//     created: created.toString(),
//     ...rest,
//   }))

//   // Return the user props
//   return {
//     availableTokens: user.availableTokens,
//     images: imageProps,
//     imageId: ctx.params?.imageId || null,
//   }
// }

import { getSession } from "@auth0/nextjs-auth0"
import clientPromise from "../lib/mongodb"
import AWS from "aws-sdk"



export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res)

  // Check if there is a user session. If not, return early.
  if (!userSession || !userSession.user) {
    return {
      availableTokens: 0,
      images: [],
      imageId: ctx.params?.imageId || null,
    }
  }

  const client = await clientPromise
  const db = client.db("SDDesigner")

  // Try to find the user in the database.
  let user = await db.collection("users").findOne({
    auth0Id: userSession.user.sub,
  })

  // If the user does not exist, create them with 3 trial tokens.
  if (!user) {
    // Setup the DigitalOcean Spaces client
    const spacesEndpoint = new AWS.Endpoint("fra1.digitaloceanspaces.com")
    // Derive folder name from auth0Id by removing the prefix
    const folderName = userSession.user.sub.split("|")[1]

    // const spacesClient = new AWS.S3({
    //   endpoint: spacesEndpoint,
    //   credentials: {
    //     accessKeyId: process.env.DO_ACCESS_KEY, // Set your access key in the environment variables
    //     secretAccessKey: process.env.DO_SECRET_KEY, // Set your secret key in the environment variables
    //   },
    // })

    // // Attempt to create the folder in the bucket
    // try {
    //   await spacesClient.putObject({
    //     Bucket: "storyforge", // Replace with your bucket name
    //     Key: `${folderName}/`, // S3 requires a trailing slash for folders
    //     ACL: "private", // Set the ACL according to your needs
    //   })
    // } catch (error) {
    //   console.error("Error creating folder in DigitalOcean Space:", error)
    //   // Handle error appropriately
    //   // You may want to return or throw an error here
    // }



    // Insert a new user document into the 'users' collection
    const newUser = {
      auth0Id: userSession.user.sub,
      availableTokens: 3, // Assign 3 trial tokens
      createdAt: new Date(),
      email: userSession.user.email,
      folderName: folderName // Replace with the correct URL format for your Space
    }

    // Insert the new user into the database
    const result = await db.collection("users").insertOne(newUser)

    // Use the insertedId to fetch the new user so we can use it in the return value
    if (result.insertedId) {
      user = await db.collection("users").findOne({ _id: result.insertedId })
    }

    // If for some reason the user still wasn't created, return default props
    if (!user) {
      return {
        availableTokens: 0,
        images: [],
        imageId: ctx.params?.imageId || null,
      }
    }
  }

    // Fetch the images associated with the user
    const images = await db
      .collection("images")
      .find({
        userId: user._id,
      })
      .limit(5)
      .sort({
        created: -1,
      })
      .toArray()

    // Map over the images to format the response
    const imageProps = images.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    }))

  // Return the user props
  return {
    availableTokens: user.availableTokens,
    images: imageProps,
    imageId: ctx.params?.imageId || null,
    folderName: user.folderName, // Return the folder name if needed
  }
}
