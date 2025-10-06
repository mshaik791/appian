export async function getAvatarSessionToken(): Promise<{ token?: string; rtcConfig?: RTCConfiguration; mock?: boolean }> {
  const res = await fetch("/api/avatar/session", { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
