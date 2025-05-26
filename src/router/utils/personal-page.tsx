import type { FC } from 'react'
import { message } from 'antd'
import { use, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PersonalContext } from '@/pages/personal-center'

const PersonalPage: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMe } = use(PersonalContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isMe) {
      message.info('无法进入他人的数据页面')
      navigate('../works')
    }
  }, [isMe, navigate])

  if (isMe)
    return <>{children}</>
  return null
}

export default PersonalPage
