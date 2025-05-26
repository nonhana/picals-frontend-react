import type { VirtualListProps } from '@/components/common/virtual-list'
import type { WorkNormalItemInfo } from '@/utils/types'
import { useMemo } from 'react'
import LayoutList from '@/components/common/layout-list'
import ImgLoadingSkeleton from '@/components/skeleton/img-loading'

interface WorkSlideWindowProps extends Partial<VirtualListProps> {
  workId: string
  workList: {
    page: number
    list: WorkNormalItemInfo[]
  }[]
  setWorkListEnd?: (status: boolean) => void
  isFinal?: boolean
  initializing?: boolean
  setInitializing?: (status: boolean) => void
}

function WorkSlideWindow({
  workId,
  workList,
  setWorkListEnd,
  isFinal = true,
  initializing,
  setInitializing,
  ...rest
}: WorkSlideWindowProps) {
  const virtualListItems = useMemo(
    () => workList.map(everyPage => everyPage.list).flat(),
    [workList],
  )

  return (
    <LayoutList
      {...rest}
      virtualList
      data={virtualListItems}
      workId={workId}
      type="work-detail"
      scrollType="work-little"
      setAtBottom={setWorkListEnd}
      initializing={initializing}
      setInitializing={setInitializing}
    >
      {!isFinal && <ImgLoadingSkeleton className="h-90px w-90px shrink-0 rd-1" />}
    </LayoutList>
  )
}

export default WorkSlideWindow
