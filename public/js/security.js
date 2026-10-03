let csrfTokenPromise = null;

export function resetCsrfToken() {
    csrfTokenPromise = null;
}

async function getCsrfToken() {
    if (!csrfTokenPromise) {
        csrfTokenPromise = fetch('/api/csrf.php')
            .then(async response => {
                const result = await response.json();
                if (!response.ok || !result.success || typeof result.data?.csrf_token !== 'string') {
                    throw new Error(result.message || 'Unable to establish request security token.');
                }
                return result.data.csrf_token;
            })
            .catch(error => {
                resetCsrfToken();
                throw error;
            });
    }

    return csrfTokenPromise;
}

export async function secureFetch(resource, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return fetch(resource, options);
    }

    const headers = new Headers(options.headers || {});
    headers.set('X-CSRF-Token', await getCsrfToken());
    return fetch(resource, { ...options, headers });
}
