export type AuthCredentials = {
  username: string;
  password: string;
};

export type AuthUser = {
  userId: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  loginType?: string;
};

export type SignUpRequest = {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};
