// src/links/create-remote-link.ts
export const createRemoteLink = async (url: string) => {
  return { url, expiresAt: new Date(Date.now() + 3600 * 1000) } // 1 hour expiration
}
