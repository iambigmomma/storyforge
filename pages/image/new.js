import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { useRouter } from "next/router"
import { useState } from "react"
import { AppLayout } from "../../components/AppLayout"
import { getAppProps } from "../../utils/getAppProps"
import logo from "../../public/generating-icon.png"
import Image from "next/image"

export default function NewPost(props) {
  const router = useRouter()
  const defaultImageName = `Simba's Magican Voyage Chapter2`
  const defaultDescription = `Description: Harry Simba learns magic with his friends Hermione Nala and Ron Zazu.
Background: A spacious classroom filled with animals casting various spells with their magic wands.`

  const [imageDescription, setImageDescription] = useState(defaultDescription)
  const [imageName, setImageName] = useState(defaultImageName)
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [generatedImageInfo, setGeneratedImageInfo] = useState(null)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const response = await fetch(`/api/generateImage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ imageDescription, imageName }),
      })
      const json_response = await response.json()
      if (json_response?.imageId) {
        router.push(`/image/${json_response.imageId}`)
        // setGeneratedImage(json_response.imageLink)
        // setGeneratedImageInfo(JSON.parse(json_response.image_info))
        // console.log(JSON.parse(json_response.image_info))
        // setGenerating(false)
      }
    } catch (e) {
      setGenerating(false)
    }
  }

return (
  <div className="flex flex-col h-full overflow-hidden">
    {/* Form Section */}
    <div className="p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-screen-sm m-auto border rounded-md shadow-xl bg-slate-100 border-slate-200 shadow-slate-200">
        <div>
          <label className="block text-center">
            <strong>Scene name</strong>
          </label>
          <textarea
            className="block w-full px-4 py-2 my-2 border rounded-sm resize-none border-slate-500"
            value={imageName}
            placeholder="Enter image name here..."
            onChange={(e) => setImageName(e.target.value)}
            maxLength={40}
          />
          <label className="block text-center">
            <strong>Dreams in Every Word</strong>
          </label>
          <textarea
            className="block w-full px-4 py-2 my-2 border rounded-sm resize-none border-slate-500"
            value={imageDescription}
            placeholder="Enter image description here..."
            onChange={(e) => setImageDescription(e.target.value)}
            maxLength={300}
            rows="6"
          />
        </div>
        <button
          type="submit"
          className="btn"
          disabled={!imageDescription.trim()}>
          Generate
        </button>
      </form>
    </div>

    {/* Image Preview Section */}
    <div className="relative flex flex-col items-center justify-center flex-1 p-4">
      {/* {generatedImage && (
        <div className="mb-4" onClick={() => setShowModal(true)}>
          <Image
            // src={`data:image/png;base64,${generatedImage}`}
            src={generatedImage}
            alt="Generated Image"
            width={512}
            height={512}
            layout="intrinsic"
            quality={100}
          />
        </div>
      )} */}
      {generating && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center w-full h-full text-blue-500 bg-white bg-opacity-50 animate-pulse">
          <Image src={logo} width={200} height={200} alt="logo" />
          <h6>Generating...</h6>
        </div>
      )}
    </div>
  </div>
)
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx)

    if (!props.availableTokens) {
      return {
        redirect: {
          destination: "/token-topup",
          permanent: false,
        },
      }
    }

    return {
      props,
    }
  },
})

