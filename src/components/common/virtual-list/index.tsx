import type { CSSProperties } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils'

export interface VirtualListProps {
  direction: 'vertical' | 'horizontal'
  length: number
  itemLength: number
  data: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  ref?: React.RefObject<(HTMLDivElement & { posData: { id: string, left: number }[] }) | null>
  children?: React.ReactNode
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
}

function VirtualList({
  direction,
  length,
  itemLength,
  data,
  renderItem,
  ref,
  children,
  onMouseEnter,
  onMouseLeave,
}: VirtualListProps) {
  const isVertical = direction === 'vertical'

  const [scrollPos, setScrollPos] = useState(0)

  const gap = useMemo(() => {
    const containableCount = Math.floor(length / itemLength)
    return (length - containableCount * itemLength) / (containableCount - 1)
  }, [length, itemLength])

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.posData = data.map((item, index) => ({
        id: item.id,
        left: index * (itemLength + gap),
      }))
    }
  }, [data, itemLength, gap, ref])

  const visibleMap = useMemo(() => {
    const visibleCount = Math.ceil(length / itemLength) // 比可视区域多渲染一个
    const startIndex = Math.floor(scrollPos / (itemLength + gap))
    return { start: startIndex, end: startIndex + visibleCount }
  }, [scrollPos, length, itemLength])

  const startOffset = useMemo(
    () => visibleMap.start * (itemLength + gap),
    [visibleMap, gap, itemLength],
  )

  const totalSize = useMemo(
    () => data.length * itemLength + gap * (data.length - 1),
    [gap, data, itemLength],
  )

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      setScrollPos(isVertical ? target.scrollTop : target.scrollLeft)
    },
    [isVertical],
  )

  const containerStyle = useMemo<CSSProperties>(() => {
    return isVertical ? { height: `${length}px` } : { width: `${length}px`, whiteSpace: 'nowrap' }
  }, [isVertical, length])

  const contentStyle = useMemo<CSSProperties>(() => {
    return isVertical ? { height: `${totalSize}px` } : { width: `${totalSize}px` }
  }, [isVertical, totalSize])

  const listStyle = useMemo<CSSProperties>(() => {
    return isVertical
      ? {
          transform: `translateY(${startOffset}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
        }
      : {
          transform: `translateX(${startOffset}px)`,
          display: 'flex',
          gap: `${gap}px`,
        }
  }, [isVertical, startOffset, gap])

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        ref={ref}
        className={cn('scrollbar-none', isVertical ? 'overflow-y-auto' : 'overflow-x-auto')}
        style={containerStyle}
        onScroll={onScroll}
      >
        <div style={contentStyle}>
          <div style={listStyle}>
            {data
              .slice(visibleMap.start, visibleMap.end)
              .map((item, index) => renderItem(item, index + visibleMap.start))}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

export default VirtualList
