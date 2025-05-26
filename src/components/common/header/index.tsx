import type { InputRef } from 'antd'
import type { FC } from 'react'
import type { AppState } from '@/store/types'
import { SearchOutlined, UploadOutlined } from '@ant-design/icons'
import { Icon } from '@iconify/react'
import { Button, Input, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import logo from '@/assets/svgs/logo.svg'
import { SIDEBAR_WHITE_LIST, TRIGGER_MAX_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils/constants'

import LazyImg from '../lazy-img'
import SearchDropdown from './search-dropdown'
import Sidebar from './sidebar'
import UserDropdown from './user-dropdown'

const { Search } = Input

interface HeaderProps {
  width: number
  changeSideBarStatus: (status: boolean) => void
  setNaturalSideBarVisible: (status: boolean) => void
}

const Header: FC<HeaderProps> = ({ width, changeSideBarStatus, setNaturalSideBarVisible }) => {
  const searchParams = useSearchParams()[0]
  const searchLabel = searchParams.get('label')
  const location = useLocation()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  useEffect(() => changeSideBarStatus(showSidebar), [showSidebar])

  // 当路径变化时，隐藏所有工具栏
  useEffect(() => {
    setShowSidebar(false)
    setShowSearchDropdown(false)
    setShowUserDropdown(false)
  }, [location])

  useEffect(() => {
    if (!SIDEBAR_WHITE_LIST.test(location.pathname))
      return
    if (width < TRIGGER_MIN_WIDTH) {
      setShowSidebar(false)
      setNaturalSideBarVisible(false)
    }
    if (width > TRIGGER_MAX_WIDTH) {
      setShowSidebar(true)
      setNaturalSideBarVisible(true)
    }
  }, [width, location.pathname])

  const { userInfo, isLogin } = useSelector((state: AppState) => state.user)

  const searchRef = useRef<InputRef>(null)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    setKeyword(searchParams.get('label') || '')
  }, [searchLabel])

  const handleSearch = (value: string) => {
    value = value.trim()
    if (!value) {
      message.warning('请输入有效搜索内容~')
      return
    }
    navigate({
      pathname: '/search-result',
      search: `?label=${value}&type=work&sortType=new`,
    })
    setShowSearchDropdown(false)
    searchRef.current?.input?.blur()
  }

  const toUpload = () => {
    if (location.pathname === '/upload')
      return
    navigate('/upload')
  }

  return (
    <div className="relative w-full">
      <Icon
        className="fixed left-10 z-1 h-16 cursor-pointer"
        width={24}
        color="#858585"
        icon="ant-design:menu-outlined"
        onClick={() => setShowSidebar(true)}
      />

      <div
        style={{ zIndex: showSearchDropdown ? 2000 : 0 }}
        className="relative h-16 w-full flex select-none items-center justify-between bg-white px-10"
      >
        <img
          onClick={() => {
            navigate('/home')
          }}
          className="ml-34px h-10 cursor-pointer"
          src={logo}
          alt="picals-logo"
        />

        <div className="absolute left-1/2 top-1/2 w-30% hidden md:block -translate-x-1/2 -translate-y-1/2">
          <Search
            ref={searchRef}
            size="large"
            placeholder="请输入你想搜索的内容呀~"
            allowClear
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            onSearch={value => handleSearch(value)}
          />
        </div>

        <div className="flex items-center gap-5">
          <Link to="https://github.com/nonhana/Picals-Frontend-React" target="_blank">
            <Icon width={32} color="#858585" icon="ant-design:github-filled" />
          </Link>
          <Button
            shape="circle"
            type="default"
            size="middle"
            icon={<SearchOutlined />}
            className="block md:hidden"
          />

          {isLogin && (
            <Button
              shape={isMobile ? 'circle' : 'round'}
              type="default"
              size="middle"
              icon={<UploadOutlined />}
              onClick={toUpload}
            >
              <span className="color-neutral hidden md:block">转载/投稿作品</span>
            </Button>
          )}
          {isLogin
            ? (
                <div
                  className="h-10 w-10 flex cursor-pointer items-center justify-center overflow-hidden rd-20"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <LazyImg src={userInfo.littleAvatar} alt="avatar" />
                </div>
              )
            : (
                <Link
                  to="/login"
                  className="h-10 w-10 flex cursor-pointer items-center justify-center rounded-full bg-neutral-300 text-sm color-white"
                >
                  <span>登录</span>
                </Link>
              )}
        </div>
      </div>

      <Sidebar
        className="left-0 top-0"
        width={width}
        visible={showSidebar}
        setVisible={setShowSidebar}
      />

      <SearchDropdown
        className="left-1/2 top-16 -translate-x-1/2"
        visible={showSearchDropdown}
        setVisible={setShowSearchDropdown}
        setKeyword={setKeyword}
      />

      {isLogin && (
        <UserDropdown
          className="right-10 top-16"
          visible={showUserDropdown}
          setVisible={setShowUserDropdown}
        />
      )}
    </div>
  )
}

export default Header
