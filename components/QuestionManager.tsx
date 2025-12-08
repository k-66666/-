

import React, { useState } from 'react';
import { Question, QuestionType } from '../types';
import { Plus, Trash2, Save, Pencil, X, Wand2, Check, CheckSquare, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

interface QuestionManagerProps {
  questions: Question[];
  onAdd: (q: Question) => void;
  onUpdate: (q: Question) => void;
  onDelete: (id: string) => void;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onAdd, onUpdate, onDelete }) => {
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'import' | 'excel'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState<QuestionType>(QuestionType.CHOICE);
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerChoice, setCorrectAnswerChoice] = useState<string[]>([]);
  const [correctAnswerJudge, setCorrectAnswerJudge] = useState<string>(''); 
  const [correctAnswerText, setCorrectAnswerText] = useState(''); // For Essay
  const [mnemonic, setMnemonic] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [importText, setImportText] = useState('');

  const resetForm = () => {
    setType(QuestionType.CHOICE);
    setContent('');
    setOptions(['', '', '', '']);
    setCorrectAnswerChoice([]);
    setCorrectAnswerJudge('');
    setCorrectAnswerText('');
    setMnemonic('');
    setAnalysis('');
    setEditingId(null);
    setImportText('');
  };

  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setType(q.type);
    setContent(q.content);
    setMnemonic(q.mnemonic || '');
    setAnalysis(q.analysis || '');
    
    if (q.type === QuestionType.CHOICE && q.options) {
      const newOpts = [...q.options];
      while (newOpts.length < 4) newOpts.push('');
      setOptions(newOpts);
      setCorrectAnswerChoice(Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer as string]);
    } else if (q.type === QuestionType.JUDGE) {
      setCorrectAnswerJudge(String(q.correctAnswer));
    } else if (q.type === QuestionType.ESSAY) {
      setCorrectAnswerText(String(q.correctAnswer));
    }
    setActiveView('editor');
  };

  const handleSave = () => {
    if (!content) return;
    if (type === QuestionType.CHOICE && correctAnswerChoice.length === 0) return;
    if (type === QuestionType.JUDGE && !correctAnswerJudge) return;
    if (type === QuestionType.ESSAY && !correctAnswerText) return;

    const questionData: Question = {
      id: editingId || Date.now().toString(),
      type,
      content,
      correctAnswer: type === QuestionType.JUDGE 
          ? (correctAnswerJudge === 'true') 
          : type === QuestionType.ESSAY
            ? correctAnswerText
            : correctAnswerChoice,
      mnemonic: mnemonic || undefined,
      analysis: analysis || undefined,
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

  const toggleChoiceAnswer = (index: number) => {
      const letter = String.fromCharCode(65 + index);
      setCorrectAnswerChoice(prev => 
          prev.includes(letter) ? prev.filter(o => o !== letter) : [...prev, letter].sort()
      );
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const buffer = evt.target?.result;
          const wb = XLSX.read(buffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

          let imported = 0;
          const startRow = (data[0][0] && String(data[0][0]).includes('题')) ? 1 : 0;

          for (let i = startRow; i < data.length; i++) {
              const row = data[i];
              if (!row || row.length === 0) continue;
              
              const content = row[0];
              if (!content) continue;

              let newQ: Partial<Question> = {
                  id: Date.now() + Math.random().toString(),
                  content: String(content).trim(),
                  tags: ['Excel导入']
              };

              const potentialOptions = [row[2], row[3], row[4], row[5]].filter(x => x);
              
              if (potentialOptions.length >= 2) {
                  newQ.type = QuestionType.CHOICE;
                  newQ.options = potentialOptions.map(String);
                  
                  let ansRaw = String(row[6] || '').toUpperCase().trim();
                  const ansArr = ansRaw.split(/[,，\s]+|/).filter(x => ['A','B','C','D'].includes(x));
                  
                  const mappedAns = ansArr.map(letter => {
                      const idx = letter.charCodeAt(0) - 65;
                      // Store the LETTER, not the text, to match seed data format
                      return letter;
                  }).filter(x => x) as string[];

                  if (mappedAns.length > 0) newQ.correctAnswer = mappedAns;
                  else continue; 

              } else {
                  newQ.type = QuestionType.JUDGE;
                  const ansRaw = String(row[6] || '').trim();
                  newQ.correctAnswer = ['对','T','TRUE','√','1','正确'].includes(ansRaw.toUpperCase());
              }

              if (row[7]) newQ.mnemonic = String(row[7]);
              if (row[8]) newQ.analysis = String(row[8]);

              onAdd(newQ as Question);
              imported++;
          }
          alert(`成功导入 ${imported} 道题目！`);
          e.target.value = ''; 
      };
      reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 overflow-x-auto">
        <button onClick={() => { resetForm(); setActiveView('list'); }} className={`flex-1 min-w-[60px] py-2 text-xs font-bold rounded-md transition-all ${activeView === 'list' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>列表</button>
        <button onClick={() => { resetForm(); setActiveView('editor'); }} className={`flex-1 min-w-[60px] py-2 text-xs font-bold rounded-md transition-all ${activeView === 'editor' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>手动</button>
        <button onClick={() => { resetForm(); setActiveView('import'); }} className={`flex-1 min-w-[60px] py-2 text-xs font-bold rounded-md transition-all ${activeView === 'import' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>智能导入</button>
        <button onClick={() => { resetForm(); setActiveView('excel'); }} className={`flex-1 min-w-[60px] py-2 text-xs font-bold rounded-md transition-all ${activeView === 'excel' ? 'bg-white dark:bg-slate-700 shadow text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>Excel</button>
      </div>

      {activeView === 'list' && (
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-start group relative shadow-sm">
                    <div className="flex-1 pr-16"> 
                        <div className="flex gap-2 mb-2">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">{idx + 1}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                q.type === QuestionType.JUDGE ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 
                                q.type === QuestionType.ESSAY ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            }`}>
                                {q.type === QuestionType.JUDGE ? '判断' : q.type === QuestionType.ESSAY ? '简答' : '选择'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">{q.content}</p>
                    </div>
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                        <button onClick={() => handleStartEdit(q)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if(confirm('确定要删除这道题吗？')) onDelete(q.id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                    <div className="grid grid-cols-3 gap-2">
                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === QuestionType.CHOICE ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800'}`}>
                            <input type="radio" checked={type === QuestionType.CHOICE} onChange={() => setType(QuestionType.CHOICE)} className="hidden" />
                            <span className="text-xs font-bold">选择</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === QuestionType.JUDGE ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'border-slate-100 dark:border-slate-800'}`}>
                            <input type="radio" checked={type === QuestionType.JUDGE} onChange={() => setType(QuestionType.JUDGE)} className="hidden" />
                            <span className="text-xs font-bold">判断</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === QuestionType.ESSAY ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-800'}`}>
                            <input type="radio" checked={type === QuestionType.ESSAY} onChange={() => setType(QuestionType.ESSAY)} className="hidden" />
                            <span className="text-xs font-bold">简答</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">题目内容</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="请输入题目描述..." rows={4} />
                </div>
                {type === QuestionType.CHOICE && (
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">选项设置 (点击✓设为正确)</label>
                        <div className="space-y-3">
                            {options.map((opt, i) => {
                                const letter = String.fromCharCode(65+i);
                                return (
                                <div key={i} className="flex gap-3 items-center group">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${correctAnswerChoice.includes(letter) ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{letter}</div>
                                    <input value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }} className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={`选项 ${letter}`} />
                                    <button onClick={() => toggleChoiceAnswer(i)} className={`p-2 rounded-lg transition-all ${correctAnswerChoice.includes(letter) ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-300 hover:text-slate-500'}`}><CheckSquare className="w-5 h-5" /></button>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
                {type === QuestionType.JUDGE && (
                    <div>
                         <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">正确答案</label>
                         <div className="flex gap-4">
                            <button onClick={() => setCorrectAnswerJudge('true')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${correctAnswerJudge === 'true' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-600 dark:text-green-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>正确 (√)</button>
                            <button onClick={() => setCorrectAnswerJudge('false')} className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${correctAnswerJudge === 'false' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>错误 (×)</button>
                         </div>
                    </div>
                )}
                {type === QuestionType.ESSAY && (
                     <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">参考答案</label>
                        <textarea value={correctAnswerText} onChange={(e) => setCorrectAnswerText(e.target.value)} className="w-full p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900 dark:text-indigo-200 placeholder-indigo-300/50" placeholder="输入完整的参考答案..." rows={6} />
                     </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">深度辨析/解析</label>
                    <textarea value={analysis} onChange={(e) => setAnalysis(e.target.value)} className="w-full p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 dark:text-blue-200 placeholder-blue-300/50" placeholder="输入详细的理由或辨析..." rows={3} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">助记 (选填)</label>
                    <input value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} className="w-full p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-400 placeholder-amber-300/50" placeholder="输入顺口溜..." />
                </div>
                <button onClick={handleSave} disabled={!content || (type === QuestionType.CHOICE ? correctAnswerChoice.length === 0 : (type === QuestionType.JUDGE ? !correctAnswerJudge : !correctAnswerText))} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"><Save className="w-5 h-5" /> {editingId ? '保存修改' : '确认添加'}</button>
            </div>
        </div>
      )}

      {activeView === 'import' && (
        <div className="flex-1 overflow-y-auto pb-20">
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">批量导入 (Magic Import)</h3>
                    <textarea value={importText} onChange={(e) => setImportText(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300" placeholder="格式：... 答案：A, B, C" rows={12} />
                </div>
             </div>
        </div>
      )}

      {activeView === 'excel' && (
          <div className="flex-1 overflow-y-auto pb-20">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Excel 导入</h3>
                  <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                  <p className="text-xs text-slate-400">支持列顺序：题目 | 类型 | 选项A-D | 答案 | 巧记 | 解析</p>
              </div>
          </div>
      )}
    </div>
  );
};