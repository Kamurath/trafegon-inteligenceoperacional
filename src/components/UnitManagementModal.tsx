import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { DynamicUnit, loadDynamicUnits, saveDynamicUnits, renameUnitPrefix } from '../lib/infoUtils';

interface UnitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnitsUpdated?: () => void;
}

export const UnitManagementModal: React.FC<UnitManagementModalProps> = ({
  isOpen,
  onClose,
  onUnitsUpdated,
}) => {
  const [units, setUnits] = useState<DynamicUnit[]>([]);
  const [newPrefix, setNewPrefix] = useState('');
  const [newName, setNewName] = useState('');
  
  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPrefix, setEditingPrefix] = useState('');
  const [editingName, setEditingName] = useState('');
  
  // Deleting confirmation state
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUnits(loadDynamicUnits());
      setError(null);
      setEditingIndex(null);
      setDeletingIndex(null);
      setNewPrefix('');
      setNewName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const prefix = newPrefix.trim().toUpperCase();
    const name = newName.trim();

    if (!prefix || !name) {
      setError('Por favor, preencha o prefixo e o nome da unidade.');
      return;
    }

    if (units.some(u => u.prefix === prefix)) {
      setError(`O prefixo "${prefix}" já está em uso por outra unidade.`);
      return;
    }

    const updatedUnits = [...units, { prefix, name }];
    setUnits(updatedUnits);
    saveDynamicUnits(updatedUnits);
    
    setNewPrefix('');
    setNewName('');
    onUnitsUpdated?.();
  };

  const handleStartEdit = (index: number, unit: DynamicUnit) => {
    setError(null);
    setEditingIndex(index);
    setEditingPrefix(unit.prefix);
    setEditingName(unit.name);
    setDeletingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setError(null);
  };

  const handleSaveEdit = (index: number) => {
    setError(null);
    const prefix = editingPrefix.trim().toUpperCase();
    const name = editingName.trim();

    if (!prefix || !name) {
      setError('Por favor, preencha o prefixo e o nome da unidade.');
      return;
    }

    // Check if another unit has this prefix
    if (units.some((u, i) => i !== index && u.prefix === prefix)) {
      setError(`O prefixo "${prefix}" já está sendo usado por outra unidade.`);
      return;
    }

    const oldPrefix = units[index].prefix;
    
    // Rename across tasks, birthdays, unitInfo
    if (oldPrefix !== prefix) {
      renameUnitPrefix(oldPrefix, prefix);
    }

    const updatedUnits = [...units];
    updatedUnits[index] = { prefix, name };
    
    setUnits(updatedUnits);
    saveDynamicUnits(updatedUnits);
    setEditingIndex(null);
    onUnitsUpdated?.();
  };

  const handleDeleteUnit = (index: number) => {
    const unitToDelete = units[index];
    const updatedUnits = units.filter((_, i) => i !== index);
    
    setUnits(updatedUnits);
    saveDynamicUnits(updatedUnits);
    setDeletingIndex(null);
    onUnitsUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#050714] dark:bg-black p-6 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">Gerenciar Unidades</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Unit Form */}
          <form onSubmit={handleAddUnit} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Nova Unidade</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-1/4">
                <input
                  type="text"
                  placeholder="Prefixo (ex: ARA)"
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-all text-xs font-bold uppercase dark:text-white"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nome Completo (ex: Espaçolaser - Araripina)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-all text-xs dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#050714] dark:bg-white dark:text-[#050714] text-white hover:bg-gray-900 dark:hover:bg-gray-100 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </form>

          {/* Units List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Unidades Cadastradas ({units.length})</h4>
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {units.map((unit, index) => {
                const isEditing = editingIndex === index;
                const isConfirmingDelete = deletingIndex === index;

                return (
                  <div key={index} className="p-3 bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors flex items-center justify-between gap-4">
                    {isEditing ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingPrefix}
                          onChange={(e) => setEditingPrefix(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-xs font-bold uppercase dark:text-white"
                        />
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-xs dark:text-white"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black text-xs px-2.5 py-1 rounded-md tracking-wider flex-shrink-0 min-w-[64px] text-center">
                          {unit.prefix}
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {unit.name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(index)}
                            className="p-1 bg-green-500 text-white hover:bg-green-600 rounded transition-colors"
                            title="Salvar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-300 rounded transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 p-1 rounded-lg border border-red-100 dark:border-red-900/30">
                          <span className="text-[9px] font-black text-red-600 dark:text-red-400 px-1 uppercase">Excluir?</span>
                          <button
                            onClick={() => handleDeleteUnit(index)}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase rounded transition-colors"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setDeletingIndex(null)}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] font-black uppercase rounded transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(index, unit)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingIndex(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl font-bold text-xs transition-all"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
