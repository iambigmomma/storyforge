import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ObjectId } from 'mongodb';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import ImagesContext from "../../context/imagesContext";
import clientPromise from '../../lib/mongodb';
import { getAppProps } from '../../utils/getAppProps';
import Image from "next/image";
import Head from "next/head"



export default function Post(props) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false)

  const { deleteImage } = useContext(ImagesContext);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deleteImage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ imageId: props.id, imageLink: props.imageLink }),
      })
      const json = await response.json();

      if (json.success) {
        deleteImage(props.id);
        router.replace(`/image/new`);
      }
    } catch (e) {
          console.error("Error in handleDeleteConfirm:", e)
    }
  };

  return (
    <div>
      <Head>
        <title>{props.imageName} | StoryForge</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="relative flex flex-col items-center justify-center flex-1 p-4">
        <div>
          <div className="p-2 mt-6 text-sm text-center">
            <h1>{props.imageName}</h1>
          </div>
          {/* <div className="p-2 mt-6 text-sm text-center rounded-sm bg-stone-200"> */}
          <p>{props.imageDescription}</p>
          {/* </div> */}
        </div>
        <div className="mb-4" onClick={() => setShowModal(true)}>
          <Image
            src={props.imageLink}
            alt="Generated Image"
            width={512}
            height={512}
            layout="intrinsic"
            quality={100}
          />
        </div>
        {props.imageLink && (
          <button
            className="btn"
            style={{ width: "fit-content" }}
            onClick={() => {
              const link = document.createElement("a")
              link.href = props.imageLink
              link.download = props.imageCreated + ".jpg"
              link.click()
            }}>
            Download Image
          </button>
        )}
        {/* Image Modal */}
        {showModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* You can customize the modal styles further if needed */}
            <div className="p-4 bg-white rounded shadow-lg">
              <Image
                src={props.imageLink}
                alt={props.imageCreated + ".jpg"}
                width={768}
                height={768}
                layout="intrinsic"
                quality={100}
              />
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      <div className="h-full overflow-auto">
        <div className="max-w-screen-sm mx-auto">
          <div dangerouslySetInnerHTML={{ __html: props.postContent || "" }} />
          <div className="my-4">
            {!showDeleteConfirm && (
              <button
                className="bg-red-600 btn hover:bg-red-700"
                onClick={() => setShowDeleteConfirm(true)}>
                Delete image
              </button>
            )}
            {!!showDeleteConfirm && (
              <div>
                <p className="p-2 text-center bg-red-300">
                  Are you sure you want to delete this image? This action is
                  irreversible
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn bg-stone-600 hover:bg-stone-700">
                    cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 btn hover:bg-red-700">
                    confirm delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("SDDesigner")
    const user = await db.collection('users').findOne({
      auth0Id: userSession.user.sub,
    });
    const image = await db.collection('images').findOne({
      _id: new ObjectId(ctx.params.imageId),
      userId: user._id,
    });
    // console.log(image)

    if (!image) {
      return {
        redirect: {
          destination: '/image/new',
          permanent: false,
        },
      };
    }

    return {
      props: {
        id: ctx.params.imageId,
        imageName: image.imageName,
        imageDescription: image.imageDescription,
        imageLink: image.imageLink,
        imageCreated: image.created.toString(),
        ...props,
      },
    }
  },
});
