import React from 'https://esm.sh/react@^19.1.1';
import type { VerificationResult } from '../types';
import CheckIcon from './icons/CheckIcon';
import CrossIcon from './icons/CrossIcon';

interface VerificationResultsProps {
  results: VerificationResult | null;
}

const ResultItem: React.FC<{ label: string; valid: boolean }> = ({ label, valid }) => (
  <li className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
    <span className="text-gray-300">{label}</span>
    {valid ? (
      <CheckIcon className="h-6 w-6 text-green-400" />
    ) : (
      <CrossIcon className="h-6 w-6 text-red-400" />
    )}
  </li>
);

const VerificationResults: React.FC<VerificationResultsProps> = ({ results }) => {
  if (!results) {
    return null;
  }

  const allValid = Object.values(results).every(value => typeof value === 'boolean' ? value : true);

  return (
    <div className="w-full mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700">
        {allValid ? (
            <div className="flex-shrink-0 bg-green-500/10 p-2 rounded-full">
                <CheckIcon className="h-8 w-8 text-green-400" />
            </div>
        ) : (
            <div className="flex-shrink-0 bg-red-500/10 p-2 rounded-full">
                <CrossIcon className="h-8 w-8 text-red-400" />
            </div>
        )}
        <div>
            <h2 className={`text-2xl font-bold ${allValid ? 'text-green-400' : 'text-red-400'}`}>
                {allValid ? 'Verification Passed' : 'Verification Failed'}
            </h2>
            <p className="text-gray-400 mt-1">{results.summary}</p>
        </div>
      </div>
      
      <ul className="space-y-3">
        <ResultItem label="Vehicle plate visible" valid={results.vehiclePlateVisible} />
        <ResultItem label="Vehicle fully loaded photo" valid={results.vehicleFullyLoaded} />
        <ResultItem label="Goods unloading photo" valid={results.goodsBeingUnloaded} />
        <ResultItem label="Vehicle empty photo" valid={results.vehicleEmpty} />
        <ResultItem label="Receipt memo present" valid={results.receiptMemoPresent} />
        <ResultItem label="Tax invoice present" valid={results.invoicePresent} />
      </ul>
    </div>
  );
};

export default VerificationResults;