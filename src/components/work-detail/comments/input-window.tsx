import type { FC } from 'react'
import type { AppState } from '@/store/types'
import { Button, Input } from 'antd'
import { AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import LazyImg from '@/components/common/lazy-img'
import AnimatedDiv from '@/components/motion/animated-div'

interface Replying {
  id: string
  isChild: boolean
  parent_id?: string
}

interface InputWindowProps {
  showWindow: boolean
  replyTo: string
  content: string
  setReplyTo: (replyTo: string) => void
  setReplyData: (replyData: Replying) => void
  setContent: (content: string) => void
  onSubmit: (type: 'up' | 'down') => void
}

const InputWindow: FC<InputWindowProps> = ({
  showWindow,
  content,
  setReplyTo,
  setReplyData,
  setContent,
  onSubmit,
  replyTo,
}) => {
  const { userInfo } = useSelector((state: AppState) => state.user)

  const clearReplyInfo = () => {
    setReplyData({
      id: '',
      isChild: false,
    })
    setReplyTo('')
  }

  return (
    <AnimatePresence>
      {showWindow && (
        <AnimatedDiv
          type="down-to-up"
          className="fixed bottom-5 z-1000 m-l--5 box-content w-150 flex items-center justify-between b-1px rd-10px b-solid bg-white p-5"
        >
          <div className="flex items-center gap-10px">
            <div className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rd-full">
              <LazyImg src={userInfo.avatar} alt={userInfo.username} />
            </div>
            <Input
              className={replyTo ? 'w-80' : 'w-90'}
              size="large"
              value={content}
              placeholder={replyTo ? `回复${replyTo}：` : '随便写点东东吧~'}
              onChange={event => setContent(event.target.value)}
            />
          </div>

          {replyTo && (
            <Button shape="round" size="large" type="default" onClick={clearReplyInfo}>
              取消回复
            </Button>
          )}

          <Button shape="round" size="large" type="primary" onClick={() => onSubmit('down')}>
            发布评论
          </Button>
        </AnimatedDiv>
      )}
    </AnimatePresence>
  )
}

export default InputWindow
