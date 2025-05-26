import type { FC } from 'react'
import type { IllustratorInfo } from '@/apis/illustrator/types'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { PhotoView } from 'react-photo-view'
import { useNavigate, useParams } from 'react-router'
import { getIllustratorDetailAPI } from '@/apis'
import HanaViewer from '@/components/common/hana-viewer'
import InfoModal from '@/components/illustrator/info-modal'
import WaterfallFlow from '@/components/illustrator/waterfall-flow'

const Illustrator: FC = () => {
  const navigate = useNavigate()
  const { illustratorId } = useParams<{ illustratorId: string }>()

  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [illustratorInfo, setIllustratorInfo] = useState<IllustratorInfo>()

  const getIllustratorDetail = async () => {
    try {
      const { data } = await getIllustratorDetailAPI({ id: illustratorId! })
      setIllustratorInfo(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getIllustratorDetail()
  }, [illustratorId])

  const [startAppreciate, setStartAppreciate] = useState(false)

  return (
    <div className="relative min-h-screen w-full flex justify-center from-#e6f9ff to-#f5f5f5 bg-gradient-to-b">
      <div className="relative mb-10 mt-30 w-300 flex flex-col items-center rd-6 bg-white">
        {illustratorInfo && (
          <div className="w-full flex items-center justify-between p-5">
            <Button
              icon={<ArrowLeftOutlined />}
              shape="round"
              size="large"
              onClick={() => navigate(-1)}
            >
              返回
            </Button>
            <div className="absolute left-1/2 top--20 flex flex-col transform items-center gap-2.5 text-lg color-neutral-900 font-bold -translate-x-1/2">
              <div className="h-40 w-40 cursor-pointer overflow-hidden b-5px rd-full b-solid color-white">
                <HanaViewer>
                  <PhotoView
                    src={
                      illustratorInfo.avatar
                      || `https://fakeimg.pl/400x400?font=noto&text=${illustratorInfo.name}`
                    }
                  >
                    <img
                      className="h-full w-full object-cover"
                      src={
                        illustratorInfo.avatar
                        || `https://fakeimg.pl/400x400?font=noto&text=${illustratorInfo.name}`
                      }
                      alt={illustratorInfo.name}
                    />
                  </PhotoView>
                </HanaViewer>
              </div>
              <span>{illustratorInfo.name}</span>
            </div>
            <div className="flex gap-5">
              <Button shape="round" size="large" onClick={() => setInfoModalVisible(true)}>
                查看画家信息
              </Button>
              <Button
                type="primary"
                shape="round"
                size="large"
                onClick={() => setStartAppreciate(true)}
              >
                开始浏览作品
              </Button>
            </div>
          </div>
        )}
        <div className="mt-15 w-full flex justify-center">
          <WaterfallFlow startAppreciate={startAppreciate} />
        </div>
      </div>

      {illustratorInfo && (
        <InfoModal
          visible={infoModalVisible}
          setVisible={setInfoModalVisible}
          info={illustratorInfo}
        />
      )}
    </div>
  )
}

export default Illustrator
