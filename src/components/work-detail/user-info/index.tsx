import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { UserItemInfo } from '@/utils/types'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import LazyImg from '@/components/common/lazy-img'

interface UserInfoProps {
  userInfo: UserItemInfo
  onFollow: (id: string) => void
}

const UserInfo: FC<UserInfoProps> = ({ userInfo, onFollow }) => {
  const { isLogin } = useSelector((state: AppState) => state.user)
  const { id } = useSelector((state: AppState) => state.user.userInfo)

  return (
    <div className="relative w-82.5 flex flex-col gap-5 rd-6 bg-white p-5">
      <div className="flex items-center gap-10px text-sm color-neutral-900 font-bold">
        <Link
          to={`/personal-center/${userInfo.id}`}
          className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rd-full"
        >
          <LazyImg src={userInfo.avatar} alt={userInfo.username} />
        </Link>
        <Link className="color-neutral-900" to={`/personal-center/${userInfo.id}`}>
          {userInfo.username}
        </Link>
      </div>
      <div className="rd-1 bg-neutral-100 p-10px text-wrap text-sm color-neutral-900 line-height-normal">
        <span>{userInfo.intro}</span>
      </div>
      {userInfo.id !== id && isLogin && (
        <Button
          shape="round"
          size="large"
          type={userInfo.isFollowing ? 'default' : 'primary'}
          onClick={() => onFollow(userInfo.id)}
        >
          {userInfo.isFollowing ? '取消关注' : '关注'}
        </Button>
      )}
    </div>
  )
}

export default UserInfo
