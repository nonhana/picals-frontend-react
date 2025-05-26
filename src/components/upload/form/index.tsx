import type { FormProps, SelectProps } from 'antd'
import type { FC } from 'react'
import type { INewIllustratorReq } from '@/apis/illustrator/types'
import type { UploadWorkFormInfo } from '@/utils/types'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, message, Modal, Radio, Select, Spin } from 'antd'
import { debounce } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getIllustratorDetailAPI,
  getIllustratorListInPagesAPI,
  getLabelsInPagesAPI,
  getWorkCountAPI,
  newIllustratorAPI,
  searchIllustratorsAPI,
  searchLabelsAPI,
} from '@/apis'
import CreateIllustratorModal from '@/components/common/create-illustrator-modal'
import Empty from '@/components/common/empty'

interface SelectableItemInfo {
  value: string
  label: string
}

export interface DebounceSelectProps<ValueType>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>
  debounceTimeout?: number
}

function DebounceSelect<ValueType extends SelectableItemInfo>({
  value,
  onChange,
  fetchOptions,
  debounceTimeout = 500,
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState<ValueType[]>([])
  const [current, setCurrent] = useState(1)
  const [isFinal, setIsFinal] = useState(false)
  const [searching, setSearching] = useState(false)
  const dropdownList = useRef<any>(null)
  const pageSize = 20
  const fetchRef = useRef(0)

  const getIllustratorList = async (reset?: boolean) => {
    try {
      const { data } = await getIllustratorListInPagesAPI({ current, pageSize })
      if (data.length < pageSize)
        setIsFinal(true)
      const result = data.map(item => ({ value: item.id, label: item.name }))
      if (reset) {
        setOptions(result as ValueType[])
      }
      else {
        setOptions(options.concat(result as ValueType[]))
      }
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (isFinal)
      return
    getIllustratorList()
  }, [current, isFinal])

  const onPopupScroll = (e: any) => {
    dropdownList.current = e.target
    if (searching)
      return
    e.persist()
    const { scrollTop, offsetHeight, scrollHeight } = e.target
    if (scrollTop + offsetHeight === scrollHeight) {
      setCurrent(prev => prev + 1)
    }
  }

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      if (value === '') {
        setCurrent(1)
        return
      }
      setSearching(true)
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setOptions([])
      setFetching(true)

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current)
          return
        setOptions(newOptions)
        setFetching(false)
      })
    }

    return debounce(loadOptions, debounceTimeout)
  }, [fetchOptions, debounceTimeout])

  const initialIllustratorList = () => {
    setOptions([])
    if (current === 1) {
      getIllustratorList(true)
    }
    else {
      setCurrent(1)
      setIsFinal(false)
    }
  }

  const onDropdownVisibleChange = (open: boolean) => {
    if (!open) {
      initialIllustratorList()
      setSearching(false)
      dropdownList.current.scrollTop = 0
    }
  }

  return (
    <Select
      showSearch
      placeholder="输入插画家的名字进行搜索~"
      value={value}
      onChange={onChange}
      filterOption={false}
      onSearch={debounceFetcher}
      onPopupScroll={onPopupScroll}
      notFoundContent={fetching ? <Spin size="small" /> : <Empty showImg={false} />}
      onDropdownVisibleChange={onDropdownVisibleChange}
      options={options}
    />
  )
}

interface UploadFormProps {
  formInfo: UploadWorkFormInfo
  setFormInfo: React.Dispatch<React.SetStateAction<UploadWorkFormInfo>>
  submitTrigger: number
  uploadWork: () => void
}

const wrapperStyle = 'relative bg-white w-155 p-5 rd-6 mb-5'
const titleStyle = 'text-xl font-bold color-neutral mb-5'
const labelStyle = 'text-base font-bold color-neutral-900'

const { TextArea } = Input

const Label: FC<{ text: string }> = ({ text }) => {
  return (
    <div className={labelStyle}>
      <span>{text}</span>
    </div>
  )
}

const UploadForm: FC<UploadFormProps> = ({ formInfo, setFormInfo, submitTrigger, uploadWork }) => {
  /* ----------表单本身逻辑相关---------- */
  const [messageApi, msgContextHolder] = message.useMessage()
  const [workForm] = Form.useForm()

  const submitWork: FormProps<UploadWorkFormInfo>['onFinish'] = () => uploadWork()

  const handleFailed: FormProps<UploadWorkFormInfo>['onFinishFailed'] = () => {
    messageApi.error('检查一下表单是否填写完整！')
  }

  const changeReprinted = (value: number) => {
    setFormInfo(prevFormInfo => ({
      ...prevFormInfo,
      basicInfo: {
        ...prevFormInfo.basicInfo,
        reprintType: value,
      },
    }))
    if (value) {
      setFormInfo(prevFormInfo => ({
        ...prevFormInfo,
        illustratorInfo: {
          name: '',
          homeUrl: '',
        },
      }))
    }
    else {
      setFormInfo((prevFormInfo) => {
        const { illustratorInfo: _, ...rest } = prevFormInfo
        return rest
      })
    }
  }

  useEffect(() => {
    if (submitTrigger === 0)
      return
    workForm.submit()
  }, [submitTrigger])

  /* ----------标签选择相关---------- */
  const [labels, setLabels] = useState<SelectableItemInfo[]>([])
  const [current, setCurrent] = useState(1)
  const [isFinal, setIsFinal] = useState(false)
  const [searching, setSearching] = useState(false)
  const dropdownList = useRef<any>(null)
  const pageSize = 20

  const getLabels = async (reset?: boolean) => {
    try {
      const { data } = await getLabelsInPagesAPI({ current, pageSize })
      if (data.length < pageSize)
        setIsFinal(true)
      const result = data.map(item => ({ value: item.name, label: item.name }))
      if (reset) {
        setLabels(result)
      }
      else {
        setLabels(labels.concat(result))
      }
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    if (isFinal)
      return
    getLabels()
  }, [current, isFinal])

  const onPopupScroll = (e: any) => {
    dropdownList.current = e.target
    if (searching)
      return
    e.persist()
    const { scrollTop, offsetHeight, scrollHeight } = e.target
    if (scrollTop + offsetHeight === scrollHeight) {
      setCurrent(prev => prev + 1)
    }
  }

  let timeout: ReturnType<typeof setTimeout> | null
  let currentValue: string

  const fetchLabels = (value: string, callback: (data: SelectableItemInfo[]) => void) => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    currentValue = value

    const fake = () => {
      searchLabelsAPI({ keyword: value }).then((result) => {
        if (currentValue === value) {
          const data = result.data.map(item => ({
            value: item.name,
            label: item.name,
          }))
          callback(data)
        }
      })
    }
    if (value) {
      timeout = setTimeout(fake, 300)
    }
    else {
      setCurrent(1)
    }
  }

  const searchLabels = async (value: string) => {
    setSearching(true)
    fetchLabels(value, setLabels)
  }

  const initialLabelList = () => {
    setLabels([])
    if (current === 1) {
      getLabels(true)
    }
    else {
      setCurrent(1)
      setIsFinal(false)
    }
  }

  const onDropdownVisibleChange = (open: boolean) => {
    if (!open) {
      initialLabelList()
      setSearching(false)
      dropdownList.current.scrollTop = 0
    }
  }

  /* ----------插画家选择相关---------- */
  const fetchIllustratorList = async (keyword: string): Promise<SelectableItemInfo[]> => {
    try {
      const { data } = await searchIllustratorsAPI({ keyword })
      const result = data.map(item => ({ value: item.id, label: item.name }))
      return result
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return []
    }
  }

  const selectIllustrator = async (value: any) => {
    const { data } = await getIllustratorDetailAPI({ id: value })
    setFormInfo(prevFormInfo => ({
      ...prevFormInfo,
      illustratorInfo: {
        name: data.name,
        homeUrl: data.homeUrl,
      },
    }))
    workForm.setFieldsValue({ illustratorInfo: { name: data.name, homeUrl: data.homeUrl } })
  }

  /* ----------新增插画家相关---------- */
  const [modalStatus, setModalStatus] = useState(false)
  const [newIllustratorInfo, setNewIllustratorInfo] = useState<INewIllustratorReq>({
    name: '',
    homeUrl: '',
  })
  const [homeUrlPrefix, setHomeUrlPrefix] = useState('https://www.pixiv.net/users/')
  const [illustratorId, setIllustratorId] = useState('')

  useEffect(() => {
    setNewIllustratorInfo({
      ...newIllustratorInfo,
      homeUrl: homeUrlPrefix + illustratorId,
    })
  }, [homeUrlPrefix, illustratorId])

  const confirmAction = async () => {
    try {
      if (illustratorId === '') {
        messageApi.error('请填写插画家ID！')
        return
      }
      await newIllustratorAPI(newIllustratorInfo)
      setModalStatus(false)
      messageApi.success('新建插画家成功！')
      // 将新的插画家信息填写至表单
      setFormInfo(prevFormInfo => ({
        ...prevFormInfo,
        illustratorInfo: {
          name: newIllustratorInfo.name,
          homeUrl: newIllustratorInfo.homeUrl,
        },
      }))
      workForm.setFieldsValue({
        illustratorInfo: {
          name: newIllustratorInfo.name,
          homeUrl: newIllustratorInfo.homeUrl,
        },
      })
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const [modal, modalContextHolder] = Modal.useModal()
  const cancelAction = () => {
    modal.confirm({
      title: '确定要关闭吗？',
      icon: <ExclamationCircleOutlined />,
      content: '关闭窗口后，填写的信息将不会保存！',
      okText: '确定',
      cancelText: '取消',
      onOk: () => setModalStatus(false),
    })
  }

  useEffect(() => {
    if (!modalStatus) {
      setNewIllustratorInfo({ name: '', homeUrl: '' })
      setHomeUrlPrefix('https://www.pixiv.net/users/')
      setIllustratorId('')
    }
  }, [modalStatus])

  const [workCount, setWorkCount] = useState(0)

  const getWorkCount = async () => {
    try {
      const { data } = await getWorkCountAPI()
      setWorkCount(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getWorkCount()
  }, [])

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}

      <Form
        name="workForm"
        form={workForm}
        size="large"
        labelAlign="left"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={formInfo}
        onFinish={submitWork}
        onFinishFailed={handleFailed}
        autoComplete="off"
      >
        <div className={`${wrapperStyle}`}>
          <div
            style={{ margin: 0 }}
            className={`${titleStyle} font-normal flex items-center justify-between`}
          >
            <span className="color-azure">Total number of works currently saved:</span>
            <span className="text-3xl color-neutral-900">{workCount}</span>
          </div>
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>基本信息填写</span>
          </div>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text="作品名称" />}
            name={['basicInfo', 'name']}
          >
            <Input
              placeholder="请输入作品名称（可为空）"
              showCount
              maxLength={64}
              value={formInfo.basicInfo.name}
              onChange={e =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, name: e.target.value },
                })}
            />
          </Form.Item>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text="作品简介" />}
            name={['basicInfo', 'intro']}
          >
            <TextArea
              placeholder="请输入简介~不超过1024个字哦！（可为空）"
              showCount
              maxLength={1024}
              autoSize={{ minRows: 4, maxRows: 8 }}
              value={formInfo.basicInfo.intro}
              onChange={e =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, intro: e.target.value },
                })}
            />
          </Form.Item>

          <Form.Item<UploadWorkFormInfo>
            label={<Label text="是否转载" />}
            name={['basicInfo', 'reprintType']}
            rules={[{ required: true, message: '请选择是否转载作品！' }]}
          >
            <Radio.Group
              value={formInfo.basicInfo.reprintType}
              onChange={event => changeReprinted(event.target.value)}
            >
              <Radio value={2}>合集作品</Radio>
              <Radio value={1}>转载作品</Radio>
              <Radio value={0}>原创作品</Radio>
            </Radio.Group>
          </Form.Item>

          {formInfo.basicInfo.reprintType !== 0 && (
            <>
              {formInfo.basicInfo.reprintType === 1 && (
                <Form.Item<UploadWorkFormInfo>
                  label={<Label text="作品URL" />}
                  name={['basicInfo', 'workUrl']}
                  rules={[
                    { required: true, message: '请输入收藏作品的源地址！' },
                    { type: 'url', message: '请输入正确的URL地址！' },
                  ]}
                >
                  <Input
                    placeholder="请输入收藏作品的源地址"
                    value={formInfo.basicInfo.workUrl}
                    onChange={e =>
                      setFormInfo({
                        ...formInfo,
                        basicInfo: { ...formInfo.basicInfo, workUrl: e.target.value },
                      })}
                  />
                </Form.Item>
              )}

              <Form.Item<UploadWorkFormInfo>
                label={<Label text="原作者名" />}
                name={['illustratorInfo', 'name']}
                rules={[{ required: true, message: '请输入原作者的名称！' }]}
              >
                <Flex gap={20}>
                  <DebounceSelect
                    value={formInfo.illustratorInfo?.name}
                    fetchOptions={fetchIllustratorList}
                    onChange={selectIllustrator}
                  />
                  <Button type="primary" onClick={() => setModalStatus(true)}>
                    新增插画家
                  </Button>
                </Flex>
              </Form.Item>

              <Form.Item<UploadWorkFormInfo>
                label={<Label text="作者主页" />}
                name={['illustratorInfo', 'homeUrl']}
                rules={[
                  { required: true, message: '请输入原作者的主页url地址！' },
                  { type: 'url', message: '请输入正确的URL地址！' },
                ]}
              >
                <Input
                  placeholder="原作者主页，选中插画家后自动填充"
                  value={formInfo.illustratorInfo?.homeUrl}
                  disabled
                  onChange={e =>
                    setFormInfo({
                      ...formInfo,
                      illustratorInfo: { ...formInfo.illustratorInfo!, homeUrl: e.target.value },
                    })}
                />
              </Form.Item>
            </>
          )}
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>作品标签添加</span>
          </div>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text="作品标签" />}
            name="labels"
            rules={[{ required: true, message: '作品标签是必须要选的！' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="选择不超过50个标签，或者自己输入"
              maxCount={50}
              onSearch={searchLabels}
              onChange={(value) => {
                setFormInfo(prevFormInfo => ({
                  ...prevFormInfo,
                  labels: value,
                }))
              }}
              onDropdownVisibleChange={onDropdownVisibleChange}
              options={labels}
              onPopupScroll={onPopupScroll}
              notFoundContent={<Empty showImg={false} />}
            />
          </Form.Item>
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>其他信息</span>
          </div>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text="开启评论" />}
            name={['basicInfo', 'openComment']}
            rules={[{ required: true, message: '请选择是否开启评论！' }]}
          >
            <Radio.Group
              value={formInfo.basicInfo.openComment}
              onChange={e =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, openComment: e.target.value },
                })}
            >
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item<UploadWorkFormInfo>
            label={<Label text="AI生成作品" />}
            name={['basicInfo', 'isAIGenerated']}
            rules={[{ required: true, message: '请选择是否为AI生成作品！' }]}
          >
            <Radio.Group
              value={formInfo.basicInfo.isAIGenerated}
              onChange={e =>
                setFormInfo({
                  ...formInfo,
                  basicInfo: { ...formInfo.basicInfo, isAIGenerated: e.target.value },
                })}
            >
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        <div className={wrapperStyle}>
          <div className={titleStyle}>
            <span>其他须知</span>
          </div>
          <div className="flex flex-col gap-10px text-sm color-neutral-900 font-bold line-height-normal">
            <span>
              这个小站只是因纯粹的热爱而搭建，大家所上传的图片全部都会在后台管理系统进行审核，通过后会在本站进行展示。
            </span>
            <span>
              尽可能不要转载相同的作品，如果发现有重复的作品，会在后台管理系统进行统一的处理。
            </span>
            <span>包含以下要素的作品将不予上传：</span>
            <ul className="m-0 flex flex-col gap-10px pl-5">
              <li>
                <span>现实世界的照片（这是二次元，二次元，二次元）；</span>
              </li>
              <li>
                <span>转载时，原作者明确要求不能转载的；</span>
              </li>
              <li>
                <span>
                  他人制作的作品，发售中的商品图像，第三者持有权利的图像，游戏、视频作品的截图，包含屏幕截图图像的作品。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Form>

      <CreateIllustratorModal
        modalStatus={modalStatus}
        confirmAction={confirmAction}
        cancelAction={cancelAction}
        formInfo={newIllustratorInfo}
        setFormInfo={setNewIllustratorInfo}
        homeUrlPrefix={homeUrlPrefix}
        setHomeUrlPrefix={setHomeUrlPrefix}
        illustratorId={illustratorId}
        setIllustratorId={setIllustratorId}
      />
    </>
  )
}

export default UploadForm
