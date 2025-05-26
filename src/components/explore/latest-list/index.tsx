import type { FC } from 'react'
import type { WorkNormalItemInfo } from '@/utils/types'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import { getLatestWorksAPI, likeActionsAPI } from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useAtBottom } from '@/hooks'
import {
  pushToLatestWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

const LatestList: FC = () => {
  const location = useLocation()

  const dispatch = useDispatch()

  const [current, setCurrent] = useState(1)
  const [latestWorkList, setLatestWorkList] = useState<
    {
      page: number
      list: WorkNormalItemInfo[]
    }[]
  >([{ page: current, list: [] }])
  const atBottom = useAtBottom()
  const [isFinal, setIsFinal] = useState(false)

  const getLatestWorks = async () => {
    try {
      const { data } = await getLatestWorksAPI({ pageSize: 30, current })
      if (data.length < 30)
        setIsFinal(true)
      setLatestWorkList((prev) => {
        const result = prev.map((item) => {
          if (item.page === current) {
            return { page: item.page, list: data }
          }
          return item
        })
        if (!isFinal)
          result.push({ page: current + 1, list: [] })
        return result
      })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (atBottom && !isFinal)
      setCurrent(prev => prev + 1)
  }, [atBottom])

  useEffect(() => {
    getLatestWorks()
  }, [current])

  const handleLike = async (page: number, id: string) => {
    await likeActionsAPI({ id })
    setLatestWorkList(
      latestWorkList.map((item) => {
        if (item.page === page) {
          return {
            page: item.page,
            list: item.list.map((work) => {
              if (work.id === id) {
                return { ...work, isLiked: !work.isLiked }
              }
              return work
            }),
          }
        }
        return item
      }),
    )
  }

  const addLatestWorks = () => {
    dispatch(resetOtherList())
    const result = latestWorkList.reduce((prev, current) => {
      return prev.concat(current.list.map(item => item.id))
    }, [] as string[])
    dispatch(pushToLatestWorkList(result))
    dispatch(setCurrentList('latestWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-160 w-full p-5">
      <div className="m-b-10px title">
        <span>最新发布</span>
      </div>

      {latestWorkList.map(
        everyPage =>
          everyPage.list.length !== 0 && (
            <AnimatedList
              key={everyPage.page}
              workList={everyPage.list}
              like={(id: string) => handleLike(everyPage.page, id)}
              onClick={addLatestWorks}
            />
          ),
      )}

      {!isFinal && <WorkListSkeleton row={1} />}
    </div>
  )
}

export default LatestList
