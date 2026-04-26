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
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-900 text-slate-200 overflow-hidden">
      {step === 'input' && (
        <TextInputPanel onGenerate={handleInitialSubmit} loading={loading} />
      )}

      <main className="flex-grow p-4 md:p-8 flex flex-col relative overflow-hidden">
        {error && (
          <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-xl backdrop-blur-md border border-red-400 text-sm md:text-base w-[90%] md:w-auto text-center">
            {error}
          </div>
        )}

        {step === 'input' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center opacity-60 p-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <span className="text-4xl md:text-5xl">🧠</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-300 mb-2">Ready to Forge?</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-md">Enter your topic on the {window.innerWidth < 1024 ? 'top' : 'left'} to start the multi-agent pipeline</p>
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
          <div className="flex-grow flex flex-col min-h-0 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 truncate pr-4 max-w-full">{mindMapData.title}</h2>
              <button
                onClick={reset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs md:text-sm font-medium border border-slate-700 transition-colors whitespace-nowrap"
              >
                Create New Map
              </button>
            </div>

            <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
              <div className="flex-grow flex flex-col gap-4 md:gap-6 min-h-0 lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar">
                <div id="mindmap-export-area" className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative min-h-[400px] md:min-h-[600px] flex-shrink-0">
                  <MindMapCanvas data={mindMapData} onNodeEdit={handleNodeEdit} />
                  <RefinementPanel
                    onRefine={handleRefine}
                    loading={loading}
                    disabled={refinementUsed}
                  />
                </div>

                <SummaryPanel
                  summary={mindMapData.summary}
                  flowExplanation={mindMapData.flow_explanation}
                />
              </div>

              <div className="w-full lg:w-80 flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 flex-shrink-0 pb-20 lg:pb-0">
                <QualityScorePanel report={testerReport} />
                <PipelineStatusPanel />
              </div>
            </div>

            <ExportBar mindMapData={mindMapData} miroJson={miroJson} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
