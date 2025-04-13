// utils/fetchWithSuspense.ts
export function fetchWithSuspense<T>(url: string, options?: RequestInit) {
  let status = 'pending';
  let result: T;
  let error: Error;

  const promise = fetch(url, options)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        status = 'success';
        result = data.message;
      } else {
        status = 'error';
        error = new Error(data.message);
      }
    })
    .catch(err => {
      status = 'error';
      error = err;
    });

  return {
    read() {
      if (status === 'pending') throw promise;
      if (status === 'error') throw error;
      return result;
    }
  };
}