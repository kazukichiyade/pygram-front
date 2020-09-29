import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_NEWPOST, PROPS_LIKED, PROPS_COMMENT } from "../types";

// 環境変数をenvファイルから取得し変数へ格納
const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

// 非同期の関数はsliceの外に定義する決まりになっている

// 投稿の一覧を取得する非同期関数
export const fetchAsyncGetPosts = createAsyncThunk(
  // アクション名を定義
  "post/get",
  // async awaitを使用中のみ、非同期から同期へ変更し処理を実行
  async () => {
    // resに取得した投稿の一覧が配列で渡される
    const res = await axios.get(apiUrlPost, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// 新規投稿用の非同期関数
export const fetchAsyncNewPost = createAsyncThunk(
  // アクション名を定義
  "post/post",
  // newPostにtitleとimgがReact側から渡り格納される(types.tsで定義したPROPS_NEWPOST型を使用)
  async (newPost: PROPS_NEWPOST) => {
    // formのdataをuploadData変数に格納
    const uploadData = new FormData();
    // newPostのtitleをtitle属性に追加
    uploadData.append("title", newPost.title);
    // imgがあればimg属性にimgとimg.nameを追加
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
    // resに新規に投稿したobjectデータが返ってくる
    const res = await axios.post(apiUrlPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// 投稿されたいいね用の非同期関数
export const fetchAsyncPatchLiked = createAsyncThunk(
  // アクション名を定義
  "post/patch",
  // likedにidとtitleとcurrentとnewがReact側から渡り格納される(types.tsで定義したPROPS_LIKED型を使用)
  async (liked: PROPS_LIKED) => {
    // 現在のcurrentデータを変数に格納
    const currentLiked = liked.current;
    // formのdataをuploadData変数に格納
    const uploadData = new FormData();

    // いいねボタンを解除させる機能
    let isOverlapped = false;
    currentLiked.forEach((current) => {
      if (current === liked.new) {
        isOverlapped = true;
      } else {
        uploadData.append("liked", String(current));
      }
    });

    // isOverlappedがfalseの時
    if (!isOverlapped) {
      // likedのnewをliked属性に追加
      uploadData.append("liked", String(liked.new));
    } else if (currentLiked.length === 1) {
      // likedのtitleをtitle属性に追加
      uploadData.append("title", liked.title);
      const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      });
      return res.data;
    }
    const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメントの一覧を取得する非同期関数
export const fetchAsyncGetComments = createAsyncThunk(
  // アクション名を定義
  "comment/get",
  async () => {
    const res = await axios.get(apiUrlComment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// コメントを新規作成する非同期関数
export const fetchAsyncPostComment = createAsyncThunk(
  // アクション名を定義
  "comment/post",
  // commentにtextとpostがReact側から渡り格納される(types.tsで定義したPROPS_COMMENT型を使用)
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiUrlComment, comment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

// slice作成(createSlice(RTK))
export const postSlice = createSlice({
  name: "post",
  // modal用の状態管理(初期状態)
  initialState: {
    // backendのAPIにアクセスした際のロードの状態
    isLoadingPost: false,
    // 新規投稿のmodalの状態
    openNewPost: false,
    // backendで定義したPostモデルの自分自身のプロフィールの状態
    posts: [
      {
        id: 0,
        title: "",
        userPost: 0,
        created_on: "",
        img: "",
        liked: [0],
      },
    ],
    // backendで定義したCommentモデルの自分自身のプロフィールの状態
    comments: [
      {
        id: 0,
        text: "",
        userComment: 0,
        post: 0,
      },
    ],
  },
  // dispatchで呼ばれた際に走るアクション
  reducers: {
    // fetch(ローディング)開始した際のロードの状態変更
    fetchPostStart(state) {
      state.isLoadingPost = true;
    },
    // fetch(ローディング)終了した際のロードの状態変更
    fetchPostEnd(state) {
      state.isLoadingPost = false;
    },
    // 新規投稿用のmodalの状態変更(modalが出る)
    setOpenNewPost(state) {
      state.openNewPost = true;
    },
    // 新規投稿用のmodalの状態変更(modalが出ない)
    resetOpenNewPost(state) {
      state.openNewPost = false;
    },
  },
  // 非同期関数の後処理を定義(extraReducers)
  extraReducers: (builder) => {
    // 投稿の一覧を取得する非同期関数が正常終了した場合、postsのstateに格納しておく
    builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
      return {
        ...state,
        posts: action.payload,
      };
    });
    // 新規投稿用の非同期関数が正常終了した場合、スプレッド演算子で分解し、最後の要素に足す
    builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
      return {
        ...state,
        posts: [...state.posts, action.payload],
      };
    });
    // コメントの一覧を取得する非同期関数が正常終了した場合、commentsのstateに格納しておく
    builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
      return {
        ...state,
        comments: action.payload,
      };
    });
    // コメントを新規作成する非同期関数が正常終了した場合、スプレッド演算子で分解し、最後の要素に足す
    builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };
    });
    // 投稿されたいいね用の非同期関数が正常終了した場合、新しい要素で置き換える
    builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    });
  },
});

// reducer内で定義したactionをreactで定義できるようにexport
export const {
  fetchPostStart,
  fetchPostEnd,
  setOpenNewPost,
  resetOpenNewPost,
} = postSlice.actions;

// stateの中から取得したい値(state.post.isLoadingPost)を指定して変数(selectIsLoadingPost)へ格納
export const selectIsLoadingPost = (state: RootState) =>
  state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;

export default postSlice.reducer;
