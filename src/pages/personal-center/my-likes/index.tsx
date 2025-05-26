import type { FC } from 'react'
import { use, useEffect, useState } from 'react'
import { getUserLikeWorksTotalAPI } from '@/apis'
import WorkList from '@/components/personal-center/work-list'

import { PersonalContext } from '..'

const MyLikes: FC = () => {
  const { userId } = use(PersonalContext)

  const [workCount, setWorkCount] = useState<number>(0)

  const getLikeWorkCount = async () => {
    try {
      const { data } = await getUserLikeWorksTotalAPI({ id: userId! })
      setWorkCount(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getLikeWorkCount()
  }, [userId])

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-10px py-5">
        <span className="select-none title">最近喜欢</span>
        <div className="rd-full bg-neutral px-6px py-3px text-sm color-white font-bold">
          <span>{workCount}</span>
        </div>
      </div>
      <WorkList workCount={workCount} getWorkCount={getLikeWorkCount} />
    </div>
  )
}

export default MyLikes
