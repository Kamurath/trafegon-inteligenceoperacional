import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnitInfo } from '../types';
import { loadUnitInfo, saveUnitInfo, loadDynamicUnits, DynamicUnit } from '../lib/infoUtils';
import { Edit2, Check, X, ExternalLink, Settings } from 'lucide-react';
import { UnitManagementModal } from '../components/UnitManagementModal';

const InfoRow: React.FC<{ 
  label: string; 
  value: string; 
  isLink?: boolean;
  isEditing?: boolean;
  onChange?: (val: string) => void;
}> = ({ label, value, isLink, isEditing, onChange }) => (
  <div className="flex flex-col lg:flex-row gap-0.5 lg:gap-2">
    <div className="w-full lg:w-48 bg-[#050714] dark:bg-black text-white px-2 py-1 lg:px-6 lg:py-3 rounded-md text-[8px] lg:text-[10px] font-bold uppercase flex items-center justify-start lg:justify-end lg:text-right">
      {label}
    </div>
    <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-2 py-1 lg:px-6 lg:py-3 rounded-md text-[10px] lg:text-sm font-medium flex items-center min-h-[28px] lg:min-h-[48px] dark:text-gray-200">
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent outline-none border-b border-blue-200 focus:border-blue-500 transition-colors dark:text-white"
        />
      ) : isLink ? (
        <a 
          href={value.startsWith('http') ? value : '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 italic underline flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          {value.startsWith('http') ? 'Link Drive' : value}
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        value
      )}
    </div>
  </div>
);

const Separator = () => <div className="h-1 bg-[#050714] dark:bg-black rounded-full my-4" />;

interface InformacoesPageProps {
  refreshKey?: number;
}

export const InformacoesPage: React.FC<InformacoesPageProps> = ({ refreshKey }) => {
  const [unitsData, setUnitsData] = useState<Record<string, UnitInfo>>({});
  const [units, setUnits] = useState<DynamicUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('EL - ARA');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UnitInfo | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const loadAllData = () => {
    const dynamicUnits = loadDynamicUnits();
    setUnits(dynamicUnits);
    const data = loadUnitInfo();
    setUnitsData(data);
    
    // Ensure selected unit still exists
    if (dynamicUnits.length > 0) {
      const selectedExists = dynamicUnits.some(u => `EL - ${u.prefix}` === selectedUnitId);
      if (!selectedExists) {
        setSelectedUnitId(`EL - ${dynamicUnits[0].prefix}`);
        setIsEditing(false);
      }
    } else {
      setSelectedUnitId('');
      setIsEditing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [refreshKey]);

  const selectedUnit = unitsData[selectedUnitId];

  const handleStartEdit = () => {
    if (selectedUnit) {
      setEditData({ ...selectedUnit });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleSaveEdit = () => {
    if (editData && selectedUnitId) {
      const newData = { ...unitsData, [selectedUnitId]: editData };
      setUnitsData(newData);
      saveUnitInfo(newData);
      setIsEditing(false);
      setEditData(null);
    }
  };

  const updateField = (field: keyof UnitInfo, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const handleUnitsUpdated = () => {
    loadAllData();
  };

  const displayData = isEditing && editData ? editData : selectedUnit;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 px-2 pb-10"
    >
      {/* Unit Selection & Management Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
        {units.map((unit) => {
          const unitId = `EL - ${unit.prefix}`;
          return (
            <button
              key={unit.prefix}
              onClick={() => {
                setSelectedUnitId(unitId);
                setIsEditing(false);
              }}
              className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all border whitespace-nowrap snap-start ${
                selectedUnitId === unitId
                  ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                  : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {unitId}
            </button>
          );
        })}
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="px-3 py-1 bg-[#FDBA74] hover:bg-orange-400 text-[#050714] rounded-full text-[9px] font-bold transition-all border border-orange-200 dark:border-orange-950 flex items-center gap-1 whitespace-nowrap snap-start shadow-sm"
          title="Gerenciar Unidades"
        >
          <Settings className="w-3 h-3" /> Gerenciar Unidades
        </button>
      </div>

      {units.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-2xl text-center space-y-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nenhuma unidade cadastrada.</p>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-4 py-2 bg-[#050714] dark:bg-white dark:text-[#050714] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow"
          >
            Cadastrar Unidade
          </button>
        </div>
      ) : !selectedUnit ? (
        <div className="text-center p-8 text-sm text-gray-500">Selecione uma unidade acima.</div>
      ) : (
        <>
          {/* Unit Header */}
          <div className="relative group">
            <div className="bg-[#050714] dark:bg-black text-white py-3 px-4 rounded-lg text-left lg:text-center text-xs font-bold tracking-widest uppercase">
              {selectedUnit.name}
            </div>
            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
                title="Editar Informações"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Info Blocks */}
          <div className="space-y-2">
            <InfoRow 
              label="Funcionamento" 
              value={displayData.funcionamento} 
              isEditing={isEditing}
              onChange={(v) => updateField('funcionamento', v)}
            />
            <InfoRow 
              label="Contatos" 
              value={displayData.contatos} 
              isEditing={isEditing}
              onChange={(v) => updateField('contatos', v)}
            />
            <InfoRow 
              label="WhatsApp | Bio" 
              value={displayData.whatsappBio} 
              isEditing={isEditing}
              onChange={(v) => updateField('whatsappBio', v)}
            />
            <InfoRow 
              label="WhatsApp | Tráfego" 
              value={displayData.whatsappTrafego} 
              isEditing={isEditing}
              onChange={(v) => updateField('whatsappTrafego', v)}
            />

            <Separator />

            <InfoRow 
              label="CNPJ" 
              value={displayData.cnpj} 
              isEditing={isEditing}
              onChange={(v) => updateField('cnpj', v)}
            />
            <InfoRow 
              label="Razão Social" 
              value={displayData.razaoSocial} 
              isEditing={isEditing}
              onChange={(v) => updateField('razaoSocial', v)}
            />
            <InfoRow 
              label="Endereço" 
              value={displayData.endereco} 
              isEditing={isEditing}
              onChange={(v) => updateField('endereco', v)}
            />

            <Separator />

            <InfoRow 
              label="Contato do Sócio" 
              value={displayData.contatoSocio} 
              isEditing={isEditing}
              onChange={(v) => updateField('contatoSocio', v)}
            />
            <InfoRow 
              label="Endereço do Sócio" 
              value={displayData.enderecoSocio} 
              isEditing={isEditing}
              onChange={(v) => updateField('enderecoSocio', v)}
            />

            <Separator />

            <InfoRow 
              label="Documentos" 
              value={displayData.documentosLink} 
              isLink 
              isEditing={isEditing}
              onChange={(v) => updateField('documentosLink', v)}
            />
          </div>

          {/* Edit Actions */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-10 right-10 flex gap-3 z-50"
              >
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-bold text-sm shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-[#050714] dark:bg-white dark:text-[#050714] text-white rounded-full font-bold text-sm shadow-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Unit Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
          <UnitManagementModal
            isOpen={isManageModalOpen}
            onClose={() => setIsManageModalOpen(false)}
            onUnitsUpdated={handleUnitsUpdated}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
