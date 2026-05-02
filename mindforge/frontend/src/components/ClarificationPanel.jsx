import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const ClarificationPanel = ({ questions, onSubmit, loading }) => {
  const [answers, setAnswers] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const isComplete = questions.every(q => answers[q.id]);

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl p-5 md:p-6 flex flex-col rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-green-500/30 relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/50 to-purple-500/50 rounded-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">STEP 2: CLARIFY IDEAS</h2>
        <p className="text-xs text-slate-400 mb-4">System-generated clarification questions based on the input.</p>

        <div className="flex-grow space-y-4 mb-4 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
          {questions.map((q) => (
            <div key={q.id} className="bg-white/5 rounded-xl border border-white/10 p-3">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Q{q.id}: {q.question}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(q.id, opt)}
                    className={`text-left text-sm p-2 rounded-lg border transition-all ${answers[q.id] === opt
                        ? 'bg-slate-200 border-slate-300 text-slate-900 font-medium'
                        : 'bg-transparent border-slate-600/50 text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            id="final-generate-btn"
            onClick={() => onSubmit(answers, additionalInfo)}
            disabled={loading || !isComplete}
            className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:shadow-none text-xs tracking-wider uppercase border border-emerald-400/30"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            Refine & Generate Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClarificationPanel;
