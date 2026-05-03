const TOKEN_COOKIE = "dbs_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function setAuthCookie(token: string) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

export function removeAuthCookie() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}
