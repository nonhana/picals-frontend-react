import type { FC } from 'react'
import { Button } from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import uploadSuccessfully from '@/assets/imgs/upload-successfully.gif'
import HanaCard from '@/components/common/hana-card'
import LazyImg from '@/components/common/lazy-img'
import { saveUploadSuccess } from '@/store/modules/uploadForm'

interface UploadSuccessProps {
  workStatus: string | null
}

const UploadSuccess: FC<UploadSuccessProps> = ({ workStatus }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const returnHome = () => {
    navigate('/home')
    dispatch(saveUploadSuccess(false))
  }

  const reload = () => {
    if (workStatus === 'edit')
      navigate('/upload')
    else window.location.reload()
    dispatch(saveUploadSuccess(false))
  }

  return (
    <HanaCard>
      <div className="h-250px w-250px overflow-hidden rd-6">
        <LazyImg src={uploadSuccessfully} alt="uploadSuccessfully" />
      </div>
      <span>上传成功，正在审核中~！</span>
      <span>上传成功后会展示在首页哦~</span>
      <span>感谢您对小站做出的贡献！！( &gt; w &lt; )</span>
      <div className="flex gap-5">
        <Button className="w-50" shape="round" size="large" type="default" onClick={returnHome}>
          返回首页
        </Button>
        <Button className="w-50" shape="round" size="large" type="primary" onClick={reload}>
          重新上传作品
        </Button>
      </div>
    </HanaCard>
  )
}

export default UploadSuccess
