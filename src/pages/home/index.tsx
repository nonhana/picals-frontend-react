import type { FC } from 'react'
import type { Pagination } from '@/apis/types'
import type { AppState } from '@/store/types'
import type { LabelInfo, WorkNormalItemInfo } from '@/utils/types'
import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router'
import { getFollowNewWorksAPI, getRecommendLabelListAPI, getRecommendWorksAPI } from '@/apis'
import GreyButton from '@/components/common/grey-button'
import FollowedWorks from '@/components/home/followed-works'
import LabelList from '@/components/home/label-list/index'
import RecommendedWorks from '@/components/home/recommended-works'
import { setTempId } from '@/store/modules/user'
import { generateTempId, MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

const Home: FC = () => {
  const dispatch = useDispatch()
  const { isLogin, tempId } = useSelector((state: AppState) => state.user)

  const [width, setWidth] = useState<number>(MAX_WIDTH)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < TRIGGER_MIN_WIDTH) {
      setWidth(MIN_WIDTH)
    }
    else {
      setWidth(MAX_WIDTH)
    }
  }, [currentWidth])

  /* ----------获取数据相关---------- */

  // 标签列表相关
  const [labelList, setLabelList] = useState<LabelInfo[]>([])
  const [gettingLabelList, setGettingLabelList] = useState(true)

  const getLabelList = async () => {
    setGettingLabelList(true)
    try {
      const { data } = await getRecommendLabelListAPI()
      setLabelList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingLabelList(false)
    }
  }

  // 最新关注作品相关
  const [followWorkList, setFollowWorkList] = useState<WorkNormalItemInfo[]>([])
  const [gettingFollowWorkList, setGettingFollowWorkList] = useState(true)

  const getFollowNewWorks = async () => {
    setGettingFollowWorkList(true)
    try {
      const { data } = await getFollowNewWorksAPI({ pageSize: 30, current: 1 })
      setFollowWorkList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingFollowWorkList(false)
    }
  }

  // 获取推荐作品相关
  const [recommendWorkList, setRecommendWorkList] = useState<WorkNormalItemInfo[]>([])
  const [gettingRecommendWorkList, setGettingRecommendWorkList] = useState(true)

  const getRecommendWorks = async () => {
    setGettingRecommendWorkList(true)
    setRecommendWorkList([])
    try {
      const params: Pagination = { pageSize: 30, current: 1 }
      if (!isLogin) {
        if (!tempId)
          dispatch(setTempId(generateTempId()))
        params.id = tempId
      }
      const { data } = await getRecommendWorksAPI(params) // 只获取一页
      setRecommendWorkList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingRecommendWorkList(false)
    }
  }

  useEffect(() => {
    getLabelList()
    if (isLogin)
      getFollowNewWorks()
    getRecommendWorks()
  }, [])

  return (
    <div className="relative my-30px w-full select-none">
      <div style={{ width: `${width}px` }} className="mx-auto flex flex-col">
        <LabelList loading={gettingLabelList} labelList={labelList} />
        {isLogin && <FollowedWorks loading={gettingFollowWorkList} workList={followWorkList} />}
        <RecommendedWorks loading={gettingRecommendWorkList} workList={recommendWorkList} />
      </div>

      <div className="fixed bottom-10 right-10">
        <GreyButton onClick={getRecommendWorks}>
          <Icon color="#fff" icon="ant-design:reload-outlined" />
        </GreyButton>
      </div>
    </div>
  )
}

export default Home
