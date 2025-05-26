import type { FC } from 'react'
import { Link } from 'react-router'
import { isWarmHue } from '@/utils'

interface LabelItemProps {
  id: string
  name: string
  color: string
}

const LabelItem: FC<LabelItemProps> = ({ name, color }) => {
  return (
    <Link
      to={`/search-result?label=${name}&type=work&sortType=new`}
      className="h-10 flex flex-shrink-0 cursor-pointer select-none items-center rd-1 px-6 text-sm hover:opacity-80"
      style={{ backgroundColor: color }}
    >
      <span className={`${isWarmHue(color) ? 'color-neutral-900' : 'color-white'}`}>
        #
        {name}
      </span>
    </Link>
  )
}

export default LabelItem
