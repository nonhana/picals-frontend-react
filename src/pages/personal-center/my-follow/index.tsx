import type { FC } from 'react'
import { use, useEffect, useState } from 'react'
import { getFollowingTotalAPI } from '@/apis'
import UserList from '@/components/personal-center/user-list'

import { PersonalContext } from '..'

const MyFollow: FC = () => {
  const { userId, width } = use(PersonalContext)

  const [total, setTotal] = useState(0) // 用户总数

  const getFollowingTotal = async () => {
    try {
      const { data } = await getFollowingTotalAPI({ id: userId })
      setTotal(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getFollowingTotal()
  }, [userId])

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-10px py-5">
        <span className="select-none title">关注列表</span>
        <div className="rd-full bg-neutral px-6px py-3px text-sm color-white font-bold">
          <span>{total}</span>
        </div>
      </div>
      <UserList width={width} total={total} />
    </div>
  )
}

export default MyFollow
