import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, Send, CheckCircle2, AlertCircle, MicOff } from 'lucide-react';
import { loadSettings } from '../lib/settingsUtils';
import { AppSettings, Task, Aniversariante } from '../types';

interface CommandAssistantProps {
  initialCommand: string;
  onClose: () => void;
  onComplete: (type: 'task' | 'birthday', data: any) => void;
}

type FlowType = 'task' | 'birthday';

interface Step {
  field: string;
  label: string;
  question: string;
  type: 'text' | 'date' | 'select' | 'datetime-local';
  options?: string[];
  optional?: boolean;
}

export const CommandAssistant: React.FC<CommandAssistantProps> = ({ initialCommand, onClose, onComplete }) => {
  const [settings] = useState<AppSettings>(loadSettings());
  const [flow, setFlow] = useState<FlowType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const birthdaySteps: Step[] = [
    { field: 'name', label: 'Nome', question: 'Qual é o nome do aniversariante?', type: 'text' },
    { field: 'unidade', label: 'Unidade', question: 'Qual é a unidade?', type: 'select', options: settings.unidades.map(u => u.name) },
    { field: 'data', label: 'Data', question: 'Qual é a data do aniversário?', type: 'date' },
    { field: 'status', label: 'Status', question: 'Qual será o status?', type: 'select', options: settings.statusAniversariantes.map(s => s.name) },
    { field: 'foto', label: 'Link da Foto', question: 'Deseja adicionar o link da foto? (Opcional)', type: 'text', optional: true },
  ];

  const taskSteps: Step[] = [
    { field: 'title', label: 'Tarefa', question: 'Qual é a tarefa?', type: 'text' },
    { field: 'unidade', label: 'Unidade', question: 'Qual é a unidade?', type: 'select', options: settings.unidades.map(u => u.name) },
    { field: 'solicitante', label: 'Solicitante', question: 'Quem é o solicitante?', type: 'select', options: settings.solicitantes.map(s => s.name) },
    { field: 'status', label: 'Status', question: 'Qual será o status?', type: 'select', options: settings.statusPauta.map(s => s.name) },
    { field: 'entrega', label: 'Entrega', question: 'Qual é a data e hora de entrega?', type: 'datetime-local' },
  ];

  const steps = flow === 'birthday' ? birthdaySteps : taskSteps;
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    const cmd = initialCommand.toLowerCase();
    if (cmd.includes('aniversariante')) {
      setFlow('birthday');
    } else if (cmd.includes('tarefa')) {
      setFlow('task');
    } else {
      onClose();
    }
  }, [initialCommand]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStepIndex, flow]);

  const handleNext = (val: string) => {
    setError(null);
    const value = val.trim();
    const lowerValue = value.toLowerCase();

    if (['cancelar', 'parar', 'sair'].includes(lowerValue)) {
      onClose();
      return;
    }

    if (!value && !currentStep.optional) {
      setError('Este campo é obrigatório.');
      return;
    }

    if (currentStep.type === 'select' && currentStep.options && !currentStep.options.includes(value)) {
      setError(`Por favor, escolha uma das opções: ${currentStep.options.join(', ')}`);
      return;
    }

    const newAnswers = { ...answers, [currentStep.field]: value };
    setAnswers(newAnswers);
    setInputValue('');

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(flow!, newAnswers);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Auto-submit voice if it matches a select option or if it's text
      if (currentStep.type === 'select' && currentStep.options) {
        const match = currentStep.options.find(opt => opt.toLowerCase() === transcript.toLowerCase());
        if (match) {
          handleNext(match);
        }
      }
    };

    recognition.start();
  };

  if (!flow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-10 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
    >
      <div className="bg-[#050714] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Assistente Local</span>
        </div>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            Passo {currentStepIndex + 1} de {steps.length}
          </div>
          <h3 className="text-sm font-bold text-gray-900 leading-tight">
            {currentStep.question}
          </h3>
        </div>

        <div className="relative">
          {currentStep.type === 'select' ? (
            <div className="grid grid-cols-2 gap-2">
              {currentStep.options?.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleNext(opt)}
                  className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold hover:bg-blue-50 hover:border-blue-200 transition-all text-left"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type={currentStep.type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext(inputValue);
                  if (e.key === 'Escape') onClose();
                }}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                placeholder={currentStep.optional ? "Pressione Enter para pular" : "Digite aqui..."}
              />
              <button
                onClick={() => handleNext(inputValue)}
                className="p-2 bg-[#050714] text-white rounded-xl hover:bg-gray-900 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleVoiceInput}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <Mic className="w-3 h-3 animate-bounce" /> : <Mic className="w-3 h-3" />}
            {isListening ? 'Ouvindo...' : 'Falar'}
          </button>
          
          <button
            onClick={onClose}
            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-3 border-t border-gray-100">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {steps.map((s, i) => (
            <div
              key={s.field}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
