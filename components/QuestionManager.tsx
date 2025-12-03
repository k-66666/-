import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { Plus, Trash2, Save, Pencil, X, Wand2, Check } from 'lucide-react';

interface QuestionManagerProps {
  questions: Question[];
  onAdd: (q: Question) => void;
  onUpdate: (q: Question) => void;
  onDelete: (id: string) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onAdd, onUpdate, onDelete }) => {
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'import'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState<QuestionType>(QuestionType.CHOICE);
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  // Import State
  const [importText, setImportText] = useState('');

  const resetForm = () => {
    setType(QuestionType.CHOICE);
    setContent('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setMnemonic('');
    setEditingId(null);
    setImportText('');
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setType(q.type);
    setContent(q.content);
    setMnemonic(q.mnemonic || '');
    
    if (q.type === QuestionType.CHOICE && q.options) {
      const newOpts = [...q.options];
      while (newOpts.length < 4) newOpts.push('');
      setOptions(newOpts);
      setCorrectAnswer(q.correctAnswer as string);
    } else if (q.type === QuestionType.JUDGE) {
      setCorrectAnswer(String(q.correctAnswer));
    }

    setActiveView('editor');
  };

  const handleSave = () => {
    if (!content || !correctAnswer) return;

    const questionData: Question = {
      id: editingId || Date.now().toString(),
      type,
      content,
      correctAnswer: type === QuestionType.JUDGE ? (correctAnswer === 'true') : correctAnswer,
      mnemonic: mnemonic || undefined,
      options: type === QuestionType.CHOICE ? options.filter(o => o) : undefined,
      tags: ['自定义']
    };

    if (editingId) {
        onUpdate(questionData);
    } else {
        onAdd(questionData);
    }
    
    resetForm();
    setActiveView('list');
  };

  // Smart Paste Logic
  const handleSmartImport = () => {
    if (!importText) return;

    // Split by common question delimiters (1., 2. or newlines)
    const blocks = importText.split(/\n\s*\n|\n(?=\d+[.、])/g).filter(b => b.trim());
    let importedCount = 0;

    blocks.forEach(block => {
        const text = block.trim();
        if (!text) return;

        // Detect Type: If it has A. B. C. -> CHOICE
        const hasOptions = /[A-D][.、]/i.test(text);
        
        let newQ: Partial<Question> = {
            id: Date.now() + Math.random().toString(),
            tags: ['导入']
        };

        if (hasOptions) {
            newQ.type = QuestionType.CHOICE;
            
            // Extract options
            const opts: string[] = [];
            const optionMatches = text.matchAll(/([A-D])[.、]\s*([^A-D\n]+)/gi);
            for (const match of optionMatches) {
                opts.push(match[2].trim());
            }
            newQ.options = opts.length >= 2 ? opts : ['选项A', '选项B', '选项C', '选项D'];

            // Clean content (remove options from text)
            let cleanContent = text.replace(/([A-D])[.、]\s*[^A-D\n]+/gi, '').trim();
            // Remove ID prefix (1. )
            cleanContent = cleanContent.replace(/^\d+[.、]\s*/, '');
            // Remove Answer line if present
            cleanContent = cleanContent.replace(/答案[：:]\s*[A-D]/gi, '');
            newQ.content = cleanContent;

            // Extract Answer
            const ansMatch = text.match(/答案[：:]\s*([A-D])/i) || text.match(/\(\s*([A-D])\s*\)/i);
            if (ansMatch) {
                // Map letter to full option text
                const letterIndex = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
                if (newQ.options && newQ.options[letterIndex]) {
                    newQ.correctAnswer = newQ.options[letterIndex];
                }
            }
        } else {
            // JUDGE
            newQ.type = QuestionType.JUDGE;
            // Clean content
            let cleanContent = text.replace(/^\d+[.、]\s*/, '');
            
            // Extract Answer
            let ans = true; // default
            if (text.includes('错误') || text.includes('×') || text.includes('F')) ans = false;
            
            // Remove answer indicators from content
            cleanContent = cleanContent.replace(/[(（]\s*[√×TtfF]\s*[）)]/g, '');
            cleanContent = cleanContent.replace(/答案[：:]\s*[正确错误]/g, '');

            newQ.content = cleanContent.trim();
            newQ.correctAnswer = ans;
        }

        if (newQ.content && newQ.correctAnswer !== undefined) {
            onAdd(newQ as Question);
            importedCount++;
        }
    });

    alert(`成功导入 ${importedCount} 道题目！`);
    resetForm();
    setActiveView('list');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
        <button 
          onClick={() => { resetForm(); setActiveView('list'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeView === 'list' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          列表
        </button>
        <button 
          onClick={() => { resetForm(); setActiveView('editor'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeView === 'editor' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          手动添加
        </button>
        <button 
          onClick={() => { resetForm(); setActiveView('import'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${activeView === 'import' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Wand2 className="w-3 h-3" />
          智能导入
        </button>
      </div>

      {activeView === 'list' && (
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-start group relative shadow-sm">
                    <div className="flex-1 pr-16"> 
                        <div className="flex gap-2 mb-2">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{idx + 1}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${q.type === QuestionType.JUDGE ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                                {q.type === QuestionType.JUDGE ? '判断' : '选择'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">{q.content}</p>
                    </div>
                    
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                        <button 
                            onClick={() => handleStartEdit(q)}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => {
                                if(confirm('确定要删除这道题吗？')) {
                                    onDelete(q.id);
                                }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeView === 'editor' && (
        <div className="flex-1 overflow-y-auto pb-20">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm">
                
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">题目类型</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === QuestionType.CHOICE ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800'}`}>
                            <input type="radio" checked={type === QuestionType.CHOICE} onChange={() => setType(QuestionType.CHOICE)} className="hidden" />
                            <span className="text-sm font-bold">选择题</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === QuestionType.JUDGE ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'border-slate-100 dark:border-slate-800'}`}>
                            <input type="radio" checked={type === QuestionType.JUDGE} onChange={() => setType(QuestionType.JUDGE)} className="hidden" />
                            <span className="text-sm font-bold">判断题</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">题目内容</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="请输入题目描述..."
                        rows={4}
                    />
                </div>

                {type === QuestionType.CHOICE && (
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">选项设置</label>
                        <div className="space-y-3">
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-3 items-center group">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${correctAnswer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        {String.fromCharCode(65+i)}
                                    </div>
                                    <input 
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...options];
                                            newOpts[i] = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                        className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={`选项 ${String.fromCharCode(65+i)}`}
                                    />
                                    <button 
                                        onClick={() => setCorrectAnswer(opt)}
                                        className={`p-2 rounded-lg transition-all ${correctAnswer === opt && opt !== '' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-300 hover:text-slate-500'}`}
                                        title="设为正确答案"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {type === QuestionType.JUDGE && (
                    <div>
                         <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">正确答案</label>
                         <div className="flex gap-4">
                            <button 
                                onClick={() => setCorrectAnswer('true')}
                                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${correctAnswer === 'true' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                                正确 (√)
                            </button>
                            <button 
                                 onClick={() => setCorrectAnswer('false')}
                                 className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${correctAnswer === 'false' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                                错误 (×)
                            </button>
                         </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">助记 (选填)</label>
                    <input 
                        value={mnemonic}
                        onChange={(e) => setMnemonic(e.target.value)}
                        className="w-full p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-400 placeholder-amber-300/50"
                        placeholder="输入一句顺口溜或关键词..."
                    />
                </div>

                <button 
                    onClick={handleSave}
                    disabled={!content || !correctAnswer}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                    <Save className="w-5 h-5" />
                    {editingId ? '保存修改' : '确认添加'}
                </button>
            </div>
        </div>
      )}

      {activeView === 'import' && (
        <div className="flex-1 overflow-y-auto pb-20">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">批量导入 (Magic Import)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">直接粘贴题目文本，系统会自动识别选择题和判断题。</p>
                    
                    <textarea 
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300"
                        placeholder={`支持格式示例：

1. 题目内容... 
A. 选项1 
B. 选项2 
答案：A

2. 题目内容... (√)
`}
                        rows={12}
                    />
                </div>
                
                <button 
                    onClick={handleSmartImport}
                    disabled={!importText}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Wand2 className="w-5 h-5" />
                    开始智能分析并导入
                </button>
             </div>
        </div>
      )}
    </div>
  );
};