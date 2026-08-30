import React from 'react';
import { Loader2 } from 'lucide-react';

interface ComponentLoaderProps {
  label?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({ label = 'Carregando módulo...' }) => {
  return (
    <div className="flex-1 w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center bg-[#F8F9FB] select-none">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#0084FF] animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold text-[#1A1D21] tracking-tight">{label}</p>
      <p className="text-[11px] text-[#64748B] mt-0.5">Otimizando desempenho com carregamento sob demanda</p>
    </div>
  );
};
