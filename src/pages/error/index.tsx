import type { FallbackProps } from 'react-error-boundary'
import { Button } from 'antd'
import { useNavigate } from 'react-router'
import ErrorImg from '@/assets/imgs/500.png'
import HanaCard from '@/components/common/hana-card'
import LazyImg from '@/components/common/lazy-img'

function Error({ error }: FallbackProps) {
  const navigate = useNavigate()
  return (
    <div className="h-screen w-screen from-#e6f9ff to-#f5f5f5 bg-gradient-to-b">
      <HanaCard>
        <div className="h-250px w-250px overflow-hidden rd-6">
          <LazyImg src={ErrorImg} alt="ErrorImg" />
        </div>
        <span>页面发生错误：</span>
        <div className="relative rd-1 bg-neutral-100 p-5 text-sm color-red">
          <span>{error.message}</span>
        </div>
        <span>请向管理员汇报~！</span>
        <Button className="w-50" shape="round" size="large" onClick={() => navigate('/home')}>
          返回首页
        </Button>
      </HanaCard>
    </div>
  )
}

export default Error
