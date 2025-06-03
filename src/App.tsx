import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Header } from '@/components/shared/Header';
import { ApiTester } from '@/features/api-tester/components/ApiTester';
import { RequestHistory } from '@/features/history/components/RequestHistory';
import { Button } from '@/components/ui/Button';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RequestConfig, ApiResponse } from '@/types';

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestConfig | undefined>();
  const [selectedResponse, setSelectedResponse] = useState<ApiResponse | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a gentle fade-in effect on initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLoadRequest = (request: RequestConfig, response?: ApiResponse) => {
    setSelectedRequest(request);
    setSelectedResponse(response);
    if (showHistory) {
      setShowHistory(false);
    }
  };

  const toggleHistoryPanel = () => {
    setShowHistory(!showHistory);
  };

  return (
    <ThemeProvider>
      <div className={cn(
        "h-screen flex flex-col bg-background transition-opacity duration-500",
        isLoaded ? "opacity-100" : "opacity-0"
      )}>
        <Header />
        <div className="flex-1 flex overflow-hidden">
          {/* History Panel with animated transition */}
          <div 
            className={cn(
              "border-r border-border bg-card/40 backdrop-blur-sm flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
              showHistory ? "w-80" : "w-0"
            )}
          >
            <div className="h-full">
              <RequestHistory onLoadRequest={handleLoadRequest} />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-end px-4 py-2 bg-card/40 backdrop-blur-sm border-b border-border/40">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={toggleHistoryPanel}
                leftIcon={showHistory ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              >
                {showHistory ? "Hide History" : "Show History"}
              </Button>
            </div>
            
            <main className="flex-1 overflow-auto px-5 py-5">
              <div className="max-w-6xl mx-auto w-full">
                <ApiTester 
                  initialRequest={selectedRequest}
                  initialResponse={selectedResponse}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
