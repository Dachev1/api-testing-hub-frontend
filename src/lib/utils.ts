import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function getStatusColor(status: number): string {
  if (status === 0) return 'text-destructive';
  if (status >= 200 && status < 300) return 'bg-emerald-500/10 text-emerald-500';
  if (status >= 400) return 'bg-rose-500/10 text-rose-500';
  return 'bg-amber-500/10 text-amber-500';
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  // Allow relative URLs that start with /
  if (url.startsWith('/')) return true;
  
  // Add protocol if missing for the check
  const urlToCheck = url.match(/^https?:\/\//i) ? url : `https://${url}`;
  
  try {
    new URL(urlToCheck);
    return true;
  } catch {
    return false;
  }
}

/**
 * Suggest a corrected URL based on common issues
 */
export function suggestUrlCorrection(url: string): string | null {
  if (!url) return null;
  
  // Already has protocol
  if (url.match(/^https?:\/\//i)) return null;
  
  // Relative URL
  if (url.startsWith('/')) return null;
  
  // Missing protocol - add https://
  return `https://${url}`;
}

export function parseResponseTime(startTime: number, endTime: number): number {
  return endTime - startTime;
}

export function sanitizeHeaders(headers: Array<{ key: string; value: string }>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  headers.forEach(header => {
    if (header.key.trim() && header.value.trim()) {
      sanitized[header.key.trim()] = header.value.trim();
    }
  });
  return sanitized;
}

/**
 * Get description for HTTP status code
 */
export function getStatusDescription(status: number): string {
  const descriptions: Record<number, string> = {
    // 1xx Informational
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    
    // 2xx Success
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    
    // 3xx Redirection
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    
    // 4xx Client Errors
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    
    // 5xx Server Errors
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
  };
  
  return descriptions[status] || "Unknown Status";
}

/**
 * Get category name for HTTP status code
 */
export function getStatusCodeCategory(status: number): string {
  if (status >= 100 && status < 200) {
    return "Informational response - Request received, continuing process";
  }
  if (status >= 200 && status < 300) {
    return "Success - Request was successfully received, understood, and accepted";
  }
  if (status >= 300 && status < 400) {
    return "Redirection - Further action needs to be taken to complete the request";
  }
  if (status >= 400 && status < 500) {
    return "Client error - Request contains bad syntax or cannot be fulfilled";
  }
  if (status >= 500) {
    return "Server error - Server failed to fulfill a valid request";
  }
  return "Unknown status code category";
} 