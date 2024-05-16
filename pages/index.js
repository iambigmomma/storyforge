import Image from "next/image"
import Link from "next/link"
import { Logo } from "../components/Logo"
import HeroImage from "../public/deploy-24-cover.png"
import Head from "next/head"

export default function Home() {
  return (
    <div className="relative flex items-center justify-center w-screen h-screen overflow-hidden">
      <Head>
        <title>
          StoryForge | Craft child illustration stories effortlessly
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Ensure that the parent div of Image is relative and fills the screen */}
      <div className="absolute inset-0 z-0">
        {/* The Image component will fill the parent div while maintaining its aspect ratio */}
        <Image
          src={HeroImage}
          alt="Hero"
          layout="fill"
          objectFit="cover" // This will cover the entire area of the container without stretching
          quality={100} // Adjust the quality if needed
          priority // Preload the image on the page
        />
      </div>
      {/* Content */}
      <div className="relative z-10 max-w-screen-sm px-10 py-5 text-center text-white rounded-md bg-slate-900/90 backdrop-blur-sm">
        <Logo />
        <p className="mb-5">
          Where Your Words Transmute into Vivid Adventures. Craft child
          illustration stories effortlessly with the magic of AI and let your
          imagination roam free.
        </p>
        <Link href="/image/new" className="inline-block px-6 py-3 text-sm font-bold leading-none text-white bg-blue-500 rounded hover:bg-blue-600">
            Begin
          
        </Link>
      </div>
    </div>
  )
}
