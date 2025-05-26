import type { FC } from 'react'
import type { FavoriteDetailInfo } from '@/utils/types'
import { Button } from 'antd'
import { Link } from 'react-router'
import LazyImg from '@/components/common/lazy-img'

type HeaderProps = FavoriteDetailInfo & {
  setStartAppreciate: (status: boolean) => void
}

const Header: FC<HeaderProps> = ({
  name,
  intro,
  creatorId,
  creatorName,
  cover,
  workNum,
  setStartAppreciate,
}) => {
  return (
    <div className="relative flex justify-between b-1px b-b-solid p-5 color-neutral">
      <div className="flex items-center gap-5">
        <div className="h-40 w-40 flex items-center justify-center">
          <LazyImg
            className="rd-1"
            src={cover || `https://fakeimg.pl/400x400?font=noto&text=${name}`}
            alt={name}
          />
        </div>
        <div className="w-100 flex flex-col gap-10px text-sm color-neutral-900">
          <span className="text-lg font-bold">{name}</span>
          <span>
            创建者：
            <Link to={`/personal-center/${creatorId}`}>{creatorName}</Link>
          </span>
          <span>
            {workNum}
            个内容
          </span>
          <span>{intro}</span>
        </div>
      </div>
      <Button
        size="large"
        shape="round"
        type="primary"
        onClick={() => setStartAppreciate(true)}
        disabled={!workNum}
      >
        开始浏览全部作品
      </Button>
    </div>
  )
}

export default Header
