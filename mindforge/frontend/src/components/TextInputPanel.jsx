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
    <div className="w-80 h-full bg-slate-800 p-6 flex flex-col border-r border-slate-700 shadow-xl">
      <h1 className="text-2xl font-bold text-brand-gold mb-6">MindForge</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <label className="text-sm font-medium text-slate-400 mb-2">Input Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your unstructured notes here..."
          className="flex-grow bg-slate-700 border border-slate-600 rounded p-3 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-brand-gold mb-4"
        />

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="bg-brand-gold hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold py-3 px-4 rounded flex items-center justify-center transition-colors shadow-lg"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <Send className="mr-2" size={20} />
          )}
          {loading ? 'Generating...' : 'Generate Mind Map'}
        </button>
      </form>
    </div>
  );
};

export default TextInputPanel;
