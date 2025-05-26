import type { FC } from 'react'
import { Fragment, useEffect, useState } from 'react'
import ContentLoader from 'react-content-loader'
import { useOutletContext } from 'react-router'
import { MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

interface WorkListSkeletonProps {
  heading?: {
    width: number
    height: number
  }
  row?: number
  padding?: number
  borderRadius?: number
  [key: string]: any
}

const WorkListSkeleton: FC<WorkListSkeletonProps> = ({
  heading,
  row = 2,
  padding = 20,
  borderRadius = 8,
  ...props
}) => {
  const [width, setWidth] = useState<number>(MAX_WIDTH)
  const [column, setColumn] = useState<number>(6)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < TRIGGER_MIN_WIDTH) {
      setWidth(MIN_WIDTH)
      setColumn(5)
    }
    else {
      setWidth(MAX_WIDTH)
      setColumn(6)
    }
  }, [currentWidth])

  const list = []

  let height

  for (let i = 1; i <= row; i++) {
    for (let j = 0; j < column; j++) {
      const itemWidth = (width - padding * (column + 1)) / column
      const x = j * (itemWidth + padding)
      const height1 = itemWidth
      const height2 = 20
      const height3 = 20
      const space = padding + height1 + (padding / 2 + height2) + height3 + padding * 2
      const y1 = (heading ? heading.height : 0) + space * (i - 1)
      const y2 = y1 + padding + height1
      const y3 = y2 + padding / 2 + height2
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
          <rect x={x} y={y2} rx={0} ry={0} width={itemWidth} height={height2} />
          <rect x={x} y={y3} rx={0} ry={0} width={itemWidth * 0.6} height={height3} />
        </Fragment>,
      )

      if (i === row) {
        height = y3 + height3
      }
    }
  }

  return (
    <ContentLoader viewBox={`0 0 ${width} ${height}`} width={width} height={height} {...props}>
      {heading && (
        <rect x={padding} y={padding} rx={0} ry={0} width={heading.width} height={heading.height} />
      )}
      {list}
    </ContentLoader>
  )
}

export default WorkListSkeleton
