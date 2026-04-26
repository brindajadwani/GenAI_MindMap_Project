import React, { useState } from 'react';
import { Share2, FileJson, FileImage, FileText, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ExportBar = ({ mindMapData, miroJson }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const exportPNG = async () => {
    const area = document.getElementById('mindmap-export-area');
    if (!area) return;
    window.dispatchEvent(new CustomEvent('mindforge-fit-view'));
    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(area, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#0f172a',
      onclone: (clonedDoc) => {
        const clonedArea = clonedDoc.getElementById('mindmap-export-area');
        if (clonedArea) {
          clonedArea.style.overflow = 'visible';
          clonedArea.style.height = 'auto';
        }
      }
    });

    const link = document.createElement('a');
    link.download = `${mindMapData.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    setIsOpen(false);
  };

  const exportPDF = async () => {
    const area = document.getElementById('mindmap-export-area');
    if (!area) return;
    window.dispatchEvent(new CustomEvent('mindforge-fit-view'));
    await new Promise(r => setTimeout(r, 300));
    
    const canvas = await html2canvas(area, { 
      scale: 3, 
      useCORS: true, 
      backgroundColor: '#0f172a'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${mindMapData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    setIsOpen(false);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(miroJson || mindMapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${mindMapData.title.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setIsOpen(false);
  };

  return (
    <div 
      data-html2canvas-ignore="true"
      className="fixed bottom-6 right-6 lg:absolute lg:bottom-6 lg:right-6 z-40"
    >
      <div className="relative">
        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full mb-4 right-0 w-64 bg-[#1a2235]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-2 space-y-1">
              <button 
                onClick={exportPDF}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 text-slate-200 transition-all rounded-2xl group"
              >
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">PDF Document</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">High Resolution</span>
                </div>
              </button>
              
              <button 
                onClick={exportPNG}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 text-slate-200 transition-all rounded-2xl group"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileImage size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">PNG Image</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Transparent BG</span>
                </div>
              </button>

              <button 
                onClick={exportJSON}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 text-slate-200 transition-all rounded-2xl group"
              >
                <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                  <FileJson size={20} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">JSON Data</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Miro Compatible</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Share Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-3 px-6 py-4 rounded-[2rem] font-black transition-all shadow-[0_10px_40px_rgba(0,0,0,0.3)] border ${
            isOpen 
            ? 'bg-brand-gold text-slate-900 border-brand-gold scale-95' 
            : 'bg-white/10 text-white border-white/10 hover:border-brand-gold/50 hover:bg-white/15'
          }`}
        >
          <Share2 size={22} className={`${isOpen ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`} />
          <span className="uppercase tracking-[0.15em] text-xs">Export Map</span>
          <ChevronUp size={18} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default ExportBar;
