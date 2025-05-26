import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { UploadWorkFormInfo } from '@/utils/types'
import { Icon } from '@iconify/react'
import { Button, message, Modal, notification } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router'
import { editWorkAPI, getWorkDetailAPI, uploadWorkAPI } from '@/apis'
import Empty from '@/components/common/empty'
import HanaModal from '@/components/common/hana-modal'
import UploadForm from '@/components/upload/form'
import ImgUpload from '@/components/upload/img-upload'
import UploadSuccess from '@/components/upload/success'
import { saveFormInfo, saveImgList, saveUploadSuccess } from '@/store/modules/uploadForm'

const initialFormInfo: UploadWorkFormInfo = {
  basicInfo: {
    name: '',
    intro: '',
    reprintType: 1,
    openComment: true,
    isAIGenerated: false,
  },
  labels: [],
}

const Upload: FC = () => {
  const dispatch = useDispatch()

  const { id: localUserId } = useSelector((state: AppState) => state.user.userInfo)
  const { imgList: storedImgList, formInfo: storedFormInfo } = useSelector(
    (state: AppState) => state.uploadForm,
  )

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const workStatus = searchParams.get('type')
  const workId = searchParams.get('workId')
  const editMode = useMemo(
    () => workStatus && workId && workStatus === 'edit',
    [workStatus, workId],
  )

  const [imgList, setImgList] = useState<string[]>(storedImgList)
  const [formInfo, setFormInfo] = useState<UploadWorkFormInfo>(storedFormInfo)
  const [formResetTrigger, setFormResetTrigger] = useState<boolean>(false)

  const [showEditForm, setShowEditForm] = useState<boolean>(true)
  const [editFormLoaded, setEditFormLoaded] = useState<boolean>(false)
  const [originInfo, setOriginInfo] = useState<UploadWorkFormInfo>()

  const resetForm = useCallback(() => {
    setFormResetTrigger(prev => !prev)
    setShowEditForm(false)
    setImgList([])
    setFormInfo(initialFormInfo)
    dispatch(saveImgList([]))
    dispatch(saveFormInfo(initialFormInfo))
  }, [dispatch])

  useEffect(() => {
    if (formResetTrigger && imgList.length === 0 && formInfo.basicInfo.name === '') {
      setFormResetTrigger(false)
      setShowEditForm(true)
    }
  }, [formResetTrigger, imgList, formInfo])

  useEffect(() => {
    dispatch(saveImgList(imgList))
    dispatch(saveFormInfo(formInfo))
  }, [imgList, formInfo, dispatch])

  useEffect(() => {
    if (editMode) {
      setShowEditForm(false)
      const fetchWorkDetail = async () => {
        try {
          const { data } = await getWorkDetailAPI({ id: workId! })

          if (!data) {
            notification.error({
              message: '作品不存在！',
              description: '请检查作品 ID 是否正确，不要随便输入 ID 哦！',
            })
            return
          }
          if (data.authorId !== localUserId) {
            notification.error({
              message: '无权编辑！',
              description: '只能编辑自己的作品哦！',
            })
            return
          }

          const originWorkInfo: UploadWorkFormInfo = {
            basicInfo: {
              name: data.name,
              intro: data.intro,
              reprintType: data.reprintType,
              openComment: data.openComment,
              isAIGenerated: data.isAIGenerated,
            },
            labels: data.labels.map(label => label.name),
          }
          if (data.reprintType !== 0) {
            originWorkInfo.illustratorInfo = {
              name: data.illustrator!.name,
              homeUrl: data.illustrator!.homeUrl,
            }
          }
          if (data.reprintType === 1)
            originWorkInfo.basicInfo.workUrl = data.workUrl
          setOriginInfo(originWorkInfo)
          setImgList(data.imgList)
          setFormInfo(originWorkInfo)
        }
        catch (error) {
          console.error('获取作品详情时发生错误:', error)
          notification.error({
            message: '获取作品详情失败',
            description: '请稍后重试或联系管理员。',
          })
        }
      }
      fetchWorkDetail()

      return () => resetForm()
    }
  }, [editMode, workId, localUserId, resetForm])

  useEffect(() => {
    if (
      editMode
      && originInfo
      && !editFormLoaded
      && formInfo.basicInfo.name === originInfo.basicInfo.name
    ) {
      setEditFormLoaded(true)
    }
  }, [editMode, formInfo, originInfo, editFormLoaded])

  useEffect(() => {
    if (editMode && editFormLoaded)
      setShowEditForm(true)
  }, [editMode, editFormLoaded])

  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [submitTrigger, setSubmitTrigger] = useState(0)
  const [uploading, setUploading] = useState(false)

  const uploadWork = useCallback(async () => {
    try {
      setUploading(true)
      const uploadWorkInfo = {
        ...formInfo.basicInfo,
        labels: formInfo.labels,
        imgList,
        illustratorInfo: formInfo.illustratorInfo,
      }
      if (editMode) {
        await editWorkAPI({ id: workId!, ...uploadWorkInfo })
      }
      else {
        await uploadWorkAPI(uploadWorkInfo)
      }
      setUploadSuccess(true)
      dispatch(saveUploadSuccess(true))
      resetForm()
    }
    catch (error) {
      console.error('上传作品时发生错误:', error)
      notification.error({
        message: '上传作品失败',
        description: '请稍后重试或联系管理员。',
      })
    }
    finally {
      setUploading(false)
    }
  }, [formInfo, imgList, editMode, workId, resetForm])

  const [modal, contextHolder] = Modal.useModal()

  const handleResetForm = () => {
    modal.confirm({
      title: '确定要重置表单吗？',
      content: '重置后，当前表单内容将会被清空。',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        resetForm()
        message.success('表单已重置！')
      },
    })
  }

  return (
    <>
      {contextHolder}

      <div className="relative min-h-screen w-full flex flex-col items-center gap-5 from-#e6f9ff to-#f5f5f5 bg-gradient-to-b py-5">
        {uploadSuccess
          ? (
              <UploadSuccess workStatus={workStatus} />
            )
          : (
              <>
                <ImgUpload imgList={imgList} setImgList={setImgList} />
                {showEditForm
                  ? (
                      <UploadForm
                        formInfo={formInfo}
                        setFormInfo={setFormInfo}
                        submitTrigger={submitTrigger}
                        uploadWork={uploadWork}
                      />
                    )
                  : (
                      <div className="relative h-100 w-200">
                        <Empty text="看到这个，你肯定是做了一些不好的事情，对吗？" />
                      </div>
                    )}
                <div className="flex gap-5">
                  <Button className="w-40" shape="round" size="large" danger onClick={handleResetForm}>
                    重置表单
                  </Button>
                  <Button
                    className="w-40"
                    shape="round"
                    size="large"
                    type="default"
                    onClick={() => navigate('/home')}
                  >
                    取消
                    {editMode ? '编辑' : '投稿'}
                  </Button>
                  <Button
                    className="w-40"
                    shape="round"
                    size="large"
                    type="primary"
                    loading={uploading}
                    onClick={() => setSubmitTrigger(prev => prev + 1)}
                  >
                    {editMode ? '编辑' : '投稿'}
                    作品
                  </Button>
                </div>
              </>
            )}
      </div>

      <HanaModal
        title="正在上传ing..."
        visible={uploading}
        setVisible={setUploading}
        allowActivelyClose={false}
      >
        <div className="m-10 mt-0 flex flex-col items-center justify-center gap-5">
          <Icon
            color="#3d3d3d"
            width={36}
            className="animate-spin"
            icon="material-symbols:hourglass-empty"
          />
          <span>正在逐张处理您上传的图片，请稍微等一下哦！！(&gt; v &lt;)</span>
          <span>当然，图片上传的优化方案也一直在不断研究中！!</span>
        </div>
      </HanaModal>
    </>
  )
}

export default Upload
