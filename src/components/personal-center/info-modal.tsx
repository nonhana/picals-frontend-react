import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { UserDetailInfo } from '@/utils/types'
import { Button } from 'antd'
import { PhotoView } from 'react-photo-view'
import { useSelector } from 'react-redux'

import HanaModal from '../common/hana-modal'
import HanaViewer from '../common/hana-viewer'

const genderMap = {
  0: '男性',
  1: '女性',
  2: '保密',
}

interface InfoModalProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  info: UserDetailInfo
  follow: () => void
}

const InfoModal: FC<InfoModalProps> = ({ visible, setVisible, info, follow }) => {
  const { isLogin } = useSelector((state: AppState) => state.user)
  const { id } = useSelector((state: AppState) => state.user.userInfo)

  return (
    <HanaModal title="个人信息" visible={visible} setVisible={setVisible}>
      <>
        <div className="relative h-63 w-full flex items-center justify-center bg-neutral-50 text-lg color-neutral-900 font-bold">
          <div className="flex flex-col items-center justify-center gap-3">
            <HanaViewer>
              <div className="h-24 w-24 cursor-pointer overflow-hidden rd-full">
                <PhotoView src={info.avatar}>
                  <img
                    className="h-full w-full object-cover"
                    src={info.littleAvatar}
                    alt={info.littleAvatar}
                  />
                </PhotoView>
              </div>
            </HanaViewer>
            <span>{info.username}</span>
            <span className="text-sm color-neutral font-normal">{info.email}</span>
            {isLogin && id !== info.id && (
              <Button
                type={info.isFollowed ? 'default' : 'primary'}
                size="large"
                shape="round"
                onClick={follow}
              >
                {info.isFollowed ? '已关注' : '加关注'}
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-5 p-5 text-sm color-neutral-900 font-bold">
          <div className="flex gap-5 text-wrap line-height-normal">
            <span className="shrink-0">个人简介</span>
            <span>{info.intro}</span>
          </div>
          <div className="flex gap-5 text-wrap line-height-normal">
            <span className="shrink-0">个人性别</span>
            <span>{genderMap[info.gender]}</span>
          </div>
        </div>
      </>
    </HanaModal>
  )
}

export default InfoModal
