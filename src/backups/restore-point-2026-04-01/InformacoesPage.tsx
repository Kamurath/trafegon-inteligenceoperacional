// BACKUP OF /src/pages/InformacoesPage.tsx as of 2026-04-01
import React, { useState } from 'react';
import { UnitInfo } from '../types';
import { OFFICIAL_UNITS } from '../lib/infoUtils';
import { Search, Building2, Clock, Phone, MapPin, FileText, ExternalLink, Copy, Check, Globe, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InformacoesPageProps {
  unitInfo: Record<string, UnitInfo>;
  onUpdateUnitInfo: (id: string, info: UnitInfo) => void;
  searchQuery: string;
}

export const InformacoesPage: React.FC<InformacoesPageProps> = ({ unitInfo, onUpdateUnitInfo, searchQuery }) => {
  const [selectedUnitId, setSelectedUnitId] = useState(OFFICIAL_UNITS[0].id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredUnits = OFFICIAL_UNITS.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentInfo = unitInfo[selectedUnitId] || {
    id: selectedUnitId,
    name: OFFICIAL_UNITS.find(u => u.id === selectedUnitId)?.name || '',
    funcionamento: '',
    contatos: '',
    whatsappBio: '',
    whatsappTrafego: '',
    cnpj: '',
    razaoSocial: '',
    endereco: '',
    contatoSocio: '',
    enderecoSocio: '',
    documentosLink: '',
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const InfoCard = ({ title, value, icon: Icon, fieldId, isLink = false }: { title: string, value: string, icon: any, fieldId: string, isLink?: boolean }) => (
    <div className="bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 p-6 rounded-[32px] group hover:border-blue-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
          <Icon size={24} />
        </div>
        <div className="flex gap-2">
          {isLink && value && (
            <a href={value} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-all">
              <ExternalLink size={18} />
            </a>
          )}
          <button 
            onClick={() => copyToClipboard(value, fieldId)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-blue-500 transition-all"
          >
            {copiedField === fieldId ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-gray-900 dark:text-white font-bold leading-relaxed break-words">
        {value || 'Não informado'}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Sidebar de Unidades */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">UNIDADES</h2>
        <div className="flex-1 bg-white dark:bg-[#0A0C1F] border border-gray-200 dark:border-white/5 rounded-[40px] p-4 overflow-y-auto max-h-[600px] lg:max-h-none shadow-sm">
          <div className="space-y-2">
            {filteredUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnitId(unit.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                  selectedUnitId === unit.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={18} className={selectedUnitId === unit.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} />
                  <span className="font-bold text-sm truncate">{unit.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo da Unidade */}
      <div className="flex-1 space-y-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Building2 size={200} />
          </div>
          <div className="relative z-10">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
              Informações Oficiais
            </span>
            <h3 className="text-5xl font-black tracking-tighter mb-2">{currentInfo.name}</h3>
            <p className="text-blue-100 font-medium text-lg max-w-xl">Dados cadastrais, contatos e links importantes para operação diária da unidade.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoCard title="Horário de Funcionamento" value={currentInfo.funcionamento} icon={Clock} fieldId="func" />
          <InfoCard title="Contatos da Unidade" value={currentInfo.contatos} icon={Phone} fieldId="contato" />
          <InfoCard title="Link WhatsApp Bio" value={currentInfo.whatsappBio} icon={Globe} fieldId="wa_bio" isLink />
          <InfoCard title="Link WhatsApp Tráfego" value={currentInfo.whatsappTrafego} icon={MessageSquare} fieldId="wa_traf" isLink />
          <InfoCard title="CNPJ" value={currentInfo.cnpj} icon={FileText} fieldId="cnpj" />
          <InfoCard title="Razão Social" value={currentInfo.razaoSocial} icon={Building2} fieldId="razao" />
          <InfoCard title="Endereço Completo" value={currentInfo.endereco} icon={MapPin} fieldId="end" />
          <InfoCard title="Contato do Sócio" value={currentInfo.contatoSocio} icon={Phone} fieldId="socio_cont" />
          <InfoCard title="Endereço do Sócio" value={currentInfo.enderecoSocio} icon={MapPin} fieldId="socio_end" />
          <div className="md:col-span-2 xl:col-span-3">
            <InfoCard title="Link da Pasta de Documentos (Drive)" value={currentInfo.documentosLink} icon={ExternalLink} fieldId="drive" isLink />
          </div>
        </div>
      </div>
    </div>
  );
};
