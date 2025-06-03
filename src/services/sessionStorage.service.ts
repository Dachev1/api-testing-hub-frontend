import type { RequestConfig, ApiResponse } from '@/types';

export interface SavedRequest {
  id: string;
  name: string;
  request: RequestConfig;
  response?: ApiResponse;
  timestamp: Date;
}

const STORAGE_KEY = 'api-testing-hub-requests';

export class SessionStorageService {
  static getSavedRequests(): SavedRequest[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const requests = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return requests.map((req: any) => ({
        ...req,
        timestamp: new Date(req.timestamp)
      }));
    } catch (error) {
      console.error('Error loading saved requests:', error);
      return [];
    }
  }

  static saveRequest(request: RequestConfig, response?: ApiResponse, name?: string): SavedRequest {
    const savedRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name: name || this.generateRequestName(request),
      request,
      response,
      timestamp: new Date()
    };

    const existingRequests = this.getSavedRequests();
    const updatedRequests = [savedRequest, ...existingRequests];
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
    } catch (error) {
      console.error('Error saving request:', error);
    }

    return savedRequest;
  }

  static generateRequestName(request: RequestConfig): string {
    try {
      const url = new URL(request.url);
      // Use the hostname as the base
      const hostname = url.hostname.replace('www.', '');
      
      // Add a specific endpoint name if it's not just the root
      if (url.pathname && url.pathname !== '/') {
        // Get the last part of the path if it exists
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const lastPath = pathParts[pathParts.length - 1];
          return `${hostname} - ${lastPath}`;
        }
      }
      
      // Just use the hostname if no specific path
      return hostname;
    } catch (e) {
      // Fallback to a simple name if URL parsing fails
      return `API Request`;
    }
  }

  static updateRequest(id: string, updates: Partial<SavedRequest>): void {
    const requests = this.getSavedRequests();
    const index = requests.findIndex(req => req.id === id);
    
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
  }

  static deleteRequest(id: string): void {
    const requests = this.getSavedRequests();
    const filtered = requests.filter(req => req.id !== id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  static clearAllRequests(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  static getRequestById(id: string): SavedRequest | undefined {
    const requests = this.getSavedRequests();
    return requests.find(req => req.id === id);
  }
} 