import type { FC } from 'react'
import type { WorkNormalItemInfo } from '@/utils/types'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import { likeActionsAPI } from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import Empty from '@/components/common/empty'
import AnimatedDiv from '@/components/motion/animated-div'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useMap } from '@/hooks'
import {
  pushToRecommendWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

interface RecommendedWorksProps {
  loading: boolean
  workList: WorkNormalItemInfo[]
}

const RecommendedWorks: FC<RecommendedWorksProps> = ({ loading, workList: sourceData }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const [workList, setWorkList, setWorkMapList] = useMap<WorkNormalItemInfo>([])

  useEffect(() => {
    setWorkList(sourceData)
  }, [sourceData])

  const handleLike = async (id: string) => {
    await likeActionsAPI({ id })
    setWorkMapList(id, { ...workList.get(id)!, isLiked: !workList.get(id)!.isLiked })
  }

  const addRecommendWorks = () => {
    dispatch(resetOtherList())
    dispatch(pushToRecommendWorkList(sourceData.map(item => item.id)))
    dispatch(setCurrentList('recommendWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-160 p-5">
      <div className="m-b-10px title">
        <span>推荐作品</span>
      </div>

      {workList.size !== 0 && !loading && (
        <AnimatedList
          workList={Array.from(workList.values())}
          like={handleLike}
          onClick={addRecommendWorks}
        />
      )}

      {workList.size === 0 && !loading && (
        <AnimatedDiv type="opacity-gradient">
          <Empty />
        </AnimatedDiv>
      )}

      {workList.size === 0 && loading && (
        <AnimatedDiv type="opacity-gradient" className="absolute top-14">
          <WorkListSkeleton />
        </AnimatedDiv>
      )}
    </div>
  )
}

export default RecommendedWorks
