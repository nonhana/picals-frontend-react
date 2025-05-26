import type { FC } from 'react'
import type { WorkNormalItem } from '@/apis/types'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'

import { Link } from 'react-router'
import AnimatedDiv from '@/components/motion/animated-div'
import LazyImg from '../lazy-img'

interface WaterfallItemProps {
  item: WorkNormalItem
  height: number
  [key: string]: any
}

const WaterfallItem: FC<WaterfallItemProps> = ({ item, height, ...props }) => {
  const [hovering, setHovering] = useState(false)

  return (
    <AnimatedDiv
      type="down-to-up"
      {...props}
      style={{ height }}
      className="relative w-75 cursor-pointer overflow-hidden rd-6"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatePresence>
        {hovering && (
          <AnimatedDiv type="opacity-gradient" className="absolute inset-0 z-1 bg-black/32">
            <Link
              className="size-full flex flex-col items-center justify-center gap-10px text-sm color-white"
              to={`/work-detail/${item.id}`}
            >
              <span>
                作品名称：
                {item.name}
              </span>
              <span>
                转载人：
                {item.authorName}
              </span>
              <span>
                转载时间：
                {item.createdAt}
              </span>
            </Link>
          </AnimatedDiv>
        )}
      </AnimatePresence>
      <LazyImg src={item.cover} alt={item.name} />
    </AnimatedDiv>
  )
}

export default WaterfallItem
