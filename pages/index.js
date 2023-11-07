import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import HeroImage from '../public/tum-background.jpg';
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
      <Image src={HeroImage} alt="Hero" fill className="absolute" />
      <div className="relative z-10 max-w-screen-sm px-10 py-5 text-center text-white rounded-md bg-slate-900/90 backdrop-blur-sm">
        <Logo />
        <p>
          Where Your Words Transmute into Vivid Adventures. Craft child
          illustration stories effortlessly with the magic of AI and let your
          imagination roam free
        </p>
        <Link href="/image/new" className="text-center btn">
          Begin
        </Link>
      </div>
    </div>
  )
}
