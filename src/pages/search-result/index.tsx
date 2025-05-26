import type { MenuProps } from 'antd'
import type { FC } from 'react'
import type { LabelDetailInfo, SearchFilter } from '@/utils/types'
import { PictureOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Input, Menu, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import { getLabelDetailAPI, newLabelAPI } from '@/apis'
import Empty from '@/components/common/empty'
import HanaModal from '@/components/common/hana-modal'
import LabelInfo from '@/components/search-result/label-info'
import UserList from '@/components/search-result/user-list'
import WorkList from '@/components/search-result/work-list'
import { addRecord } from '@/store/modules/searchHistory'
import { MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

const items: MenuProps['items'] = [
  {
    label: '插画',
    key: 'work',
    icon: <PictureOutlined />,
  },
  {
    label: '用户',
    key: 'user',
    icon: <UserOutlined />,
  },
]

const SearchResult: FC = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const query = useSearchParams()[0]
  const searchFilter: SearchFilter = {
    label: query.get('label') || '',
    type: query.get('type') || 'work',
    sortType: query.get('sortType') || 'new',
  }
  const [current, setCurrent] = useState(searchFilter.type || 'work')
  const [width, setWidth] = useState<number>(MAX_WIDTH)
  const exploreRef = useRef<HTMLDivElement>(null)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < TRIGGER_MIN_WIDTH) {
      setWidth(MIN_WIDTH)
    }
    else {
      setWidth(MAX_WIDTH)
    }
  }, [currentWidth])

  const checkoutMenu: MenuProps['onClick'] = (e) => {
    navigate({
      search: `?label=${searchFilter.label}&type=${e.key}&sortType=${searchFilter.sortType}`,
    })
  }

  useEffect(() => {
    setCurrent(searchFilter.type || 'work')
  }, [searchFilter.type])

  const [labelDetail, setLabelDetail] = useState<LabelDetailInfo>()

  const getLabelDetail = async () => {
    try {
      const { data } = await getLabelDetailAPI({ name: searchFilter.label })
      if (data) {
        setLabelDetail(data)
      }
      else {
        setLabelDetail(undefined)
      }
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const likeLabel = () => setLabelDetail(prev => ({ ...prev!, isMyLike: !prev!.isMyLike }))

  const [showAddLabelModal, setShowAddLabelModal] = useState(false)
  const [labelName, setLabelName] = useState('')

  useEffect(() => {
    getLabelDetail()
    setLabelName(searchFilter.label || '')
    dispatch(addRecord(searchFilter.label))
  }, [searchFilter.label])

  const confirmAddLabel = async () => {
    if (!labelName)
      return
    try {
      await newLabelAPI([{ value: labelName }])
      getLabelDetail()
      setShowAddLabelModal(false)
      message.success('添加标签成功')
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  return (
    <>
      <div ref={exploreRef} className="relative my-30px w-full overflow-hidden">
        <div
          style={{
            width: `${width}px`,
            marginTop: current === 'work' ? '0' : '-210px',
          }}
          className="mx-auto flex flex-col items-center transition-all duration-300 ease-in-out"
        >
          {labelDetail
            ? (
                <LabelInfo {...labelDetail} like={likeLabel} />
              )
            : (
                <div className="relative h-210px w-full">
                  <Empty showImg={false} text="目前暂未收录该标签哦~">
                    <Button
                      size="large"
                      shape="round"
                      type="primary"
                      onClick={() => {
                        setShowAddLabelModal(true)
                      }}
                    >
                      添加标签
                    </Button>
                  </Empty>
                </div>
              )}
          <Menu
            className="w-full"
            onClick={checkoutMenu}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
          />
          {current === 'work'
            ? (
                labelDetail
                  ? (
                      <WorkList
                        labelName={labelDetail.name}
                        sortType={searchFilter.sortType}
                        workCount={labelDetail.workCount}
                      />
                    )
                  : (
                      <div className="relative w-full pt-5">
                        <Empty />
                      </div>
                    )
              )
            : (
                <UserList labelName={searchFilter.label} width={width} />
              )}
        </div>
      </div>

      <HanaModal
        title="添加标签"
        visible={showAddLabelModal}
        setVisible={setShowAddLabelModal}
        onOk={confirmAddLabel}
      >
        <Input
          className="mx-auto my-10 w-90%"
          size="large"
          value={labelName}
          onChange={e => setLabelName(e.target.value)}
          placeholder="请输入新标签名称"
        />
      </HanaModal>
    </>
  )
}

export default SearchResult
