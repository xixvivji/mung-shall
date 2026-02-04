export type ContractOverlayFieldKey =
  | "name"
  | "birthY"
  | "birthM"
  | "birthD"
  | "address"
  | "phone1"
  | "phone2"
  | "phone3"
  | "breedingPlace"
  | "job"
  | "animalType"
  | "breed"
  | "age"
  | "color"
  | "manageNo"
  | "agreeYes"
  | "agreeNo"
  | "dateY"
  | "dateM"
  | "dateD"
  | "applicantName"
  | "signature";

export type ContractOverlayValues = Record<ContractOverlayFieldKey, string>;

export const DEFAULT_CONTRACT_OVERLAY_VALUES: ContractOverlayValues = {
  name: "",
  birthY: "",
  birthM: "",
  birthD: "",
  address: "",
  phone1: "",
  phone2: "",
  phone3: "",
  breedingPlace: "",
  job: "",
  animalType: "",
  breed: "",
  age: "",
  color: "",
  manageNo: "",
  agreeYes: "0",
  agreeNo: "0",
  dateY: "",
  dateM: "",
  dateD: "",
  applicantName: "",
  signature: "",
};

export const createDefaultContractOverlayValues = (): ContractOverlayValues => ({
  ...DEFAULT_CONTRACT_OVERLAY_VALUES,
});

