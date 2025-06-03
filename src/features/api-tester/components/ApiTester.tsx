import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '@/hooks';
import { Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { 
  X, AlertCircle, CheckCircle, Clock, HardDrive, Sparkles, 
  Save, Rocket, ArrowUpRight, Database, Copy
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HTTP_METHODS } from '@/constants';
import { KeyValueTable } from './KeyValueTable';
import { AiAssistant } from './AiAssistant';
import { SessionStorageService } from '@/services/sessionStorage.service';
import type { ApiTesterProps, KeyValuePair, RequestHeader, RequestConfig, ApiResponse } from '@/types';

interface ExtendedApiTesterProps extends ApiTesterProps {
  onToggleHistory?: () => void;
  initialRequest?: RequestConfig;
  initialResponse?: ApiResponse;
}

// Animated icon with smooth transitions
const AnimatedIcon = ({ icon: Icon, className, ...props }: { icon: React.ComponentType<LucideProps> } & LucideProps) => (
  <Icon className={cn("transition-all duration-300", className)} {...props} />
);

// Status badge component for displaying HTTP status codes
const StatusBadge = React.memo(({ status, statusText }: { status: number, statusText?: string }) => {
  return (
    <span className="font-mono text-base font-bold px-3 py-1 rounded-md inline-flex items-center gap-1.5 bg-card border border-border">
      {status} {statusText}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export const ApiTester: React.FC<ExtendedApiTesterProps> = ({ 
  className, 
  onToggleHistory,
  initialRequest,
  initialResponse
}) => {
  // Form state
  const [requestForm, setRequestForm] = useState({
    method: initialRequest?.method || 'GET',
    url: initialRequest?.url || '',
    body: initialRequest?.body || ''
  });
  const { method, url, body } = requestForm;

  const updateRequestField = (field: keyof typeof requestForm, value: string) => {
    setRequestForm(prev => ({ ...prev, [field]: value }));
  };

  // Table data state
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    initialRequest?.headers?.length 
      ? initialRequest.headers 
      : [{ key: '', value: '', enabled: true }]
  );
  const [params, setParams] = useState<KeyValuePair[]>([{ key: '', value: '', enabled: true }]);
  
  // UI state
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('headers');
  const [responseTab, setResponseTab] = useState<string>('response');
  const [copied, setCopied] = useState(false);
  
  const { response, loading, error, sendRequest, clearResponse, clearError } = useApi();

  // Update form when initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      setRequestForm({
        method: initialRequest.method,
        url: initialRequest.url,
        body: initialRequest.body || ''
      });
      setHeaders(initialRequest.headers?.length ? initialRequest.headers : [{ key: '', value: '', enabled: true }]);
    }
  }, [initialRequest]);

  // Memoize the request handler for better performance
  const handleSendRequest = useCallback(async () => {
    if (!url.trim()) return;
    
    clearError();
    setSaved(false);
    
    // Auto-correct common URL issues
    let processedUrl = url;
    
    if (!/^https?:\/\//i.test(processedUrl) && !processedUrl.startsWith('/')) {
      processedUrl = `https://${processedUrl}`;
      updateRequestField('url', processedUrl);
    }
    
    await sendRequest({
      method,
      url: processedUrl,
      headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
      body,
    });
  }, [url, method, headers, body, clearError, updateRequestField, sendRequest]);

  const handleSaveRequest = useCallback(() => {
    const requestConfig = {
      method,
      url,
      headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
      body
    };
    
    SessionStorageService.saveRequest(requestConfig, response || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    window.dispatchEvent(new Event('storage'));
  }, [method, url, headers, body, response]);

  const copyResponseToClipboard = useCallback(() => {
    const responseData = (response || initialResponse)?.data;
    if (responseData) {
      const text = typeof responseData === 'object' 
        ? JSON.stringify(responseData, null, 2) 
        : String(responseData);
      
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [response, initialResponse]);

  // Memoize the requestConfig object to prevent unnecessary re-renders
  const requestConfig = useMemo(() => ({
    method,
    url,
    headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
    body
  }), [method, url, headers, body]);

  const responseData = response || initialResponse;
  
  // Plain JSON rendering with colored links
  const renderJsonWithLinks = useCallback((data: any) => {
    try {
      // Convert data to JSON string with proper formatting
      const jsonString = JSON.stringify(data, null, 2);
      
      // First, escape HTML characters to prevent XSS
      const escapedHtml = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Make URLs clickable with colored styling
      const linkedJson = escapedHtml
        .replace(/"(https?:\/\/[^"\\]*(?:\\.[^"\\]*)*)"/g, 
          '"<a href="$1" target="_blank" rel="noopener noreferrer" class="text-pink-400 dark:text-pink-300 font-medium hover:underline">$1</a>"');
      
      return { __html: linkedJson };
    } catch (e) {
      // Fallback if any errors occur
      return { __html: JSON.stringify(data, null, 2) };
    }
  }, []);
  
  const renderTextWithLinks = useCallback((text: string) => {
    try {
      // Escape HTML to prevent XSS
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Make URLs clickable with colored styling
      const linkedText = escapedText.replace(
        /(https?:\/\/[^\s"<>]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-pink-400 dark:text-pink-300 font-medium hover:underline">$1</a>'
      );
      
      return { __html: linkedText };
    } catch (e) {
      // Fallback if any errors occur
      return { __html: text };
    }
  }, []);

  return (
    <div className={cn('flex h-full flex-col space-y-6', className)}>
      {/* Request Card */}
      <div className="rounded-xl bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-md shadow-xl border border-border/10 overflow-hidden transition-all duration-500 will-change-transform animate-scale">
        {/* Method-specific accent band */}
        <div className={cn(
          "h-1 w-full will-change-opacity",
          method === 'GET' && "bg-gradient-to-r from-emerald-400 to-emerald-600",
          method === 'POST' && "bg-gradient-to-r from-blue-400 to-blue-600",
          method === 'PUT' && "bg-gradient-to-r from-amber-400 to-amber-600",
          method === 'DELETE' && "bg-gradient-to-r from-rose-400 to-rose-600",
          method === 'PATCH' && "bg-gradient-to-r from-violet-400 to-violet-600",
          method === 'HEAD' && "bg-gradient-to-r from-slate-400 to-slate-600",
          method === 'OPTIONS' && "bg-gradient-to-r from-pink-400 to-pink-600",
        )} />
        
        <div className="p-8">
          <div className="space-y-6">
            {/* URL Bar and Actions */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <Select
                  value={method}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, method: e.target.value }))}
                  options={HTTP_METHODS}
                  className="w-full font-semibold transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-md"
                  showColorIndicator={true}
                />
              </div>
              
              <div className="col-span-10 flex gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-md blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                  <Input
                    value={url}
                    onChange={(e) => updateRequestField('url', e.target.value)}
                    placeholder="Enter request URL..."
                    className="font-mono text-sm w-full z-10 relative shadow-sm transition-all duration-300 
                              group-hover:shadow-md group-hover:border-primary/40 focus:shadow-md"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="gradient"
                    onClick={handleSendRequest}
                    loading={loading}
                    disabled={!url.trim()}
                    className="px-6 transition-all duration-300 shadow-md hover:shadow-lg min-w-28"
                    rightIcon={<AnimatedIcon icon={ArrowUpRight} className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                  >
                    <span className="relative z-10">Send</span>
                  </Button>
                  
                  <Button
                    variant={showAiAssistant ? "gradient-secondary" : "outline"}
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    className={cn(
                      "transition-all duration-300 shadow-sm",
                      showAiAssistant ? "hover:shadow-md" : "hover:border-primary/60 hover:text-primary hover:shadow-md"
                    )}
                    leftIcon={<AnimatedIcon icon={Sparkles} className="h-4 w-4" />}
                  >
                    {showAiAssistant ? "Hide AI" : "AI Assistant"}
                  </Button>
                  
                  {responseData && (
                    <Button
                      variant={saved ? "gradient-success" : "outline"}
                      onClick={handleSaveRequest}
                      className="transition-all duration-300 shadow-sm hover:shadow-md"
                      leftIcon={saved ? 
                        <AnimatedIcon icon={CheckCircle} className="h-4 w-4 animate-pulse" /> : 
                        <AnimatedIcon icon={Save} className="h-4 w-4" />
                      }
                    >
                      {saved ? "Saved" : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-full bg-destructive/20 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-destructive">Request Failed</p>
                    
                    {error.includes('Invalid URL format: no protocol') ? (
                      <>
                        <p className="text-sm text-destructive/90 mt-1.5">
                          The URL is missing a protocol (http:// or https://).
                        </p>
                        <div className="mt-3 bg-destructive/5 p-3 rounded-md">
                          <p className="text-xs text-destructive/80 font-medium">Try adding "https://" to the beginning of your URL:</p>
                          <code className="text-xs bg-background/50 px-2 py-1 rounded mt-1.5 block">
                            https://{error.split('no protocol: ')[1]}
                          </code>
                        </div>
                      </>
                    ) : error.includes('CORS Error') ? (
                      <>
                        <p className="text-sm text-destructive/90 mt-1.5">
                          The server doesn't allow requests from your browser.
                        </p>
                        <p className="text-xs text-destructive/70 mt-2">
                          This is a security restriction. Try using the backend proxy or an API that supports CORS.
                        </p>
                      </>
                    ) : error.includes('Network Error') ? (
                      <>
                        <p className="text-sm text-destructive/90 mt-1.5">
                          Couldn't connect to the server. Please check your internet connection.
                        </p>
                        <p className="text-xs text-destructive/70 mt-2">
                          The server might be down or your network connection might be unstable.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-destructive/90 mt-1.5">
                        {error.includes('Backend error:') ? error.replace('Backend error:', '') : error}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearError}
                    className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Request Configuration Tabs */}
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="bg-muted/30 p-1.5 rounded-xl mb-2 border-border/20 backdrop-blur-md">
                <TabsTrigger value="headers" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                      <path d="M4 12H2" />
                      <path d="M10 12H8" />
                      <path d="M16 12h-2" />
                      <path d="M22 12h-2" />
                    </svg>
                    Headers
                    {headers.filter(h => h.enabled !== false && h.key.trim()).length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary/80 text-primary-foreground rounded-full animate-fade-in">
                        {headers.filter(h => h.enabled !== false && h.key.trim()).length}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="params" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    Params
                    {params.filter(p => p.enabled !== false && p.key.trim()).length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary/80 text-primary-foreground rounded-full animate-fade-in">
                        {params.filter(p => p.enabled !== false && p.key.trim()).length}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="body" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                      <line x1="18" y1="9" x2="18" y2="9" />
                      <line x1="18" y1="15" x2="18" y2="15" />
                    </svg>
                    Body
                  </span>
                </TabsTrigger>
                <TabsTrigger value="auth" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Auth
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="mt-6 animate-fade-in">
                <KeyValueTable
                  data={headers}
                  onChange={setHeaders}
                  keyPlaceholder="Header name"
                  valuePlaceholder="Header value"
                  title="Request Headers"
                />
              </TabsContent>

              <TabsContent value="params" className="mt-6 animate-fade-in">
                <KeyValueTable
                  data={params}
                  onChange={setParams}
                  keyPlaceholder="Parameter name"
                  valuePlaceholder="Parameter value"
                  title="Query Parameters"
                />
              </TabsContent>

              <TabsContent value="body" className="mt-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10 text-primary">
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      Request Body
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Content Type: JSON</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-md blur-lg group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                    <textarea
                      value={body}
                      onChange={(e) => setRequestForm(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Enter request body (JSON, XML, etc.)"
                      className={cn(
                        'w-full h-48 rounded-lg border border-border bg-card/60 px-4 py-3 text-sm font-mono',
                        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus:border-primary',
                        'resize-none placeholder:text-muted-foreground transition-all duration-300',
                        'hover:border-primary/40 shadow-sm hover:shadow-md focus:shadow-md relative z-10'
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="auth" className="mt-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10 text-primary">
                        <Rocket className="h-3.5 w-3.5" />
                      </div>
                      Authentication
                    </h3>
                  </div>
                  <div className="p-8 border border-dashed border-border rounded-lg text-center bg-gradient-to-b from-card/40 to-card/20 shadow-inner">
                    <div className="max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground">Authentication methods coming soon...</p>
                      <p className="text-xs text-muted-foreground mt-2">For now, use custom headers for authentication</p>
                      <Button 
                        variant="gradient-secondary" 
                        className="mt-4 shadow-sm" 
                        size="sm"
                        onClick={() => {
                          setActiveTab('headers');
                          setHeaders([...headers, { key: 'Authorization', value: 'Bearer ', enabled: true }]);
                        }}
                      >
                        Add Authorization Header
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AI Assistant Section */}
        {showAiAssistant && (
          <div className="border-t border-border/30 bg-gradient-to-b from-muted/50 to-muted/10 backdrop-blur-md animate-slide-up">
            <div className="p-6">
              <AiAssistant requestConfig={requestConfig} />
            </div>
          </div>
        )}
      </div>

      {/* Response Section */}
      {responseData && (
        <div className="rounded-xl bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-md shadow-xl border border-border/10 overflow-hidden will-change-transform animate-scale">
          {/* Status indicator band - now a neutral border */}
          <div className="h-2 w-full bg-muted/50"></div>
          
          {/* Response Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-border/20 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Status</span>
                    <div className="inline-block">
                      <StatusBadge status={responseData?.status} statusText={responseData?.statusText} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">{responseData.time} ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">{responseData.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyResponseToClipboard}
                className={cn(
                  "transition-all duration-300 shadow-sm hover:shadow-md",
                  copied && "border-primary text-primary"
                )}
                leftIcon={
                  copied ? 
                  <AnimatedIcon icon={CheckCircle} className="h-3.5 w-3.5 text-primary" /> : 
                  <AnimatedIcon icon={Copy} className="h-3.5 w-3.5" />
                }
              >
                {copied ? "Copied" : "Copy"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResponse}
                className="text-muted-foreground hover:text-destructive transition-all duration-300"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
            </div>
          </div>
          
          {/* Response Content */}
          <div className="p-8">
            <Tabs value={responseTab} onValueChange={setResponseTab} className="w-full">
              <TabsList className="bg-muted/30 p-1.5 rounded-xl mb-4 border-border/20 backdrop-blur-md">
                <TabsTrigger value="response" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    Response Body
                  </span>
                </TabsTrigger>
                <TabsTrigger value="headers" className="px-5 py-2">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
                      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
                      <path d="M4 12H2" />
                      <path d="M10 12H8" />
                      <path d="M16 12h-2" />
                      <path d="M22 12h-2" />
                    </svg>
                    Response Headers
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="response" className="animate-fade-in">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-md blur-lg group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                  <pre className={cn(
                    'font-mono text-sm p-7 rounded-lg bg-card/80 dark:bg-[#282a36]/80 border border-border shadow-md',
                    'hover:shadow-lg transition-all duration-300 max-h-[500px] overflow-auto relative z-10',
                    'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-primary/20',
                    'overscroll-contain text-foreground leading-relaxed',
                    'content-visibility-auto contain-intrinsic-size-y-500'
                  )}
                    dangerouslySetInnerHTML={
                      typeof responseData.data === 'object'
                        ? renderJsonWithLinks(responseData.data)
                        : renderTextWithLinks(String(responseData.data || ''))
                    }
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="headers" className="animate-fade-in">
                <div className="rounded-lg border border-border shadow-sm overflow-hidden">
                  <div className="bg-muted/30 px-4 py-3 border-b border-border/60 sticky top-0 z-10">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4 text-sm font-medium text-muted-foreground">Name</div>
                      <div className="col-span-8 text-sm font-medium text-muted-foreground">Value</div>
                    </div>
                  </div>
                  <div className="divide-y divide-border/60 max-h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-primary/20 content-visibility-auto contain-intrinsic-size-y-400">
                    {Object.entries(responseData.headers || {}).length > 0 ? (
                      Object.entries(responseData.headers || {}).map(([key, value]) => (
                        <div key={key} className="px-4 py-3 hover:bg-muted/20 transition-colors duration-200">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4 font-medium truncate">{key}</div>
                            <div className="col-span-8 font-mono text-sm break-all">{value}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <p>No headers returned in the response</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}; 