import React, { useState } from 'react';
import { HelpCircle, ChevronRight, MessageSquarePlus } from 'lucide-react';

const ClarificationPanel = ({ questions, onSubmit, loading }) => {
  const [answers, setAnswers] = useState({});
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const isComplete = questions.every(q => answers[q.id]);

  return (
    <div className="flex-grow flex flex-col items-center justify-start pt-6 md:pt-12 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 shadow-2xl mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 md:p-3 bg-brand-gold/20 rounded-full text-brand-gold">
            <HelpCircle size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Refine Your Idea</h2>
            <p className="text-sm md:text-base text-slate-400">Answer these to help Grok build a better map.</p>
          </div>
        </div>

        <div className="space-y-8 mb-8">
          {questions.map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">
                <span className="text-brand-gold mr-2">{q.id}.</span>
                {q.question}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(q.id, opt)}
                    className={`text-left p-4 rounded-xl border transition-all ${answers[q.id] === opt
                        ? 'bg-brand-gold border-brand-gold text-slate-900 font-bold shadow-[0_0_15px_rgba(200,169,110,0.3)]'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-brand-gold/50 hover:bg-slate-700'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-3 pt-4 border-t border-slate-700">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <MessageSquarePlus size={20} className="text-brand-gold" />
              Additional Context (Optional)
            </h3>
            <textarea
              id="additional-context"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Anything else we should know? (e.g. 'Focus on the business aspect', 'Keep it technical')"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl p-4 text-slate-200 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>

        <button
          id="final-generate-btn"
          onClick={() => onSubmit(answers, additionalInfo)}
          disabled={loading || !isComplete}
          className="w-full bg-brand-gold hover:bg-yellow-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center transition-all group shadow-lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
          ) : (
            <>
              Generate Full Mind Map
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClarificationPanel;
