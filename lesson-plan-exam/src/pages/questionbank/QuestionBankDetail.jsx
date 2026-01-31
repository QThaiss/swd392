import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { questionBankApi, questionApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Loader2, Plus, ArrowLeft, Trash2, Edit, FileText, CheckCircle, Wand2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import QuestionForm from './QuestionForm';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Question">
        <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-slate-600 mb-2">Are you sure you want to delete this question?</p>
            {title && <p className="font-semibold text-slate-900 mb-6 px-4 line-clamp-2">"{title}"</p>}
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm}>Delete</Button>
            </div>
        </div>
    </Modal>
);

const QuestionBankDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bank, setBank] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateParams, setGenerateParams] = useState({ topic: '', count: 5, questionType: 'MULTIPLE_CHOICE', difficultyLevel: 1 });
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState(new Set());
    const [generating, setGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: '' });

    const canManage = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'teacher' || user?.role === 'admin';

    const fetchBankAndQuestions = async () => {
        try {
            setLoading(true);
            const bankRes = await questionBankApi.getById(id);
            if (bankRes.success) {
                setBank(bankRes.data);
            }
            
            await fetchQuestions();
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const questionsRes = await questionApi.getByBank(id, { size: 100 });
            if (questionsRes.success) {
                let data = questionsRes.data;
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                     if (Array.isArray(data.items)) data = data.items;
                     else if (Array.isArray(data.content)) data = data.content;
                }
                setQuestions(Array.isArray(data) ? data : []);
            }
        } catch (error) {
             console.error("Failed to fetch questions", error);
        }
    }

    useEffect(() => {
        fetchBankAndQuestions();
    }, [id]);

    const handleCreateQuestion = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleDeleteQuestion = (question) => {
        setDeleteConfirm({ open: true, id: question.id, title: question.title });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return;
        try {
            await questionApi.delete(deleteConfirm.id);
            setQuestions(prev => prev.filter(q => q.id !== deleteConfirm.id));
            toast.success("Question deleted");
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete question");
        } finally {
            setDeleteConfirm({ open: false, id: null, title: '' });
        }
    };



    const handleFormSuccess = () => {
        setIsModalOpen(false);
        fetchQuestions();
    };

    // AI Handlers
    const handleGenerateClick = () => {
        setGenerateParams({ topic: '', count: 5, questionType: 'MULTIPLE_CHOICE', difficultyLevel: 1 });
        setIsReviewing(false);
        setGeneratedQuestions([]);
        setIsGenerateModalOpen(true);
    };

    const handleGenerateSubmit = async () => {
        if (!generateParams.topic) {
            toast.error("Please enter a topic");
            return;
        }

        try {
            setGenerating(true);
            const { aiApi } = await import('../../services/api');
            const res = await aiApi.generateQuestions(generateParams);
            
            if (res.success) {
                setGeneratedQuestions(res.data);
                setIsReviewing(true);
                // Select all by default
                const allIndices = new Set(res.data.map((_, idx) => idx));
                setSelectedIndices(allIndices);
            }
        } catch (error) {
            console.error("Generation failed", error);
            toast.error("Failed to generate questions");
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleSelect = (idx) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(idx)) {
            newSelected.delete(idx);
        } else {
            newSelected.add(idx);
        }
        setSelectedIndices(newSelected);
    };

    const handleImportQuestions = async () => {
        const bankId = parseInt(id);
        if (!bankId || isNaN(bankId)) {
            console.error("Invalid Question Bank ID:", id);
            toast.error("Error: Question Bank ID is invalid.");
            return;
        }

        try {
            setGenerating(true);
            const questionsToImport = generatedQuestions.filter((_, idx) => selectedIndices.has(idx));
            
            console.log(`Importing ${questionsToImport.length} questions to Bank ID: ${bankId}`);
            
            let successCount = 0;
            for (const q of questionsToImport) {
                try {
                    // Map QuestionDTO to CreateQuestionRequest
                    const payload = {
                        questionBankId: bankId,
                        title: q.title,
                        content: q.content,
                        questionType: q.questionType,
                        questionDifficultyId: null, // Let backend handle default or user input mechanism later
                        difficultyLevel: q.difficultyLevel, // Not in DTO but might be needed? Backend CreateQuestionRequest has questionDifficultyId, not level INT.
                        // We need to resolve difficulty ID from Level INT if possible, implies backend logic missing?
                        // For now, send validation safe payload.
                        answers: q.answers.map((a, idx) => ({
                            answerText: a.answerText,
                            isCorrect: a.isCorrect,
                            explanation: "",
                            orderIndex: idx
                        })),
                        additionalData: ""
                    };
                    
                    // Note: CreateQuestionRequest requires questionDifficultyId (Integer ID), NOT level (1,2,3).
                    // If we pass null, backend might use default or fail? Backend: if (Id != null) findById. 
                    // It does NOT auto-resolve Level -> ID. 
                    // WORKAROUND: Pass hardcoded ID=1 (Easy) or handle logic.
                    // For now, let's omit if null is allowed. Backend: check null checks.
                    
                    console.log("Sending Payload:", payload);
                    const res = await questionApi.create(payload);
                    if (res && (res.success || res.id)) successCount++; // Accommodate different potential responses
                    
                } catch (e) {
                    console.error("Failed to import question", q, e);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} questions.`);
                setIsGenerateModalOpen(false);
                fetchQuestions();
            } else {
                toast.error("No questions were imported successfully. Check console for errors.");
            }

        } catch (error) {
            console.error("Import failed", error);
            toast.error("Failed to import questions");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!bank) return <div className="p-12 text-center">Question Bank not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/question-banks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-2xl font-bold">{bank.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Questions</CardTitle>
                            <CardDescription>Manage questions for this bank.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             {canManage && (
                                <>
                                    <Button variant="outline" onClick={handleGenerateClick} className="text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                                        <Wand2 className="h-4 w-4 mr-2" /> AI Generate
                                    </Button>
                                    <Button onClick={handleCreateQuestion}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Question
                                    </Button>
                                </>
                             )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No questions yet. Create one to get started.</p>
                        ) : (
                            questions.map((q, index) => (
                                <div key={q.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors flex justify-between group">
                                    <div className="flex gap-3">
                                        <span className="font-mono text-slate-400 text-sm">#{index + 1}</span>
                                        <div>
                                            <h3 className="font-medium text-slate-900">{q.title}</h3>
                                            <p className="text-sm text-slate-500 max-w-2xl whitespace-pre-wrap">{q.content}</p>
                                            
                                            {/* Answers Display */}
                                            {q.answers && q.answers.length > 0 && (
                                                <div className="mt-3 grid gap-1">
                                                    {q.answers.map((ans, idx) => (
                                                        <div 
                                                            key={ans.id || idx} 
                                                            className={`text-sm flex items-start gap-2 ${
                                                                ans.isCorrect ? 'text-emerald-600 font-medium' : 'text-slate-500'
                                                            }`}
                                                        >
                                                            <div className="mt-0.5">
                                                                {ans.isCorrect ? (
                                                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                                ) : (
                                                                    <div className="h-4 w-4 border border-slate-200 rounded-full" />
                                                                )}
                                                            </div>
                                                            <span>{ans.answerText || ans.correctAnswer}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-3">
                                                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                                    {q.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Fill in Blank'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {canManage && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(q)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingQuestion ? "Edit Question" : "Create Question"}
            >
                <QuestionForm 
                    initialData={editingQuestion} 
                    questionBankId={parseInt(id)} 
                    onSuccess={handleFormSuccess} 
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* AI Generation Modal */}
             <Modal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title={isReviewing ? "Review AI Generated Questions" : "Generate Questions with AI"}
            >
                {!isReviewing ? (
                    <div className="space-y-4">
                        <Input
                            label="Topic *"
                            placeholder="e.g. Chemical Reactions"
                            value={generateParams.topic}
                            onChange={e => setGenerateParams({...generateParams, topic: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    value={generateParams.questionType}
                                    onChange={e => setGenerateParams({...generateParams, questionType: e.target.value})}
                                >
                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                    <option value="FILL_BLANK">Fill in Blank</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                    value={generateParams.difficultyLevel}
                                    onChange={e => setGenerateParams({...generateParams, difficultyLevel: parseInt(e.target.value)})}
                                >
                                    <option value={1}>Easy</option>
                                    <option value={2}>Medium</option>
                                    <option value={3}>Hard</option>
                                </select>
                            </div>
                        </div>
                        <Input
                            label="Number of Questions (1-20)"
                            type="number"
                            min={1}
                            max={20}
                            value={generateParams.count}
                            onChange={e => setGenerateParams({...generateParams, count: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleGenerateSubmit} isLoading={generating}>
                                <Wand2 className="h-4 w-4 mr-2" /> Generate
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-slate-500">Select questions to import provided by AI.</p>
                            <span className="text-sm font-medium text-indigo-600">{selectedIndices.size} selected</span>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                             {generatedQuestions.map((q, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedIndices.has(idx) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
                                    onClick={() => handleToggleSelect(idx)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 ${selectedIndices.has(idx) ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {selectedIndices.has(idx) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 text-sm">{q.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 lines-clamp-2">{q.content}</p>
                                            <div className="mt-2 space-y-1">
                                                {q.answers.map((a, aidx) => (
                                                     <div key={aidx} className={`text-xs flex gap-1 ${a.isCorrect ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                                                        <span>{a.isCorrect ? '✓' : '•'}</span>
                                                        <span>{a.answerText}</span>
                                                     </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsReviewing(false)}>Back</Button>
                            <Button onClick={handleImportQuestions} isLoading={generating}>
                                Import {selectedIndices.size} Questions
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <DeleteConfirmModal
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                onConfirm={confirmDelete}
                title={deleteConfirm.title}
            />
        </div>
    );
};

export default QuestionBankDetail;
