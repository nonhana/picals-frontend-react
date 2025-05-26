import type { RadioChangeEvent } from 'antd'
import type { FC } from 'react'
import type { WorkNormalItemInfo } from '@/utils/types'
import { Radio } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { likeActionsAPI, searchWorksByLabelAPI, searchWorksIdListAPI } from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import Empty from '@/components/common/empty'
import Pagination from '@/components/common/pagination'
import AnimatedDiv from '@/components/motion/animated-div'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useMap } from '@/hooks'
import {
  pushToSearchResultWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

const sortOptions = [
  { label: '按最新排序', value: 'new' },
  { label: '按旧排序', value: 'old' },
  { label: '按点赞数排序', value: 'like' },
  { label: '按收藏数排序', value: 'collect' },
]

interface WorkListProps {
  sortType: string
  labelName: string
  workCount: number
}

const WorkList: FC<WorkListProps> = ({ labelName, sortType: URLSortType, workCount }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [sortType, setSortType] = useState(URLSortType)

  useEffect(() => {
    setSortType(URLSortType)
  }, [URLSortType])

  /* ----------分页相关--------- */
  const [current, setCurrent] = useState(1)

  const pageChange = (page: number) => {
    current !== page && setCurrent(page)
  }

  /* ----------作品列表相关--------- */
  const [workList, setWorkList, updateWorkList] = useMap<WorkNormalItemInfo>([])
  const [gettingWorkList, setGettingWorkList] = useState(true)

  const searchWorksByLabel = async () => {
    setGettingWorkList(true)
    try {
      const { data } = await searchWorksByLabelAPI({
        labelName,
        sortType,
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

  useEffect(() => {
    searchWorksByLabel()
  }, [labelName, sortType, current])

  const handleLike = async (id: string) => {
    try {
      await likeActionsAPI({ id })
      updateWorkList(id, { ...workList.get(id)!, isLiked: !workList.get(id)!.isLiked })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const changeType = ({ target: { value } }: RadioChangeEvent) => {
    navigate({
      search: `?label=${labelName}&type=work&sortType=${value}`,
    })
  }

  const addSearchResultWorks = async () => {
    const { data } = await searchWorksIdListAPI({
      labelName,
      sortType,
    })
    dispatch(resetOtherList())
    dispatch(pushToSearchResultWorkList(data))
    dispatch(setCurrentList('searchResultWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-180 w-full p-5 pb-15">
      <div className="mb-10px w-full flex items-center justify-between">
        <div className="flex items-center gap-10px">
          <div className="text-2xl title">
            <span>插画</span>
          </div>
          <div className="rd-full bg-neutral px-10px py-5px text-sm color-white font-bold">
            <span>{workCount}</span>
          </div>
        </div>
        <Radio.Group
          options={sortOptions}
          onChange={changeType}
          value={sortType}
          optionType="button"
          buttonStyle="solid"
        />
      </div>

      {workList.size !== 0 && !gettingWorkList && (
        <AnimatedList
          workList={Array.from(workList.values())}
          like={handleLike}
          onClick={addSearchResultWorks}
        />
      )}

      <AnimatePresence>
        {workList.size === 0 && !gettingWorkList && (
          <AnimatedDiv type="opacity-gradient">
            <Empty />
          </AnimatedDiv>
        )}

        {workList.size === 0 && gettingWorkList && (
          <AnimatedDiv type="opacity-gradient">
            <WorkListSkeleton className="absolute top-14" />
          </AnimatedDiv>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <Pagination total={workCount} pageSize={30} current={current} onChange={pageChange} />
      </div>
    </div>
  )
}

export default WorkList
