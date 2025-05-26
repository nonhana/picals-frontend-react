import type { FC } from 'react'
import type { AppState } from '@/store/types'
import type { CommentItem } from '@/utils/types'
import { Icon } from '@iconify/react'
import { Button } from 'antd'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import LazyImg from '@/components/common/lazy-img'

interface Replying {
  id: string
  isChild: boolean
  parentId?: string
  userId?: string
}

interface CommentProps {
  comment: CommentItem
  style?: React.CSSProperties
  reply: (replyData: Replying) => void
  deleteComment: (id: string) => void
}

const Comment: FC<CommentProps> = ({ comment, style, reply, deleteComment }) => {
  const { id } = useSelector((state: AppState) => state.user.userInfo)
  const [showChildComments, setShowChildComments] = useState(false)

  const handleReply = (id: string, isChild: boolean, parentId?: string, userId?: string) => {
    reply({
      id,
      isChild,
      parentId,
      userId,
    })
  }

  return (
    <>
      <div style={style} className="relative mb-20px w-150 flex gap-10px">
        <div className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rd-full">
          <LazyImg src={comment.authorInfo.avatar} alt={comment.authorInfo.username} />
        </div>
        <div className="w-full flex flex-col gap-10px">
          <div className="flex items-center text-sm font-bold">
            <span className="color-neutral-900">{comment.authorInfo.username}</span>
            {comment.authorInfo.id === id && <span className="color-red">（你）</span>}
            {comment.level === 1 && comment.replyTo && (
              <>
                <Icon width="20px" color="#858585" icon="ant-design:caret-right-filled" />
                <span>{comment.replyTo.username}</span>
                {comment.replyTo.id === id && <span className="color-red">（你）</span>}
              </>
            )}
          </div>
          <div className="text-wrap text-sm color-neutral-900 line-height-normal">
            <span>{comment.content}</span>
          </div>
          <div className="w-full flex items-center justify-between text-sm color-neutral">
            <div>
              <span>{comment.createdAt}</span>
              <Button size="small" type="link" onClick={() => handleReply(comment.id, false)}>
                回复
              </Button>
              {comment.level === 0 && comment.childComments?.length !== 0 && (
                <Button
                  size="small"
                  type="link"
                  onClick={() => setShowChildComments(!showChildComments)}
                >
                  {showChildComments ? '收起' : '展开'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-10px">
              <span>
                {comment.childComments
                  && comment.childComments?.length !== 0
                  && `共有${comment.childComments.length}条${comment.level === 0 ? '回复' : '评论'}`}
              </span>

              {comment.authorInfo.id === id && (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    deleteComment(comment.id)
                  }}
                >
                  <Icon width={24} icon="ant-design:delete-outlined" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {comment.childComments && showChildComments && (
        <div>
          {comment.childComments.map(childComment => (
            <Comment
              style={{
                marginLeft: '50px',
                width: '550px',
              }}
              key={childComment.id}
              comment={childComment}
              reply={() => handleReply(childComment.id, true, comment.id, comment.authorInfo.id)}
              deleteComment={deleteComment}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default Comment
