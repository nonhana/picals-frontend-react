import { Fragment, useEffect, useState } from 'react'
import ContentLoader from 'react-content-loader'
import { useOutletContext } from 'react-router'
import { MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

interface LabelListSkeletonProps {
  row?: number
  padding?: number
  borderRadius?: number
  [key: string]: any
}

function LabelListSkeleton({
  row = 1,
  padding = 10,
  borderRadius = 4,
  ...props
}: LabelListSkeletonProps) {
  const [width, setWidth] = useState<number>(MAX_WIDTH)
  const [column, setColumn] = useState<number>(12)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < TRIGGER_MIN_WIDTH) {
      setWidth(MIN_WIDTH)
      setColumn(10)
    }
    else {
      setWidth(MAX_WIDTH)
      setColumn(12)
    }
  }, [currentWidth])

  const list = []

  let height

  for (let i = 1; i <= row; i++) {
    for (let j = 0; j < column; j++) {
      const itemWidth = (width - padding * (column + 1)) / column
      const x = j * (itemWidth + padding)
      const height1 = 40
      const space = padding + height1 + padding / 2 + padding * 2
      const y1 = space * (i - 1)
      const y2 = y1 + height1
      list.push(
        <Fragment key={`${i}-${j}`}>
          <rect
            x={x}
            y={y1}
            rx={borderRadius}
            ry={borderRadius}
            width={itemWidth}
            height={height1}
          />
        </Fragment>,
      )
      if (i === row)
        height = y2
    }
  }

  return (
    <ContentLoader viewBox={`0 0 ${width} ${height}`} width={width} height={height} {...props}>
      {list}
    </ContentLoader>
  )
}

export default LabelListSkeleton
