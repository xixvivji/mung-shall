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

export type ShelterProfileResponse = {
  id: number;
  careNm: string;
  shelterRegNo?: string | null;
  tel: string;
  address: string;
};

export type ShelterProfileUpdateRequest = {
  careNm: string;
  tel: string;
  address: string;
};
