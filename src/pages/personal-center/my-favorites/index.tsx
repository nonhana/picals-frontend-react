import type { FC } from 'react'
import type { FavoriteDetailInfo, FavoriteItemInfo, WorkNormalItemInfo } from '@/utils/types'
import { use, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router'
import {
  getFavoriteDetailAPI,
  getFavoriteWorkListAPI,
  getSearchResultNumAPI,
  getUserFavoriteListAPI,
  likeActionsAPI,
  searchFavoriteWorkAPI,
} from '@/apis'
import Empty from '@/components/common/empty'
import Header from '@/components/personal-center/favorites/header'
import Sidebar from '@/components/personal-center/favorites/sidebar'
import WorkList from '@/components/personal-center/favorites/work-list'
import { setFavoriteList } from '@/store/modules/favorites'

import { PersonalContext } from '..'

const MyFavorites: FC = () => {
  const { isMe, userId } = use(PersonalContext)

  const dispatch = useDispatch()

  const searchParams = useSearchParams()[0]
  const folderId = searchParams.get('folderId')

  /* ----------收藏夹信息相关---------- */
  const [favoriteDetailInfo, setFavoriteDetailInfo] = useState<FavoriteDetailInfo>()

  // 获取收藏夹详细信息
  const getFavoriteDetail = async () => {
    try {
      const { data } = await getFavoriteDetailAPI({ id: folderId! })
      setFavoriteDetailInfo(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (folderId)
      getFavoriteDetail()
  }, [folderId])

  const [current, setCurrent] = useState(1)
  const [workList, setWorkList] = useState<WorkNormalItemInfo[]>([])
  const [gettingWorkList, setGettingWorkList] = useState(true)

  const getFavoriteWorkList = async () => {
    setGettingWorkList(true)
    try {
      const { data } = await getFavoriteWorkListAPI({ id: folderId!, current, pageSize: 12 })
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
    if (folderId)
      getFavoriteWorkList()
  }, [folderId, current])

  // 给收藏夹的作品点赞
  const like = async (id: string) => {
    try {
      await likeActionsAPI({ id })
      setWorkList(
        workList.map(item => (item.id === id ? { ...item, isLiked: !item.isLiked } : item)),
      )
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  /* ----------收藏夹内部搜索相关---------- */
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchCurrent, setSearchCurrent] = useState(1)
  const [searchStatus, setSearchStatus] = useState(false) // 是否处于搜索状态
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!mounted)
      setMounted(true)
    if (mounted && !searchStatus) {
      setSearchTotal(0)
      setCurrent(1)
      setSearchCurrent(1)
      getFavoriteWorkList()
    }
  }, [searchStatus])

  const handleSearch = async (keyword: string) => {
    try {
      setSearchCurrent(1)
      const { data: workNum } = await getSearchResultNumAPI({ keyword, favoriteId: folderId! })
      setSearchTotal(workNum)
      const { data: workList } = await searchFavoriteWorkAPI({
        id: folderId!,
        keyword,
        current: searchCurrent,
        pageSize: 12,
      })
      setWorkList(workList)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  /* ----------收藏夹列表相关---------- */
  const [folderList, setFolderList] = useState<FavoriteItemInfo[]>([])
  const [gettingFolderList, setGettingFolderList] = useState(true)

  const fetchFavoriteList = async () => {
    setGettingFolderList(true)
    try {
      const { data } = await getUserFavoriteListAPI({ id: userId! })
      const list = data.sort((a, b) => a.order - b.order)
      if (isMe)
        dispatch(setFavoriteList(list))
      setFolderList(list)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingFolderList(false)
    }
  }

  useEffect(() => {
    fetchFavoriteList()
  }, [userId])

  // 刷新作品列表
  const refresh = async () => {
    setCurrent(1)
    setSearchTotal(0)
    setSearchCurrent(1)
    setSearchStatus(false)
    await getFavoriteWorkList()
    await fetchFavoriteList()
    await getFavoriteDetail()
  }

  const [startAppreciate, setStartAppreciate] = useState(false)

  return (
    <div className="mt-5 min-h-150 flex overflow-hidden b-1px rd-6 b-solid color-neutral">
      <Sidebar
        loading={gettingFolderList}
        folderList={folderList}
        setFolderList={setFolderList}
        fetchFavoriteList={fetchFavoriteList}
      />
      <div className="h-full w-209 b-1px b-l-solid color-neutral">
        {folderId
          ? (
              favoriteDetailInfo && (
                <>
                  <Header {...favoriteDetailInfo} setStartAppreciate={setStartAppreciate} />
                  <WorkList
                    total={searchStatus ? searchTotal : favoriteDetailInfo.workNum}
                    current={searchStatus ? searchCurrent : current}
                    setCurrent={searchStatus ? setSearchCurrent : setCurrent}
                    loading={gettingWorkList}
                    workList={workList}
                    searchStatus={searchStatus}
                    setSearchStatus={setSearchStatus}
                    handleSearch={handleSearch}
                    refresh={refresh}
                    like={like}
                    startAppreciate={startAppreciate}
                  />
                </>
              )
            )
          : (
              <div className="h-full w-full">
                <Empty text="请选择一个收藏夹" />
              </div>
            )}
      </div>
    </div>
  )
}

export default MyFavorites
