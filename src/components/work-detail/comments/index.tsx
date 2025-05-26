import type { FC } from 'react'
import type { IPostCommentReq } from '@/apis/comment/types'
import type { AppState } from '@/store/types'
import type { CommentItem } from '@/utils/types'
import { Button, Input, message, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { deleteCommentAPI, getCommentListAPI, postCommentAPI } from '@/apis'
import Empty from '@/components/common/empty'
import LazyImg from '@/components/common/lazy-img'

import Comment from './comment'
import InputWindow from './input-window'

interface CommentsProps {
  totalCount: number
  loading: boolean
}

interface Replying {
  id: string
  isChild: boolean
  parentId?: string
  userId?: string
}

const Comments: FC<CommentsProps> = ({ loading, totalCount }) => {
  const { workId } = useParams<{ workId: string }>()
  const [messageApi, msgContextHolder] = message.useMessage()

  const { userInfo } = useSelector((state: AppState) => state.user)
  const [commentList, setCommentList] = useState<CommentItem[]>([])
  const [count, setCount] = useState(totalCount)

  const fetchCommentList = async () => {
    try {
      const { data } = await getCommentListAPI({ id: workId! })
      setCommentList(data)
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  useEffect(() => {
    fetchCommentList()
  }, [workId])

  const [upContent, setUpContent] = useState('') // 上方输入框的内容
  const [downContent, setDownContent] = useState('') // 下方输入框的内容

  const [replyData, setReplyData] = useState<Replying>({
    id: '',
    isChild: false,
  })
  const [replyTo, setReplyTo] = useState('')

  const [showWindow, setShowWindow] = useState(false)

  const inputRef = useRef<HTMLDivElement | null>(null)
  const [inputIsInWindow, setInputIsInWindow] = useState(false)
  let inputRefObserver: IntersectionObserver | null = null

  const workInfoRef = useRef<HTMLElement | null>(null)
  const [workInfoIsInWindow, setWorkInfoIsInWindow] = useState(false)
  let workInfoRefObserver: IntersectionObserver | null = null

  useEffect(() => {
    if (!loading)
      workInfoRef.current = document.getElementById('work-info')
    if (workInfoRef.current) {
      workInfoRefObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setWorkInfoIsInWindow(true)
          }
          else {
            setWorkInfoIsInWindow(false)
          }
        })
      })
      workInfoRefObserver.observe(workInfoRef.current)
      return () => {
        workInfoRefObserver?.disconnect()
      }
    }
  }, [loading])

  useEffect(() => {
    if (inputRef.current) {
      inputRefObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInputIsInWindow(true)
          }
          else {
            setInputIsInWindow(false)
          }
        })
      })
      inputRefObserver.observe(inputRef.current)
      return () => {
        inputRefObserver?.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    setShowWindow((!inputIsInWindow && !workInfoIsInWindow) || replyData.id !== '')
  }, [inputIsInWindow, workInfoIsInWindow, replyData])

  const reply = (data: Replying) => {
    if (replyData.id === data.id) {
      setReplyData({
        id: '',
        isChild: false,
      })
      setReplyTo('')
      return
    }
    setReplyData(prevReplyData => ({ ...prevReplyData, id: data.id }))
    if (data.isChild) {
      setReplyData(prevReplyData => ({
        ...prevReplyData,
        isChild: true,
        parentId: data.parentId,
        userId: data.userId,
      }))
      commentList.forEach((comment) => {
        if (comment.childComments) {
          comment.childComments.forEach((child) => {
            if (child.id === data.id) {
              setReplyTo(child.authorInfo.username)
            }
          })
        }
      })
    }
    else {
      setReplyData(prevReplyData => ({ ...prevReplyData, isChild: false }))
      commentList.forEach((comment) => {
        if (comment.id === data.id) {
          setReplyTo(comment.authorInfo.username)
        }
      })
    }
  }

  const [modal, modalContextHolder] = Modal.useModal()
  const handleDelete = async (id: string) => {
    modal.confirm({
      title: '删除评论',
      content: '你确定要删除这条评论吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCommentAPI({ id })
          const commentCount = commentList.find(comment => comment.id === id)?.childComments
          setCount(prevCount => prevCount - (commentCount ? commentCount.length + 1 : 1))
          fetchCommentList()
          message.success('删除评论成功')
        }
        catch (error) {
          console.error('出现错误了喵！！', error)
        }
      },
    })
  }

  const postComment = async (data: IPostCommentReq) => {
    try {
      await postCommentAPI(data)
      setCount(prevCount => prevCount + 1)
      fetchCommentList()
    }
    catch (error) {
      console.error('出现错误了喵！！', error)
    }
  }

  const submitComment = async (type: 'up' | 'down') => {
    const reqData: IPostCommentReq = {
      content: '',
      id: workId!,
    }
    if (replyData.id !== '') {
      if (replyData.isChild) {
        reqData.replyInfo = {
          replyCommentId: replyData.parentId!,
          replyUserId: replyData.userId,
        }
      }
      else {
        reqData.replyInfo = {
          replyCommentId: replyData.id,
        }
      }
    }
    switch (type) {
      case 'up':
        if (upContent === '') {
          messageApi.error('评论内容不能为空')
          return
        }
        else {
          reqData.content = upContent
          messageApi.success('评论成功')
          setUpContent('')
        }
        break
      case 'down':
        if (downContent === '') {
          messageApi.error('评论内容不能为空')
          return
        }
        else {
          reqData.content = downContent
          messageApi.success('评论成功')
          setDownContent('')
        }
        break
      default:
        break
    }
    await postComment(reqData)
    setReplyData({
      id: '',
      isChild: false,
    })
    setReplyTo('')
  }

  return (
    <>
      {msgContextHolder}
      {modalContextHolder}

      <div>
        <div className="flex items-center gap-10px">
          <span className="text-lg color-neutral-900 font-bold">评论</span>
          <span className="text-sm color-neutral">
            目前共有
            {count}
            条评论
          </span>
        </div>
        <div ref={inputRef} className="my-5 flex items-center justify-between">
          <div className="flex items-center gap-10px">
            <div className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rd-full">
              <LazyImg src={userInfo.littleAvatar} alt={userInfo.username} />
            </div>
            <Input
              className="w-90"
              size="large"
              placeholder="随便写点东东吧~"
              value={upContent}
              onChange={event => setUpContent(event.target.value)}
            />
          </div>

          <Button shape="round" size="large" type="primary" onClick={() => submitComment('up')}>
            发布评论
          </Button>
        </div>
        {commentList.length === 0
          ? (
              <div className="relative w-150">
                <Empty showImg={false} text="暂无评论，评个论吧好吗" />
              </div>
            )
          : (
              <>
                {commentList.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    reply={reply}
                    deleteComment={handleDelete}
                  />
                ))}
              </>
            )}
        <InputWindow
          content={downContent}
          replyTo={replyTo}
          showWindow={showWindow}
          setContent={setDownContent}
          setReplyTo={setReplyTo}
          setReplyData={setReplyData}
          onSubmit={submitComment}
        />
      </div>
    </>
  )
}

export default Comments
