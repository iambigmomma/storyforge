import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import {
  faHashtag,
  faMagnifyingGlass,
  faTimes,
  faDownload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"

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
  const router = useRouter()
  // Function to close the delete confirmation modal
  const closeDeleteConfirmModal = () => setShowDeleteConfirm(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const { deleteImage } = useContext(ImagesContext)

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deleteImage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ imageName: props.imageName, imageId: props.id }),
      })
      const json = await response.json()

      if (json.success) {
        deleteImage(props.id)
        router.replace(`/image/new`)
      }
    } catch (e) {
      console.error("Error in handleDeleteConfirm:", e)
    }
  }

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
        {/* Image Preview Section with Icons */}
        <div className="relative mb-4 image-container">
          {/* Magnifier Icon */}
          <div className="absolute right-10 top-2">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="lg"
              className="text-white cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </div>
          {/* Download Icon */}
          {props.imageLink && (
            <div className="absolute right-2 top-2">
              <FontAwesomeIcon
                icon={faDownload}
                size="lg"
                className="text-white cursor-pointer"
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = props.imageLink
                  link.download = props.imageCreated + ".jpg"
                  link.click()
                }}
              />
            </div>
          )}
          <Image
            className="rounded-lg cursor-pointer"
            src={props.imageLink}
            alt="Generated Image"
            width={384}
            height={576}
            layout="intrinsic"
            quality={100}
          />
          {/* Trash Icon */}
          <FontAwesomeIcon
            icon={faTrash}
            size="lg"
            className="absolute p-1 text-red-600 bg-white rounded-full bottom-2 right-2"
            onClick={() => setShowDeleteConfirm(true)}
          />
        </div>
        {/* Overlay Image Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative p-4 bg-white rounded-lg shadow-lg">
              {/* Close Icon */}
              <div
                className="absolute z-10 cursor-pointer right-4 top-4"
                onClick={() => setShowModal(false)}>
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  className="text-white"
                />
              </div>
              <Image
                src={props.imageLink}
                alt={props.imageCreated + ".jpg"}
                width={512}
                height={768}
                layout="intrinsic"
                quality={100}
              />
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 right-4">
        {/* {!showDeleteConfirm && (
          <FontAwesomeIcon
            icon={faTrash}
            size="2x"
            className="text-red-600 cursor-pointer"
            onClick={() => setShowDeleteConfirm(true)}
          />
        )} */}
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative p-4 bg-white rounded-lg shadow-lg">
              {/* Close Overlay
              <div
                className="absolute z-10 cursor-pointer right-4 top-4"
                onClick={closeDeleteConfirmModal}>
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  className="text-black"
                />
              </div> */}
              <div className="text-center">
                <p className="mb-4">
                  Are you sure you want to delete this image? This action is
                  irreversible.
                </p>
                <div className="flex justify-around">
                  <button
                    onClick={closeDeleteConfirmModal}
                    className="px-4 py-2 font-bold text-gray-800 bg-gray-300 rounded-l hover:bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 font-bold text-white bg-red-600 rounded-r hover:bg-red-700">
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
