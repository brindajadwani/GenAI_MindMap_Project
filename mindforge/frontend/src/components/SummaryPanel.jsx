import React from 'react';
import { BookOpen, Map } from 'lucide-react';

const SummaryPanel = ({ summary, flowExplanation }) => {
  if (!summary && !flowExplanation) return null;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Summary */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-gold/20 rounded-lg text-brand-gold">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Strategy Summary</h3>
          </div>
          <p className="text-slate-300 leading-relaxed italic">
            "{summary}"
          </p>
        </div>

        {/* Flow Explanation */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Map size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Roadmap Flow</h3>
          </div>
          <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {flowExplanation}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
