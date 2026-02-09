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
