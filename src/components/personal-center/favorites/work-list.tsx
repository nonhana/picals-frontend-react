import type { RadioChangeEvent } from 'antd'
import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { WorkNormalItemInfo } from '@/utils/types'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, Input, message, Modal, Radio } from 'antd'
import { use, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import {
  copyFavoriteWorksAPI,
  favoriteActionsAPI,
  getFavoriteWorkIdListAPI,
  moveFavoriteWorksAPI,
} from '@/apis'
import Empty from '@/components/common/empty'
import Pagination from '@/components/common/pagination'
import WorkItem from '@/components/common/work-item'
import AnimatedDiv from '@/components/motion/animated-div'
import FavoriteWorkListSkeleton from '@/components/skeleton/favorite-work-list'
import { PersonalContext } from '@/pages/personal-center'
import {
  pushToFavoriteWorkList,
  resetOtherList,
  setCurrentList,
  setPrevPosition,
} from '@/store/modules/viewList'

const { Search } = Input

interface WorkListProps {
  total: number
  loading: boolean
  workList: WorkNormalItemInfo[]
  current: number
  setCurrent: (current: number) => void
  handleSearch: (keyword: string) => void
  searchStatus: boolean
  setSearchStatus: (status: boolean) => void
  refresh: () => Promise<void> // 刷新作品列表
  like: (id: string) => void
  startAppreciate: boolean
}

const WorkList: FC<WorkListProps> = ({
  total,
  loading,
  workList,
  current,
  setCurrent,
  handleSearch,
  searchStatus,
  setSearchStatus,
  refresh,
  like,
  startAppreciate,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMe } = use(PersonalContext)

  const [messageApi, msgContextHolder] = message.useMessage()

  const dispatch = useDispatch()
  const { favoriteList } = useSelector((state: AppState) => state.favorite)
  const { isLogin } = useSelector((state: AppState) => state.user)
  const searchParams = useSearchParams()[0]
  const folderId = searchParams.get('folderId')

  const [keyword, setKeyword] = useState('')

  const onSearch = () => {
    if (keyword === '') {
      setSearchStatus(false)
      return
    }
    setSearchStatus(true)
    handleSearch(keyword)
  }

  const handleCancelSearch = () => {
    setKeyword('')
    setSearchStatus(false)
  }

  const onPageChange = (page: number) => setCurrent(page)

  const [settingStatus, setSettingStatus] = useState(false) // 是否处于批量编辑状态
  const [chosenWorkList, setChosenWorkList] = useState<string[]>([]) // 选中的作品id列表
  const [allChosen, setAllChosen] = useState(false) // 是否全选

  // 重置编辑状态
  const resetSettingStatus = () => {
    setSettingStatus(false)
    setAllChosen(false)
    setChosenWorkList([])
  }

  /* ----------Modal相关---------- */
  // #region
  const [modal, modalContextHolder] = Modal.useModal()
  const [moveModalStatus, setMoveModalStatus] = useState(false)
  const [moveFolderId, setMoveFolderId] = useState<string>('')
  const [copyModalStatus, setCopyModalStatus] = useState(false)
  const [copyFolderId, setCopyFolderId] = useState<string>('')

  // 批量取消收藏
  const handleCancelFavorite = async (idList: string[]) => {
    try {
      const promises = idList.map(id => favoriteActionsAPI({ id, favoriteIds: [folderId!] }))
      await Promise.all(promises)
      await refresh()
      resetSettingStatus()
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const cancelConfirm = (idList: string[]) => {
    modal.confirm({
      title: `确定要取消收藏${idList.length === 1 ? '该' : '这些'}作品吗？`,
      icon: <ExclamationCircleFilled />,
      content: '该操作无法撤销',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        await handleCancelFavorite(idList)
        messageApi.success('取消收藏成功')
      },
    })
  }

  // 移动作品
  const onChooseMoveFolder = (e: RadioChangeEvent) => {
    setMoveFolderId(e.target.value)
  }
  const moveConfirm = async (idList: string[], targetId: string) => {
    try {
      await moveFavoriteWorksAPI({ idList, fromId: folderId!, toId: targetId })
      setMoveModalStatus(false)
      await refresh()
      resetSettingStatus()
      messageApi.success('移动成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }
  useEffect(() => {
    if (!moveModalStatus)
      setMoveFolderId(folderId!)
  }, [moveModalStatus, folderId])

  // 复制作品
  const onChooseCopyFolder = (e: RadioChangeEvent) => {
    setCopyFolderId(e.target.value)
  }
  const copyConfirm = async (idList: string[], targetId: string) => {
    try {
      await copyFavoriteWorksAPI({ idList, toId: targetId })
      setCopyModalStatus(false)
      await refresh()
      resetSettingStatus()
      messageApi.success('复制成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }
  useEffect(() => {
    if (!copyModalStatus)
      setCopyFolderId(folderId!)
  }, [copyModalStatus, folderId])
  // #endregion

  /* ----------作品编辑相关---------- */
  // #region
  // 选中作品。如果选中列表中已经有该作品，则将其移除；否则添加
  const choose = (id: string) => {
    setChosenWorkList((prev) => {
      if (prev.includes(id))
        return prev.filter(item => item !== id)
      return [...prev, id]
    })
  }
  // 全选或取消全选
  const chooseAllWorks = (e: RadioChangeEvent) => {
    setAllChosen(e.target.value)
    if (e.target.value) {
      setChosenWorkList(workList.map(item => item.id))
    }
    else {
      setChosenWorkList([])
    }
  }
  // 单个作品取消收藏
  const cancelSingleWork = (id: string) => {
    setChosenWorkList([id])
    cancelConfirm([id])
  }
  // 单个作品移动
  const moveSingleWork = (id: string) => {
    setChosenWorkList([id])
    setMoveModalStatus(true)
  }
  // 单个作品复制
  const copySingleWork = (id: string) => {
    setChosenWorkList([id])
    setCopyModalStatus(true)
  }

  useEffect(() => {
    if (settingStatus)
      return // 如果处于编辑状态，不重置
    setAllChosen(false)
    setChosenWorkList([])
  }, [settingStatus, workList])
  // #endregion

  const addFavoriteWorks = async () => {
    const { data } = await getFavoriteWorkIdListAPI({ id: folderId! })
    dispatch(resetOtherList())
    dispatch(pushToFavoriteWorkList(data))
    dispatch(setCurrentList('favoriteWorkList'))
    dispatch(setPrevPosition(location.pathname + location.search))
  }

  useEffect(() => {
    if (!startAppreciate)
      return
    if (workList.length === 0) {
      messageApi.info('暂无作品，快去收藏一些吧~')
    }
    navigate(`/work-detail/${workList[0].id}`)
    addFavoriteWorks()
  }, [startAppreciate])

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}

      <div className="relative min-h-150 flex flex-col items-center pb-10">
        {settingStatus && (
          <div className="h-16 w-full flex items-center b-1px b-b-solid px-5 color-neutral">
            <Button type="default" onClick={() => setSettingStatus(false)}>
              取消批量编辑
            </Button>
          </div>
        )}
        {settingStatus
          ? (
              <div className="h-16 w-full flex items-center justify-between b-1px b-b-solid px-5 color-neutral">
                <div className="flex items-center gap-10px">
                  <Radio.Group value={allChosen} onChange={chooseAllWorks}>
                    <Radio value>全选</Radio>
                    <Radio value={false}>取消全选</Radio>
                  </Radio.Group>
                  <Button
                    disabled={chosenWorkList.length === 0}
                    type="link"
                    onClick={() => cancelConfirm(chosenWorkList)}
                  >
                    取消收藏
                  </Button>
                  <Button
                    disabled={chosenWorkList.length === 0}
                    type="link"
                    onClick={() => setMoveModalStatus(true)}
                  >
                    移动到
                  </Button>
                  <Button
                    disabled={chosenWorkList.length === 0}
                    type="link"
                    onClick={() => setCopyModalStatus(true)}
                  >
                    复制到
                  </Button>
                </div>
                <span className="text-sm color-neutral">
                  已选择
                  {chosenWorkList.length}
                  个作品
                </span>
              </div>
            )
          : (
              <div className="h-16 w-full flex justify-end b-1px b-b-solid px-5 color-neutral">
                <div className="flex items-center gap-5">
                  {isLogin && isMe && (
                    <Button
                      type="link"
                      onClick={() => setSettingStatus(true)}
                      disabled={workList.length === 0}
                    >
                      批量操作
                    </Button>
                  )}
                  {searchStatus && (
                    <Button type="link" onClick={handleCancelSearch}>
                      取消搜索
                    </Button>
                  )}
                  <Search
                    value={keyword}
                    placeholder="输入作品名称"
                    onChange={e => setKeyword(e.target.value)}
                    onSearch={onSearch}
                    disabled={workList.length === 0}
                  />
                </div>
              </div>
            )}

        {workList.length !== 0 && !loading && (
          <AnimatedDiv
            type="opacity-gradient"
            className="relative mx-5 w-199 flex flex-wrap gap-5 py-5"
          >
            {workList.map(item => (
              <WorkItem
                key={item.id}
                itemInfo={item}
                type="favorite"
                settingStatus={settingStatus}
                chooseStatus={chosenWorkList.includes(item.id)}
                choose={choose}
                like={like}
                cancel={cancelSingleWork}
                move={moveSingleWork}
                copy={copySingleWork}
                onClick={addFavoriteWorks}
              />
            ))}
          </AnimatedDiv>
        )}

        {workList.length === 0 && !loading && (
          <AnimatedDiv type="opacity-gradient" className="absolute top-16 w-full">
            <Empty text={searchStatus ? '没有找到相关作品' : '暂无作品，快去收藏一些吧~'} />
          </AnimatedDiv>
        )}

        {workList.length === 0 && loading && (
          <AnimatedDiv type="opacity-gradient" className="absolute top-20 w-full">
            <FavoriteWorkListSkeleton />
          </AnimatedDiv>
        )}

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <Pagination total={total} pageSize={12} current={current} onChange={onPageChange} />
        </div>
      </div>

      <Modal
        className="scrollbar-none"
        title="移动作品"
        width="420px"
        open={moveModalStatus}
        okText="移动"
        cancelText="取消"
        onOk={() => moveConfirm(chosenWorkList, moveFolderId)}
        onCancel={() => setMoveModalStatus(false)}
      >
        <div className="h-110 overflow-y-scroll">
          <Radio.Group className="w-full" onChange={onChooseMoveFolder} value={moveFolderId}>
            {favoriteList.map(item => (
              <Radio
                disabled={item.id === folderId}
                key={item.id}
                value={item.id}
                className="h-15 w-full flex items-center justify-between px-5"
              >
                <div className="w-70 flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    作品数：
                    {item.workNum}
                  </span>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>

      <Modal
        className="scrollbar-none"
        title="复制作品"
        width="420px"
        open={copyModalStatus}
        okText="复制"
        cancelText="取消"
        onOk={() => copyConfirm(chosenWorkList, copyFolderId)}
        onCancel={() => setCopyModalStatus(false)}
      >
        <div className="h-110 overflow-y-scroll">
          <Radio.Group className="w-full" onChange={onChooseCopyFolder} value={copyFolderId}>
            {favoriteList.map(item => (
              <Radio
                disabled={item.id === folderId}
                key={item.id}
                value={item.id}
                className="h-15 w-full flex items-center justify-between px-5"
              >
                <div className="w-70 flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    作品数：
                    {item.workNum}
                  </span>
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </Modal>
    </>
  )
}

export default WorkList
