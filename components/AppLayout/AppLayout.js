import { useUser } from "@auth0/nextjs-auth0/client"
import { faBars, faCoins, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import ImagesContext from "../../context/imagesContext"
import { Logo } from "../Logo"
import Head from "next/head"

export const AppLayout = ({
  children,
  availableTokens,
  images: imagesFromSSR,
  imageId,
  imageCreated,
}) => {
  const { user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { setImagesFromSSR, images, getImages, noMoreImages } =
    useContext(ImagesContext)

  useEffect(() => {
    setImagesFromSSR(imagesFromSSR)
    if (imageId) {
      const exists = imagesFromSSR.find((image) => image._id === imageId)
      if (!exists) {
        getImages({ getNewerImages: true, lastImageDate: imageCreated })
      }
    }
  }, [imagesFromSSR, setImagesFromSSR, imageId, imageCreated, getImages])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const closeMenu = () => setIsMenuOpen(false)

  const menuContent = () => (
    <>
      <Logo />
      <Link href="/image/new" className="mt-4 btn" onClick={closeMenu}>
          New Scene
      </Link>
      <Link href="/token-topup" className="block mt-2 text-center" onClick={closeMenu}>
          <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
          <span className="pl-1">{availableTokens} tokens available</span>
      </Link>
      {images.map((image) => (
        <Link key={image._id} href={`/image/${image._id}`}
            onClick={closeMenu}
            className={`py-1 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 ${
              imageId === image._id ? "bg-white/20 border-white" : "bg-white/10"
            } cursor-pointer rounded-sm text-white`}>
            {image.imageName} : {image.imageDescription}
        </Link>
      ))}
      {images.length > 0 && !noMoreImages && (
        <a
          onClick={() => {
            getImages({ lastImageDate: images[images.length - 1].created })
            closeMenu()
          }}
          className="mt-4 text-sm text-center text-white cursor-pointer hover:underline">
          Load more images
        </a>
      )}
      <div className="flex items-center h-20 gap-2 px-2 text-white border-t">
        {!!user ? (
          <>
            <div className="min-w-[50px]">
              <Image
                src={user.picture}
                alt={user.name}
                height={50}
                width={50}
                className="rounded-full"
              />
            </div>
            <div className="flex-1">
              <div className="font-bold">{user.email}</div>
              <Link href="/api/auth/logout"
                onClick={closeMenu} className="text-sm">
                  Logout
                
              </Link>
            </div>
          </>
        ) : (
          <Link href="/api/auth/login"
            onClick={closeMenu} className="text-sm">
              Login
            
          </Link>
        )}
      </div>
    </>
  )

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden md:flex-row">
      <Head>
        <title>
          StoryForge | Craft child illustration stories effortlessly
        </title>
      </Head>
      {/* Mobile Header */}
      <div className="z-20 flex flex-col items-center w-full p-4 text-white bg-slate-800 md:hidden">
        {/* Menu Button */}
        <button
          className="flex items-center justify-center mb-4"
          onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} className="cursor-pointer" />
          <span className="ml-2 font-semibold">{!isMenuOpen && "MENU"}</span>
        </button>
        {/* Logo */}
        <Logo className="mb-4" />
      </div>

      {/* Overlay menu for small screens */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center text-white bg-slate-800 md:hidden">
          <div className="flex justify-end w-full p-4">
            <button onClick={closeMenu}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="w-full max-w-xs p-4 overflow-y-auto">
            {menuContent()}
          </div>
        </div>
      )}

      {/* Sidebar for large screens */}
      <div
        className={`hidden md:flex md:flex-col md:w-80 md:h-full bg-slate-800 text-white ${
          isMenuOpen ? "hidden" : ""
        }`}>
        {menuContent()}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto md:overflow-hidden">{children}</div>
    </div>
  )
}
