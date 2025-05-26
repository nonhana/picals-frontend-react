import type { FC } from 'react'
import type { IllustratorInfo } from '@/apis/illustrator/types'
import { useEffect, useState } from 'react'
import { PhotoView } from 'react-photo-view'
import { Link } from 'react-router'

import HanaModal from '../common/hana-modal'
import HanaViewer from '../common/hana-viewer'

interface InfoModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  info: IllustratorInfo
}

const InfoModal: FC<InfoModalProps> = ({ visible, setVisible, info }) => {
  const [illustratorAvatar, setIllustratorAvatar] = useState<string>('')

  useEffect(() => {
    setIllustratorAvatar(info.avatar || `https://fakeimg.pl/400x400?font=noto&text=${info.name}`)
  }, [info.avatar])

  return (
    <HanaModal title="插画家信息" visible={visible} setVisible={setVisible}>
      <>
        <div className="relative h-63 w-full flex items-center justify-center bg-neutral-50 text-lg color-neutral-900 font-bold">
          <div className="flex flex-col items-center justify-center gap-3">
            <HanaViewer>
              <div className="h-24 w-24 cursor-pointer overflow-hidden rd-full">
                <PhotoView src={illustratorAvatar}>
                  <img
                    className="h-full w-full object-cover"
                    src={illustratorAvatar}
                    alt={info.name}
                  />
                </PhotoView>
              </div>
            </HanaViewer>
            <span>{info.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 text-sm color-neutral-900 font-bold">
          <div className="flex gap-5 text-wrap line-height-normal">
            <span className="w-25 shrink-0">现收录作品数</span>
            <span>{info.workNum}</span>
          </div>
          <div className="flex gap-5 text-wrap line-height-normal">
            <span className="w-25 shrink-0">个人简介</span>
            <span>{info.intro || '暂无关于该插画家的简介，待补充！'}</span>
          </div>
          <div className="flex gap-5 text-wrap line-height-normal">
            <span className="w-25 shrink-0">个人主页</span>
            <Link to={info.homeUrl} target="_blank" className="color-azure">
              {info.homeUrl}
            </Link>
          </div>
        </div>
      </>
    </HanaModal>
  )
}

export default InfoModal
