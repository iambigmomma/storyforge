import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { useRouter } from "next/router"
import { useState } from "react"
import { AppLayout } from "../../components/AppLayout"
import { getAppProps } from "../../utils/getAppProps"
import logo from "../../public/generating-icon.png"
import Image from "next/image"
import Head from "next/head"


export default function NewImage(props) {
  const router = useRouter()
  const defaultImageName = `The Lady of The Rings Chapter27`
  const defaultDescription = `In the warmth of a hobbit's home, brimming with ancient lore, Gandolfin the elder unfurls the storied past of the powerful ringlet to a wide-eyed Lilo, surrounded by towering stacks of books and age-old maps.`

  const [imageDescription, setImageDescription] = useState(defaultDescription)
  const [imageName, setImageName] = useState(defaultImageName)
  const [generating, setGenerating] = useState(false)


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
      }
    } catch (e) {
      setGenerating(false)
    }
  }

return (
  <div className="relative flex flex-col h-full overflow-hidden">
    <Head>
      <title>New Scene | StoryForge</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    {/* Overlay Section During Generating*/}
    {generating && (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-75">
        <Image src={logo} width={200} height={200} alt="Generating icon" />
        <h6>Generating...</h6>
      </div>
    )}
    {/* Form Section */}
    <div className={`p-4 ${generating ? "opacity-50" : ""}`}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-screen-sm p-4 m-auto border rounded-md shadow-xl bg-slate-100 border-slate-200 shadow-slate-200 md:p-6">
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
  </div>
)
}

NewImage.getLayout = function getLayout(page, pageProps) {
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

