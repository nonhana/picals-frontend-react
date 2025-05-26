import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { WorkNormalItemInfo } from '@/utils/types'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { getFollowNewWorksAPI, getFollowNewWorksIdListAPI, likeActionsAPI } from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import Empty from '@/components/common/empty'
import AnimatedDiv from '@/components/motion/animated-div'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useMap } from '@/hooks/useMap'
import {
  pushToFollowingNewWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

interface MainListProps {
  pageSize: number
  current: number
}

const MainList: FC<MainListProps> = ({ pageSize, current }) => {
  const location = useLocation()
  const dispatch = useDispatch()

  const { isLogin } = useSelector((state: AppState) => state.user)
  const [workList, setWorkList, updateWorkList] = useMap<WorkNormalItemInfo>([])
  const [loading, setLoading] = useState(true)

  const getFollowNewWorks = async () => {
    setLoading(true)
    try {
      const { data } = await getFollowNewWorksAPI({ pageSize, current })
      setWorkList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFollowNewWorks()
  }, [current, pageSize])

  const handleLike = async (id: string) => {
    await likeActionsAPI({ id })
    updateWorkList(id, { ...workList.get(id)!, isLiked: !workList.get(id)!.isLiked })
  }

  const addFollowedNewWorkList = async () => {
    const { data } = await getFollowNewWorksIdListAPI()
    dispatch(resetOtherList())
    dispatch(pushToFollowingNewWorkList(data))
    dispatch(setCurrentList('followingNewWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-160 w-full p-5">
      <div className="mb-10px title">
        <span>已关注用户新作</span>
      </div>

      {isLogin
        ? (
            <>
              {workList.size !== 0 && !loading && (
                <AnimatedList
                  workList={Array.from(workList.values())}
                  like={handleLike}
                  onClick={addFollowedNewWorkList}
                />
              )}

              <AnimatePresence>
                {workList.size === 0 && !loading && (
                  <AnimatedDiv type="opacity-gradient">
                    <Empty text="emmm，看起来你还没关注用户，或者是你关注的用户没发布过作品" />
                  </AnimatedDiv>
                )}

                {workList.size === 0 && loading && (
                  <AnimatedDiv type="opacity-gradient" className="absolute top-14">
                    <WorkListSkeleton />
                  </AnimatedDiv>
                )}
              </AnimatePresence>
            </>
          )
        : (
            <Empty text="还没登录，这里自然是空的" />
          )}
    </div>
  )
}

export default MainList
