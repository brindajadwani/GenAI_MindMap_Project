import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const TextInputPanel = ({ onGenerate, loading, initialText = '', setInitialText }) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      if (setInitialText) setInitialText(text);
      onGenerate(text);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl p-5 md:p-6 flex flex-col rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.15)] border border-purple-500/30 relative overflow-hidden group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500" />
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow relative z-10">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">STEP 1: CAPTURE THOUGHTS</h2>
        
        <div className="flex-grow flex flex-col mb-4">
          <textarea
            id="idea-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your raw, unstructured thoughts here..."
            className="w-full h-32 md:h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all placeholder:text-slate-400 text-sm leading-relaxed custom-scrollbar"
          />
        </div>

        <div className="flex justify-end">
          <button
            id="initial-generate-btn"
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:shadow-none text-xs tracking-wider uppercase border border-blue-400/30"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : null}
            Generate Questions
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextInputPanel;
