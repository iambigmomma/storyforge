import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../lib/mongodb';

export const getAppProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);
  const client = await clientPromise;
  const db = client.db('SDDesigner');
  const user = await db.collection('users').findOne({
    auth0Id: userSession.user.sub,
  });

  if (!user) {
    return {
      availableTokens: 0,
      images: [],
    };
  }

  const images = await db
    .collection('images')
    .find({
      userId: user._id,
    })
    .limit(5)
    .sort({
      created: -1,
    })
    .toArray();

  return {
    availableTokens: user.availableTokens,
    images: images.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    })),
    imageId: ctx.params?.imageId || null,
  };
};
