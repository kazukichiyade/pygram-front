import React, { useState } from "react";
import styles from "./Post.module.css";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";

import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { selectProfiles } from "../auth/authSlice";

import {
  selectComments,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncPostComment,
  fetchAsyncPatchLiked,
} from "./postSlice";

import { PROPS_POST } from "../types";

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS_POST> = ({
  // Core.tsxから渡される値を羅列している
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
  liked,
}) => {
  const classes = useStyles();
  // dispatchを定義(AppDispatch：store.tsで定義した型を使用)
  const dispatch: AppDispatch = useDispatch();
  // backendで定義したProfileモデルの全ての存在するプロフィールに対しての状態
  const profiles = useSelector(selectProfiles);
  // backendで定義したCommentモデルの自分自身のプロフィールの状態
  const comments = useSelector(selectComments);
  // コメントの状態を管理
  const [text, setText] = useState("");

  // postIdに対応したコメントをcommentsOnPostに格納
  const commentsOnPost = comments.filter((com) => {
    return com.post === postId;
  });

  // userPostに対応した投稿をprofに格納
  const prof = profiles.filter((prof) => {
    return prof.userProfile === userPost;
  });

  // コメントを投稿する関数
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    // リフレッシュ無効化
    e.preventDefault();
    const packet = { text: text, post: postId };
    // fetch(ローディング)開始した際のロードの状態変更
    await dispatch(fetchPostStart());
    // コメントを新規作成する非同期関数(textとpostIdを使用)
    await dispatch(fetchAsyncPostComment(packet));
    // fetch(ローディング)終了した際のロードの状態変更
    await dispatch(fetchPostEnd());
    setText("");
  };

  // いいねボタンが押された時の関数
  const handlerLiked = async () => {
    const packet = {
      id: postId,
      title: title,
      current: liked,
      new: loginId,
    };
    // fetch(ローディング)開始した際のロードの状態変更
    await dispatch(fetchPostStart());
    // 投稿されたいいね用の非同期関数(postIdとtitleとlikedとloginIdを使用)
    await dispatch(fetchAsyncPatchLiked(packet));
    // fetch(ローディング)終了した際のロードの状態変更
    await dispatch(fetchPostEnd());
  };

  // titleが存在する場合
  if (title) {
    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          {/* アバター画像 */}
          <Avatar className={styles.post_avatar} src={prof[0]?.img} />
          {/* ニックネーム */}
          <h3>{prof[0]?.nickName}</h3>
        </div>
        {/* 投稿画像 */}
        <img className={styles.post_image} src={imageUrl} alt="" />

        <h4 className={styles.post_text}>
          {/* いいねのチェックボックス */}
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          {/* ニックネーム表示 */}
          <strong> {prof[0]?.nickName}</strong> {title}
          {/* いいねを押したアバター画像群 */}
          <AvatarGroup max={7}>
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like}
                src={profiles.find((prof) => prof.userProfile === like)?.img}
              />
            ))}
          </AvatarGroup>
        </h4>

        {/* コメント欄 */}
        <Divider />
        <div className={styles.post_comments}>
          {commentsOnPost.map((comment) => (
            <div key={comment.id} className={styles.post_comment}>
              {/* アバター画像 */}
              <Avatar
                src={
                  profiles.find(
                    (prof) => prof.userProfile === comment.userComment
                  )?.img
                }
                className={classes.small}
              />
              <p>
                <strong className={styles.post_strong}>
                  {
                    profiles.find(
                      (prof) => prof.userProfile === comment.userComment
                    )?.nickName
                  }
                </strong>
                {/* コメントのテキスト */}
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        <form className={styles.post_commentBox}>
          {/* コメント追記欄 */}
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {/* コメント投稿ボタン */}
          <button
            disabled={!text.length}
            className={styles.post_button}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      </div>
    );
  }
  return null;
};

export default Post;
