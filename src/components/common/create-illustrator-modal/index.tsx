import type { UploadProps } from 'antd'
import type { FC } from 'react'
import type { INewIllustratorReq } from '@/apis/illustrator/types'
import { Icon } from '@iconify/react'
import { Flex, Input, message, Modal, notification, Select, Upload } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import LazyImg from '../lazy-img'

const { Option } = Select

interface CreateIllustratorModalProps {
  modalStatus: boolean
  confirmAction: () => void
  cancelAction: () => void
  formInfo: INewIllustratorReq
  setFormInfo: React.Dispatch<React.SetStateAction<INewIllustratorReq>>
  homeUrlPrefix: string
  setHomeUrlPrefix: (value: string) => void
  illustratorId: string
  setIllustratorId: React.Dispatch<React.SetStateAction<string>>
}

const CreateIllustratorModal: FC<CreateIllustratorModalProps> = ({
  modalStatus,
  confirmAction,
  cancelAction,
  formInfo,
  setFormInfo,
  homeUrlPrefix,
  setHomeUrlPrefix,
  illustratorId,
  setIllustratorId,
}) => {
  const [imgHovering, setImgHovering] = useState(false)

  const removeImg = () => {
    setFormInfo((prev) => {
      const newFormInfo = { ...prev }
      delete newFormInfo.avatar
      return newFormInfo
    })
    setImgHovering(false)
  }

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: true,
    action: `${import.meta.env.VITE_BASE_URL}/api/tool/upload-single-img`,
    showUploadList: false,
    accept: '.jpg,.png,.gif',
    onChange(info) {
      const { status } = info.file
      if (status === 'done') {
        setFormInfo({ ...formInfo, avatar: info.file.response.data })
        message.success(`${info.file.name} 上传成功`)
      }
      else if (status === 'error') {
        notification.error({
          message: '上传失败',
          description: info.file.response.message || '未知错误',
        })
      }
    },
  }

  const homeUrlPrefixes = (
    <Select defaultValue={homeUrlPrefix} onChange={setHomeUrlPrefix}>
      <Option value="https://www.pixiv.net/users/">https://www.pixiv.net/users/</Option>
      <Option value="https://x.com/">https://x.com/</Option>
    </Select>
  )

  return (
    <Modal
      title="新增插画家"
      width="600px"
      open={modalStatus}
      okText="确认"
      cancelText="取消"
      onOk={confirmAction}
      onCancel={cancelAction}
    >
      <Flex vertical gap={20} className="mt-5">
        <Flex align="center">
          <span className="w-80px flex">
            <span className="w-2 color-red">*</span>
            名称：
          </span>
          <Input
            className="w-450px"
            placeholder="请输入插画家名称"
            value={formInfo.name}
            onChange={e => setFormInfo({ ...formInfo, name: e.target.value })}
          />
        </Flex>
        <Flex align="center">
          <span className="w-80px flex">
            <span className="w-2 color-red">*</span>
            主页：
          </span>
          <Input
            className="w-450px"
            addonBefore={homeUrlPrefixes}
            placeholder="请输入插画家的对应主页id"
            value={illustratorId}
            onChange={e => setIllustratorId(e.target.value)}
          />
        </Flex>
        <Flex align="center">
          <span className="w-80px flex">
            <span className="w-2" />
            简介：
          </span>
          <Input
            className="w-450px"
            placeholder="请输入插画家简介"
            value={formInfo.intro}
            onChange={e => setFormInfo({ ...formInfo, intro: e.target.value })}
          />
        </Flex>
        <Flex align="center">
          <span className="w-80px flex">
            <span className="w-2" />
            头像：
          </span>
          {formInfo.avatar
            ? (
                <div
                  className="relative h-100px w-100px cursor-pointer overflow-hidden rd-1"
                  onMouseEnter={() => setImgHovering(true)}
                  onMouseLeave={() => setImgHovering(false)}
                >
                  <AnimatePresence>
                    {imgHovering && (
                      <motion.div
                        className="text-m absolute left-0 top-0 z-1 h-full w-full flex items-center justify-center bg-black bg-opacity-32 text-white"
                        onClick={removeImg}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span>移除图片</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <LazyImg src={formInfo.avatar} alt={formInfo.avatar} />
                </div>
              )
            : (
                <Upload {...uploadProps}>
                  <div className="h-100px w-100px flex cursor-pointer items-center justify-center bg-neutral-100">
                    <Icon width="24px" color="#858585" icon="ant-design:upload-outlined" />
                  </div>
                </Upload>
              )}
        </Flex>
      </Flex>
    </Modal>
  )
}

export default CreateIllustratorModal
