import { CircleDot } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
                <CircleDot className="w-12 h-12 text-citolab-600 animate-spin" />
                <h3 className="mt-4 text-lg font-medium text-gray-700">Loading Application</h3>
                <p className="mt-2 text-sm text-gray-500">Please wait while we initialize...</p>
                <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-citolab-600 rounded-full animate-pulse-width"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingIndicator;