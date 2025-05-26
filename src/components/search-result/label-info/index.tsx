import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { LabelDetailInfo, LabelInfo as LabelInfoType } from '@/utils/types'
import { Button } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRecommendLabelListAPI, labelActionsAPI } from '@/apis'
import Empty from '@/components/common/empty'
import LabelItem from '@/components/common/label-item'
import LayoutList from '@/components/common/layout-list'
import LazyImg from '@/components/common/lazy-img'
import AnimatedDiv from '@/components/motion/animated-div'
import LabelListSkeleton from '@/components/skeleton/label-list'
import { addLikedLabel, removeLikedLabel } from '@/store/modules/user'
import { isWarmHue } from '@/utils'

type LabelInfoProps = LabelDetailInfo & {
  like: () => void
}

const LabelInfo: FC<LabelInfoProps> = ({ id, name, color, cover, isMyLike, workCount, like }) => {
  const dispatch = useDispatch()
  const { isLogin } = useSelector((state: AppState) => state.user)

  const handleLike = async () => {
    try {
      await labelActionsAPI({ id })
      if (isMyLike) {
        dispatch(removeLikedLabel(id))
      }
      else {
        dispatch(addLikedLabel({ id, name, color, cover }))
      }
      like()
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const [labelList, setLabelList] = useState<LabelInfoType[]>([])
  const [loading, setLoading] = useState(true)

  const getRecommendLabelList = async () => {
    setLoading(true)
    try {
      const { data } = await getRecommendLabelListAPI()
      setLabelList(data.filter(item => item.id !== id))
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRecommendLabelList()
  }, [id])

  return (
    <div className="relative mb-30px w-full flex flex-col">
      <div className="mb-20px w-full flex items-center justify-between">
        <div className="flex gap-5">
          <div className="h-30 w-30 overflow-hidden b-2px b-white rd-2 b-solid">
            <LazyImg
              src={
                cover
                || `https://fakeimg.pl/200x200/${color.slice(1)}/${isWarmHue(color) ? '3d3d3d' : 'ffffff'}?retina=1&font=noto&text=${name}`
              }
              alt={name}
            />
          </div>
          <div className="flex flex-col gap-5 text-2xl color-neutral-900 font-bold">
            <div>
              <span>{name}</span>
            </div>
            <div>
              <span>{workCount}</span>
              <span className="text-2xl font-normal">作品</span>
            </div>
          </div>
        </div>
        {isLogin
          && (isMyLike
            ? (
                <Button type="default" size="large" shape="round" onClick={handleLike}>
                  移除喜欢的标签
                </Button>
              )
            : (
                <Button type="primary" size="large" shape="round" onClick={handleLike}>
                  添加喜欢的标签
                </Button>
              ))}
      </div>
      <div className="relative min-h-10 w-full">
        <AnimatePresence>
          {labelList.length !== 0 && !loading && (
            <AnimatedDiv type="opacity-gradient">
              <LayoutList scrollType="label">
                {labelList.map(item => (
                  <LabelItem key={item.id} {...item} />
                ))}
              </LayoutList>
            </AnimatedDiv>
          )}

          {labelList.length === 0 && !loading && (
            <AnimatedDiv type="opacity-gradient">
              <Empty showImg={false} />
            </AnimatedDiv>
          )}

          {labelList.length === 0 && loading && (
            <AnimatedDiv type="opacity-gradient">
              <LabelListSkeleton className="absolute top-0" />
            </AnimatedDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LabelInfo
