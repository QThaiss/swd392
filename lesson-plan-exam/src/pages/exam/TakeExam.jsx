import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Flag, Loader2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Ref to prevent double API calls in React StrictMode
    const startedRef = useRef(false);
    
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [confirmModal, setConfirmModal] = useState({ open: false, message: '' });

    // Fetch exam data
    useEffect(() => {
        // Prevent double call in React StrictMode
        if (startedRef.current) return;
        startedRef.current = true;
        
        const fetchExam = async () => {
            try {
                setLoading(true);
                
                // First, fetch exam details
                const examRes = await examApi.getById(id);
                console.log('Exam details:', examRes);
                
                if (examRes.success) {
                    setExam(examRes.data);
                }
                
                // 1. Try to start exam session
                const startResponse = await examApi.start(id);
                console.log('Start response:', startResponse);
                
                if (!startResponse.success) {
                    // Check if it's "Max attempts reached" or similar
                    const errorMsg = startResponse.message || '';
                    if (errorMsg.toLowerCase().includes('max attempts') || 
                        errorMsg.toLowerCase().includes('đã làm') ||
                        startResponse.statusCode === 403) {
                        setError('You have completed all attempts for this exam. (Max attempts reached)');
                        return;
                    }
                    throw new Error(errorMsg || 'Failed to start exam');
                }
                
                const attempt = startResponse.data;
                
                // 2. Fetch questions
                const questionsRes = await examApi.getQuestions(id);
                console.log('Questions details:', questionsRes);

                if (examRes.success) {
                    const durationSeconds = (examRes.data.durationMinutes || 60) * 60;
                    
                    if (attempt.startedAt) {
                        const startTime = new Date(attempt.startedAt).getTime();
                        const now = new Date().getTime();
                        const elapsedSeconds = Math.floor((now - startTime) / 1000);
                        const remaining = Math.max(0, durationSeconds - elapsedSeconds);
                        setTimeLeft(remaining);
                    } else {
                        setTimeLeft(durationSeconds);
                    }
                }

                if (questionsRes.success) {
                    let qData = questionsRes.data;
                    
                    // Handle wrapped response { questions: [...] }
                    if (qData && Array.isArray(qData.questions)) {
                        qData = qData.questions;
                    } else if (!Array.isArray(qData)) {
                        qData = qData.items || qData.content || [];
                    }
                    
                    setQuestions(qData);
                } else {
                    console.warn('Questions API failed, checking start response fallback');
                }

            } catch (err) {
                console.error('Load exam error:', err);
                const errorMsg = err.response?.data?.message || err.message || 'Failed to load exam';
                
                // Handle 403 error specially
                if (err.response?.status === 403) {
                    if (errorMsg.toLowerCase().includes('max attempts')) {
                        setError('You have completed all attempts for this exam.');
                    } else {
                        setError('You do not have permission to access this exam. ' + errorMsg);
                    }
                } else {
                    setError(errorMsg);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0 || submitted) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        if (submitting) return;
        
        const unanswered = questions.filter(q => {
            const qId = q.question?.id || q.id;
            return !answers[qId];
        }).length;
        if (unanswered > 0) {
            setConfirmModal({
                open: true,
                message: `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
            });
            return;
        }
        executeSubmit();
    };

    const executeSubmit = async () => {

        try {
            setSubmitting(true);
            
            // Transform answers object to array format expected by backend
            // Backend expects: { answers: [{ questionId, selectedAnswerId }, ...] }
            const answersArray = Object.entries(answers).map(([questionId, selectedAnswerId]) => ({
                questionId: parseInt(questionId),
                selectedAnswerId: parseInt(selectedAnswerId)
            }));
            
            console.log('Submitting exam with answers:', answersArray);
            
            const response = await examApi.submit(id, { answers: answersArray });
            if (response.success) {
                setSubmitted(true);
                setResult(response.data);
            } else {
                setError(response.message || 'Failed to submit exam');
            }
        } catch (err) {
            console.error('Submit error:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to submit exam');
        } finally {
            setSubmitting(false);
            setConfirmModal({ open: false, message: '' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h2 className="text-xl font-semibold text-slate-900">Error Loading Exam</h2>
                <p className="text-slate-500">{error}</p>
                <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
            </div>
        );
    }

    if (submitted && result) {
        // Calculate display values from backend response
        const scorePercent = result.scorePercentage ?? result.score ?? 0;
        const totalScorePoints = result.totalScore ?? 0;
        const maxScorePoints = result.maxScore ?? exam?.totalPoints ?? questions.length;
        const passThreshold = exam?.passThreshold ?? 50;
        const passed = scorePercent >= passThreshold;
        // Use backend values if available, otherwise calculate
        const totalQs = result.totalQuestions ?? questions.length;
        const correctCount = result.correctCount ?? result.correct ?? Math.round((scorePercent / 100) * totalQs);
        const incorrectCount = result.incorrectCount ?? (totalQs - correctCount);

        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card className="text-center">
                    <CardContent className="py-12">
                        <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Exam Submitted!</h1>
                        <p className="text-slate-500 mb-8">Your answers have been recorded successfully.</p>
                        
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-8">
                            <p className="text-sm text-indigo-600 font-medium mb-2">Your Score</p>
                            <p className="text-5xl font-bold text-indigo-700">
                                {typeof scorePercent === 'number' ? scorePercent.toFixed(1) : scorePercent}%
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                ({totalScorePoints} / {maxScorePoints} points)
                            </p>
                            <p className={`mt-2 font-medium ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                                {passed ? '✓ Passed!' : '✗ Not Passed'}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-slate-50">
                                <p className="text-xs text-slate-500">Total Questions</p>
                                <p className="text-2xl font-bold text-slate-900">{totalQs}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50">
                                <p className="text-xs text-emerald-600">Correct</p>
                                <p className="text-2xl font-bold text-emerald-700">{correctCount}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-red-50">
                                <p className="text-xs text-red-600">Incorrect</p>
                                <p className="text-2xl font-bold text-red-700">{incorrectCount}</p>
                            </div>
                        </div>

                        <Button onClick={() => navigate('/exams')} size="lg">
                            Back to Exams
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    // Handle case where question details are nested (e.g. { question: {...}, points: 5 })
    const questionDisplay = currentQuestion?.question || currentQuestion;

    // Debug log for the first question to check structure
    if (currentIndex === 0) {
        console.log('Current Question Data:', currentQuestion);
        console.log('Display Object:', questionDisplay);
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 overflow-auto">
            {/* Timer Header - Fixed at top */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">{exam?.title || 'Exam'}</h1>
                        <p className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                        timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Content - with top padding for fixed header */}
            <div className="pt-20 pb-6 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                {/* Question Panel */}
                <div className="col-span-9">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Question {currentIndex + 1}</CardTitle>
                            <Button
                                variant={flagged.has(questionDisplay?.id) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleFlag(questionDisplay?.id)}
                            >
                                <Flag className={`h-4 w-4 mr-1 ${flagged.has(questionDisplay?.id) ? 'fill-current' : ''}`} />
                                {flagged.has(questionDisplay?.id) ? 'Flagged' : 'Flag'}
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Question Text */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-lg text-slate-900 whitespace-pre-wrap">
                                    {questionDisplay?.content || questionDisplay?.questionText || questionDisplay?.title || 'Question text not available'}
                                </p>
                                {/* Debug info if content missing */}
                                {(!questionDisplay?.content && !questionDisplay?.questionText && !questionDisplay?.title) && (
                                    <p className="text-xs text-red-400 mt-2">
                                        Debug info: Keys={Object.keys(questionDisplay || {}).join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {(questionDisplay?.options || questionDisplay?.answers || []).map((option, idx) => {
                                    const optionId = option.id || idx;
                                    // Handle different possible text properties from backend
                                    const optionText = typeof option === 'string' 
                                        ? option 
                                        : (option.answerText || option.content || option.text || `Option ${idx + 1}`);
                                    const isSelected = answers[questionDisplay?.id] === optionId;
                                    
                                    return (
                                        <button
                                            key={optionId}
                                            onClick={() => handleAnswer(questionDisplay?.id, optionId)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="flex-1">{optionText}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                
                                {currentIndex === questions.length - 1 ? (
                                    <Button onClick={handleSubmit} isLoading={submitting}>
                                        Submit Exam
                                    </Button>
                                ) : (
                                    <Button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}>
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Navigator */}
                <div className="col-span-3">
                    <Card className="sticky top-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Question Navigator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const qId = q.question?.id || q.id;
                                    const isAnswered = answers[qId] !== undefined;
                                    const isFlagged = flagged.has(qId);
                                    const isCurrent = idx === currentIndex;
                                    
                                    return (
                                        <button
                                            key={q.id || idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all relative ${
                                                isCurrent
                                                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                                    : isAnswered
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {idx + 1}
                                            {isFlagged && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-emerald-100" />
                                    <span className="text-slate-500">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-slate-100" />
                                    <span className="text-slate-500">Unanswered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded bg-slate-100 relative">
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
                                    </span>
                                    <span className="text-slate-500">Flagged</span>
                                </div>
                            </div>
                            
                            {/* Summary */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500">
                                    Answered: <span className="font-semibold text-slate-900">{Object.keys(answers).length}</span> / {questions.length}
                                </p>
                            </div>

                            <Button 
                                className="w-full mt-4" 
                                onClick={handleSubmit}
                                isLoading={submitting}
                            >
                                Submit Exam
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>

            
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                title="Confirm Submission"
            >
                <div className="text-center py-4">
                     <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-slate-600 mb-6">{confirmModal.message}</p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>Cancel</Button>
                        <Button onClick={executeSubmit} isLoading={submitting}>Submit Exam</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TakeExam;
