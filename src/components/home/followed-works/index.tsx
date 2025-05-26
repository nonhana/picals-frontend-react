import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { WorkNormalItemInfo } from '@/utils/types'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getFollowNewWorksIdListAPI, likeActionsAPI } from '@/apis'
import Empty from '@/components/common/empty'
import LayoutList from '@/components/common/layout-list'
import WorkItem from '@/components/common/work-item'
import AnimatedDiv from '@/components/motion/animated-div'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useMap } from '@/hooks'
import {
  pushToFollowingNewWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

interface FollowedWorksProps {
  loading: boolean
  workList: WorkNormalItemInfo[]
}

const FollowedWorks: FC<FollowedWorksProps> = ({ loading, workList: sourceData }) => {
  const dispatch = useDispatch()
  const { isLogin } = useSelector((state: AppState) => state.user)
  const [workList, setWorkList, updateWorkList] = useMap<WorkNormalItemInfo>([])

  useEffect(() => {
    setWorkList(sourceData)
  }, [sourceData])

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
    <div className="relative min-h-85 p-5">
      <div className="m-b-10px title">
        <span>已关注用户新作</span>
      </div>

      {isLogin
        ? (
            <AnimatePresence>
              {sourceData.length !== 0 && !loading && (
                <AnimatedDiv type="opacity-gradient">
                  <LayoutList scrollType="work-normal" gap={20}>
                    {Array.from(workList.values()).map(item => (
                      <WorkItem
                        key={item.id}
                        itemInfo={item}
                        like={handleLike}
                        onClick={addFollowedNewWorkList}
                      />
                    ))}
                  </LayoutList>
                </AnimatedDiv>
              )}

              {sourceData.length === 0 && !loading && (
                <AnimatedDiv type="opacity-gradient">
                  <Empty text="emmm，看起来你还没关注用户，或者是你关注的用户没发布过作品" />
                </AnimatedDiv>
              )}

              {sourceData.length === 0 && loading && (
                <AnimatedDiv type="opacity-gradient">
                  <WorkListSkeleton row={1} className="absolute top-14" />
                </AnimatedDiv>
              )}
            </AnimatePresence>
          )
        : (
            <Empty text="还没登录，这里自然是空的" />
          )}
    </div>
  )
}

export default FollowedWorks
