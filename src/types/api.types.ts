export interface ApiTesterProps {
  className?: string;
}

export interface KeyValuePair {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface KeyValueTableProps {
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  title?: string;
  className?: string;
}

export interface RequestConfig {
  method: string;
  url: string;
  headers?: RequestHeader[];
  body?: string;
  sessionId?: string;
}

export interface RequestHeader {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: string;
}

export interface UseApiOptions {
  onSuccess?: (response: ApiResponse) => void;
  onError?: (error: string) => void;
} 