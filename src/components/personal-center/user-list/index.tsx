import type { FC } from 'react'
import type { UserItemInfo } from '@/utils/types'
import { AnimatePresence } from 'framer-motion'
import { use, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getFansListAPI, getFollowingListAPI, likeActionsAPI, userActionsAPI } from '@/apis'
import Empty from '@/components/common/empty'
import Pagination from '@/components/common/pagination'
import UserItem from '@/components/common/user-item'
import AnimatedDiv from '@/components/motion/animated-div'
import UserListSkeleton from '@/components/skeleton/user-list'
import { useMap } from '@/hooks'
import { PersonalContext } from '@/pages/personal-center'
import { decreaseFollowNum, increaseFollowNum } from '@/store/modules/user'

interface UserListProps {
  width: number
  total: number
}

const UserList: FC<UserListProps> = ({ width, total }) => {
  const dispatch = useDispatch()

  const { currentPath, userId } = use(PersonalContext)

  const [userList, setUserList, updateUserList] = useMap<UserItemInfo>([]) // 用户列表

  // 关注/取消关注
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

  // 喜欢/取消喜欢用户作品
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

  const [gettingUser, setGettingUser] = useState(true) // 获取用户列表中

  const getUserList = async () => {
    setGettingUser(true)
    try {
      const { data }
        = currentPath === 'follow'
          ? await getFollowingListAPI({
              id: userId,
              current,
              pageSize,
            })
          : await getFansListAPI({
              id: userId,
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
      setGettingUser(false)
    }
  }

  useEffect(() => {
    getUserList()
  }, [currentPath, userId, current])

  return (
    <div className="relative min-h-160 w-full p-5">
      <AnimatePresence>
        {userList.size !== 0 && !gettingUser && (
          <AnimatedDiv type="opacity-gradient">
            <div className="relative w-full flex flex-col gap-20px pb-10">
              {Array.from(userList.values()).map(item => (
                <UserItem
                  key={item.id}
                  {...item}
                  width={width}
                  follow={handleFollow}
                  likeWork={handleLikeWork}
                />
              ))}
            </div>
          </AnimatedDiv>
        )}

        {userList.size === 0 && !gettingUser && (
          <AnimatedDiv type="opacity-gradient">
            <Empty />
          </AnimatedDiv>
        )}

        {userList.size === 0 && gettingUser && (
          <AnimatedDiv type="opacity-gradient">
            <UserListSkeleton className="absolute top-5" />
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
