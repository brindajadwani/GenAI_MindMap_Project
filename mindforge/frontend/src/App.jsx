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
    // Recursive function to update title in the tree
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
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#0a0f1d] text-slate-200 overflow-hidden font-sans">
      {step === 'input' && (
        <TextInputPanel onGenerate={handleInitialSubmit} loading={loading} />
      )}

      <main className="flex-grow p-4 md:p-8 flex flex-col relative overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 text-sm w-[92%] md:w-auto text-center animate-in slide-in-from-top-4 duration-300">
            {error}
          </div>
        )}

        {step === 'input' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-brand-gold/20 blur-3xl rounded-full" />
              <div className="relative w-20 h-20 md:w-28 md:h-28 bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl md:text-6xl animate-pulse">🧠</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">MindForge AI</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-md leading-relaxed">
              Transform your unstructured thoughts into strategic roadmaps with multi-agent intelligence.
            </p>
          </div>
        )}

        {step === 'clarify' && (
          <ClarificationPanel
            questions={questions}
            onSubmit={handleClarificationSubmit}
            loading={loading}
          />
        )}

        {step === 'result' && mindMapData && (
          <div className="flex-grow flex flex-col min-h-0 animate-in fade-in duration-1000">
            {/* Header */}
            <header className="flex items-center justify-between mb-6 gap-4">
              <div className="flex flex-col min-w-0">
                <h2 className="text-xl md:text-3xl font-black text-white truncate drop-shadow-sm">
                  {mindMapData.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Forge Successful</span>
                </div>
              </div>
              <button
                onClick={reset}
                className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl text-xs md:text-sm font-bold border border-white/10 transition-all text-white backdrop-blur-md"
              >
                New Map
              </button>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
              {/* Main Content Scrollable */}
              <div className="flex-grow flex flex-col gap-6 overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-24 lg:pb-0">
                
                {/* Canvas Area */}
                <section id="mindmap-export-area" className="bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative min-h-[450px] md:min-h-[600px] flex-shrink-0 group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                  <MindMapCanvas data={mindMapData} onNodeEdit={handleNodeEdit} />
                  
                  {/* Floating Refinement inside canvas but anchored bottom */}
                  <div className="absolute bottom-6 left-0 w-full pl-4 pr-16 md:px-8 z-20 pointer-events-none flex justify-center">
                    <div className="w-full max-w-3xl pointer-events-auto">
                      <RefinementPanel
                        onRefine={handleRefine}
                        loading={loading}
                        disabled={refinementUsed}
                      />
                    </div>
                  </div>
                </section>

                <SummaryPanel
                  summary={mindMapData.summary}
                  flowExplanation={mindMapData.flow_explanation}
                />

                {/* Mobile-only Stats stacking */}
                <div className="lg:hidden flex flex-col gap-6">
                  <QualityScorePanel report={testerReport} />
                  <PipelineStatusPanel />
                </div>
              </div>

              {/* Desktop Sidebar */}
              <aside className="hidden lg:flex w-80 flex-col gap-6 flex-shrink-0">
                <QualityScorePanel report={testerReport} />
                <PipelineStatusPanel />
              </aside>
            </div>

            <ExportBar mindMapData={mindMapData} miroJson={miroJson} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
