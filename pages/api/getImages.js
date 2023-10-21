import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import clientPromise from "../../lib/mongodb"

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

    const { lastImageDate, getNewerImages } = req.body

    const images = await db
      .collection("images")
      .find({
        userId: userProfile._id,
        created: { [getNewerImages ? "$gt" : "$lt"]: new Date(lastImageDate) },
      })
      .limit(getNewerImages ? 0 : 3)
      .sort({ created: -1 })
      .toArray()
    res.status(200).json({ images })
    return
  } catch (e) {
    res.status(500).send({ error: "Internal Server Error", message: e.message })
  }
})
