import { getSession } from "@auth0/nextjs-auth0"
import clientPromise from "../lib/mongodb"

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
    // Insert a new user document into the 'users' collection
    const newUser = {
      auth0Id: userSession.user.sub,
      availableTokens: 3, // Assign 3 trial tokens
      createdAt: new Date(),
      email: userSession.user.email
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
  }
}
