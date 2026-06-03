/**
 * API Service
 * Centralized API communication layer with AI features
 */

import { PricingResponse, Recording } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const SESSION_TOKEN_KEY = 'vnotes_session_token';
const USER_DATA_KEY = 'vnotes_user_data';
const SESSION_EXPIRED_MESSAGE_KEY = 'vnotes_session_expired_message';

/**
 * Returns Authorization header object if a session token exists in localStorage.
 * Requirements: 3.9
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

/**
 * Handles a 401 Unauthorized response by clearing stored credentials,
 * storing an expiry message for LoginPage to display, and redirecting to /login.
 * Requirements: 3.10, 9.10
 */
function handleAuthError(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.setItem(
    SESSION_EXPIRED_MESSAGE_KEY,
    'Your session has expired. Please sign in again.'
  );
  window.location.href = '/login';
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
          ...options.headers
        },
        ...options
      });

      if (response.status === 401) {
        handleAuthError();
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Recording endpoints
  async uploadRecording(file: File): Promise<Recording> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/recordings/upload`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      if (response.status === 401) {
        handleAuthError();
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getRecordings(searchQuery?: string): Promise<Recording[]> {
    const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return this.request<Recording[]>(`/recordings${query}`);
  }

  async getRecording(id: string): Promise<Recording> {
    return this.request<Recording>(`/recordings/${id}`);
  }

  async deleteRecording(id: string): Promise<{ message: string }> {
    return this.request(`/recordings/${id}`, {
      method: 'DELETE'
    });
  }

  // AI Features
  async addKeyMoment(id: string, time: string, label: string): Promise<Recording> {
    return this.request<Recording>(`/recordings/${id}/key-moments`, {
      method: 'POST',
      body: JSON.stringify({ time, label })
    });
  }

  async removeKeyMoment(id: string, time: string): Promise<Recording> {
    return this.request<Recording>(`/recordings/${id}/key-moments`, {
      method: 'DELETE',
      body: JSON.stringify({ time })
    });
  }

  async generateSummary(id: string): Promise<Recording> {
    return this.request<Recording>(`/recordings/${id}/summary`, {
      method: 'POST'
    });
  }

  async transcribeRecording(id: string): Promise<Recording> {
    return this.request<Recording>(`/recordings/${id}/transcribe`, {
      method: 'POST'
    });
  }

  async getPricing(): Promise<PricingResponse> {
    return this.request<PricingResponse>('/pricing');
  }

  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export { getAuthHeaders, handleAuthError };
