import type { DragEndEvent } from '@dnd-kit/core'
import type { UploadProps } from 'antd'
import type { FC } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { message, notification, Progress, Upload } from 'antd'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import HanaModal from '@/components/common/hana-modal'
import HanaViewer from '@/components/common/hana-viewer'

import DraggableImg from './draggable-img'

const { Dragger } = Upload

interface ImgUploadProps {
  imgList: string[]
  setImgList: React.Dispatch<React.SetStateAction<string[]>>
}

const ImgUpload: FC<ImgUploadProps> = ({
  imgList: sourceImgList,
  setImgList: setSourceImgList,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [uploadList, setUploadList] = useState<{ fileName: string, progress: number }[]>([])
  const orderedList = useRef<string[]>([])
  // 防止图片列表预览组件因图片列表获取不完全而出现显示错误（setXxx是异步的）
  const [imgList, setImgList] = useState<string[]>([])
  const [imgListVisible, setImgListVisible] = useState(false)

  useEffect(() => {
    setImgListVisible(false)
    setImgList(sourceImgList)
  }, [sourceImgList])

  useEffect(() => {
    setImgListVisible(true)
  }, [imgList])

  const handleSubmit = async (file: File, index: number) => {
    const newUploadItem = { fileName: file.name, progress: 0 }
    setUploadList(prevList => [...prevList, newUploadItem])
    setShowModal(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/tool/upload-single-img`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || file.size),
            )
            setUploadList(prevList =>
              prevList.map(item =>
                item.fileName === file.name ? { ...item, progress: percentCompleted } : item,
              ),
            )
          },
        },
      )

      orderedList.current[index] = data.data
      if (orderedList.current.every(item => item)) {
        setSourceImgList([...imgList, ...orderedList.current])
        orderedList.current = [] // 清空临时数组
      }
      setUploadList(prevList => prevList.filter(item => item.fileName !== file.name))
      message.success(`${file.name}上传成功！`)
    }
    catch (error: any) {
      notification.error({
        message: '上传失败',
        description: error.response?.data?.message || '上传过程中出现错误，请稍后再试。',
      })
    }
    finally {
      if (uploadList.length === 0)
        setShowModal(false)
    }
  }

  const uploadProps: UploadProps = {
    name: 'image',
    multiple: true,
    customRequest: async (options) => {
      const file = options.file as File
      const index = orderedList.current.length
      orderedList.current.push('') // 占位符，用于记录图片上传后的url的位置
      await handleSubmit(file, index)
    },
    showUploadList: false,
    accept: '.jpg,.png,.gif',
    beforeUpload: (file) => {
      // 检验大小
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        message.error('图片大小不能超过10MB！')
      }

      // 检验格式是否符合.jpg .png .gif
      const allowFormat
        = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
      if (!allowFormat) {
        message.error('只能上传JPG/PNG/GIF格式的图片！')
      }

      return isLt10M && allowFormat
    },
  }

  const onDelete = (index: number) => {
    const newImgList = imgList.filter((_, idx) => idx !== index)
    setSourceImgList(newImgList)
  }

  /* ----------图片列表拖曳排序相关---------- */
  // 拖拽传感器，在移动像素5px范围内，不触发拖拽事件
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  // 拖拽结束后的操作
  const dragEndEvent = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = imgList.findIndex(url => url === active.id)
      const newIndex = imgList.findIndex(url => url === over.id)
      const newImgList = arrayMove(imgList, oldIndex, newIndex)
      setSourceImgList(newImgList)
    }
  }

  return (
    <>
      <div className="relative flex flex-col items-center gap-5">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击上传或者把图片们拖进来~！</p>
          <p className="ant-upload-hint">
            支持JPG、PNG、GIF格式的图片，大小≤10MB！再大就不行了哦！
          </p>
        </Dragger>

        <div className="w-212 flex flex-wrap gap-5">
          {imgListVisible && (
            <DndContext
              onDragEnd={dragEndEvent}
              modifiers={[restrictToParentElement]}
              sensors={sensors}
            >
              <SortableContext items={imgList} strategy={rectSortingStrategy}>
                <HanaViewer onDelete={onDelete}>
                  {imgList.map(url => (
                    <DraggableImg key={url} id={url} src={url} />
                  ))}
                </HanaViewer>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <HanaModal
        title="图片上传"
        visible={showModal}
        setVisible={setShowModal}
        allowActivelyClose={false}
      >
        <div className="w-full scrollbar-none">
          <div className="m-10 mt-0 max-h-200 overflow-y-scroll">
            {uploadList.map(item => (
              <div key={item.fileName} className="mb-2 h-8 flex items-center">
                <span className="inline-block w-45 overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.fileName}
                  ：
                </span>
                <Progress percent={item.progress} />
              </div>
            ))}
          </div>
        </div>
      </HanaModal>
    </>
  )
}

export default ImgUpload
