import { useRouter } from "next/router"
import React, { useCallback, useReducer, useState } from "react"

const ImagesContext = React.createContext({})

export default ImagesContext

function imagesReducer(state, action) {
  switch (action.type) {
    case "addImages": {
      const newImages = [...state]
      action.images.forEach((image) => {
        const exists = newImages.find((i) => i._id === image._id)
        if (!exists) {
          newImages.push(image)
        }
      })
      return newImages
    }
    case "deleteImage": {
      const newImages = []
      state.forEach((image) => {
        if (image._id !== action.imageId) {
          newImages.push(image)
        }
      })
      return newImages
    }
    default:
      return state
  }
}

export const ImagesProvider = ({ children }) => {
  const [images, dispatch] = useReducer(imagesReducer, [])
  const [noMoreImages, setNoMoreImages] = useState(false)

  const deleteImage = useCallback((imageId) => {
    dispatch({
      type: "deleteImage",
      imageId,
    })
  }, [])

  const setImagesFromSSR = useCallback((imagesFromSSR = []) => {
    dispatch({
      type: "addImages",
      images: imagesFromSSR,
    })
  }, [])

  const getImages = useCallback(
    async ({ lastImageDate, getNewerImages = false }) => {
      const result = await fetch(`/api/getImages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ lastImageDate, getNewerImages }),
      })
      const json = await result.json()
      console.log("*******************/api/getImages*******************")
      console.log(json)
      const imagesResult = json.images || []
      if (imagesResult.length < 5) {
        setNoMoreImages(true)
      }
      dispatch({
        type: "addImages",
        images: imagesResult,
      })
    },
    []
  )

  return (
    <ImagesContext.Provider
      value={{
        images,
        setImagesFromSSR,
        getImages,
        noMoreImages,
        deleteImage,
      }}>
      {children}
    </ImagesContext.Provider>
  )
}
