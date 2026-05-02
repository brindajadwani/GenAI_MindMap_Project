import React, { useState } from 'react';
import TextInputPanel from './components/TextInputPanel';
import MindMapCanvas from './components/MindMapCanvas';
import ExportBar from './components/ExportBar';
import QualityScorePanel from './components/QualityScorePanel';
import ClarificationPanel from './components/ClarificationPanel';
import SummaryPanel from './components/SummaryPanel';
import RefinementPanel from './components/RefinementPanel';
import PipelineStatusPanel from './components/PipelineStatusPanel';
import { generateMindMap, getClarificationQuestions, refineMindMap } from './services/apiService';
import { Folder, Clock, Lightbulb, Settings, History, Map } from 'lucide-react';

function App() {
  const [mindMapData, setMindMapData] = useState(null);
  const [miroJson, setMiroJson] = useState(null);
  const [testerReport, setTesterReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('input'); // input, clarify, result
  const [initialText, setInitialText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [refinementUsed, setRefinementUsed] = useState(false);

  const handleInitialSubmit = async (text) => {
    setLoading(true);
    setError(null);
    setInitialText(text);
    try {
      const data = await getClarificationQuestions(text);
      setQuestions(data.questions);
      setStep('clarify');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze input. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClarificationSubmit = async (answers, additionalInfo) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMindMap(initialText, answers, additionalInfo);
      setMindMapData(result.mind_map);
      setMiroJson(result.miro_json);
      setTesterReport(result.tester_report);
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate mind map. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeEdit = (nodeData, newTitle) => {
    const updateTree = (nodes) => {
      return nodes.map(node => {
        if (node.title === nodeData.title) {
          return { ...node, title: newTitle };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    setMindMapData(prev => {
      if (prev.title === nodeData.title) {
        return { ...prev, title: newTitle };
      }
      return {
        ...prev,
        children: updateTree(prev.children)
      };
    });
  };

  const reset = () => {
    setStep('input');
    setMindMapData(null);
    setInitialText('');
    setRefinementUsed(false);
    setQuestions([]);
  };

  const handleRefine = async (feedback) => {
    if (refinementUsed) return;
    setLoading(true);
    setError(null);
    try {
      const result = await refineMindMap(mindMapData, feedback);
      setMindMapData(result.mind_map);
      setMiroJson(result.miro_json);
      setTesterReport(result.tester_report);
      setRefinementUsed(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Refinement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#1e2330] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2330] flex flex-col justify-between border-r border-slate-700/50 z-50 shadow-2xl flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8 px-2 mt-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BrainWeave</h1>
          </div>

          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
              <Folder size={18} />
              Projects
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
              <Clock size={18} />
              Recents
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white transition-colors text-sm font-medium mt-2">
              <Lightbulb size={18} className="text-emerald-400" />
              Brainstorming Hub
            </button>
            
            <button onClick={reset} className="mt-6 w-full py-2.5 bg-slate-700/50 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-bold text-white transition-all shadow-md">
              Create New Map
            </button>
          </nav>
        </div>

        <div className="p-4 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            <Map size={18} />
            Project
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            <History size={18} />
            Project History
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content with Background */}
      <main 
        className="flex-grow flex flex-col relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 text-sm">
            {error}
          </div>
        )}

        <div className="relative z-10 flex-grow flex flex-col p-6 h-full">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">Input Area</h1>
            
            <div className="flex items-center gap-3">
              <span className="text-white text-sm font-medium drop-shadow-md">Map Theme:</span>
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-lg p-1 flex gap-1">
                <button className="px-3 py-1 bg-white/40 text-white rounded-md text-sm font-bold shadow-sm">Glass</button>
                <button className="px-3 py-1 text-slate-200 hover:bg-white/20 rounded-md text-sm font-medium">Woven</button>
                <button className="px-3 py-1 text-slate-200 hover:bg-white/20 rounded-md text-sm font-medium">Classic</button>
              </div>
            </div>
          </header>

          <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0">
            
            {/* Left Column: Input Panels */}
            <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6 flex-shrink-0">
              
              {/* Step 1: Always visible */}
              <TextInputPanel 
                onGenerate={handleInitialSubmit} 
                loading={loading && step === 'input'} 
                initialText={initialText} 
                setInitialText={setInitialText} 
              />
              
              {/* Step 2: Visible when questions are generated */}
              {(step === 'clarify' || step === 'result') && questions.length > 0 && (
                <ClarificationPanel 
                  questions={questions} 
                  onSubmit={handleClarificationSubmit} 
                  loading={loading && step === 'clarify'} 
                />
              )}
            </div>

            {/* Right Column: Structured Map */}
            <div className="flex-grow bg-slate-100/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl overflow-hidden flex flex-col relative">
              
              {step === 'result' && mindMapData ? (
                <>
                  <div className="p-4 border-b border-slate-300/50 flex justify-between items-start bg-white/40">
                    <div>
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">STEP 3: YOUR STRUCTURED MAP</h2>
                      <h1 className="text-xl font-bold text-slate-900">{mindMapData.title}</h1>
                    </div>
                    {/* Toolbar is inside MindMapCanvas, but we can have ExportBar logic here if needed */}
                  </div>
                  
                  <div className="flex-grow relative">
                    <MindMapCanvas data={mindMapData} onNodeEdit={handleNodeEdit} />
                  </div>
                  
                  {/* Export Bar at bottom */}
                  <div className="absolute bottom-0 left-0 w-full bg-white/60 backdrop-blur-md border-t border-slate-200 p-2">
                    <ExportBar mindMapData={mindMapData} miroJson={miroJson} />
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-slate-500 p-8 text-center">
                  <div>
                    <h2 className="text-lg font-bold mb-2">STEP 3: YOUR STRUCTURED MAP</h2>
                    <p className="text-sm">Complete Step 1 and 2 to generate your mind map visualization here.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
