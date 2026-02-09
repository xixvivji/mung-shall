export interface MemberMeResponse {
  userId: number;
  username: string;
  name: string;
  phone: string | null;
  email: string;
  address: string | null;
  loginType: string;
  userType: "shelter" | "adopter" | "admin" | "center";
}

export interface MemberUpdateRequest {
  name?: string;
  phone?: string | null;
  address?: string | null;
}