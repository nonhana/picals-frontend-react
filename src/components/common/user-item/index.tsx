import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { UserItemInfo } from '@/utils/types'
import { Button } from 'antd'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { MAX_WIDTH } from '@/utils'

import Empty from '../empty'
import LazyImg from '../lazy-img'
import WorkItem from '../work-item'

type UserItemProps = UserItemInfo & {
  width: number
  follow: (id: string) => void
  likeWork: (userId: string, workId: string) => void
}

const UserItem: FC<UserItemProps> = ({
  id,
  username,
  email,
  intro,
  avatar,
  works,
  follow,
  likeWork,
  isFollowing,
  width,
}) => {
  const { isLogin } = useSelector((state: AppState) => state.user)
  const { id: localUserId } = useSelector((state: AppState) => state.user.userInfo)
  return (
    <div className="relative h-65 flex gap-5 rd-1 bg-white p-5">
      <Link
        to={`/personal-center/${id}/works`}
        className="h-20 w-20 shrink-0 cursor-pointer overflow-hidden rd-full"
      >
        <LazyImg src={avatar} alt={username} />
      </Link>

      <div className="flex flex-col gap-5">
        <Link className="flex items-center gap-2.5" to={`/personal-center/${id}/works`}>
          <span className="text-sm color-neutral-900 font-bold">{username}</span>
          <span className="text-xs color-neutral">{email}</span>
        </Link>

        <div className="w-70 break-words text-xs color-neutral">
          <span>{intro}</span>
        </div>

        {isLogin
          && (localUserId !== id
            ? (
                isFollowing
                  ? (
                      <Button
                        className="w-25"
                        shape="round"
                        size="large"
                        type="default"
                        onClick={() => follow(id)}
                      >
                        已关注
                      </Button>
                    )
                  : (
                      <Button
                        className="w-25"
                        shape="round"
                        size="large"
                        type="primary"
                        onClick={() => follow(id)}
                      >
                        加关注
                      </Button>
                    )
              )
            : (
                <Button className="w-25" shape="round" size="large" type="primary" disabled>
                  你自己
                </Button>
              ))}
      </div>

      {!works || works.length === 0
        ? (
            <Empty showImg={false} />
          )
        : (
            <div className="flex gap-5">
              {works.slice(0, width === MAX_WIDTH ? 4 : 3).map(work => (
                <WorkItem type="user_work" key={work.id} itemInfo={work} like={likeWork} />
              ))}
            </div>
          )}
    </div>
  )
}

export default UserItem
