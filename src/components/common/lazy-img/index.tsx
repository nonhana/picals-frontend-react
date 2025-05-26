import type { FC } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AnimatedDiv from '@/components/motion/animated-div'
import ImgLoadingSkeleton from '@/components/skeleton/img-loading'

type LazyImgProps = {
  width?: number | string
  height?: number | string
  imgLoaded?: (url: string) => void
} & React.ImgHTMLAttributes<HTMLImageElement>

const LazyImg: FC<LazyImgProps> = ({
  width = '100%',
  height = '100%',
  imgLoaded,
  className,
  src,
  alt,
}) => {
  const [imgLoading, setImgLoading] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const imgContainerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 },
      )
    })

    if (imgContainerRef.current)
      observer.observe(imgContainerRef.current)

    return () => {
      if (imgContainerRef.current)
        observer.unobserve(imgContainerRef.current)
    }
  }, [])

  return (
    <div
      ref={imgContainerRef}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {isInView && (
        <img
          ref={imgRef}
          className="h-full w-full object-cover"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => {
            setImgLoading(false)
            imgLoaded && src && imgLoaded(src)
          }}
        />
      )}
      <AnimatePresence>
        {imgLoading && (
          <AnimatedDiv type="opacity-gradient" className="absolute left-0 top-0 size-full">
            <ImgLoadingSkeleton />
          </AnimatedDiv>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LazyImg
