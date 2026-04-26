import React from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const QualityScorePanel = ({ report }) => {
  if (!report) return null;

  const score = report.quality_score * 100;
  const isGood = score >= 80;

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group transition-all hover:border-brand-gold/20">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/10 rounded-full blur-[60px] group-hover:bg-brand-gold/20 transition-all duration-700" />
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="flex items-center gap-2 self-start">
          <div className="p-1.5 bg-brand-gold/10 rounded-lg">
            <ShieldCheck className="text-brand-gold" size={16} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Validation Protocol</h3>
        </div>

        {/* Circular Progress */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-700/50"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - score / 100)}
              strokeLinecap="round"
              fill="transparent"
              className={`${isGood ? 'text-brand-gold' : 'text-amber-500'} transition-all duration-1000 ease-out`}
              style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-100">{Math.round(score)}%</span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Quality</span>
          </div>
        </div>

        <div className="w-full space-y-3 mt-2">
          {report.issues && report.issues.length > 0 ? (
            report.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-700/30">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[11px] text-slate-300 leading-tight">{issue}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 justify-center py-2 text-brand-gold animate-pulse">
              <CheckCircle size={16} />
              <span className="text-[10px] uppercase font-bold tracking-wider">All Checks Passed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityScorePanel;
