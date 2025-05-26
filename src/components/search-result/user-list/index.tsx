import type { FC } from 'react'
import type { UserItemInfo } from '@/utils/types'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { likeActionsAPI, searchUserAPI, searchUserTotalAPI, userActionsAPI } from '@/apis'
import Empty from '@/components/common/empty'
import Pagination from '@/components/common/pagination'
import UserItem from '@/components/common/user-item'
import AnimatedDiv from '@/components/motion/animated-div'
import UserListSkeleton from '@/components/skeleton/user-list'
import { useMap } from '@/hooks'
import { decreaseFollowNum, increaseFollowNum } from '@/store/modules/user'

interface UserListProps {
  width: number
  labelName: string
}

const UserList: FC<UserListProps> = ({ width, labelName }) => {
  const dispatch = useDispatch()

  const [userList, setUserList, updateUserList] = useMap<UserItemInfo>([])
  const [total, setTotal] = useState(0)

  const handleFollow = async (id: string) => {
    try {
      await userActionsAPI({ id })
      if (!userList.get(id)!.isFollowing) {
        dispatch(increaseFollowNum())
      }
      else {
        dispatch(decreaseFollowNum())
      }
      updateUserList(id, { ...userList.get(id)!, isFollowing: !userList.get(id)!.isFollowing })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const handleLikeWork = async (userId: string, workId: string) => {
    await likeActionsAPI({ id: workId })
    updateUserList(userId, {
      ...userList.get(userId)!,
      works: userList
        .get(userId)!
        .works!.map(work => (work.id === workId ? { ...work, isLiked: !work.isLiked } : work)),
    })
  }

  /* ----------分页相关--------- */
  const [current, setCurrent] = useState(1)
  const pageSize = 6

  const pageChange = (page: number) => {
    current !== page && setCurrent(page)
  }

  const getUserCount = async () => {
    try {
      const { data } = await searchUserTotalAPI({ keyword: labelName })
      setTotal(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const [searchingUser, setSearchingUser] = useState(true)
  const searchUser = async () => {
    setSearchingUser(true)
    try {
      const { data } = await searchUserAPI({
        keyword: labelName,
        current,
        pageSize,
      })
      setUserList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setSearchingUser(false)
    }
  }

  useEffect(() => {
    getUserCount()
  }, [labelName])

  useEffect(() => {
    searchUser()
  }, [labelName, current])

  return (
    <div className="relative min-h-160 w-full p-5 pb-15">
      <div className="mb-10px w-full flex items-center justify-between">
        <div className="flex items-center gap-10px">
          <div className="text-2xl title">
            <span>用户</span>
          </div>
          <div className="rd-full bg-neutral px-10px py-5px text-sm color-white font-bold">
            <span>{total}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {userList.size !== 0 && !searchingUser && (
          <AnimatedDiv type="opacity-gradient" className="relative w-full flex flex-col gap-20px">
            {Array.from(userList.values()).map(item => (
              <UserItem
                key={item.id}
                {...item}
                width={width}
                follow={handleFollow}
                likeWork={handleLikeWork}
              />
            ))}
          </AnimatedDiv>
        )}

        {userList.size === 0 && !searchingUser && (
          <AnimatedDiv type="opacity-gradient">
            <Empty />
          </AnimatedDiv>
        )}

        {userList.size === 0 && searchingUser && (
          <AnimatedDiv type="opacity-gradient">
            <UserListSkeleton className="absolute top-14" />
          </AnimatedDiv>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <Pagination total={total} pageSize={pageSize} current={current} onChange={pageChange} />
      </div>
    </div>
  )
}

export default UserList
