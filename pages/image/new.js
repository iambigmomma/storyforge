import { withPageAuthRequired } from "@auth0/nextjs-auth0"
import { useRouter } from "next/router"
import { useState } from "react"
import { AppLayout } from "../../components/AppLayout"
import { getAppProps } from "../../utils/getAppProps"
import { Carousel } from "react-responsive-carousel"
import { ToastContainer, toast } from "react-toastify"
import "react-responsive-carousel/lib/styles/carousel.min.css" // requires a loader
import "react-toastify/dist/ReactToastify.css"
import logo from "../../public/generating-icon.png"
import Image from "next/image"
import Head from "next/head"


export default function NewImage(props) {
  const router = useRouter()
  const defaultImageName = ""
  const defaultDescription = ""
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
  // Define your example prompts
  const prompts = [
    {
      title: "A Surging Destiny",
      description:
        "Lilo, amidst the vivid greenery of the tranquil Fantasialand countryside, experiences a surge of destiny as she stumbles upon a mysteriously glowing ringlet by her cozy hobbit burrow.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/A_Surging_Destiny.jpg",
    },
    {
      title: "The Elder's Lore",
      description:
        "In the warmth of a hobbit's home, brimming with ancient lore, Gandolfin the elder unfurls the storied past of the powerful ringlet to a wide-eyed Lilo, surrounded by towering stacks of books and age-old maps.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/The_Elder's_Lore.jpg",
    },
    {
      title: "A Monumental Quest",
      description:
        "The courageous hobbit quartet, Lilo, Sammie, Perrin, and Merrybell, embark on their monumental quest along a winding road, casting long shadows as they wave farewell, the Mystic Mountain looming on the horizon.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/A_Monumental_Quest.jpg",
    },
    {
      title: "Whispering Woods",
      description:
        "Beneath the ancient boughs of a whispering forest, Lilo's band is joined by the noble guardians Aragorn, Legolass, and Gimlix, standing as unyielding sentinels ready to protect the valiant fellowship.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/Whispering_Woods.jpg",
    },
    {
      title: "Evasion of Shadows",
      description:
        "Through an eerie, mist-shrouded wood, Lilo and her friends narrowly evade the ghostly Hollow Shadows, whose silhouettes flicker between the trees, under the watchful eyes of nocturnal owls.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/Evasion_of_Shadows.jpg",
    },
    {
      title: "The Cave of Crystals",
      description:
        "In a cavern aglow with ethereal crystals, the entrancing Golluma weaves a web of temptation around the ringlet, her eyes reflecting a deceptive sparkle as compelling as the cave’s luminous allure.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/The_Cave_of_Crystals.jpg",
    },
    {
      title: "Clash at Mystic Mountain",
      description:
        "Amidst a tumultuous landscape at the Mystic Mountain's base, Lilo and her allies clash with Mordoreon’s sinister forces, the air ablaze with magical fire, as the fate of the kingdom hangs in the balance.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/Clash_at_Mystic_Mountain.jpg",
    },
    {
      title: "Vanquishing Darkness",
      description:
        "Atop the Mystic Mountain's majestic peak, Lilo, with a mixture of awe and relief, releases the ringlet into the mountain's heart, vanquishing its binding magic as a surge of pure light sweeps the encroaching darkness away.",
      cover:
        "https://storyforge.fra1.cdn.digitaloceanspaces.com/cover/Vanquishing_Darkness.jpg",
    },
  ]

  // Function to copy prompt to the form and notify user
  const handlePromptSelection = (prompt) => {
    setImageDescription(prompt.description)
    setImageName(prompt.title)
    toast("Copied & Pasted!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
    })
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
          <button type="submit" className="btn" disabled={!imageDescription}>
            Generate
          </button>
        </form>
      </div>
      {/* Prompt Examples Section */}
      <label className="block text-center">
        <h3>Inspire by Masterpiece</h3>
        <div style={{ maxWidth: "80%", margin: "auto"}}>
          <p>(Tap to paste)</p>
        </div>
      </label>
      <div
        className="carousel-container"
        style={{ maxWidth: "80%", margin: "auto" }}>
        <Carousel
          showArrows={true}
          emulateTouch={true}
          showStatus={false}
          showIndicators={false}
          showThumbs={false}
          infiniteLoop={true}
          centerMode={true} // Enable center mode
          centerSlidePercentage={33.3333} // Each slide takes up 1/3 of the container
          className="example-prompts-carousel">
          {prompts.map((prompt, index) => (
            <div
              key={index}
              className="carousel-card"
              onClick={() => handlePromptSelection(prompt)}>
              <p className="carousel-title">{prompt.title}</p>{" "}
              {/* Title above the image */}
              <Image
                src={prompt.cover}
                alt={`${prompt.title} cover`}
                width={256}
                height={384}
                objectFit="contain"
                quality={100}
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* Toast Notification */}
      <ToastContainer />
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

