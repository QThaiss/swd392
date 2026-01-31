import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
    ArrowLeft, Clock, FileText, CheckCircle2, 
    XCircle, Loader2, ChevronDown, ChevronUp,
    User, Calendar, BarChart3
} from 'lucide-react';

const ExamPreview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedQuestions, setExpandedQuestions] = useState({});

    useEffect(() => {
        fetchExamData();
    }, [id]);

    const fetchExamData = async () => {
        try {
            setLoading(true);
            const [examRes, questionsRes] = await Promise.all([
                examApi.getById(id),
                examApi.getQuestions(id)
            ]);

            if (examRes.success) {
                setExam(examRes.data);
            }

            if (questionsRes.success) {
                let data = questionsRes.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setQuestions(data);
            }
        } catch (err) {
            setError('Failed to load exam preview');
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (questionId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const getDifficultyBadge = (difficulty) => {
        const styles = {
            EASY: 'bg-emerald-100 text-emerald-700',
            MEDIUM: 'bg-amber-100 text-amber-700',
            HARD: 'bg-red-100 text-red-700',
        };
        return styles[difficulty] || 'bg-slate-100 text-slate-600';
    };

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Published' },
            DRAFT: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
            COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
        };
        return styles[status] || styles.DRAFT;
    };

    const getDifficultyStats = () => {
        const stats = { EASY: 0, MEDIUM: 0, HARD: 0 };
        questions.forEach(q => {
            if (stats.hasOwnProperty(q.difficulty)) {
                stats[q.difficulty]++;
            }
        });
        return stats;
    };

    const getTotalPoints = () => {
        return questions.reduce((sum, q) => sum + (q.points || 1), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <p className="text-slate-600">{error || 'Exam not found'}</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/exams')}>
                    Back to Exams
                </Button>
            </div>
        );
    }

    const status = getStatusBadge(exam.status);
    const stats = getDifficultyStats();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/exams')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                        </span>
                    </div>
                    <p className="text-slate-500">Exam Preview</p>
                </div>
                <Button onClick={() => navigate(`/exams/${id}/edit`)}>
                    Edit Exam
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white">
                    <CardContent className="p-4 text-center">
                        <FileText className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                        <p className="text-sm text-slate-600">Questions</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{getTotalPoints()}</p>
                        <p className="text-sm text-slate-600">Total Points</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{exam.durationMinutes}</p>
                        <p className="text-sm text-slate-600">Minutes</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{exam.passThreshold}%</p>
                        <p className="text-sm text-slate-600">Pass Threshold</p>
                    </CardContent>
                </Card>
            </div>

            {/* Exam Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Exam Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Grade Level</p>
                            <p className="font-medium text-slate-900">Grade {exam.gradeLevel}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Max Attempts</p>
                            <p className="font-medium text-slate-900">{exam.maxAttempts || 1}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Created By</p>
                            <p className="font-medium text-slate-900 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {exam.teacherName || 'Unknown'}
                            </p>
                        </div>
                        {exam.startDate && (
                            <div>
                                <p className="text-slate-500">Start Date</p>
                                <p className="font-medium text-slate-900 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(exam.startDate).toLocaleString()}
                                </p>
                            </div>
                        )}
                        {exam.endDate && (
                            <div>
                                <p className="text-slate-500">End Date</p>
                                <p className="font-medium text-slate-900 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(exam.endDate).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {exam.description && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-slate-500 text-sm">Description</p>
                            <p className="text-slate-700 mt-1">{exam.description}</p>
                        </div>
                    )}

                    {/* Options */}
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-slate-500 text-sm mb-2">Exam Options</p>
                        <div className="flex flex-wrap gap-2">
                            {exam.showResultsImmediately && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    Show results immediately
                                </span>
                            )}
                            {exam.showCorrectAnswers && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    Show correct answers
                                </span>
                            )}
                            {exam.randomizeQuestions && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    Randomize questions
                                </span>
                            )}
                            {exam.randomizeAnswers && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    Randomize answers
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Difficulty Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-20">Easy</span>
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all" 
                                    style={{ width: `${questions.length > 0 ? (stats.EASY / questions.length) * 100 : 0}%` }} 
                                />
                            </div>
                            <span className="text-sm text-slate-600 w-20 text-right">
                                {stats.EASY} ({questions.length > 0 ? Math.round((stats.EASY / questions.length) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-20">Medium</span>
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-amber-500 rounded-full transition-all" 
                                    style={{ width: `${questions.length > 0 ? (stats.MEDIUM / questions.length) * 100 : 0}%` }} 
                                />
                            </div>
                            <span className="text-sm text-slate-600 w-20 text-right">
                                {stats.MEDIUM} ({questions.length > 0 ? Math.round((stats.MEDIUM / questions.length) * 100) : 0}%)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-20">Hard</span>
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-red-500 rounded-full transition-all" 
                                    style={{ width: `${questions.length > 0 ? (stats.HARD / questions.length) * 100 : 0}%` }} 
                                />
                            </div>
                            <span className="text-sm text-slate-600 w-20 text-right">
                                {stats.HARD} ({questions.length > 0 ? Math.round((stats.HARD / questions.length) * 100) : 0}%)
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {questions.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">No questions in this exam</p>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((question, index) => (
                                <div 
                                    key={question.id} 
                                    className="border border-slate-200 rounded-lg overflow-hidden"
                                >
                                    <div 
                                        className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => toggleQuestion(question.id)}
                                    >
                                        <span className="text-sm font-mono text-slate-400 w-8">#{index + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate">{question.title}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(question.difficulty)}`}>
                                            {question.difficulty || 'N/A'}
                                        </span>
                                        <span className="text-xs text-slate-500">{question.points || 1} pts</span>
                                        {expandedQuestions[question.id] ? (
                                            <ChevronUp className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                    
                                    {expandedQuestions[question.id] && (
                                        <div className="p-4 border-t border-slate-200 bg-white">
                                            <p className="text-slate-700 mb-4">{question.content}</p>
                                            
                                            {question.answers && question.answers.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-slate-500 uppercase">Answers</p>
                                                    {question.answers.map((answer, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className={`
                                                                flex items-center gap-2 p-2 rounded-lg text-sm
                                                                ${answer.isCorrect 
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                    : 'bg-slate-50 text-slate-600'
                                                                }
                                                            `}
                                                        >
                                                            {answer.isCorrect ? (
                                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                                                            )}
                                                            <span>{answer.content}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ExamPreview;
