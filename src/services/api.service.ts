import type { ApiResponse, RequestConfig, RequestHeader } from '@/types';
import { formatBytes } from '@/lib/utils';
import { API_BASE_URL, API_HEADERS } from '@/config/api.config';

export class ApiService {
  private static filterEnabledHeaders(headers: RequestHeader[]): Record<string, string> {
    return headers
      .filter(header => header.enabled !== false && header.key.trim() && header.value.trim())
      .reduce((acc, header) => {
        acc[header.key.trim()] = header.value.trim();
        return acc;
      }, {} as Record<string, string>);
  }

  private static getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return error.message.includes('CORS') 
        ? 'CORS Error: The server does not allow cross-origin requests from this domain.'
        : 'Network Error: Unable to connect to the server.';
    }
    
    if (error.message.includes('CORS')) {
      return 'CORS Error: Cross-origin request blocked.';
    }
    
    if (error.message.includes('ERR_FAILED')) {
      return 'Request Failed: The server rejected the request.';
    }
    
    // Extract specific error patterns from stack traces to provide friendlier messages
    if (error.message.includes('Invalid URL format: no protocol')) {
      const urlMatch = error.message.match(/no protocol: (.+)/);
      const url = urlMatch ? urlMatch[1] : '';
      return `Invalid URL format: no protocol: ${url}`;
    }
    
    if (error.message.includes('Internal Server Error')) {
      // Try to extract the real error message from "Backend error: Internal Server Error"
      const match = error.message.match(/Backend error: (.+)/);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Make 404 errors more user friendly
    if (error.message.includes('404') || (error.status === 404)) {
      return 'Resource Not Found: The URL you requested could not be found.';
    }
    
    // Make server errors more user friendly
    if (error.message.includes('500') || (error.status === 500)) {
      return 'Server Error: The API server encountered an error processing your request.';
    }
    
    return error.message || 'An unexpected error occurred';
  }

  private static isInternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const currentOrigin = window.location.origin;
      return urlObj.origin === currentOrigin || url.startsWith('/api');
    } catch {
      return url.startsWith('/') || url.startsWith('api');
    }
  }

  private static async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch {
      return 'Unable to parse response';
    }
  }

  private static formatApiResponse(
    data: any, 
    status: number, 
    statusText: string, 
    headers: Record<string, string>, 
    startTime: number
  ): ApiResponse {
    const endTime = performance.now();
    const responseSize = new Blob([JSON.stringify(data)]).size;
    
    return {
      data,
      status,
      statusText,
      headers,
      time: Math.round(endTime - startTime),
      size: formatBytes(responseSize),
    };
  }

  static async makeRequest(config: RequestConfig): Promise<ApiResponse> {
    const startTime = performance.now();
    
    try {
      // Check if we should use the backend proxy for external URLs
      const useProxy = !this.isInternalUrl(config.url);
      
      if (useProxy) {
        // Add sessionId if not already provided
        if (!config.sessionId) {
          config.sessionId = crypto.randomUUID();
        }
        return await this.executeRequest(config);
      }
      
      // Direct request for internal URLs
      const requestHeaders = config.headers 
        ? this.filterEnabledHeaders(config.headers)
        : {};

      const sanitizedHeaders = { ...requestHeaders };
      // Browser-controlled headers that shouldn't be manually set
      delete sanitizedHeaders['user-agent'];
      delete sanitizedHeaders['origin'];
      delete sanitizedHeaders['referer'];
      
      const requestOptions: RequestInit = {
        method: config.method,
        headers: {
          ...API_HEADERS,
          ...sanitizedHeaders,
        },
        mode: 'cors',
        credentials: 'include',
      };

      if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        requestOptions.body = config.body;
      }

      const response = await fetch(config.url, requestOptions);
      const responseData = await this.parseResponse(response);

      // Capture all headers properly
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return this.formatApiResponse(
        responseData, 
        response.status, 
        response.statusText, 
        headers, 
        startTime
      );
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async executeRequest(config: RequestConfig): Promise<ApiResponse> {
    const backendUrl = `${API_BASE_URL}/requests/execute`;
    const startTime = performance.now();
    
    const requestHeaders = config.headers 
      ? this.filterEnabledHeaders(config.headers)
      : {};
    
    // Generate a session ID if not provided
    const sessionId = config.sessionId || crypto.randomUUID();
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: API_HEADERS,
        credentials: 'include',
        body: JSON.stringify({
          method: config.method,
          url: config.url,
          headers: requestHeaders,
          body: config.body,
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      // Format the response from backend
      return {
        data: result.body || result.data,
        status: result.status,
        statusText: result.statusText || '',
        headers: result.headers || {},
        time: Math.round(performance.now() - startTime),
        size: formatBytes(new Blob([JSON.stringify(result.body || result.data)]).size),
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error));
    }
  }
} 