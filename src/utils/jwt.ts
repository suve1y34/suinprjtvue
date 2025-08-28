export function parseJwtExp(token: string): number | null {
  try {
    const base64 = token.split(".")[1];
    const json = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp : null;
  } catch { return null; }
}

export function isExpired(token: string, leewaySec = 30) {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= leewaySec;
}