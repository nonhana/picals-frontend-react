import type { FC } from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router'
import notFound from '@/assets/imgs/404.png'
import HanaCard from '@/components/common/hana-card'
import LazyImg from '@/components/common/lazy-img'

const NotFound: FC = () => {
  const navigate = useNavigate()
  return (
    <div className="h-screen w-screen from-#e6f9ff to-#f5f5f5 bg-gradient-to-b">
      <HanaCard>
        <div className="h-250px w-250px overflow-hidden rd-6">
          <LazyImg src={notFound} alt="notFound" />
        </div>
        <span>请求路径不存在~的说~</span>
        <span>如果页面有误，请及时反馈</span>
        <Button className="w-50" shape="round" size="large" onClick={() => navigate('/home')}>
          返回首页
        </Button>
      </HanaCard>
    </div>
  )
}

export default NotFound
