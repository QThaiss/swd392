import React, { useState, useEffect } from 'react';
import { questionApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const QuestionForm = ({ initialData, questionBankId, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        questionType: 'MULTIPLE_CHOICE',
        questionBankId: questionBankId,
        questionDifficultyId: null,
        answers: [
            { answerText: '', isCorrect: false },
            { answerText: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                content: initialData.content || '',
                questionType: initialData.questionType || 'MULTIPLE_CHOICE',
                questionBankId: initialData.questionBankId || questionBankId,
                questionDifficultyId: initialData.questionDifficultyId || null,
                answers: initialData.answers?.map(a => ({
                    id: a.id,
                    answerText: a.answerText || '',
                    isCorrect: a.isCorrect || false
                })) || []
            });
        }
    }, [initialData, questionBankId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAnswerChange = (index, field, value) => {
        const newAnswers = [...formData.answers];
        newAnswers[index][field] = value;
        setFormData(prev => ({ ...prev, answers: newAnswers }));
    };

    const handleSetCorrect = (index) => {
        const newAnswers = formData.answers.map((ans, i) => ({
            ...ans,
            isCorrect: i === index // Only one correct answer for now for simplicity, can extend to multiple
        }));
        setFormData(prev => ({ ...prev, answers: newAnswers }));
    };

    const addAnswer = () => {
        setFormData(prev => ({
            ...prev,
            answers: [...prev.answers, { answerText: '', isCorrect: false }]
        }));
    };

    const removeAnswer = (index) => {
        setFormData(prev => ({
            ...prev,
            answers: prev.answers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                answers: formData.answers.map(({ id, answerText, isCorrect }) => ({ answerText, isCorrect })) // Sanitize
            };

            if (initialData?.id) {
                await questionApi.update(initialData.id, payload);
            } else {
                await questionApi.create(payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g., Question 1"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select 
                        name="questionType" 
                        value={formData.questionType} 
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="FILL_BLANK">Fill in the Blank</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Question Content</label>
                <textarea 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange} 
                    required 
                    rows={3}
                    className="w-full p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Answers</label>
                    <Button type="button" variant="ghost" size="sm" onClick={addAnswer} className="text-indigo-600">
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {formData.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => handleSetCorrect(index)}
                                className={`flex-shrink-0 ${answer.isCorrect ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                            >
                                {answer.isCorrect ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>
                            <Input 
                                value={answer.answerText} 
                                onChange={(e) => handleAnswerChange(index, 'answerText', e.target.value)} 
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                                required
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeAnswer(index)}
                                disabled={formData.answers.length <= 2}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={loading}>
                    {initialData ? 'Update Question' : 'Create Question'}
                </Button>
            </div>
        </form>
    );
};

export default QuestionForm;
