// BACKUP OF /src/components/Header.tsx as of 2026-04-01
import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Sun, Moon, Send, X, ChevronRight, Ban } from 'lucide-react';
import { AIAction } from '../types';
import { 
  AssistantState, 
  INITIAL_ASSISTANT_STATE, 
  detectIntent, 
  TASK_STEPS, 
  BIRTHDAY_STEPS, 
  validateInput, 
  formatValue,
  isCancelCommand
} from '../lib/localAssistantUtils';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCommand: (action: AIAction) => void;
  onLocalAction?: (action: AIAction) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onCommand, onLocalAction, isDarkMode, onToggleTheme }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [assistant, setAssistant] = useState<AssistantState>(INITIAL_ASSISTANT_STATE);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [assistant]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleInput = (text: string) => {
    if (!text.trim()) return;

    // Check for cancel command
    if (isCancelCommand(text)) {
      setAssistant(INITIAL_ASSISTANT_STATE);
      setInputValue('');
      setError(null);
      return;
    }

    if (!assistant.isActive) {
      const intent = detectIntent(text);
      if (intent) {
        setAssistant({
          intent,
          step: 0,
          data: {},
          isActive: true,
        });
        setInputValue('');
        onSearch?.(''); // Clear search when assistant starts
        setError(null);
        return;
      }
      // If not an intent, treat as normal search/command
      onSearch(text);
    } else {
      // Assistant is active, process step
      const steps = assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
      const currentStep = steps[assistant.step];
      
      const validationError = validateInput(assistant.intent, assistant.step, text);
      if (validationError) {
        setError(validationError);
        return;
      }

      const formattedValue = formatValue(assistant.intent, assistant.step, text);
      const newData = { ...assistant.data, [currentStep.field]: formattedValue };
      
      if (assistant.step < steps.length - 1) {
        setAssistant({
          ...assistant,
          step: assistant.step + 1,
          data: newData
        });
        setInputValue('');
        setError(null);
      } else {
        // Final step completed
        const actionType = assistant.intent === 'task' ? 'create_task' : 'create_birthday';
        onLocalAction?.({
          type: actionType,
          payload: newData
        });
        setAssistant(INITIAL_ASSISTANT_STATE);
        setInputValue('');
        setError(null);
      }
    }
  };

  const handleSkip = () => {
    if (!assistant.isActive) return;
    const steps = assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
    const currentStep = steps[assistant.step];

    if (currentStep.optional || true) { // Allow skipping for now to be flexible
      if (assistant.step < steps.length - 1) {
        setAssistant({
          ...assistant,
          step: assistant.step + 1
        });
        setError(null);
      } else {
        // If it was the last step, just finish
        const actionType = assistant.intent === 'task' ? 'create_task' : 'create_birthday';
        onLocalAction?.({
          type: actionType,
          payload: assistant.data
        });
        setAssistant(INITIAL_ASSISTANT_STATE);
        setError(null);
      }
    }
  };

  const currentSteps = assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
  const currentStep = assistant.isActive ? currentSteps[assistant.step] : null;

  return (
    <header className="h-20 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#050714]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex-1 max-w-2xl relative">
        <div className={`relative group transition-all duration-300 ${assistant.isActive ? 'scale-105' : ''}`}>
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${assistant.isActive ? 'text-blue-500' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            placeholder={assistant.isActive ? `Responda: ${currentStep?.question}` : "Busque ou digite um comando (ex: 'Adicionar tarefa')..."}
            className={`w-full pl-12 pr-24 py-3 bg-gray-100 dark:bg-white/5 border-2 rounded-2xl focus:outline-none transition-all duration-300 ${
              assistant.isActive 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'border-transparent focus:border-blue-500/50'
            } dark:text-white`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!assistant.isActive) onSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInput(inputValue);
              if (e.key === 'Escape' && assistant.isActive) setAssistant(INITIAL_ASSISTANT_STATE);
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue && (
              <button 
                onClick={() => {
                  setInputValue('');
                  if (!assistant.isActive) onSearch('');
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => handleInput(inputValue)}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Assistant UI Panel */}
        <AnimatePresence>
          {assistant.isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-4 p-6 bg-white dark:bg-[#0A0C1F] border border-blue-500/30 rounded-3xl shadow-2xl z-50 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1 block">Assistente Local</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{currentStep?.question}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {currentSteps.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                          i === assistant.step ? 'bg-blue-500 w-10' : i < assistant.step ? 'bg-blue-500/40' : 'bg-gray-200 dark:bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-red-500 mb-4 flex items-center gap-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                >
                  <Ban size={14} />
                  {error}
                </motion.p>
              )}

              <div className="flex items-center justify-between gap-4 mt-6">
                <button 
                  onClick={() => setAssistant(INITIAL_ASSISTANT_STATE)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <X size={16} /> Cancelar
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSkip}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    Pular etapa
                  </button>
                  <button 
                    onClick={() => handleInput(inputValue)}
                    className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    Confirmar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleTheme}
          className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl text-gray-500 dark:text-gray-400 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
          title={isDarkMode ? "Mudar para modo dia" : "Mudar para modo noite"}
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Fritz</p>
            <p className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Administrador</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 border-2 border-white dark:border-[#050714]">
            F
          </div>
        </div>
      </div>
    </header>
  );
};
