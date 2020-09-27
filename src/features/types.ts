// 共通して使用するデータ型の定義だけしておく

export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

// authSlice.ts
// ログイン及び新規登録に使用する型
export interface PROPS_AUTHEN {
  email: string;
  password: string;
}

export interface PROPS_PROFILE {
  id: number;
  nickName: string;
  img: File | null;
}

export interface PROPS_NICKNAME {
  nickName: string;
}
// authSlice.ts

// postSlice.ts
export interface PROPS_NEWPOST {
  title: string;
  img: File | null;
}
export interface PROPS_LIKED {
  id: number;
  title: string;
  current: number[];
  new: number;
}
export interface PROPS_COMMENT {
  text: string;
  post: number;
}
// postSlice.ts

// Post.tsx
export interface PROPS_POST {
  postId: number;
  loginId: number;
  userPost: number;
  title: string;
  imageUrl: string;
  liked: number[];
}
// Post.tsx
