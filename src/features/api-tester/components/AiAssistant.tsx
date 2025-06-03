import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Sparkles, Loader2, Copy, CheckCircle2, Send, Code, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config/api.config';
import type { ApiResponse, RequestConfig } from '@/types';

interface AiAssistantProps {
  request?: RequestConfig;
  requestConfig?: RequestConfig;
  response?: ApiResponse | null;
  className?: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ request, requestConfig, response, className }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  
  // Use either request or requestConfig prop
  const actualRequest = requestConfig || request;

  const generateDescription = async () => {
    if (!actualRequest?.url) return;
    
    setLoading(true);
    try {
      const res = await fetch('/ai-docs/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: actualRequest.method,
          url: actualRequest.url,
          headers: actualRequest.headers?.reduce((acc: Record<string, string>, h) => {
            if (h.enabled !== false && h.key && h.value) {
              acc[h.key] = h.value;
            }
            return acc;
          }, {}) || {}
        })
      });
      
      if (res.ok) {
        const data = await res.text();
        setDescription(data);
      } else {
        const error = await res.text();
        setDescription(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      setDescription('Failed to generate description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentation = async () => {
    if (!actualRequest?.url || !response) return;
    
    setLoading(true);
    try {
      const res = await fetch('/ai-docs/documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiRequest: {
            method: actualRequest.method,
            url: actualRequest.url,
            headers: actualRequest.headers?.reduce((acc: Record<string, string>, h) => {
              if (h.enabled !== false && h.key && h.value) {
                acc[h.key] = h.value;
              }
              return acc;
            }, {}) || {},
            body: actualRequest.body
          },
          apiResponse: {
            statusCode: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: response.data,
            responseTimeMs: response.time
          }
        })
      });
      
      if (res.ok) {
        const data = await res.text();
        setDocumentation(data);
      } else {
        const error = await res.text();
        setDocumentation(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Failed to generate documentation:', error);
      setDocumentation('Failed to generate documentation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeResponse = async () => {
    if (!response) return;
    
    setLoading(true);
    try {
      const res = await fetch('/ai-docs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusCode: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: response.data,
          responseTimeMs: response.time
        })
      });
      
      if (res.ok) {
        const data = await res.text();
        setAnalysis(data);
      } else {
        const error = await res.text();
        setAnalysis(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Failed to analyze response:', error);
      setAnalysis('Failed to analyze response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<Send className="h-3.5 w-3.5" />}
            onClick={generateDescription}
            disabled={!actualRequest?.url || loading}
          >
            {loading ? "Generating..." : "Describe API"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Generate Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              API Description
            </h4>
            {description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(description, 'description')}
                className="h-7 w-7"
              >
                {copied === 'description' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
          {description ? (
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              {description}
            </div>
          ) : (
            <div className="bg-muted/20 rounded-lg p-4 text-center text-sm text-muted-foreground">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating description...
                </div>
              ) : (
                "Click 'Describe API' to generate a description of the current API endpoint"
              )}
            </div>
          )}
        </div>

        {/* Generate Documentation */}
        {documentation && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-muted-foreground" />
                API Documentation
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(documentation, 'documentation')}
                className="h-7 w-7"
              >
                {copied === 'documentation' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {documentation}
            </div>
          </div>
        )}

        {/* Analyze Response */}
        {analysis && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Response Analysis</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(analysis, 'analysis')}
                className="h-7 w-7"
              >
                {copied === 'analysis' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 