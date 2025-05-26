import type { FC } from 'react'
import type { AppState } from '@/store/types'
import { message } from 'antd'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

const AuthRouter: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLogin } = useSelector((state: AppState) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLogin) {
      message.info('您尚未登录，无法进入此页面哦~')
      navigate('/home')
    }
  }, [isLogin, navigate])

  if (isLogin)
    return <>{children}</>
  return null
}

export default AuthRouter
