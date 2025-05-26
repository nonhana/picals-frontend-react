import type { FC } from 'react'
import type { WorkNormalItemInfo } from '@/utils/types'
import { message } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { use, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import {
  deleteWorkAPI,
  getUserLikeWorksAPI,
  getUserLikeWorksIdListAPI,
  getUserWorksListAPI,
  likeActionsAPI,
} from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import Empty from '@/components/common/empty'
import Pagination from '@/components/common/pagination'
import AnimatedDiv from '@/components/motion/animated-div'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useMap } from '@/hooks'
import { PersonalContext } from '@/pages/personal-center'
import {
  pushToLikeWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

interface WorkListProps {
  workCount: number
  getWorkCount: () => Promise<void>
}

const WorkList: FC<WorkListProps> = ({ workCount, getWorkCount }) => {
  const location = useLocation()

  const dispatch = useDispatch()

  const { userId, currentPath } = use(PersonalContext)

  const [current, setCurrent] = useState<number>(1)
  const [workList, setWorkList, setWorkMap] = useMap<WorkNormalItemInfo>([])

  const likeWork = async (workId: string) => {
    try {
      await likeActionsAPI({ id: workId })
      setWorkMap(workId, { ...workList.get(workId)!, isLiked: !workList.get(workId)!.isLiked })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const [gettingWorkList, setGettingWorkList] = useState(true)

  const getUserWorks = async () => {
    setGettingWorkList(true)
    try {
      const { data } = await getUserWorksListAPI({ id: userId!, current, pageSize: 30 })
      setWorkList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingWorkList(false)
    }
  }

  const getUserLikeWorks = async () => {
    setGettingWorkList(true)
    try {
      const { data } = await getUserLikeWorksAPI({
        id: userId!,
        current,
        pageSize: 30,
      })
      setWorkList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingWorkList(false)
    }
  }

  const refreshWorkList = async () => {
    await getWorkCount()
    if (currentPath === 'works')
      await getUserWorks()
    if (currentPath === 'likes')
      await getUserLikeWorks()
  }

  useEffect(() => {
    refreshWorkList()
  }, [current, currentPath])

  const deleteWork = async (workId: string) => {
    try {
      await deleteWorkAPI({ id: workId })
      await refreshWorkList()
      message.success('删除成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (userId)
      setCurrent(1)
  }, [userId])

  const addWorks = async () => {
    if (currentPath === 'works') {
      dispatch(resetOtherList())
      dispatch(setCurrentList('userWorkList'))
    }
    else {
      const { data } = await getUserLikeWorksIdListAPI({ id: userId! })
      dispatch(resetOtherList())
      dispatch(pushToLikeWorkList(data))
      dispatch(setCurrentList('likeWorkList'))
    }
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-160 w-full pb-15">
      {workList.size !== 0 && !gettingWorkList && (
        <AnimatedList
          type="personal_center"
          workList={Array.from(workList.values())}
          like={likeWork}
          deleteWork={deleteWork}
          onClick={addWorks}
        />
      )}

      <AnimatePresence>
        {workList.size === 0 && !gettingWorkList && (
          <AnimatedDiv type="opacity-gradient">
            <Empty />
          </AnimatedDiv>
        )}

        {workList.size === 0 && gettingWorkList && (
          <AnimatedDiv type="opacity-gradient" className="absolute top-0">
            <WorkListSkeleton />
          </AnimatedDiv>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <Pagination total={workCount} pageSize={30} onChange={setCurrent} current={current} />
      </div>
    </div>
  )
}

export default WorkList
