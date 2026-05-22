/**
 * API Service
 * Centralized API communication layer with AI features
 */

import { Recording, KeyMoment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
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
          ...options.headers
        },
        ...options
      });

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
        body: formData
      });

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
