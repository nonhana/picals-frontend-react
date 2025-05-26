import type { FC } from 'react'
import { Link } from 'react-router'
import { isWarmHue } from '@/utils'

import LazyImg from '../lazy-img'

interface LabelImgItemProps {
  id: string
  name: string
  color: string
  cover: string | null
}

const LabelImgItem: FC<LabelImgItemProps> = ({ name, color, cover }) => {
  return (
    <Link
      to={`/search-result?label=${name}&type=work&sortType=new`}
      className="relative h-118px w-118px flex flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rd-6px hover:opacity-80"
    >
      <LazyImg
        src={
          cover
          || `https://fakeimg.pl/200x200/${color.slice(1)}/${isWarmHue(color) ? '3d3d3d' : 'ffffff'}?retina=1&font=noto&text=${name}`
        }
        alt={name}
      />
      <div className="absolute left-0 top-0 h-118px w-118px bg-black opacity-32" />
      <div className="absolute bottom-20px w-full flex justify-center px-1 text-sm color-white font-bold">
        <span className="break-all">
          #
          {name}
        </span>
      </div>
    </Link>
  )
}

export default LabelImgItem
