import { Fragment, useEffect, useState } from 'react'
import ContentLoader from 'react-content-loader'
import { useOutletContext } from 'react-router'
import { MAX_WIDTH, MIN_WIDTH, TRIGGER_MIN_WIDTH } from '@/utils'

interface UserListSkeletonProps {
  row?: number
  borderRadius?: number
  [key: string]: any
}

function UserListSkeleton({ row = 2, borderRadius = 4, ...props }: UserListSkeletonProps) {
  const [width, setWidth] = useState<number>(MAX_WIDTH)
  const currentWidth = useOutletContext<number>()

  useEffect(() => {
    if (currentWidth < TRIGGER_MIN_WIDTH) {
      setWidth(MIN_WIDTH)
    }
    else {
      setWidth(MAX_WIDTH)
    }
  }, [currentWidth])

  const list = []
  let height

  for (let i = 1; i <= row; i++) {
    const itemWidth = width
    const itemHeight = 244 // 头像高度 + 内容高度
    const y = itemHeight * (i - 1)

    // 头像
    const avatarSize = 80
    const avatarX = 16 // 左边距
    const avatarY = y + 20 // 上边距

    // 用户名
    const usernameWidth = 120
    const usernameHeight = 24
    const usernameX = avatarX + avatarSize + 16 // 头像右边距
    const usernameY = avatarY

    // 简介
    const introWidth = 240 // 剩余宽度
    const introHeight = 32
    const introX = usernameX
    const introY = usernameY + usernameHeight + 16 // 用户名下边距

    // 关注按钮
    const buttonWidth = 80
    const buttonHeight = 32
    const buttonX = usernameX
    const buttonY = introY + introHeight + 16 // 简介下边距

    // 作品展示
    const workWidth = (itemWidth - 460) / 4
    const workHeight = workWidth
    const workX = introX + 256

    list.push(
      <Fragment key={i}>
        {/* 头像 */}
        <rect x={avatarX} y={avatarY} rx="50%" width={avatarSize} height={avatarSize} />

        {/* 用户名 */}
        <rect
          x={usernameX}
          y={usernameY}
          rx={borderRadius}
          ry={borderRadius}
          width={usernameWidth}
          height={usernameHeight}
        />

        {/* 简介 */}
        <rect
          x={introX}
          y={introY}
          rx={borderRadius}
          ry={borderRadius}
          width={introWidth}
          height={introHeight}
        />

        {/* 关注按钮 */}
        <rect
          x={buttonX}
          y={buttonY}
          rx={borderRadius}
          ry={borderRadius}
          width={buttonWidth}
          height={buttonHeight}
        />

        {/* 作品展示 */}
        {Array.from({ length: 4 }).fill(0).map((_, index) => (
          <rect
            key={index}
            x={workX + index * (workWidth + 16)}
            y={avatarY}
            rx={borderRadius}
            ry={borderRadius}
            width={workWidth}
            height={workHeight}
          />
        ))}
      </Fragment>,
    )

    if (i === row) {
      height = y + itemHeight
    }
  }

  return (
    <ContentLoader viewBox={`0 0 ${width} ${height}`} width={width} height={height} {...props}>
      {list}
    </ContentLoader>
  )
}

export default UserListSkeleton
