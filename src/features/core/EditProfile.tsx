import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
  editNickname,
  selectProfile,
  selectOpenProfile,
  resetOpenProfile,
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncUpdateProf,
} from "../auth/authSlice";

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

const EditProfile: React.FC = () => {
  // dispatchを定義(AppDispatch：store.tsで定義した型を使用)
  const dispatch: AppDispatch = useDispatch();
  // 自分自身のプロフィール設定用のmodalの状態
  const openProfile = useSelector(selectOpenProfile);
  // backendで定義したProfileモデルの自分自身のプロフィールの状態
  const profile = useSelector(selectProfile);
  // img画像の状態管理
  const [image, setImage] = useState<File | null>(null);

  // updateを押した際に発火する関数
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    // リフレッシュ無効化
    e.preventDefault();
    const packet = { id: profile.id, nickName: profile.nickName, img: image };

    // fetch(ローディング)開始した際のロードの状態変更
    await dispatch(fetchCredStart());
    // プロフィールを更新する非同期関数
    await dispatch(fetchAsyncUpdateProf(packet));
    // fetch(ローディング)終了した際のロードの状態変更
    await dispatch(fetchCredEnd());
    // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
    await dispatch(resetOpenProfile());
  };

  // 画像挿入ボタンが押された場合の処理
  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  return (
    <>
      {/* モーダル */}
      <Modal
        // 自分自身のプロフィール設定用のmodalの状態
        isOpen={openProfile}
        // モーダル以外の箇所をクリックした場合
        onRequestClose={async () => {
          // 自分自身のプロフィール設定用のmodalの状態変更(modalが出ない)
          await dispatch(resetOpenProfile());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          {/* タイトル */}
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          {/* nickNameのテキストフィールド */}
          <TextField
            placeholder="nickname"
            type="text"
            value={profile?.nickName}
            // 自分自身のプロフィールの上書きできる用に状態管理(actionの引数重要)
            onChange={(e) => dispatch(editNickname(e.target.value))}
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
            disabled={!profile?.nickName}
            variant="contained"
            color="primary"
            type="submit"
            // クリックされた際更新する関数
            onClick={updateProfile}
          >
            Update
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default EditProfile;
