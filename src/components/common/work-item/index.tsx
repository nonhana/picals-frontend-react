import type { MenuProps } from 'antd'
import type { MotionProps } from 'framer-motion'
import type { WorkItemProps, WorkItemType } from './types'
import type { HistoryItem } from '@/apis/types'
import type { AppState } from '@/store/types'
import type { WorkNormalItemInfo } from '@/utils/types'
import { Icon } from '@iconify/react'
import { Dropdown, Modal } from 'antd'
import { motion } from 'framer-motion'
import { use } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router'
import { getAnimationVariant } from '@/components/motion/preset'

import { useFloat } from '@/hooks'
import { PersonalContext } from '@/pages/personal-center'
import { FLOAT_DURATION, WORKITEM_DROPDOWN_LIST } from '@/utils'
import LazyImg from '../lazy-img'

const normalWrapper = 'w-184px'
const normalSize = 'w-184px h-184px'
const leastSize = 'w-90px h-90px'
const littleSize = 'w-118px h-118px'

const activeClasses = 'bg-white opacity-16'

const beforeClasses
  = 'before:content-[""] before:absolute before:block before:top-0 before:left-0 before:w-full before:h-full before:bg-black before:opacity-4 before:rd-2'

function WorkItem(props: WorkItemProps & { index?: number }) {
  const { index: propsIndex, type: propsType, animation: propsAnimation } = props

  const index = propsIndex ?? 0

  let curWrapper: string
  let curSize: string
  let type: WorkItemType | undefined
  let itemInfo: WorkNormalItemInfo | HistoryItem
  let settingStatus: boolean
  let chooseStatus: boolean
  let like: (id1: string, id2?: string) => void
  let deleteWork: (id: string) => void
  let choose: (id: string) => void
  let cancel: (id: string) => void
  let move: (id: string) => void
  let copy: (id: string) => void
  let args: { [key: string]: any }

  switch (propsType) {
    case 'personal_center':
      ;({ type, itemInfo, like, deleteWork, ...args } = props)
      curWrapper = normalWrapper
      curSize = normalSize
      break
    case 'favorite':
      ;({ type, itemInfo, settingStatus, chooseStatus, like, choose, cancel, move, copy, ...args }
        = props)
      curWrapper = normalWrapper
      curSize = normalSize
      break
    case 'history':
      ;({ type, itemInfo, ...args } = props)
      curWrapper = normalWrapper
      curSize = normalSize
      break
    case 'user_work':
      ;({ type, itemInfo, like, ...args } = props)
      curWrapper = normalWrapper
      curSize = normalSize
      break
    case 'least':
      ;({ type, itemInfo, ...args } = props)
      curWrapper = leastSize
      curSize = leastSize
      break
    case 'little':
      ;({ type, itemInfo, like, ...args } = props)
      curWrapper = littleSize
      curSize = littleSize
      break
    case 'normal':
      ;({ type, itemInfo, like, ...args } = props)
      curWrapper = normalWrapper
      curSize = normalSize
      break
    case undefined:
      ;({ type, itemInfo, like, ...args } = props)
      type = 'normal'
      curWrapper = normalWrapper
      curSize = normalSize
      break
  }

  const { workId } = useParams<{ workId: string }>()
  const navigate = useNavigate()
  const { userId, currentPath, isMe } = use(PersonalContext)

  const { isLogin } = useSelector((state: AppState) => state.user)
  const { id: localUserId } = useSelector((state: AppState) => state.user.userInfo)

  const [modal, contextHolder] = Modal.useModal()
  const handlePersonalDelete = (id: string) => {
    modal.confirm({
      title: '删除作品',
      content: '确定要删除这个作品吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteWork && deleteWork(id)
      },
    })
  }
  const handlePersonalEdit = (id: string) => {
    modal.confirm({
      title: '是否要进入编辑页面？',
      content: '进入编辑页，可重新编辑该作品的全部信息',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        navigate(`/upload?type=edit&workId=${id}`)
      },
    })
  }

  const onChoosePersonalItem: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'delete':
        handlePersonalDelete(itemInfo.id)
        break
      case 'edit':
        handlePersonalEdit(itemInfo.id)
        break
    }
  }

  const onChooseFavoriteItem: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'cancel':
        cancel(itemInfo.id)
        break
      case 'move':
        move(itemInfo.id)
        break
      case 'copy':
        copy(itemInfo.id)
        break
      default:
        break
    }
  }

  const [opacity, top] = useFloat()

  let motionProps: MotionProps | undefined

  if (propsAnimation) {
    motionProps = getAnimationVariant(propsAnimation)
  }

  return (
    <>
      {contextHolder}

      <motion.div
        {...args!}
        {...motionProps}
        style={{
          transition: `all 0.2s ${index * FLOAT_DURATION}ms`,
          opacity,
          transform: `translateY(${top})`,
        }}
        className={`shrink-0 relative rd-2 overflow-hidden ${settingStatus! && chooseStatus! ? 'bg-neutral-100' : 'bg-white'} ${settingStatus! ? 'hover:bg-neutral-100' : ''} ${curWrapper}`}
      >
        {settingStatus! && (
          <div
            className={`absolute top-0 left-0 h-full z-100 ${curWrapper}`}
            onClick={() => choose(itemInfo.id)}
          >
            <div className="absolute right-10px top-10px">
              <Icon
                width="32px"
                color={chooseStatus! ? '#0090F0' : '#ffffff'}
                icon={
                  chooseStatus!
                    ? 'ant-design:check-square-filled'
                    : 'ant-design:check-square-outlined'
                }
              />
            </div>
          </div>
        )}
        <div className={`absolute top-0 left-0 z-99 ${curSize} ${beforeClasses}`}>
          <Link
            to={`/work-detail/${itemInfo!.id}`}
            className={`transition-all cursor-pointer opacity-16 hover:bg-white absolute top-0 left-0 ${curSize} ${(type! === 'least' || type! === 'little') && itemInfo!.id === workId ? activeClasses : ''}`}
          />
          {type! !== 'least' && type! !== 'little' && itemInfo!.imgList.length > 1 && (
            <div className="absolute right-10px top-10px">
              <div className="absolute z--1 h-full w-full rd-full bg-black opacity-8" />
              <div className="flex items-center gap-1 px-2 py-1">
                <Icon width="12px" color="#ffffff" icon="ant-design:file-filled" />
                <span className="text-xs color-white">{itemInfo!.imgList.length}</span>
              </div>
            </div>
          )}
          {type! !== 'history' && type! !== 'least' && isLogin && (
            <Icon
              className="absolute bottom-0 right-0 cursor-pointer p-10px"
              width="44px"
              color={(itemInfo! as WorkNormalItemInfo).isLiked ? 'red' : '#3d3d3d'}
              icon={
                (itemInfo! as WorkNormalItemInfo).isLiked
                  ? 'ant-design:heart-filled'
                  : 'ant-design:heart-outlined'
              }
              onClick={() =>
                type! === 'user_work' ? like(itemInfo.authorId, itemInfo.id) : like(itemInfo!.id)}
            />
          )}
        </div>

        <div
          className={`relative rd-2 flex items-center justify-center overflow-hidden ${curSize}`}
        >
          <LazyImg src={itemInfo!.cover} alt={itemInfo!.name} />
        </div>

        {type! !== 'least' && (
          <div className="relative flex flex-col gap-5px p-10px">
            <Link
              to={`/work-detail/${itemInfo!.id}`}
              className="inline-block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-sm color-neutral-900 font-bold"
            >
              <span>{itemInfo!.name ? itemInfo!.name : '无题'}</span>
            </Link>
            {type! !== 'user_work' && (
              <div className="w-full flex justify-between">
                <div className="flex items-center gap-10px text-sm color-neutral">
                  <Link
                    to={`/personal-center/${itemInfo!.authorId}/works`}
                    className="h-6 w-6 flex cursor-pointer items-center justify-center overflow-hidden rd-full"
                  >
                    <LazyImg src={itemInfo!.authorAvatar} alt={itemInfo!.authorName} />
                  </Link>
                  <Link
                    to={`/personal-center/${itemInfo!.authorId}/works`}
                    className="cursor-pointer color-neutral-900"
                  >
                    <span>{itemInfo!.authorName}</span>
                  </Link>
                </div>
                {type! === 'personal_center'
                  && isLogin
                  && userId === localUserId
                  && currentPath === 'works' && (
                  <Dropdown
                    menu={{
                      items: WORKITEM_DROPDOWN_LIST.get('personal_center'),
                      onClick: onChoosePersonalItem,
                    }}
                    placement="bottom"
                    arrow
                  >
                    <Icon width="24px" color="#858585" icon="ant-design:more-outlined" />
                  </Dropdown>
                )}
                {type! === 'favorite' && isLogin && isMe && (
                  <Dropdown
                    menu={{
                      items: WORKITEM_DROPDOWN_LIST.get('favorite'),
                      onClick: onChooseFavoriteItem,
                    }}
                    placement="bottom"
                    arrow
                  >
                    <Icon width="24px" color="#858585" icon="ant-design:more-outlined" />
                  </Dropdown>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  )
}

export default WorkItem
