export function formatDateTime(value?: string | null) {
  if (!value) return "";
  // 이미 서버에서 ISO면 그대로 보여줘도 되고, 필요하면 locale로 변환
  return value;
}
