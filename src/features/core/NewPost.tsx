import React, { useState } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import styles from "./Core.module.css";

import { File } from "../types";

import {
  selectOpenNewPost,
  resetOpenNewPost,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncNewPost,
} from "../post/postSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 220,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const NewPost: React.FC = () => {
  // dispatchを定義(AppDispatch：store.tsで定義した型を使用)
  const dispatch: AppDispatch = useDispatch();
  // 新規投稿のmodalの状態
  const openNewPost = useSelector(selectOpenNewPost);

  // 新規投稿img画像の状態
  const [image, setImage] = useState<File | null>(null);
  // 新規投稿titleの状態
  const [title, setTitle] = useState("");

  // 画像挿入ボタンが押された場合の処理
  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  // 画像を設定してからsubmitボタンが押された時の関数
  const newPost = async (e: React.MouseEvent<HTMLElement>) => {
    // リフレッシュ無効化
    e.preventDefault();
    const packet = { title: title, img: image };
    // fetch(ローディング)開始した際のロードの状態変更
    await dispatch(fetchPostStart());
    // 新規投稿用の非同期関数
    await dispatch(fetchAsyncNewPost(packet));
    // fetch(ローディング)終了した際のロードの状態変更
    await dispatch(fetchPostEnd());
    // 最後にsetTitle及びsetImageを初期化
    setTitle("");
    setImage(null);
    // 新規投稿用のmodalの状態変更(modalが出ない)
    dispatch(resetOpenNewPost());
  };

  return (
    <>
      {/* 新規投稿用のmodal */}
      <Modal
        // 新規投稿のmodalの状態
        isOpen={openNewPost}
        // モーダル以外の箇所をクリックした場合
        onRequestClose={async () => {
          // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
          await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          {/* タイトル */}
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          {/* タイトルを投稿するテキストフィールド */}
          <TextField
            placeholder="Please enter caption"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 画像挿入 */}
          <input
            type="file"
            id="imageInput"
            hidden={true}
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          {/* submitボタン */}
          <Button
            disabled={!title || !image}
            variant="contained"
            color="primary"
            onClick={newPost}
          >
            New post
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default NewPost;
