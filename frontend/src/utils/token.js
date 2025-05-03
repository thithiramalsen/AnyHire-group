export function getAccessToken() {
  // Try Zustand/Redux first if you store it there
  // Otherwise, fallback to localStorage
  return localStorage.getItem('accessToken');
}

export function setAccessToken(token) {
  localStorage.setItem('accessToken', token);
}

export function removeAccessToken() {
  localStorage.removeItem('accessToken');
}
