import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const TextInputPanel = ({ onGenerate, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text);
    }
  };

  return (
    <div className="w-full lg:w-96 h-auto lg:h-full bg-[#0a0f1d] p-6 md:p-8 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 shadow-2xl z-20 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(200,169,110,0.3)]">
          <span className="text-xl font-black text-slate-900">M</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">MindForge</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <div className="mb-6">
          <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-3">Input Stream</label>
          <textarea
            id="idea-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your unstructured notes, meeting transcripts, or raw ideas here..."
            className="w-full min-h-[200px] lg:flex-grow bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all placeholder:text-slate-600 leading-relaxed"
          />
        </div>

        <button
          id="initial-generate-btn"
          type="submit"
          disabled={loading || !text.trim()}
          className="relative group overflow-hidden bg-brand-gold disabled:bg-slate-800 text-slate-900 font-black py-4 px-6 rounded-2xl flex items-center justify-center transition-all shadow-[0_10px_30px_rgba(200,169,110,0.2)] hover:shadow-[0_15px_40px_rgba(200,169,110,0.3)] hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center">
            {loading ? (
              <Loader2 className="animate-spin mr-3" size={20} />
            ) : (
              <Send className="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
            )}
            <span className="uppercase tracking-widest text-sm">
              {loading ? 'Processing...' : 'Ignite Pipeline'}
            </span>
          </div>
        </button>

        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
            <strong className="text-slate-400">Pro Tip:</strong> More context leads to higher precision. Include goals, constraints, and key stakeholders for best results.
          </p>
        </div>
      </form>
    </div>
  );
};

export default TextInputPanel;
