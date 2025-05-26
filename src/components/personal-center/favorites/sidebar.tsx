import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core'
import type { FC } from 'react'
import type { FavoriteFormInfo, FavoriteItemInfo } from '@/utils/types'
import { DndContext } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Icon } from '@iconify/react'
import { message, Modal } from 'antd'
import { use, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router'
import { changeFavoriteOrderAPI, deleteFavoriteAPI, editFavoriteAPI, newFavoriteAPI } from '@/apis'
import CreateFolderModal from '@/components/common/create-folder-modal'
import Empty from '@/components/common/empty'
import FavoriteItem from '@/components/common/favorite-item'
import AnimatedDiv from '@/components/motion/animated-div'
import FavoriteListSkeleton from '@/components/skeleton/favorite-list'
import { PersonalContext } from '@/pages/personal-center'
import { setFavoriteList } from '@/store/modules/favorites'

// 获取拖动元素的索引
function getMoveIndex(array: FavoriteItemInfo[], dragItem: DragMoveEvent) {
  const { active, over } = dragItem
  let activeIndex = 0 // 拖动元素的索引
  let overIndex = 0 // 被拖动元素的索引
  try {
    array.forEach((item, index) => {
      if (active.id === item.id) {
        activeIndex = index
      }
      if (over!.id === item.id) {
        overIndex = index
      }
    })
  }
  catch {
    overIndex = activeIndex // 如果有问题，则复位
  }
  return { activeIndex, overIndex }
}

interface SidebarProps {
  loading: boolean
  folderList: FavoriteItemInfo[]
  setFolderList: (folderList: FavoriteItemInfo[]) => void
  fetchFavoriteList: () => Promise<void>
}

const Sidebar: FC<SidebarProps> = ({ loading, folderList, setFolderList, fetchFavoriteList }) => {
  const dispatch = useDispatch()

  const { isMe, userId } = use(PersonalContext)
  const [messageApi, msgContextHolder] = message.useMessage()

  const [searchParams] = useSearchParams()
  const folderId = searchParams.get('folderId')

  const navigate = useNavigate()

  const [folderStatusList, setFolderStatusList] = useState<boolean[]>(
    Array.from({ length: folderList.length }, () => false),
  )
  useEffect(() => {
    if (folderId)
      setFolderStatusList(folderList.map(item => item.id === folderId))
  }, [folderId, folderList])
  const [editingFolderId, setEditingFolderId] = useState<string>('')
  const [modalStatus, setModalStatus] = useState(false)
  const [formInfo, setFormInfo] = useState<FavoriteFormInfo>({
    name: '',
    intro: '',
  })

  // 调用接口更改收藏夹的排序
  const changeFavoriteOrder = async (orderedList: FavoriteItemInfo[]) => {
    try {
      const orderList = orderedList.map((item, index) => ({
        id: item.id,
        order: index,
      }))
      await changeFavoriteOrderAPI({ orderList })
      dispatch(setFavoriteList(orderedList))
      messageApi.success('排序成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  // 拖拽结束后的操作
  const dragEndEvent = async (dragItem: DragEndEvent) => {
    const moveDataList = [...folderList]
    const { activeIndex, overIndex } = getMoveIndex(moveDataList, dragItem)
    const newDataList = arrayMove(moveDataList, activeIndex, overIndex)
    setFolderList(newDataList)
    await changeFavoriteOrder(newDataList)
  }

  const onAddFolder = () => {
    setModalStatus(true)
  }

  const onChooseFolder = (id: string) => {
    navigate(`/personal-center/${userId}/favorites?folderId=${id}`)
  }

  const [modal, modalContextHolder] = Modal.useModal()
  const onDeleteFolder = (id: string) => {
    modal.confirm({
      title: '删除收藏集',
      content: '确定删除该收藏集吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          await deleteFavoriteAPI({ id })
          navigate(`/personal-center/${userId}/favorites`)
          await fetchFavoriteList()
          messageApi.success('删除成功')
        }
        catch (error) {
          console.error('出现错误了喵！！', error)
        }
      },
    })
  }

  const onEditFolder = (id: string) => {
    setEditingFolderId(id)
    const target = folderList.find(item => item.id === id)
    if (target) {
      const info: FavoriteFormInfo = { name: target.name, intro: target.intro }
      if (target.cover)
        info.cover = target.cover
      setFormInfo(info)
    }
    setModalStatus(true)
  }
  const confirmAction = async () => {
    try {
      if (editingFolderId !== '') {
        await editFavoriteAPI({ id: editingFolderId, ...formInfo })
      }
      else {
        await newFavoriteAPI(formInfo)
      }
      setModalStatus(false)
      await fetchFavoriteList()
      messageApi.success(editingFolderId !== '' ? '编辑成功' : '新建成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }
  const cancelAction = () => {
    setModalStatus(false)
  }
  useEffect(() => {
    if (!modalStatus) {
      setFormInfo({ name: '', intro: '' })
      setEditingFolderId('')
    }
  }, [modalStatus])

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}

      <DndContext onDragEnd={dragEndEvent} modifiers={[restrictToParentElement]}>
        <SortableContext
          items={folderList.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative h-full">
            {isMe && (
              <div
                className="relative h-15 w-250px flex cursor-pointer items-center justify-between bg-white hover:bg-neutral-100"
                onClick={onAddFolder}
              >
                <div className="ml-5 flex items-center gap-10px text-lg color-neutral-900 font-bold">
                  <Icon width="24px" color="#858585" icon="ant-design:plus-circle-outlined" />
                  <span>新建收藏集</span>
                </div>
              </div>
            )}

            {folderList.length !== 0 && !loading && (
              <AnimatedDiv type="opacity-gradient">
                {folderList.map((item, index) => (
                  <FavoriteItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    folderStatus={folderStatusList[index]}
                    onChooseFolder={onChooseFolder}
                    onDeleteFolder={onDeleteFolder}
                    onEditFolder={onEditFolder}
                  />
                ))}
              </AnimatedDiv>
            )}

            {folderList.length === 0 && !loading && (
              <AnimatedDiv type="opacity-gradient" className="w-250px bg-white">
                <Empty showImg={false} text="暂无收藏集" />
              </AnimatedDiv>
            )}

            {folderList.length === 0 && loading && (
              <AnimatedDiv type="opacity-gradient" className="absolute">
                <FavoriteListSkeleton />
              </AnimatedDiv>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <CreateFolderModal
        editMode={editingFolderId !== ''}
        modalStatus={modalStatus}
        formInfo={formInfo}
        setFormInfo={setFormInfo}
        confirmAction={confirmAction}
        cancelAction={cancelAction}
      />
    </>
  )
}

export default Sidebar
