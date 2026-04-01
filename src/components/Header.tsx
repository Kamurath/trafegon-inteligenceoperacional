import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Moon, Sun, Mic, MicOff, X, Check, Plus } from 'lucide-react';
import { Page, AIAction } from '../types';
import { 
  detectIntent, 
  isCancelCommand, 
  INITIAL_ASSISTANT_STATE, 
  AssistantState, 
  TASK_STEPS, 
  BIRTHDAY_STEPS, 
  validateInput, 
  formatValue 
} from '../lib/localAssistantUtils';

interface HeaderProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  onSearch?: (query: string) => void;
  onCommand?: (command: string) => void;
  onLocalAction?: (action: AIAction) => void;
  isProcessing?: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activePage, 
  onPageChange,
  onSearch, 
  onCommand, 
  onLocalAction,
  isProcessing,
  isDarkMode,
  onToggleTheme
}) => {
  const [time, setTime] = useState(new Date());
  const [inputValue, setInputValue] = useState('');
  const [assistant, setAssistant] = useState<AssistantState>(INITIAL_ASSISTANT_STATE);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []); // Initialize once on mount

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleInput = (text: string) => {
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
      onCommand?.(text);
    } else {
      const validationError = validateInput(assistant.intent, assistant.step, text);
      if (validationError) {
        setError(validationError);
        return;
      }

      const steps = assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
      const currentStep = steps[assistant.step];
      const formattedValue = formatValue(assistant.intent, assistant.step, text);

      const newData = { ...assistant.data, [currentStep.field]: formattedValue };
      
      if (assistant.step < steps.length - 1) {
        setAssistant({
          ...assistant,
          step: assistant.step + 1,
          data: newData,
        });
        setInputValue('');
        setError(null);
      } else {
        // Complete
        const actionType = assistant.intent === 'task' ? 'create_task' : 'create_birthday';
        onLocalAction?.({
          type: actionType as any,
          payload: newData
        });
        setAssistant(INITIAL_ASSISTANT_STATE);
        setInputValue('');
        setError(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInput(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!assistant.isActive) {
      onSearch?.(val);
    }
  };

  const getPlaceholder = () => {
    if (isProcessing) return "Processando comando...";
    if (assistant.isActive) {
      const steps = assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS;
      return steps[assistant.step].question;
    }
    return "Fazer uma pergunta ou dar um comando";
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTitle = () => {
    switch (activePage) {
      case 'pauta': return 'Pauta';
      case 'aniversariantes': return 'Aniversariantes';
      case 'informacoes': return 'Informações';
      default: return 'Pauta';
    }
  };

  const handleAddClick = () => {
    if (activePage === 'pauta') {
      handleInput('Adicionar tarefa');
    } else if (activePage === 'aniversariantes') {
      handleInput('Adicionar aniversariante');
    } else {
      handleInput('Adicionar tarefa');
    }
  };

  return (
    <header className="h-auto lg:h-24 px-4 lg:px-10 flex flex-col lg:flex-row lg:items-center justify-between bg-transparent relative z-50 py-4 lg:py-0 gap-4 lg:gap-0">
      {/* Desktop Title */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="w-1.5 h-8 bg-[#050714] dark:bg-white rounded-full" />
        <h2 className="text-3xl font-bold text-[#050714] dark:text-white tracking-tight">{getTitle()}</h2>
      </div>

      {/* Mobile Top Row: Search and Add Button */}
      <div className="flex lg:hidden items-center gap-2 w-full order-1">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className={`w-full pl-11 pr-24 py-3 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 rounded-full shadow-sm border border-gray-100 outline-none text-xs placeholder:text-gray-400 focus:border-gray-200 transition-all ${isProcessing ? 'opacity-50 cursor-wait' : ''} ${assistant.isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {recognitionRef.current && (
              <button
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Usar voz"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
              AI
              <Sparkles className="w-2 h-2" />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAddClick}
          className="p-3 bg-[#050714] dark:bg-white text-white dark:text-[#050714] rounded-full shadow-md hover:opacity-90 transition-all flex-shrink-0"
          title="Adicionar"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Tabs Row */}
      <div className="flex lg:hidden items-center justify-between bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm order-2">
        {[
          { id: 'pauta', label: 'Pauta' },
          { id: 'aniversariantes', label: 'Aniversariantes' },
          { id: 'informacoes', label: 'Informações' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id as Page)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activePage === tab.id 
                ? 'bg-[#050714] dark:bg-white text-white dark:text-[#050714] shadow-md' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:flex items-center gap-2 w-full lg:max-w-xl lg:mx-12 order-2">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className={`w-full pl-11 pr-24 py-3 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 rounded-full shadow-sm border border-gray-100 outline-none text-xs placeholder:text-gray-400 focus:border-gray-200 transition-all ${isProcessing ? 'opacity-50 cursor-wait' : ''} ${assistant.isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {recognitionRef.current && (
              <button
                onClick={toggleListening}
                className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Usar voz"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
              AI
              <Sparkles className="w-2 h-2" />
            </div>
          </div>
        </div>
      </div>

        {assistant.isActive && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assistente Local</span>
              </div>
              <button 
                onClick={() => setAssistant(INITIAL_ASSISTANT_STATE)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
              {assistant.intent === 'task' ? 'Cadastrando nova tarefa...' : 'Cadastrando novo aniversariante...'}
            </p>

            <div className="mb-4">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                {assistant.intent === 'task' ? TASK_STEPS[assistant.step].question : BIRTHDAY_STEPS[assistant.step].question}
              </p>
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sua resposta..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all text-sm dark:text-white"
                />
                <button
                  onClick={() => handleInput(inputValue)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS).map((s, i) => (
                <div 
                  key={s.field}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i < assistant.step ? 'bg-green-500 w-8' : i === assistant.step ? 'bg-blue-500 w-12' : 'bg-gray-100 dark:bg-gray-700 w-8'}`}
                />
              ))}
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-medium mb-2">{error}</p>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setAssistant(INITIAL_ASSISTANT_STATE);
                    setInputValue('');
                    setError(null);
                  }}
                  className="hover:text-red-500 transition-colors font-bold uppercase"
                >
                  Cancelar
                </button>
                {(assistant.intent === 'task' ? TASK_STEPS : BIRTHDAY_STEPS)[assistant.step].optional && (
                  <button 
                    onClick={() => handleInput('')}
                    className="text-blue-500 hover:text-blue-600 font-bold uppercase"
                  >
                    Pular etapa
                  </button>
                )}
              </div>
              <span>Pressione Enter para confirmar</span>
            </div>
          </div>
        )}

      <div className="hidden lg:flex items-center gap-4 order-3">
        <button
          onClick={onToggleTheme}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-50 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          title={isDarkMode ? "Mudar para modo dia" : "Mudar para modo noite"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm border border-gray-50 dark:border-gray-700 flex items-center gap-4 font-bold text-sm text-gray-700 dark:text-gray-200">
          <span>{formatDate(time)} | {formatTime(time)}</span>
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="flex flex-col items-center leading-[0.8] relative opacity-90">
          <span className="text-[28px] font-black tracking-tighter text-[#050714] dark:text-white">trá</span>
          <span className="text-[28px] font-black tracking-tighter text-[#050714] dark:text-white">feg</span>
          <div className="bg-[#3B82F6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm mt-0.5">on</div>
        </div>
      </div>
    </header>
  );
};
