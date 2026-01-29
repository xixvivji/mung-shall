import axios from "axios";
import type { MemberMeResponse } from "../types";

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_BASE = RAW_API_BASE.endsWith("/") ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;
const ACCESS_TOKEN_KEY = "accessToken";

export async function fetchMyInfo(): Promise<MemberMeResponse> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await axios.get<MemberMeResponse>(`${API_BASE}/members/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}
