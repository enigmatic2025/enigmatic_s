import { supabase } from './supabase';

const API_BASE_URL = '/api';

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const apiClient = {
    fetch: async (endpoint: string, options: RequestOptions = {}) => {
        // 1. Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // 2. Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 3. Make request
        const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;

        // Check if endpoint already includes /api (handle legacy calls if any)
        const finalUrl = endpoint.startsWith('/api') ? endpoint : url;

        const response = await fetch(finalUrl, {
            ...options,
            headers,
        });

        // 4. Handle Auth failures globally
        if (response.status === 401) {
            console.warn("Unauthorized request. Redirecting to login might be needed.");
            // transform 401 to a specific error or let caller handle?
            // For now, let's just log. Caller usually throws.
        }

        return response;
    },

    get: (endpoint: string) => apiClient.fetch(endpoint, { method: 'GET' }),

    post: (endpoint: string, body: any) => apiClient.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    }),

    put: (endpoint: string, body: any) => apiClient.fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    }),

    patch: (endpoint: string, body: any) => apiClient.fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
    }),

    delete: (endpoint: string) => apiClient.fetch(endpoint, { method: 'DELETE' }),

};
