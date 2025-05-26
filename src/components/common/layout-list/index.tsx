import type { VirtualListProps } from '@/components/common/virtual-list'
import { Icon } from '@iconify/react'
import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import GreyButton from '@/components/common/grey-button'
import VirtualList from '@/components/common/virtual-list'
import AnimatedDiv from '@/components/motion/animated-div'

type ScrollType = 'label' | 'label-img' | 'work-normal' | 'work-detail' | 'work-little'

interface LayoutListProps extends Partial<VirtualListProps> {
  scrollType: ScrollType
  children: React.ReactNode
  initializing?: boolean
  setInitializing?: (status: boolean) => void
  className?: string
  gap?: number
  type?: string
  workId?: string
  setAtBottom?: (status: boolean) => void
  virtualList?: boolean
}

const scrollMap: Map<ScrollType, number> = new Map([
  ['label', 400],
  ['label-img', 512],
  ['work-normal', 1020],
  ['work-detail', 640],
  ['work-little', 300],
])

function LayoutList({
  initializing,
  setInitializing,
  className,
  type,
  workId,
  scrollType,
  children,
  gap = 10,
  setAtBottom,
  virtualList,
  direction,
  length,
  itemLength,
  data,
  renderItem,
}: LayoutListProps) {
  const [showButtons, setShowButtons] = useState(false)
  const layoutRef = useRef<HTMLDivElement & { posData: { id: string, left: number }[] }>(null)

  const scrollX = (direction: 'left' | 'right') => {
    if (layoutRef.current) {
      layoutRef.current.scrollBy({
        top: 0,
        left: direction === 'left' ? scrollMap.get(scrollType)! : -scrollMap.get(scrollType)!,
        behavior: 'smooth',
      })
    }
  }

  const handleScroll = () => {
    if (!layoutRef.current || !setAtBottom)
      return

    const { scrollLeft, clientWidth, scrollWidth, children } = layoutRef.current
    const innerWidth = virtualList ? children[0]?.clientWidth : scrollWidth
    const isAtBottom = scrollLeft + clientWidth >= innerWidth - 100

    setAtBottom(isAtBottom)
  }

  useEffect(() => {
    if (!layoutRef.current)
      return
    const debouncedHandleScroll = debounce(handleScroll, 50)
    layoutRef.current.addEventListener('scroll', debouncedHandleScroll)
    return () => layoutRef.current?.removeEventListener('scroll', debouncedHandleScroll)
  }, [])

  useEffect(() => {
    if (!layoutRef.current)
      return
    if (type === 'work-detail')
      return
    layoutRef.current.scrollTo({
      left: 0,
      behavior: 'smooth',
    })
  }, [children])

  useEffect(() => {
    if (setAtBottom)
      setAtBottom(false)
    if (!layoutRef.current || type !== 'work-detail' || initializing)
      return

    const scrollToWorkItem = (workItem: HTMLElement | { left: number } | null) => {
      if (!workItem) {
        if (setAtBottom && setInitializing) {
          setAtBottom(true)
          setInitializing(true)
        }
        return
      }

      if (virtualList) {
        layoutRef.current!.scrollTo({
          left: (workItem as { left: number }).left,
          behavior: 'smooth',
        })
      }
      else {
        const itemLeft = (workItem as HTMLElement).getBoundingClientRect().left
        const layoutRefLeft = layoutRef.current!.getBoundingClientRect().left
        layoutRef.current!.scrollBy({
          top: 0,
          left: itemLeft - layoutRefLeft,
          behavior: 'smooth',
        })
      }
    }

    const findWorkItem = () => {
      if (virtualList) {
        return layoutRef.current!.posData.find(item => item.id === workId) || null
      }
      else {
        return Array.from(layoutRef.current!.children).find(
          item => item.getAttribute('data-id') === workId,
        ) as HTMLElement | null
      }
    }

    scrollToWorkItem(findWorkItem())
  }, [workId, initializing])

  const scrollBtnGroup = (
    <>
      <AnimatedDiv
        type="opacity-gradient"
        className="absolute left-0 top-1/2 z-999 -translate-y-1/2"
      >
        <GreyButton onClick={() => scrollX('right')}>
          <Icon color="#fff" icon="ant-design:caret-left-filled" />
        </GreyButton>
      </AnimatedDiv>
      <AnimatedDiv
        type="opacity-gradient"
        className="absolute right-0 top-1/2 z-999 -translate-y-1/2"
      >
        <GreyButton onClick={() => scrollX('left')}>
          <Icon color="#fff" icon="ant-design:caret-right-filled" />
        </GreyButton>
      </AnimatedDiv>
    </>
  )

  return virtualList
    ? (
        <VirtualList
          ref={layoutRef}
          direction={direction!}
          length={length!}
          itemLength={itemLength!}
          data={data!}
          renderItem={renderItem!}
          onMouseEnter={() => setShowButtons(true)}
          onMouseLeave={() => setShowButtons(false)}
        >
          {showButtons && scrollBtnGroup}
        </VirtualList>
      )
    : (
        <div
          className={`relative w-full ${className}`}
          onMouseEnter={() => setShowButtons(true)}
          onMouseLeave={() => setShowButtons(false)}
        >
          <div
            ref={layoutRef}
            style={{ gap: `${gap}px` }}
            className="relative w-full flex flex-nowrap overflow-x-auto overflow-y-hidden transition-duration-300 scrollbar-none"
          >
            {children}
          </div>
          {showButtons && scrollBtnGroup}
        </div>
      )
}

export default LayoutList
