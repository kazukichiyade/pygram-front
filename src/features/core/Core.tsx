import React, { useEffect } from "react";
import Auth from "../auth/Auth";

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md";

import {
  editNickname,
  selectProfile,
  selectIsLoadingAuth,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
} from "../auth/authSlice";

import {
  selectPosts,
  selectIsLoadingPost,
  setOpenNewPost,
  resetOpenNewPost,
  fetchAsyncGetPosts,
  fetchAsyncGetComments,
} from "../post/postSlice";

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const Core: React.FC = () => {
  // dispatchを定義(AppDispatch：store.tsで定義した型を使用)
  const dispatch: AppDispatch = useDispatch();
  // backendで定義したProfileモデルの自分自身のプロフィールの状態
  const profile = useSelector(selectProfile);
  // backendで定義したPostモデルの自分自身のプロフィールの状態
  const posts = useSelector(selectPosts);
  // Postに対してbackendのAPIにアクセスした際のロードの状態
  const isLoadingPost = useSelector(selectIsLoadingPost);
  // Authに対してbackendのAPIにアクセスした際のロードの状態
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  // 起動時一番初めに実行される関数
  useEffect(() => {
    const fetchBootLoader = async () => {
      // jwtがlocalStorageに保存されているか確認
      if (localStorage.localJWT) {
        // ログイン用のmodalの状態変更(modalが出ない)
        dispatch(resetOpenSignIn());
        // ログインしているユーザーの情報を取得
        const result = await dispatch(fetchAsyncGetMyProf());
        // jwtの有効期限が切れている場合は、rejectedで抜ける
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          // 新規作成用のmodalの状態変更(modalが出る)
          dispatch(setOpenSignIn());
          return null;
        }
        // 投稿の一覧を取得する非同期関数
        await dispatch(fetchAsyncGetPosts());
        // プロフィールの一覧を取得する非同期関数
        await dispatch(fetchAsyncGetProfs());
        // コメントの一覧を取得する非同期関数
        await dispatch(fetchAsyncGetComments());
      }
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>SNS clone</h1>
        {/* ニックネームが存在する時(ログイン済みの時) */}
        {profile?.nickName ? (
          <>
            {/* 投稿ボタン */}
            <button
              className={styles.core_btnModal}
              onClick={() => {
                // 新規投稿用のmodalの状態変更(modalが出る)
                dispatch(setOpenNewPost());
                // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
                dispatch(resetOpenProfile());
              }}
            >
              <MdAddAPhoto />
              {/* ログアウトボタン */}
            </button>
            <div className={styles.core_logout}>
              {/* 投稿用もしくは認証用がload中の場合ロードアイコン表示 */}
              {(isLoadingPost || isLoadingAuth) && <CircularProgress />}
              <Button
                onClick={() => {
                  // localStorageにあるjwtを削除
                  localStorage.removeItem("localJWT");
                  // nickNameを空にする
                  dispatch(editNickname(""));
                  // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
                  dispatch(resetOpenProfile());
                  // 新規投稿用のmodalの状態変更(modalが出ない)
                  dispatch(resetOpenNewPost());
                  // ログイン用のmodalの状態変更(modalが出る)
                  dispatch(setOpenSignIn());
                }}
              >
                Logout
              </Button>
              {/* 自分自身のアバター画像付きのボタン */}
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  // 自分自身のプロフィール設定用のmodalの状態変更(modalが出る)
                  dispatch(setOpenProfile());
                  // 新規投稿用のmodalの状態変更(modalが出ない)
                  dispatch(resetOpenNewPost());
                }}
              >
                <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar alt="who?" src={profile.img} />{" "}
                </StyledBadge>
              </button>
            </div>
          </>
        ) : (
          <div>
            {/* ニックネームが無い時(ログインしていない時) */}
            {/* ログイン用のボタン */}
            <Button
              onClick={() => {
                // ログイン用のmodalの状態変更(modalが出る)
                dispatch(setOpenSignIn());
                // 新規作成用のmodalの状態変更(modalが出ない)
                dispatch(resetOpenSignUp());
              }}
            >
              LogIn
            </Button>
            {/* 新規登録用のボタン */}
            <Button
              onClick={() => {
                // 新規作成用のmodalの状態変更(modalが出る)
                dispatch(setOpenSignUp());
                // ログイン用のmodalの状態変更(modalが出ない)
                dispatch(resetOpenSignIn());
              }}
            >
              SignUp
            </Button>
          </div>
        )}
      </div>

      {/* ニックネームが存在する時(ログイン済みの時) */}
      {profile?.nickName && (
        <>
          <div className={styles.core_posts}>
            <Grid container spacing={4}>
              {/* backendで定義したPostモデルの自分自身のプロフィールの状態 */}
              {posts
                .slice(0)
                .reverse()
                .map((post) => (
                  <Grid key={post.id} item xs={12} md={4}>
                    {/* 投稿一覧 */}
                    <Post
                      postId={post.id}
                      title={post.title}
                      loginId={profile.userProfile}
                      userPost={post.userPost}
                      imageUrl={post.img}
                      liked={post.liked}
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </>
      )}
    </div>
  );
};

export default Core;
