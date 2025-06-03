import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { 
  X, AlertCircle, CheckCircle, Clock, HardDrive, Sparkles, 
  Save, Rocket, ArrowUpRight, Database, Copy, ExternalLink, Info
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn, getStatusColor, getStatusDescription, getStatusCodeCategory } from '@/lib/utils';
import { HTTP_METHODS } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { KeyValueTable } from './KeyValueTable';
import { AiAssistant } from './AiAssistant';
import { SessionStorageService } from '@/services/sessionStorage.service';
import type { ApiTesterProps, KeyValuePair, RequestHeader, RequestConfig, ApiResponse } from '@/types';

interface ExtendedApiTesterProps extends ApiTesterProps {
  onToggleHistory?: () => void;
  initialRequest?: RequestConfig;
  initialResponse?: ApiResponse;
}

// Custom icon component with animation
const AnimatedIcon = ({ icon: Icon, className, ...props }: { icon: React.ComponentType<LucideProps> } & LucideProps) => (
  <Icon className={cn("transition-all duration-300", className)} {...props} />
);

export const ApiTester: React.FC<ExtendedApiTesterProps> = ({ 
  className, 
  onToggleHistory,
  initialRequest,
  initialResponse
}) => {
  const [method, setMethod] = useState(initialRequest?.method || 'GET');
  const [url, setUrl] = useState(initialRequest?.url || '');
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    initialRequest?.headers?.length 
      ? initialRequest.headers 
      : [{ key: '', value: '', enabled: true }]
  );
  const [params, setParams] = useState<KeyValuePair[]>([{ key: '', value: '', enabled: true }]);
  const [body, setBody] = useState(initialRequest?.body || '');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('headers');
  const [responseTab, setResponseTab] = useState<string>('response');
  const [copied, setCopied] = useState(false);
  
  const { response, loading, error, sendRequest, clearResponse, clearError } = useApi();

  // Update form when initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      setMethod(initialRequest.method);
      setUrl(initialRequest.url);
      setHeaders(initialRequest.headers?.length ? initialRequest.headers : [{ key: '', value: '', enabled: true }]);
      setBody(initialRequest.body || '');
    }
  }, [initialRequest]);

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    
    clearError();
    setSaved(false);
    
    // Auto-correct common URL issues
    let processedUrl = url;
    
    // Add https:// protocol if missing
    if (!/^https?:\/\//i.test(processedUrl) && !processedUrl.startsWith('/')) {
      processedUrl = `https://${processedUrl}`;
      // Update the URL field with corrected value
      setUrl(processedUrl);
    }
    
    await sendRequest({
      method,
      url: processedUrl,
      headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
      body,
    });
  };

  const handleSaveRequest = () => {
    const requestConfig = {
      method,
      url,
      headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
      body
    };
    
    SessionStorageService.saveRequest(requestConfig, response || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Trigger a custom event to update the history component
    window.dispatchEvent(new Event('storage'));
  };

  const copyResponseToClipboard = () => {
    const responseData = (response || initialResponse)?.data;
    if (responseData) {
      const text = typeof responseData === 'object' 
        ? JSON.stringify(responseData, null, 2) 
        : String(responseData);
      
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const requestConfig = {
    method,
    url,
    headers: headers.map(h => ({ key: h.key, value: h.value, enabled: h.enabled })) as RequestHeader[],
    body
  };

  const responseData = response || initialResponse;

  // Add debug logging
  useEffect(() => {
    if (responseData) {
      console.log('Response status:', responseData.status, typeof responseData.status);
      console.log('Full response data:', responseData);
    }
  }, [responseData]);

  const renderJsonWithLinks = (data: any) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      
      // Process the JSON to highlight links
      let htmlContent = '';
      let inQuotes = false;
      let currentUrl = '';
      let isCollectingUrl = false;
      
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];
        
        // Handle quotes
        if (char === '"') {
          if (!inQuotes) {
            // Opening quote
            inQuotes = true;
            htmlContent += char;
            
            // Check if the next characters form a URL
            const nextChars = jsonString.substring(i + 1, i + 9);
            if (nextChars.startsWith('http://') || nextChars.startsWith('https:/')) {
              isCollectingUrl = true;
              currentUrl = '';
            }
          } else {
            // Closing quote
            inQuotes = false;
            
            if (isCollectingUrl) {
              // We've collected a URL, create a link
              htmlContent += `<a href="${currentUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${currentUrl}</a>`;
              isCollectingUrl = false;
            }
            
            htmlContent += char;
          }
        } else if (inQuotes && isCollectingUrl) {
          // Collecting URL characters
          currentUrl += char;
        } else {
          htmlContent += char;
        }
      }
      
      // Add syntax highlighting for other JSON elements
      htmlContent = htmlContent
        .replace(/\b(true|false|null)\b/g, '<span class="text-amber-500">$1</span>')
        .replace(/("[^"]*"(?=\s*:))/g, '<span class="text-blue-500">$1</span>')
        .replace(/(\d+)/g, '<span class="text-violet-500">$1</span>');
      
      return { __html: htmlContent };
    } catch (e) {
      // Fallback if any errors occur
      return { __html: JSON.stringify(data, null, 2) };
    }
  };
  
  const renderTextWithLinks = (text: string) => {
    try {
      // Regex to detect URLs in text
      const urlRegex = /(https?:\/\/[^\s"<>]+)/g;
      
      // Replace URLs with clickable links
      const linkedText = text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${url}</a>`;
      });
      
      return { __html: linkedText };
    } catch (e) {
      // Fallback if any errors occur
      return { __html: text };
    }
  };

  return (
    <div className={cn('flex h-full flex-col space-y-6', className)}>
      {/* Request Card */}
      <div className="rounded-xl bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-md shadow-xl border border-border/10 overflow-hidden transition-all duration-500 animate-scale">
        {/* Card Header with Accent Band */}
        <div className={cn(
          "h-1 w-full",
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
                  onChange={(e) => setMethod(e.target.value)}
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
                    onChange={(e) => setUrl(e.target.value)}
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
                    
                    {/* Format common error messages to be more user-friendly */}
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
                <TabsTrigger 
                  value="headers" 
                  className="px-5 py-2"
                >
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
                <TabsTrigger 
                  value="params" 
                  className="px-5 py-2"
                >
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
                <TabsTrigger 
                  value="body"
                  className="px-5 py-2"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                      <line x1="18" y1="9" x2="18" y2="9" />
                      <line x1="18" y1="15" x2="18" y2="15" />
                    </svg>
                    Body
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="auth"
                  className="px-5 py-2"
                >
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
                      onChange={(e) => setBody(e.target.value)}
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
        <div className="rounded-xl bg-gradient-to-b from-card/90 to-card/40 backdrop-blur-md shadow-xl border border-border/10 overflow-hidden animate-scale">
          {/* Status indicator band */}
          <div className={cn(
            "h-1 w-full",
            responseData.status >= 200 && responseData.status < 300 && "bg-gradient-to-r from-emerald-400 to-emerald-500",
            responseData.status >= 300 && responseData.status < 400 && "bg-gradient-to-r from-amber-400 to-amber-500",
            responseData.status >= 400 && responseData.status < 500 && "bg-gradient-to-r from-rose-400 to-rose-500",
            responseData.status >= 500 && "bg-gradient-to-r from-red-400 to-red-500",
          )} />
          
          {/* Response Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-border/20 bg-gradient-to-r from-muted/30 to-transparent">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Status</span>
                    <div className="relative group cursor-help">
                      <span 
                        className={cn(
                          "font-mono text-sm font-bold px-3.5 py-1.5 rounded-md shadow-sm inline-flex items-center gap-1.5 transition-all duration-200",
                          responseData?.status >= 200 && responseData?.status < 300 && "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25",
                          responseData?.status >= 300 && responseData?.status < 400 && "bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25",
                          responseData?.status >= 400 && responseData?.status < 500 && "bg-rose-500/20 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300 border border-rose-500/40 hover:bg-rose-500/25",
                          responseData?.status >= 500 && "bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300 border border-red-500/40 hover:bg-red-500/25",
                          responseData?.status >= 100 && responseData?.status < 200 && "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border border-blue-500/40 hover:bg-blue-500/25"
                        )}
                      >
                        {responseData?.status} {responseData?.statusText}
                        <Info className="h-3.5 w-3.5 ml-1 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </span>
                      
                      {/* Status tooltip */}
                      <div className="absolute left-0 bottom-full mb-2 w-64 bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-xl p-3.5 text-xs opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                        <div className="font-semibold text-foreground mb-1.5 text-sm">HTTP Status {responseData?.status}</div>
                        <p className="text-muted-foreground mb-2.5">
                          {getStatusCodeCategory(responseData?.status || 0)}
                        </p>
                        <div className="text-xs text-foreground">
                          <strong>Definition:</strong> {responseData?.status ? getStatusDescription(responseData.status) : "Unknown status"}
                        </div>
                        
                        {/* Arrow pointer */}
                        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-card/95 border-r border-b border-border rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{responseData.time} ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{responseData.size}</span>
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
                <TabsTrigger 
                  value="response"
                  className="px-5 py-2"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                    Response Body
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="headers"
                  className="px-5 py-2"
                >
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
                    'font-mono text-sm p-5 rounded-lg bg-card/60 border border-border shadow-sm',
                    'hover:shadow-md transition-all duration-300 max-h-[500px] overflow-auto relative z-10'
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
                  <div className="bg-muted/20 px-4 py-3 border-b border-border/60">
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4 text-sm font-medium text-muted-foreground">Name</div>
                      <div className="col-span-8 text-sm font-medium text-muted-foreground">Value</div>
                    </div>
                  </div>
                  <div className="divide-y divide-border/60 max-h-[400px] overflow-auto">
                    {Object.entries(responseData.headers || {}).map(([key, value]) => (
                      <div key={key} className="px-4 py-3 hover:bg-muted/20 transition-colors duration-200">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-4 font-medium truncate">{key}</div>
                          <div className="col-span-8 font-mono text-sm break-all">{value}</div>
                        </div>
                      </div>
                    ))}
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