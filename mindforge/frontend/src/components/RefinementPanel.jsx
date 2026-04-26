import React, { useState } from 'react';
import { Send, RefreshCw, Info } from 'lucide-react';

const RefinementPanel = ({ onRefine, loading, disabled }) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim() && !disabled) {
      onRefine(feedback);
      setFeedback('');
    }
  };

  return (
    <div 
      data-html2canvas-ignore="true"
      className={`w-full max-w-3xl mx-auto transition-all duration-500 ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-[#1a2235]/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-1 group focus-within:border-brand-gold/50 focus-within:shadow-[0_0_30px_rgba(200,169,110,0.15)] transition-all"
      >
        <div className="flex items-center gap-2 pl-4 pr-1 text-slate-500 shrink-0 border-r border-white/5 mr-1">
          <RefreshCw className={`text-brand-gold ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} size={18} />
        </div>

        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={disabled ? "Maximum refinements reached" : "Refine roadmap (e.g. 'add more tech details')..."}
          disabled={disabled || loading}
          className="flex-grow bg-transparent border-none py-3.5 px-2 text-sm md:text-base text-white placeholder:text-slate-600 focus:outline-none focus:ring-0 min-w-0"
        />
        
        <button
          type="submit"
          disabled={loading || !feedback.trim() || disabled}
          className="flex items-center justify-center gap-2 px-5 md:px-7 py-3 bg-brand-gold text-slate-900 font-black rounded-[1.2rem] transition-all active:scale-95 disabled:opacity-20 hover:shadow-[0_0_20px_rgba(200,169,110,0.4)] shrink-0"
        >
          <span className="hidden sm:inline text-xs uppercase tracking-widest">{loading ? 'Refining...' : 'Update'}</span>
          <Send size={18} className={loading ? 'hidden' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'} />
          {loading && <RefreshCw size={18} className="animate-spin sm:hidden" />}
        </button>
      </form>
      
      {!disabled && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1a2235] px-4 py-1.5 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.2em] text-brand-gold font-black shadow-xl whitespace-nowrap">
          Secondary Agent Active
        </div>
      )}
    </div>
  );
};

export default RefinementPanel;
