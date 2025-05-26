import type { FC } from 'react'
import type { Pagination } from '@/apis/types'
import type { AppState } from '@/store/types'
import type { WorkNormalItemInfo } from '@/utils/types'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { getRecommendWorksAPI, likeActionsAPI } from '@/apis'
import AnimatedList from '@/components/common/animated-list'
import WorkListSkeleton from '@/components/skeleton/work-list'
import { useAtBottom } from '@/hooks'
import { setTempId } from '@/store/modules/user'
import {
  pushToRecommendWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'
import { generateTempId } from '@/utils'

const WorkList: FC = () => {
  const location = useLocation()

  const dispatch = useDispatch()
  const { tempId, isLogin } = useSelector((state: AppState) => state.user)

  const [current, setCurrent] = useState(1)
  const [recommendWorkList, setRecommendWorkList] = useState<
    {
      page: number
      list: WorkNormalItemInfo[]
    }[]
  >([{ page: current, list: [] }])
  const atBottom = useAtBottom()
  const [isFinal, setIsFinal] = useState(false)

  const getRecommendWorks = async () => {
    try {
      const params: Pagination = { pageSize: 30, current }
      if (!isLogin) {
        if (!tempId)
          dispatch(setTempId(generateTempId()))
        params.id = tempId
      }
      const { data } = await getRecommendWorksAPI(params)
      if (data.length < 30)
        setIsFinal(true)
      setRecommendWorkList((prev) => {
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
    getRecommendWorks()
  }, [current])

  const handleLike = async (page: number, id: string) => {
    await likeActionsAPI({ id })
    setRecommendWorkList(
      recommendWorkList.map((item) => {
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

  const addRecommendWorks = () => {
    dispatch(resetOtherList())
    const result = recommendWorkList.reduce((prev, current) => {
      return prev.concat(current.list.map(item => item.id))
    }, [] as string[])
    dispatch(pushToRecommendWorkList(result))
    dispatch(setCurrentList('recommendWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  return (
    <div className="relative min-h-160 w-full p-5">
      <div className="m-b-10px title">
        <span>推荐作品</span>
      </div>

      {recommendWorkList.map(
        everyPage =>
          everyPage.list.length !== 0 && (
            <AnimatedList
              key={everyPage.page}
              workList={everyPage.list}
              like={(id: string) => handleLike(everyPage.page, id)}
              onClick={addRecommendWorks}
            />
          ),
      )}

      {!isFinal && <WorkListSkeleton row={1} />}
    </div>
  )
}

export default WorkList
