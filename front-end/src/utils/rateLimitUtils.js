// Development-only helper to clear client-side rate limit keys
export const clearClientRateLimitStorage = () => {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('rateLimitLock:') || k.startsWith('rateLimitCounter:')) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    // ignore
  }
};
