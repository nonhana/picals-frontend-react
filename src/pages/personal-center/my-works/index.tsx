import type { FC } from 'react'
import { use, useEffect, useState } from 'react'
import { getUserWorksTotalAPI } from '@/apis'
import LabelList from '@/components/personal-center/label-list'
import WorkList from '@/components/personal-center/work-list'

import { PersonalContext } from '..'

const MyWorks: FC = () => {
  const { userId } = use(PersonalContext)

  const [workCount, setWorkCount] = useState<number>(0)

  const getWorkCount = async () => {
    try {
      const { data } = await getUserWorksTotalAPI({ id: userId })
      setWorkCount(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getWorkCount()
  }, [userId])

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-10px py-5">
        <span className="select-none title">插画</span>
        <div className="rd-full bg-neutral px-6px py-3px text-sm color-white font-bold">
          <span>{workCount}</span>
        </div>
      </div>
      <div className="mb-5">
        <LabelList />
      </div>
      <WorkList workCount={workCount} getWorkCount={getWorkCount} />
    </div>
  )
}

export default MyWorks
