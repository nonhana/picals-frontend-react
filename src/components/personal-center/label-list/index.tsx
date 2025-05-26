import type { FC } from 'react'
import type { LabelInfo } from '@/utils/types'
import { use, useEffect, useState } from 'react'
import { getUserWorksLabelsAPI } from '@/apis'
import Empty from '@/components/common/empty'
import LabelItem from '@/components/common/label-item'
import AnimatedDiv from '@/components/motion/animated-div'
import LabelListSkeleton from '@/components/skeleton/label-list'
import { PersonalContext } from '@/pages/personal-center'

const LabelList: FC = () => {
  const { userId } = use(PersonalContext)

  const [labels, setLabels] = useState<LabelInfo[]>([])
  const [gettingLabels, setGettingLabels] = useState(true)

  const getLabels = async () => {
    setGettingLabels(true)
    try {
      const { data } = await getUserWorksLabelsAPI({ id: userId! })
      setLabels(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
      return
    }
    finally {
      setGettingLabels(false)
    }
  }

  useEffect(() => {
    getLabels()
  }, [userId])

  return (
    <div className="relative min-h-10 w-full">
      {labels.length !== 0 && !gettingLabels && (
        <AnimatedDiv type="opacity-gradient" className="mb-5 flex flex-wrap gap-10px">
          {labels.map(label => (
            <LabelItem key={label.id} {...label} />
          ))}
        </AnimatedDiv>
      )}

      {labels.length === 0 && !gettingLabels && (
        <AnimatedDiv type="opacity-gradient">
          <Empty showImg={false} />
        </AnimatedDiv>
      )}

      {labels.length === 0 && gettingLabels && (
        <AnimatedDiv type="opacity-gradient">
          <LabelListSkeleton className="absolute top-0" />
        </AnimatedDiv>
      )}
    </div>
  )
}

export default LabelList
