import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-100">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Une erreur est survenue 😕</h2>
                        <p className="text-gray-600 mb-4">L'application a rencontré un problème inattendu.</p>

                        <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-auto max-h-48 mb-4 text-red-800">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                        >
                            Recharger la page
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="w-full mt-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
                        >
                            Déconnexion forcée (Clear Cache)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
