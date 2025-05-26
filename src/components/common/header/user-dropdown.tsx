import type { FC } from 'react'
import type { AppState } from '@/store/types'
import { message, Modal } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router'
import AnimatedDiv from '@/components/motion/animated-div'
import { reset } from '@/store/modules/favorites'
import { clear } from '@/store/modules/searchHistory'
import { logout } from '@/store/modules/user'

import { HEADER_DROPDOWN_LIST } from '@/utils/constants'
import LazyImg from '../lazy-img'

const UserDropdown: FC<{
  visible: boolean
  className?: string
  setVisible: (visible: boolean) => void
}> = ({ visible, className, setVisible }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state: AppState) => state.user)

  const selectItem = (value: string) => {
    switch (value) {
      case 'works':
        navigate(`/personal-center/${userInfo.id}/works`)
        break
      case 'likes':
        navigate(`/personal-center/${userInfo.id}/likes`)
        break
      case 'favorites':
        navigate(`/personal-center/${userInfo.id}/favorites`)
        break
      case 'follow':
        navigate(`/personal-center/${userInfo.id}/follow`)
        break
      case 'fans':
        navigate(`/personal-center/${userInfo.id}/fans`)
        break
      case 'history':
        navigate(`/personal-center/${userInfo.id}/history`)
        break
      case 'profile':
        navigate(`/personal-center/${userInfo.id}/works?type=profile`)
        break
      default:
        break
    }
  }

  const [modal, contextHolder] = Modal.useModal()

  const handleLogout = () => {
    modal.confirm({
      title: '确定要退出登录吗？',
      content: '退出登录后使用功能将受限哦~',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        dispatch(logout())
        dispatch(clear())
        dispatch(reset())
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
        message.success('退出登录成功')
      },
    })
  }

  const toggleBodyOverflow = (visible: boolean) => {
    document.documentElement.style.overflow = visible ? 'hidden scroll' : ''
    document.body.style.overflow = visible ? 'hidden' : ''
    document.body.style.maxHeight = visible ? '100vh' : ''
  }

  useEffect(() => {
    toggleBodyOverflow(visible)
  }, [visible])

  useEffect(() => {
    return () => toggleBodyOverflow(false)
  }, [])

  return (
    <>
      {contextHolder}

      <AnimatePresence>
        {visible && (
          <AnimatedDiv
            type="opacity-gradient"
            className="fixed left-0 top-0 z-1999 h-full w-full bg-black bg-opacity-32"
            onClick={() => setVisible(false)}
          />
        )}

        {visible && (
          <AnimatedDiv
            type="opacity-gradient"
            className={`absolute flex flex-col w-50 rd-6px bg-white overflow-hidden z-2000 ${className}`}
          >
            <div className="absolute left-0 top-0 h-12.5 w-full bg-neutral-100" />
            <div className="z-1 m-t-25px h-25 flex flex-col items-start justify-between p-l-2.5 p-r-2.5">
              <Link to={`/personal-center/${userInfo.id}/works`}>
                <div className="h-12.5 w-12.5 flex items-center justify-center overflow-hidden rd-full">
                  <LazyImg src={userInfo.littleAvatar} alt="avatar" />
                </div>
              </Link>
              <div className="text-sm color-neutral-900 font-bold">
                <span>{userInfo.username}</span>
              </div>
              <div className="text-xs color-neutral">
                <span>{userInfo.email}</span>
              </div>
            </div>
            <div className="w-30 flex justify-between p-2.5">
              <div
                className="h-9 flex flex-col cursor-pointer items-start justify-between"
                onClick={() => selectItem('follow')}
              >
                <span className="text-sm color-neutral-900">{userInfo.followNum}</span>
                <span className="text-xs color-neutral">已关注</span>
              </div>
              <div
                className="h-9 flex flex-col cursor-pointer items-start justify-between"
                onClick={() => selectItem('fans')}
              >
                <span className="text-sm color-neutral-900">{userInfo.fanNum}</span>
                <span className="text-xs color-neutral">粉丝</span>
              </div>
            </div>
            <ul className="m-0 list-none p-0 text-sm color-neutral-900">
              {HEADER_DROPDOWN_LIST.map(item => (
                <li
                  className="cursor-pointer px-2.5 py-3 transition-duration-300 hover:bg-neutral-50"
                  key={item.name}
                  onClick={() => selectItem(item.value)}
                >
                  {item.name}
                </li>
              ))}
              <li
                className="cursor-pointer px-2.5 py-3 transition-duration-300 hover:bg-neutral-50"
                onClick={handleLogout}
              >
                退出登录
              </li>
            </ul>
          </AnimatedDiv>
        )}
      </AnimatePresence>
    </>
  )
}

export default UserDropdown
