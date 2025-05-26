import type { FC } from 'react'
import { Button, Input, message } from 'antd'
import { useEffect, useState } from 'react'
import HistoryList from '@/components/personal-center/history/history-list'
import SearchResult from '@/components/personal-center/history/search-result'

const { Search } = Input

const MyHistory: FC = () => {
  /* ----------搜索相关---------- */
  const [keyword, setKeyword] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [searchTrigger, setSearchTrigger] = useState<number>(0)

  // 触发搜索
  const onSearch = async () => {
    if (keyword === '') {
      message.warning('搜索内容不能为空')
      return
    }
    setSearching(true)
    setSearchTrigger(prev => prev + 1)
  }

  useEffect(() => {
    if (searching)
      return
    setKeyword('')
    setSearchTrigger(0)
  }, [searching])

  return (
    <div className="relative w-full">
      <div className="w-full flex items-center justify-between py-5">
        <span className="select-none title">浏览记录</span>
        <div className="flex items-center gap-5">
          {searching && (
            <Button type="link" onClick={() => setSearching(false)}>
              取消搜索
            </Button>
          )}
          <Search
            className="w-60"
            value={keyword}
            placeholder="输入作品名称"
            onChange={e => setKeyword(e.target.value)}
            onSearch={onSearch}
          />
        </div>
      </div>

      {searching
        ? (
            <SearchResult keyword={keyword} searchTrigger={searchTrigger} />
          )
        : (
            <HistoryList />
          )}
    </div>
  )
}

export default MyHistory
