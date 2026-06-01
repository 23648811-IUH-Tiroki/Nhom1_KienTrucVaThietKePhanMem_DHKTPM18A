export const fetchWithRetry = async (
  url,
  options = {},
  retries = 2,
  delay = 2500,
) => {
  const requestOptions = {
    credentials: "include",
    ...options,
  };

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, requestOptions);
      if (response.ok || attempt >= retries) {
        return response;
      }

      const shouldRetryStatus = [502, 503, 504, 522, 524].includes(response.status);
      if (!shouldRetryStatus) {
        return response;
      }
      console.warn("Fetch retry on server error", {
        attempt: attempt + 1,
        url,
        status: response.status,
      });
    } catch (error) {
      const isLastAttempt = attempt >= retries;
      console.warn("Fetch retry attempt", {
        attempt: attempt + 1,
        url,
        message: error?.message,
      });

      if (isLastAttempt) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
