import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, WifiOff, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Explicitly defining props to avoid "Property 'props' does not exist" error in some TS environments
  public readonly props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Auto-reload if it's a chunk load error (happens after new deployments)
    if (error.message && (
        error.message.includes('Loading chunk') || 
        error.message.includes('Importing a module script failed')
      )) {
      window.location.reload();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white p-6">
          <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Qualcosa è andato storto</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Si è verificato un errore imprevisto. Potrebbe essere dovuto a un aggiornamento dell'app o a un problema di connessione.
            </p>

            <button 
              onClick={this.handleReload}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Ricarica App
            </button>
            
            {this.state.error && (
               <div className="mt-6 p-3 bg-black/30 rounded-lg border border-white/5 text-left">
                  <p className="text-[10px] font-mono text-gray-500 break-all">
                    {this.state.error.toString()}
                  </p>
               </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}