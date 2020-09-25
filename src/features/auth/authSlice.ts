import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

// 環境変数をenvファイルから取得し変数へ格納
const apiUrl = process.env.REACT_APP_DEV_API_URL;

// sliceの定義
export const authSlice = createSlice({
  name: "auth",
  // modal用の状態管理
  initialState: {
    // ログイン用のmodalの状態
    openSignIn: true,
    // 新規登録用のmodalの状態
    openSignUp: false,
    // 自分自身のプロフィール設定用のmodalの状態
    openProfile: false,
    // backendのAPIにアクセスした際のロードの状態
    isLoadingAuth: false,
    // backendで定義したProfileモデルの自分自身のプロフィールの状態
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    // backendで定義したProfileモデルの全ての存在するプロフィールに対しての状態
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  // dispatchで呼ばれた際に走るアクション
  reducers: {
    // fetch(ローディング)開始した際のロードの状態変更
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    // fetch(ローディング)終了した際のロードの状態変更
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
    // ログイン用のmodalの状態変更(modalが出る)
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    // ログイン用のmodalの状態変更(modalが出ない)
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // 新規作成用のmodalの状態変更(modalが出る)
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    // 新規作成用のmodalの状態変更(modalが出ない)
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // 自分自身のプロフィール設定用のmodalの状態変更(modalが出る)
    setOpenProfile(state) {
      state.openProfile = true;
    },
    // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    // 自分自身のプロフィールの上書きできる用に状態管理(actionの引数重要)
    editNickname(state, action) {
      state.myprofile.nickName = action.payload;
    },
  },
});

// reducer内で定義したactionをreactで定義できるようにexport
export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
} = authSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default authSlice.reducer;
