import type { WorkListType } from './modules/viewList'
import type { LabelItem } from '@/apis/types'

import type { FavoriteItemInfo, UploadWorkFormInfo, UserInfo } from '@/utils/types'

interface UserState {
  userInfo: UserInfo
  tempId: string
  likedLabels: LabelItem[]
  isLogin: boolean
}

interface FavoritesState {
  favoriteList: FavoriteItemInfo[]
}

interface SearchHistoryState {
  historyList: string[]
}

interface UploadFormState {
  imgList: string[]
  formInfo: UploadWorkFormInfo
  uploadSuccess: boolean
}

interface ViewListState {
  prevPosition: string
  prevWorkId: string
  workDetailUserId: string
  userWorkList: string[]
  likeWorkList: string[]
  favoriteWorkList: string[]
  followingNewWorkList: string[]
  recommendWorkList: string[]
  latestWorkList: string[]
  illustratorWorkList: string[]
  searchResultWorkList: string[]
  currentList: WorkListType
  currentIndex: number
}

export interface AppState {
  user: UserState
  favorite: FavoritesState
  searchHistory: SearchHistoryState
  uploadForm: UploadFormState
  viewList: ViewListState
}
