import React from "react";
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Auth.module.css";
import Modal from "react-modal";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextField, Button, CircularProgress } from "@material-ui/core";

import { fetchAsyncGetPosts, fetchAsyncGetComments } from "../post/postSlice";

import {
  // useSelect
  selectIsLoadingAuth,
  selectOpenSignIn,
  selectOpenSignUp,
  // reducer
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  // 非同期関数
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncCreateProf,
} from "./authSlice";

// modalのstyle定義
const customStyles = {
  overlay: {
    backgroundColor: "#777777",
  },
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 350,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const Auth: React.FC = () => {
  // modalを使用する場合定義必要
  Modal.setAppElement("#root");
  // ログイン用のmodalの状態
  const openSignIn = useSelector(selectOpenSignIn);
  // 新規登録用のmodalの状態
  const openSignUp = useSelector(selectOpenSignUp);
  // backendのAPIにアクセスした際のロードの状態
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  // dispatchを定義(AppDispatch：store.tsで定義した型を使用)
  const dispatch: AppDispatch = useDispatch();

  return (
    <>
      {/* 新規登録のmodal */}
      <Modal
        // 新規登録用のmodalの状態
        isOpen={openSignUp}
        // modal以外の場所をクリックするとmodalを閉じる
        onRequestClose={async () => {
          // 新規登録用のmodalの状態変更(modalが出ない)
          await dispatch(resetOpenSignUp());
        }}
        style={customStyles}
      >
        {/* Formikはフォームコンポネント作成ライブラリ */}
        <Formik
          initialErrors={{ email: "required" }}
          // Formikでvalidation管理するvalue
          initialValues={{ email: "", password: "" }}
          // submitされた時の処理(values：emailとpassword)
          onSubmit={async (values) => {
            // fetch(ローディング)開始した際のロードの状態変更
            await dispatch(fetchCredStart());
            // 新規登録時の非同期関数
            const resultReg = await dispatch(fetchAsyncRegister(values));

            // 新規登録時の非同期関数が正常終了した場合の処理
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
              // ログイン時の非同期関数(jwt取得)
              await dispatch(fetchAsyncLogin(values));
              // プロフィール新規作成の非同期関数
              await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

              // プロフィールの一覧を取得する非同期関数
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              // 自身のプロフィールを取得する非同期関数
              await dispatch(fetchAsyncGetMyProf());
            }
            // fetch(ローディング)終了した際のロードの状態変更
            await dispatch(fetchCredEnd());
            // 新規作成用のmodalの状態変更(modalが出ない)
            await dispatch(resetOpenSignUp());
          }}
          // YupはFormik公式でも推奨されているValidation実装ライブラリ
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {/* Formikを使用した際のFormの設定 */}
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  {/* タイトル */}
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  {/* ロード中にロードアイコンが出るように設定 */}
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  {/* emailTextField */}
                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    // Formikのvalidationが走る
                    onChange={handleChange}
                    // Formからfocusが外れた場合にvalidationが走る
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <br />
                  {/* エラーメッセージ出力条件 */}
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}

                  {/* passwordTextField */}
                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    // Formikのvalidationが走る
                    onChange={handleChange}
                    // Formからfocusが外れた場合にvalidationが走る
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {/* エラーメッセージ出力条件 */}
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  {/* submitButton */}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    Register
                  </Button>
                  <br />
                  <br />
                  {/* ログインと新規登録を切り替えるボタン */}
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // ログイン用のmodalの状態変更(modalが出る)
                      await dispatch(setOpenSignIn());
                      // 新規作成用のmodalの状態変更(modalが出ない)
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    You already have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* ログインのmodal */}
      <Modal
        // ログイン用のmodalの状態
        isOpen={openSignIn}
        // modal以外の場所をクリックするとmodalを閉じる
        onRequestClose={async () => {
          // ログイン用のmodalの状態変更(modalが出ない)
          await dispatch(resetOpenSignIn());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          // Formikでvalidation管理するvalue
          initialValues={{ email: "", password: "" }}
          // submitされた時の処理(values：emailとpassword)
          onSubmit={async (values) => {
            // fetch(ローディング)開始した際のロードの状態変更
            await dispatch(fetchCredStart());
            // ログイン時の非同期関数(jwt取得)
            const result = await dispatch(fetchAsyncLogin(values));
            // ログイン時の非同期関数(jwt取得)が正常終了した場合の処理
            if (fetchAsyncLogin.fulfilled.match(result)) {
              // プロフィールの一覧を取得する非同期関数
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              // 自身のプロフィールを取得する非同期関数
              await dispatch(fetchAsyncGetMyProf());
            }
            // fetch(ローディング)終了した際のロードの状態変更
            await dispatch(fetchCredEnd());
            // ログイン用のmodalの状態変更(modalが出ない)
            await dispatch(resetOpenSignIn());
          }}
          // YupはFormik公式でも推奨されているValidation実装ライブラリ
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {/* Formikを使用した際のFormの設定 */}
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  {/* タイトル */}
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  {/* ロード中にロードアイコンが出るように設定 */}
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  {/* emailTextField */}
                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    // Formikのvalidationが走る
                    onChange={handleChange}
                    // Formからfocusが外れた場合にvalidationが走る
                    onBlur={handleBlur}
                    value={values.email}
                  />

                  {/* エラーメッセージ出力条件 */}
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}
                  <br />

                  {/* passwordTextField */}
                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    // Formikのvalidationが走る
                    onChange={handleChange}
                    // Formからfocusが外れた場合にvalidationが走る
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {/* エラーメッセージ出力条件 */}
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />
                  {/* submitButton */}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    Login
                  </Button>
                  <br />
                  <br />
                  {/* ログインと新規登録を切り替えるボタン */}
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // ログイン用のmodalの状態変更(modalが出ない)
                      await dispatch(resetOpenSignIn());
                      // 新規登録用のmodalの状態変更(modalが出る)
                      await dispatch(setOpenSignUp());
                    }}
                  >
                    You don't have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Auth;
