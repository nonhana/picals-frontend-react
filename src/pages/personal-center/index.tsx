import type { MenuProps } from 'antd'
import type { FC } from 'react'
import type { AppState } from '@/store/types'
import {
  HeartOutlined,
  HistoryOutlined,
  PictureOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Menu } from 'antd'
import { createContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router'
import Header from '@/components/personal-center/header'
import { MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

const PersonalContext = createContext({ isMe: false, currentPath: '', userId: '', width: 0 })

const PersonalCenter: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState('works')
  const { userId } = useParams()

  const { id: localUserId } = useSelector((state: AppState) => state.user.userInfo)
  const isMe = userId === localUserId

  const [menuItems, setMenuItems] = useState([
    {
      label: '插画',
      key: 'works',
      icon: <PictureOutlined />,
    },
    {
      label: '最近喜欢',
      key: 'likes',
      icon: <HeartOutlined />,
    },
    {
      label: '收藏集',
      key: 'favorites',
      icon: <StarOutlined />,
    },
    {
      label: '关注',
      key: 'follow',
      icon: <UserOutlined />,
    },
    {
      label: '粉丝',
      key: 'fans',
      icon: <TeamOutlined />,
    },
  ])

  useEffect(() => {
    if (isMe) {
      setMenuItems(prev => [
        ...prev,
        {
          label: '浏览记录',
          key: 'history',
          icon: <HistoryOutlined />,
        },
      ])
    }
    else {
      setMenuItems(prev => prev.filter(item => item.key !== 'history'))
    }
  }, [isMe])

  const checkoutMenu: MenuProps['onClick'] = (e) => {
    setCurrentPath(e.key)
    navigate(e.key)
  }

  useEffect(() => {
    setCurrentPath(location.pathname.split('/')[3])
  }, [location.pathname])

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

  return (
    <PersonalContext value={{ isMe, currentPath, userId: userId!, width }}>
      <div className="relative w-full flex flex-col items-center">
        <Header />
        <Menu
          className="max-w-350 w-full"
          onClick={checkoutMenu}
          selectedKeys={[currentPath]}
          mode="horizontal"
          items={menuItems}
        />
        <div
          style={{ width: `${width}px` }}
          className="relative mb-5 max-w-350 flex justify-center"
        >
          <Outlet />
        </div>
      </div>
    </PersonalContext>
  )
}

export { PersonalContext }
export default PersonalCenter
