import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { Plus, Trash2, Save, FileText, CheckSquare, Brain } from 'lucide-react';

interface QuestionManagerProps {
  questions: Question[];
  onAdd: (q: Question) => void;
  onDelete: (id: string) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onAdd, onDelete }) => {
  const [activeView, setActiveView] = useState<'list' | 'add'>('list');
  
  // Form State
  const [type, setType] = useState<QuestionType>(QuestionType.CHOICE);
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const handleSave = () => {
    if (!content || !correctAnswer) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      content,
      correctAnswer: type === QuestionType.JUDGE ? (correctAnswer === 'true') : correctAnswer,
      mnemonic: mnemonic || undefined,
      options: type === QuestionType.CHOICE ? options.filter(o => o) : undefined,
      tags: ['自定义']
    };

    onAdd(newQuestion);
    
    // Reset
    setContent('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setMnemonic('');
    setActiveView('list');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Toggle View */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button 
          onClick={() => setActiveView('list')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeView === 'list' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
        >
          题库列表 ({questions.length})
        </button>
        <button 
          onClick={() => setActiveView('add')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeView === 'add' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
        >
          添加题目
        </button>
      </div>

      {activeView === 'list' ? (
        <div className="flex-1 overflow-y-auto space-y-3">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-start group">
                    <div>
                        <div className="flex gap-2 mb-1">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{idx + 1}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${q.type === QuestionType.JUDGE ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {q.type === QuestionType.JUDGE ? '判断' : '选择'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 line-clamp-2">{q.content}</p>
                        {q.mnemonic && (
                            <div className="mt-2 flex items-center gap-1 text-amber-600 text-xs">
                                <Brain className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">{q.mnemonic}</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => onDelete(q.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 bg-white p-4 rounded-xl border border-slate-100">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">题型</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={type === QuestionType.CHOICE} onChange={() => setType(QuestionType.CHOICE)} className="text-primary" />
                        选择题
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={type === QuestionType.JUDGE} onChange={() => setType(QuestionType.JUDGE)} className="text-primary" />
                        判断题
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">题目内容</label>
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入题目..."
                    rows={3}
                />
            </div>

            {type === QuestionType.CHOICE && (
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">选项 (请在正确选项前填入相同内容)</label>
                    <div className="space-y-2">
                        {options.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <span className="text-xs text-slate-400 w-4">{String.fromCharCode(65+i)}</span>
                                <input 
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...options];
                                        newOpts[i] = e.target.value;
                                        setOptions(newOpts);
                                    }}
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                                    placeholder={`选项 ${i+1}`}
                                />
                                <input 
                                    type="radio" 
                                    name="correctOpt"
                                    checked={correctAnswer === opt && opt !== ''}
                                    onChange={() => setCorrectAnswer(opt)}
                                    className="ml-2 accent-green-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {type === QuestionType.JUDGE && (
                <div>
                     <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">正确答案</label>
                     <div className="flex gap-4">
                        <button 
                            onClick={() => setCorrectAnswer('true')}
                            className={`px-4 py-2 rounded-lg border text-sm font-bold ${correctAnswer === 'true' ? 'bg-green-50 border-green-500 text-green-600' : 'border-slate-200 text-slate-500'}`}
                        >
                            正确 (√)
                        </button>
                        <button 
                             onClick={() => setCorrectAnswer('false')}
                             className={`px-4 py-2 rounded-lg border text-sm font-bold ${correctAnswer === 'false' ? 'bg-green-50 border-green-500 text-green-600' : 'border-slate-200 text-slate-500'}`}
                        >
                            错误 (×)
                        </button>
                     </div>
                </div>
            )}

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-500" />
                    巧记 / Mnemonic (可选)
                </label>
                <input 
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                    placeholder="例如：恩自 (恩格斯-自然辩证法)..."
                />
            </div>

            <button 
                onClick={handleSave}
                disabled={!content || !correctAnswer}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                保存题目
            </button>
        </div>
      )}
    </div>
  );
};