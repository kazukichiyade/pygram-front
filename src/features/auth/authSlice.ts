import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

// 環境変数をenvファイルから取得し変数へ格納
const apiUrl = process.env.REACT_APP_DEV_API_URL;

// 非同期の関数はsliceの外に定義する決まりになっている

// ログイン時の非同期関数(jwt取得)
export const fetchAsyncLogin = createAsyncThunk(
  // アクション名を定義
  "auth/post",
  // async awaitを使用中のみ、非同期から同期へ変更し処理を実行
  // authenにemailとpasswordがReact側から渡り格納される(types.tsで定義したPROPS_AUTHEN型を使用)
  async (authen: PROPS_AUTHEN) => {
    // resにアクセストークン格納
    const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// 新規登録時の非同期関数
export const fetchAsyncRegister = createAsyncThunk(
  // アクション名を定義
  "auth/register",
  // authにemailとpasswordがReact側から渡り格納される(types.tsで定義したPROPS_AUTHEN型を使用)
  async (auth: PROPS_AUTHEN) => {
    // resに新規で作成したユーザー情報格納
    const res = await axios.post(`${apiUrl}api/register/`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

// プロフィール新規作成の非同期関数
export const fetchAsyncCreateProf = createAsyncThunk(
  // アクション名を定義
  "profile/post",
  // nickNameにnickNameがReact側から渡り格納される(types.tsで定義したPROPS_NICKNAME型を使用)
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        // tokenを取得しないとアクセスできないのでlocalStorageからjwt取得
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// プロフィールを更新する非同期関数
export const fetchAsyncUpdateProf = createAsyncThunk(
  // アクション名を定義
  "profile/put",
  // profileにidとnickNameとimgがReact側から渡り格納される(types.tsで定義したPROPS_PROFILE型を使用)
  async (profile: PROPS_PROFILE) => {
    // formのdataをuploadData変数に格納
    const uploadData = new FormData();
    // profileのnickNameをnickName属性に追加
    uploadData.append("nickName", profile.nickName);
    // imgがあればimg属性にimgとimg.nameを追加
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    // 更新するためprofile.idを指定
    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          // tokenを取得しないとアクセスできないのでlocalStorageからjwt取得
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

// 自身のプロフィールを取得する非同期関数
export const fetchAsyncGetMyProf = createAsyncThunk(
  // アクション名を定義
  "profile/get",
  async () => {
    const res = await axios.get(`${apiUrl}api/myprofile/`, {
      headers: {
        // tokenを取得しないとアクセスできないのでlocalStorageからjwt取得
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data[0];
  }
);

// プロフィールの一覧を取得する非同期関数
export const fetchAsyncGetProfs = createAsyncThunk(
  // アクション名を定義
  "profiles/get",
  async () => {
    const res = await axios.get(`${apiUrl}api/profile/`, {
      headers: {
        // tokenを取得しないとアクセスできないのでlocalStorageからjwt取得
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// slice作成(createSlice(RTK))
export const authSlice = createSlice({
  name: "auth",
  // modal用の状態管理(初期状態)
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
  // 非同期関数の後処理を定義(extraReducers)
  extraReducers: (builder) => {
    // ログイン時の非同期関数が正常終了した場合、jwtをaction.payload.accessで取得し、localStorageに格納
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      localStorage.setItem("localJWT", action.payload.access);
    });
    // 新規登録時の非同期関数が正常終了した場合、新しく作成されたprofileデータをmyprofileに格納
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    // 自身のプロフィールを取得する非同期関数が正常終了した場合、ログインしているユーザーのprofileデータをmyprofileに格納
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    // プロフィールの一覧を取得する非同期関数が正常終了した場合、取得した全プロフィールデータをprofilesに格納
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    // プロフィールを更新する非同期関数が正常終了した場合、更新後のプロフィールデータをmyprofileに格納し、profilesも新データで更新
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
      state.profiles = state.profiles.map((prof) =>
        prof.id === action.payload.id ? action.payload : prof
      );
    });
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

// state中から取得したい値(state.auth.isLoadingAuth)を指定して変数(selectIsLoadingAuth)へ格納
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
