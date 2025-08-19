import React, { useState } from 'https://esm.sh/react@^19.1.1';
import ImageUploader from './components/ImageUploader';
import VerificationResults from './components/VerificationResults';
import Spinner from './components/Spinner';
import { analyzeDeliveryImages } from './services/geminiService';
import type { VerificationResult } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setVerificationResult(null);
    setError(null);
  };

  const handleClear = () => {
    setFiles([]);
    setVerificationResult(null);
    setError(null);
  };

  const handleVerification = async () => {
    if (files.length === 0) {
      setError("Please select images to verify.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await analyzeDeliveryImages(files);
      setVerificationResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Delivery Verification AI
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Automatically verify delivery photos against company criteria.
          </p>
        </header>

        <main className="bg-gray-900/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
          <ImageUploader onFilesSelect={handleFilesSelect} onClear={handleClear} />

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleVerification}
              disabled={isLoading || files.length === 0}
              className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? 'Analyzing...' : 'Verify Delivery'}
            </button>
          </div>

          <div className="mt-8">
            {isLoading && <Spinner />}
            {error && (
              <div className="p-4 text-center text-red-400 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {verificationResult && <VerificationResults results={verificationResult} />}
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;