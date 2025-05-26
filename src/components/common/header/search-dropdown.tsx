import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { LabelInfo } from '@/utils/types'
import { Icon } from '@iconify/react'
import { message, Modal } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import { getRecommendLabelListAPI } from '@/apis'
import LayoutList from '@/components/common/layout-list'
import { clear } from '@/store/modules/searchHistory'

import Empty from '../empty'
import LabelImgItem from '../label-img-item'
import LabelItem from '../label-item'

const SearchDropdown: FC<{
  visible: boolean
  className?: string
  setVisible: (visible: boolean) => void
  setKeyword: (keyword: string) => void
}> = ({ visible, className, setVisible, setKeyword }) => {
  const dispatch = useDispatch()
  const { isLogin } = useSelector((state: AppState) => state.user)
  const { likedLabels } = useSelector((state: AppState) => state.user)
  const { historyList } = useSelector((state: AppState) => state.searchHistory)

  const [messageApi, msgContextHolder] = message.useMessage()

  const toggleBodyOverflow = (visible: boolean) => {
    document.documentElement.style.overflow = visible ? 'hidden scroll' : ''
    document.body.style.overflow = visible ? 'hidden' : ''
    document.body.style.maxHeight = visible ? '100vh' : ''
  }

  useEffect(() => {
    toggleBodyOverflow(visible)
  }, [visible])

  // 清空历史记录
  const handleClearHistory = () => {
    dispatch(clear())
    messageApi.success('清除历史记录成功')
  }

  const [popularLabels, setPopularLabels] = useState<LabelInfo[]>([])

  const getRecommendLabelList = async () => {
    try {
      const { data } = await getRecommendLabelListAPI()
      setPopularLabels(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    getRecommendLabelList()
  }, [])

  const [modal, modalContextHolder] = Modal.useModal()

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}

      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed left-0 top-0 z-1999 h-full w-full bg-black bg-opacity-32"
            onClick={() => setVisible(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {visible && (
          <motion.div
            className={`scrollbar-none absolute bg-white w-545px rd-6px overflow-hidden z-2000 ${className} select-none`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="m-b-5">
              <div className="w-full flex items-center justify-between p-10px">
                <span className="text-sm color-neutral font-bold">历史记录</span>
                <span
                  className="cursor-pointer text-sm color-neutral"
                  onClick={() => {
                    modal.confirm({
                      title: '确定要清空历史记录吗？',
                      content: '一旦清除，不可恢复！',
                      okText: '确定',
                      cancelText: '取消',
                      onOk: handleClearHistory,
                      footer: (_, { OkBtn, CancelBtn }) => (
                        <>
                          <CancelBtn />
                          <OkBtn />
                        </>
                      ),
                    })
                  }}
                >
                  清除历史记录
                </span>
              </div>
              {historyList.length === 0
                ? (
                    <div className="relative mx-10px">
                      <Empty showImg={false} />
                    </div>
                  )
                : (
                    <ul className="m-0 max-h-40 list-none overflow-y-scroll p-0">
                      {historyList.map(item => (
                        <li key={item}>
                          <Link
                            to={`/search-result?label=${item}&type=work&sortType=new`}
                            onClick={() => setKeyword(item)}
                            className="flex cursor-pointer items-center justify-between p-10px text-sm color-neutral transition-duration-300 hover:bg-neutral-100"
                          >
                            <span>{item}</span>
                            <Icon width="20px" color="#858585" icon="ant-design:export-outlined" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
            </div>

            {isLogin && (
              <div className="relative m-b-5">
                <div className="w-full p-10px text-sm color-neutral font-bold">
                  <span>喜欢的标签</span>
                </div>
                {likedLabels.length === 0
                  ? (
                      <div className="relative mx-10px">
                        <Empty showImg={false} />
                      </div>
                    )
                  : (
                      <LayoutList className="px-10px" scrollType="label">
                        {likedLabels.map(item => (
                          <LabelItem key={item.id} {...item} />
                        ))}
                      </LayoutList>
                    )}
              </div>
            )}

            <div className="relative m-b-5">
              <div className="w-full p-10px text-sm color-neutral font-bold">
                <span>最近流行的插画标签</span>
              </div>
              {popularLabels.length === 0
                ? (
                    <div className="relative mx-10px">
                      <Empty showImg={false} />
                    </div>
                  )
                : (
                    <LayoutList className="px-10px" scrollType="label-img">
                      {popularLabels.map(item => (
                        <LabelImgItem key={item.id} {...item} />
                      ))}
                    </LayoutList>
                  )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SearchDropdown
