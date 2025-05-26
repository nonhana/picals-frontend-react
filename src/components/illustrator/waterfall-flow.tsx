import type { FC } from 'react'
import type { WorkNormalItem } from '@/apis/types'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router'
import { getIllustratorWorksIdListAPI, getIllustratorWorksInPagesAPI } from '@/apis'
import { useAtBottom } from '@/hooks'
import {
  pushToIllustratorWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

import WaterfallItem from '../common/waterfall-item'

const pageSize = 10
const listClass = 'absolute w-75 flex flex-col gap-5'

type WaterfallItemInfo = WorkNormalItem & { index: number, height: number }

interface WaterfallFlowProps {
  startAppreciate: boolean
}

const WaterfallFlow: FC<WaterfallFlowProps> = ({ startAppreciate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { illustratorId } = useParams<{ illustratorId: string }>()

  const [workList, setWorkList] = useState<WaterfallItemInfo[]>([])
  const [heightArr, setHeightArr] = useState<number[]>([0, 0, 0])
  const [current, setCurrent] = useState(1)
  const [isFinal, setIsFinal] = useState(false)
  const atBottom = useAtBottom()
  const containerRef = useRef<HTMLDivElement>(null)

  const getIllustratorWorksInPages = async () => {
    try {
      const { data } = await getIllustratorWorksInPagesAPI({
        id: illustratorId!,
        current,
        pageSize,
      })
      if (data.length < pageSize)
        setIsFinal(true)
      // 遍历作品数组，将每个作品插入到目前最短的列中
      data.forEach((item) => {
        const coverImage = new Image()
        coverImage.src = item.cover
        coverImage.onload = () => {
          setHeightArr((prev) => {
            const minIndex = prev.indexOf(Math.min(...prev))
            const newArr = [...prev]
            const resultHeight = (coverImage.height * 300) / coverImage.width
            newArr[minIndex] += resultHeight + 20
            setWorkList(prev => [
              ...prev,
              {
                ...item,
                index: minIndex,
                height: resultHeight,
              },
            ])
            return newArr
          })
        }
      })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (!containerRef.current || heightArr.every(item => !item))
      return
    const maxHeight = Math.max(...heightArr)
    containerRef.current.style.height = `${maxHeight}px`
  }, [heightArr])

  useEffect(() => {
    getIllustratorWorksInPages()
  }, [illustratorId, current])

  useEffect(() => {
    if (!atBottom || isFinal)
      return
    setCurrent(prev => prev + 1)
  }, [atBottom])

  const addIllustratorWorks = async () => {
    const { data } = await getIllustratorWorksIdListAPI({ id: illustratorId! })
    dispatch(resetOtherList())
    dispatch(pushToIllustratorWorkList(data))
    dispatch(setCurrentList('illustratorWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  useEffect(() => {
    if (!startAppreciate)
      return
    navigate(`/work-detail/${workList[0].id}`)
    addIllustratorWorks()
  }, [startAppreciate])

  return (
    <div ref={containerRef} className="relative w-245">
      <div className={listClass}>
        {workList
          .filter(item => item.index === 0)
          .map(item => (
            <WaterfallItem
              key={item.id}
              item={item}
              height={item.height}
              onClick={addIllustratorWorks}
            />
          ))}
      </div>
      <div className={`${listClass} left-340px`}>
        {workList
          .filter(item => item.index === 1)
          .map(item => (
            <WaterfallItem
              key={item.id}
              item={item}
              height={item.height}
              onClick={addIllustratorWorks}
            />
          ))}
      </div>
      <div className={`${listClass} left-680px`}>
        {workList
          .filter(item => item.index === 2)
          .map(item => (
            <WaterfallItem
              key={item.id}
              item={item}
              height={item.height}
              onClick={addIllustratorWorks}
            />
          ))}
      </div>
    </div>
  )
}

export default WaterfallFlow
