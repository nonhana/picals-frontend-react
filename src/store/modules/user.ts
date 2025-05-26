import type { LabelItem } from '@/apis/types'
import type { UserInfo } from '@/utils/types'
import { createSlice } from '@reduxjs/toolkit'
import { generateTempId } from '@/utils'

const userStore = createSlice({
  name: 'user',
  initialState: {
    userInfo: {
      id: '',
      username: '',
      avatar: '',
      littleAvatar: '',
      intro: '',
      email: '',
      fanNum: 0,
      followNum: 0,
    } as UserInfo,
    tempId: '',
    likedLabels: [] as LabelItem[],
    isLogin: false,
    loginBgs: [],
  },
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload
    },
    setTempId(state, action) {
      state.tempId = action.payload
    },
    setLikedLabels(state, action) {
      state.likedLabels = action.payload
    },
    addLikedLabel(state, action) {
      state.likedLabels.push(action.payload)
    },
    removeLikedLabel(state, action) {
      state.likedLabels = state.likedLabels.filter(item => item.id !== action.payload)
    },
    increaseFollowNum(state) {
      state.userInfo.followNum++
    },
    decreaseFollowNum(state) {
      state.userInfo.followNum--
    },
    setLoginStatus(state, action) {
      state.isLogin = action.payload
    },
    logout(state) {
      state.userInfo = {
        id: '',
        username: '',
        avatar: '',
        littleAvatar: '',
        intro: '',
        email: '',
        fanNum: 0,
        followNum: 0,
      }
      state.tempId = generateTempId()
      state.likedLabels = []
      state.isLogin = false
    },
  },
})

const {
  setUserInfo,
  setTempId,
  setLikedLabels,
  addLikedLabel,
  removeLikedLabel,
  increaseFollowNum,
  decreaseFollowNum,
  setLoginStatus,
  logout,
} = userStore.actions

const userReducer = userStore.reducer

export {
  addLikedLabel,
  decreaseFollowNum,
  increaseFollowNum,
  logout,
  removeLikedLabel,
  setLikedLabels,
  setLoginStatus,
  setTempId,
  setUserInfo,
}
export default userReducer
