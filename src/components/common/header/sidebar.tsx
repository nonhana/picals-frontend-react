import type { FC } from 'react'
import type { AppState } from '@/store/types'
import { Icon } from '@iconify/react'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router'
import logo from '@/assets/svgs/logo.svg'
import AnimatedDiv from '@/components/motion/animated-div'
import {
  HEADER_MENU_LIST,
  HEADER_MENU_LIST_VISITOR,
  SIDEBAR_WHITE_LIST,
  TRIGGER_MAX_WIDTH,
  TRIGGER_MIN_WIDTH,
} from '@/utils/constants'

interface SidebarProps {
  width: number
  className?: string
  visible: boolean
  setVisible: (visible: boolean) => void
}

const Sidebar: FC<SidebarProps> = ({ width, className, visible, setVisible }) => {
  const { isLogin } = useSelector((state: AppState) => state.user)

  const location = useLocation()
  const [maskTrigger, setMaskTrigger] = useState(true)

  useEffect(() => setMaskTrigger(true), [location.pathname])

  useEffect(() => {
    if (!SIDEBAR_WHITE_LIST.test(location.pathname))
      return
    if (width < TRIGGER_MIN_WIDTH)
      setMaskTrigger(true)
    if (width > TRIGGER_MAX_WIDTH)
      setMaskTrigger(false)
  }, [width, location.pathname])

  return (
    <AnimatePresence>
      {maskTrigger && visible && (
        <AnimatedDiv
          key="mask"
          type="opacity-gradient"
          className="fixed left-0 top-0 z-999 h-full w-full bg-black bg-opacity-32"
          onClick={() => setVisible(false)}
        />
      )}

      {visible && (
        <AnimatedDiv
          key="sidebar"
          type="left-to-right"
          className={`rounded-r-6 shadow-2xl select-none fixed top-0 bottom-0 w-60 bg-white z-1000 ${className}`}
        >
          <div className="h-16 flex items-center gap-2.5 px-10">
            <Icon
              className="cursor-pointer"
              width={24}
              color="#858585"
              icon="ant-design:menu-outlined"
              onClick={() => setVisible(false)}
            />
            <img className="h-10 cursor-pointer" src={logo} alt="picals-logo" />
          </div>

          <ul className="m-0 list-none p-0">
            {(isLogin ? HEADER_MENU_LIST : HEADER_MENU_LIST_VISITOR).map(item => (
              <Link key={item.route} to={item.route}>
                <li
                  className={`px-5 h-12 flex items-center gap-2.5 cursor-pointer hover:bg-neutral-100 transition-duration-300 ${location.pathname.includes(item.route) ? 'bg-neutral-100' : ''}`}
                >
                  <Icon color="#858585" width={20} icon={item.icon} />
                  <span className="text-sm color-neutral-900">{item.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </AnimatedDiv>
      )}
    </AnimatePresence>
  )
}

export default Sidebar
