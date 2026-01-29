export type MemberMeResponse = {
  userId: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loginType: string;
  userType: "shelter" | "adopter" | "admin";
};

export type CenterProfile = {
  centerName: string;
  phoneNumber: string;
  address: string;
  description?: string | null;
};

export type CenterProfileUpdateRequest = {
  centerName: string;
  phoneNumber: string;
  address: string;
  description?: string | null;
};
