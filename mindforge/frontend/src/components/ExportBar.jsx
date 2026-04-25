import React from 'react';
import { Download, FileJson, FileImage, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as d3 from 'd3';

const ExportBar = ({ mindMapData, miroJson }) => {
  
  const exportPNG = async () => {
    const area = document.getElementById('mindmap-export-area');
    if (!area) return;
    
    // 1. Tell the canvas to show everything
    window.dispatchEvent(new CustomEvent('mindforge-fit-view'));
    
    // 2. Wait for the browser to repaint
    await new Promise(r => setTimeout(r, 300));

    // 3. Capture with high settings
    const canvas = await html2canvas(area, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
      scrollX: 0,
      scrollY: 0,
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
  };

  const exportPDF = async () => {
    const area = document.getElementById('mindmap-export-area');
    if (!area) return;
    
    // Trigger fitting
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

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${mindMapData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(miroJson || mindMapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${mindMapData.title.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex gap-4 p-4 bg-slate-800 border-t border-slate-700 mt-auto">
      <button onClick={exportPNG} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition-colors">
        <FileImage size={16} /> Export PNG
      </button>
      <button onClick={exportPDF} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition-colors">
        <FileText size={16} /> Export PDF
      </button>
      <button onClick={exportJSON} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition-colors">
        <FileJson size={16} /> Export JSON (Miro)
      </button>
    </div>
  );
};

export default ExportBar;
