import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Clock, Trash2, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionStorageService, type SavedRequest } from '@/services/sessionStorage.service';
import type { RequestConfig, ApiResponse } from '@/types';

interface RequestHistoryProps {
  onLoadRequest: (request: RequestConfig, response?: ApiResponse) => void;
  className?: string;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({ onLoadRequest, className }) => {
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    
    // Listen for storage events (when requests are saved from ApiTester)
    const handleStorageChange = () => {
      loadRequests();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadRequests = () => {
    const savedRequests = SessionStorageService.getSavedRequests();
    setRequests(savedRequests);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SessionStorageService.deleteRequest(id);
    loadRequests();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved requests?')) {
      SessionStorageService.clearAllRequests();
      loadRequests();
    }
  };

  const handleSelectRequest = (request: SavedRequest) => {
    setSelectedId(request.id);
    onLoadRequest(request.request, request.response);
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.request.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request History
          </h3>
          <span className="text-sm text-muted-foreground">
            {requests.length} saved
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No requests match your search' : 'No saved requests yet'}
            </p>
            <p className="text-xs mt-1">
              Send a request and save it to see it here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => handleSelectRequest(request)}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all',
                  'hover:bg-accent/50',
                  selectedId === request.id && 'bg-accent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded',
                        request.request.method === 'GET' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        request.request.method === 'POST' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        request.request.method === 'PUT' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                        request.request.method === 'DELETE' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        request.request.method === 'PATCH' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      )}>
                        {request.request.method}
                      </span>
                      {request.response && (
                        <span className={cn(
                          'text-xs font-medium',
                          request.response.status >= 200 && request.response.status < 300 && 'text-success',
                          request.response.status >= 400 && 'text-destructive'
                        )}>
                          {request.response.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{request.name}</p>
                    <p className="text-xs font-medium text-foreground truncate font-mono mt-1.5 border-l-2 border-primary/60 pl-2">
                      {request.request.url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(request.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(request.id, e)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {requests.length > 0 && (
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </Card>
  );
}; 