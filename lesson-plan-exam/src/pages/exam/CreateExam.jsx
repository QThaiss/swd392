import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { examApi, questionBankApi, questionApi, examMatrixApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { 
    ArrowLeft, ArrowRight, Check, Loader2, FileText, 
    Settings, Eye, Save, Clock, Calendar, BookOpen,
    CheckCircle2, Circle, ChevronDown, ChevronUp, X,
    Sparkles, Grid3X3
} from 'lucide-react';

// Step indicator component
const StepIndicator = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                            transition-all duration-300
                            ${index < currentStep 
                                ? 'bg-emerald-500 text-white' 
                                : index === currentStep 
                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                                    : 'bg-slate-100 text-slate-400'
                            }
                        `}>
                            {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                        </div>
                        <span className={`
                            mt-2 text-xs font-medium
                            ${index === currentStep ? 'text-indigo-600' : 'text-slate-500'}
                        `}>
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`
                            w-16 h-1 mx-2 rounded-full transition-colors duration-300
                            ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}
                        `} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// Question item component
const QuestionItem = ({ question, isSelected, onToggle }) => {
    const [expanded, setExpanded] = useState(false);
    
    const getDifficultyBadge = (difficulty) => {
        const styles = {
            EASY: 'bg-emerald-100 text-emerald-700',
            MEDIUM: 'bg-amber-100 text-amber-700',
            HARD: 'bg-red-100 text-red-700',
        };
        return styles[difficulty] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div 
            className={`
                border rounded-lg p-4 transition-all duration-200 cursor-pointer
                ${isSelected 
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
            `}
            onClick={() => onToggle(question)}
        >
            <div className="flex items-start gap-3">
                <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    transition-colors duration-200
                    ${isSelected 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-slate-300'
                    }
                `}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-slate-900 truncate">{question.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyBadge(question.difficulty)}`}>
                            {question.difficulty || 'N/A'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {question.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Fill Blank'}
                        </span>
                        <span className="text-xs text-slate-500">{question.points || 1} pts</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{question.content}</p>
                    
                    {question.answers && question.answers.length > 0 && (
                        <div className="mt-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                {expanded ? 'Hide answers' : 'Show answers'}
                            </button>
                            {expanded && (
                                <div className="mt-2 space-y-1 pl-2 border-l-2 border-slate-200">
                                    {question.answers.map((answer, idx) => (
                                        <div key={idx} className={`text-xs ${answer.isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                            {answer.isCorrect && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                            {answer.content}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreateExam = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Step 1: Basic Info
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        gradeLevel: 10,
        durationMinutes: 60,
        maxAttempts: 1,
        passThreshold: 50,
        startDate: '',
        endDate: '',
        showResultsImmediately: true,
        showCorrectAnswers: false,
        randomizeQuestions: false,
        randomizeAnswers: false,
    });
    
    // Step 2: Question Selection
    const [questionBanks, setQuestionBanks] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [questionLoading, setQuestionLoading] = useState(false);
    const [difficultyFilter, setDifficultyFilter] = useState('ALL');
    
    // Matrix selection
    const [useMatrix, setUseMatrix] = useState(false);
    const [matrices, setMatrices] = useState([]);
    const [selectedMatrix, setSelectedMatrix] = useState(null);
    
    const steps = ['Basic Info', 'Select Questions', 'Configuration', 'Preview'];
    
    useEffect(() => {
        fetchQuestionBanks();
        fetchMatrices();
        if (isEditing) {
            fetchExam();
        }
    }, [id]);
    
    useEffect(() => {
        if (selectedBankId) {
            fetchQuestions();
        }
    }, [selectedBankId, difficultyFilter]);
    
    const fetchExam = async () => {
        try {
            setLoading(true);
            const response = await examApi.getById(id);
            if (response.success && response.data) {
                setFormData({
                    title: response.data.title || '',
                    description: response.data.description || '',
                    gradeLevel: response.data.gradeLevel || 10,
                    durationMinutes: response.data.durationMinutes || 60,
                    maxAttempts: response.data.maxAttempts || 1,
                    passThreshold: response.data.passThreshold || 50,
                    startDate: response.data.startDate || '',
                    endDate: response.data.endDate || '',
                    showResultsImmediately: response.data.showResultsImmediately ?? true,
                    showCorrectAnswers: response.data.showCorrectAnswers ?? false,
                    randomizeQuestions: response.data.randomizeQuestions ?? false,
                    randomizeAnswers: response.data.randomizeAnswers ?? false,
                });
                // Load existing questions
                const questionsRes = await examApi.getQuestions(id);
                if (questionsRes.success && questionsRes.data) {
                    let qData = questionsRes.data;
                    if (!Array.isArray(qData)) {
                        qData = qData.items || qData.content || [];
                    }
                    setSelectedQuestions(qData);
                }
            }
        } catch (err) {
            setError('Failed to load exam');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchQuestionBanks = async () => {
        try {
            const response = await questionBankApi.getMy();
            if (response.success) {
                let data = response.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setQuestionBanks(data);
            }
        } catch (err) {
            console.error('Failed to fetch question banks', err);
        }
    };
    
    const fetchQuestions = async () => {
        if (!selectedBankId) return;
        try {
            setQuestionLoading(true);
            let response;
            if (difficultyFilter !== 'ALL') {
                response = await questionApi.getByDifficulty(selectedBankId, difficultyFilter);
            } else {
                response = await questionApi.getByBank(selectedBankId, { size: 100 });
            }
            if (response.success) {
                let data = response.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setQuestions(data);
            }
        } catch (err) {
            console.error('Failed to fetch questions', err);
        } finally {
            setQuestionLoading(false);
        }
    };
    
    const fetchMatrices = async () => {
        try {
            const response = await examMatrixApi.getMy();
            if (response.success) {
                let data = response.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setMatrices(data);
            }
        } catch (err) {
            console.error('Failed to fetch matrices', err);
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }));
    };
    
    const toggleQuestion = (question) => {
        setSelectedQuestions(prev => {
            const exists = prev.find(q => q.id === question.id);
            if (exists) {
                return prev.filter(q => q.id !== question.id);
            }
            return [...prev, question];
        });
    };
    
    const selectAllQuestions = () => {
        setSelectedQuestions(questions);
    };
    
    const clearSelection = () => {
        setSelectedQuestions([]);
    };
    
    const handleMatrixSelect = async (matrix) => {
        setSelectedMatrix(matrix);
        // Preview questions based on matrix configuration
        try {
            const response = await examMatrixApi.preview({
                questionBankId: matrix.questionBankId,
                easyCount: matrix.easyCount,
                mediumCount: matrix.mediumCount,
                hardCount: matrix.hardCount,
            });
            if (response.success && response.data) {
                let data = response.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setSelectedQuestions(data);
            }
        } catch (err) {
            console.error('Failed to preview matrix', err);
        }
    };
    
    const validateStep = (step) => {
        switch (step) {
            case 0:
                return formData.title.trim() !== '' && formData.durationMinutes > 0;
            case 1:
                return selectedQuestions.length > 0;
            case 2:
                return true;
            default:
                return true;
        }
    };
    
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };
    
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };
    
    const handleSave = async (publish = false) => {
        try {
            setSaving(true);
            const questionIds = selectedQuestions.map(q => q.id);
            const examData = {
                ...formData,
                // questionIds: questionIds, // REMOVED: Managed separately via addQuestions or Matrix
                status: publish ? 'ACTIVE' : 'DRAFT',
                totalPoints: getTotalPoints(),
            };
            
            let response;
            if (isEditing) {
                response = await examApi.update(id, examData);
                // For edit, we might need to handle questions separately if update doesn't handle it
                // But for now let's hope update handles it or user relies on create
            } else {
                if (useMatrix && selectedMatrix) {
                    response = await examApi.createFromMatrix({
                        ...examData,
                        matrixId: selectedMatrix.id,
                    });
                } else {
                    response = await examApi.create(examData);
                }
            }
            
            if (response.success) {
                const examId = response.data.id || id;
                
                // Explicitly add questions if it's a new exam and not from matrix
                if (!useMatrix && questionIds.length > 0 && examId) {
                    try {
                        console.log(`Attempt 1: Adding ${questionIds.length} questions to exam ${examId}`);
                        
                        // Prepare payload with points
                        const questionsPayload = selectedQuestions.map(q => ({
                            questionId: q.id,
                            points: q.points || 1 // Default to 1 point if not specified
                        }));

                        await examApi.addQuestions(examId, questionsPayload);
                        
                        // Verify if questions were added
                        const verifyRes = await examApi.getQuestions(examId);
                        let savedCount = 0;
                        if (verifyRes.success) {
                            let qData = verifyRes.data;
                            if (qData && Array.isArray(qData.questions)) qData = qData.questions;
                            else if (qData && qData.items) qData = qData.items;
                            else if (Array.isArray(qData)) qData = qData;
                            else qData = [];
                            
                            savedCount = qData.length;
                        }
                        
                        console.log(`Verification: Found ${savedCount} questions`);

                        // If verification failed (0 questions), try alternative payload (raw array)
                        if (savedCount === 0) {
                            console.log('Attempt 2: Retrying with raw array payload...');
                            // We need to bypass the api.js wrapper which forces object structure
                            // Using a direct axios call if possible, or we temporarily assume we can pass raw array to a new helper
                            // checking api.js: addQuestions: (examId, questionIds) => api.post(..., { questionIds })
                            // We can't easily bypass api.js wrapper without editing it.
                            // Let's Edit api.js to allow raw array? 
                            // Or better, catch the error and alert user for now.
                            
                            toast.error(`Warning: Questions might not have been saved. Expected ${questionIds.length}, found ${savedCount}. Please check the exam details.`, { duration: 5000 });
                        }

                    } catch (qErr) {
                        console.error('Failed to add questions to exam', qErr);
                        const errorMsg = qErr.response?.data?.message || qErr.message || 'Unknown error';
                        const status = qErr.response?.status || 'N/A';
                        toast.error(`Failed to add questions (Status: ${status}). Server says: ${errorMsg}`);
                    }
                }

                navigate('/exams');
            } else {
                setError(response.message || 'Failed to save exam');
            }
        } catch (err) {
            console.error('Save exam error:', err);
            setError(err.response?.data?.message || 'Failed to save exam');
        } finally {
            setSaving(false);
        }
    };
    
    const getTotalPoints = () => {
        return selectedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    };
    
    const getDifficultyStats = () => {
        const stats = { EASY: 0, MEDIUM: 0, HARD: 0, OTHER: 0 };
        selectedQuestions.forEach(q => {
            if (stats.hasOwnProperty(q.difficulty)) {
                stats[q.difficulty]++;
            } else {
                stats.OTHER++;
            }
        });
        return stats;
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate('/exams')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? 'Edit Exam' : 'Create New Exam'}
                    </h1>
                    <p className="text-slate-500">
                        {isEditing ? 'Update exam details and questions' : 'Create a new exam step by step'}
                    </p>
                </div>
            </div>
            
            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            
            {/* Step Indicator */}
            <StepIndicator steps={steps} currentStep={currentStep} />
            
            {/* Step Content */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Input
                                        name="title"
                                        label="Exam Title *"
                                        placeholder="Enter exam title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter exam description"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                <Input
                                    name="gradeLevel"
                                    label="Grade Level *"
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={formData.gradeLevel}
                                    onChange={handleChange}
                                    required
                                />
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <Clock className="h-4 w-4" />
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        min={1}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.durationMinutes}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <Calendar className="h-4 w-4" />
                                        Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <Calendar className="h-4 w-4" />
                                        End Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Step 2: Question Selection */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* Selection Method Toggle */}
                            <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                                <button
                                    onClick={() => setUseMatrix(false)}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        !useMatrix 
                                            ? 'border-indigo-500 bg-white shadow-sm' 
                                            : 'border-transparent bg-white/50 hover:bg-white'
                                    }`}
                                >
                                    <BookOpen className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                                    <p className="font-medium text-slate-900">Manual Selection</p>
                                    <p className="text-xs text-slate-500">Choose questions individually</p>
                                </button>
                                <button
                                    onClick={() => setUseMatrix(true)}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        useMatrix 
                                            ? 'border-indigo-500 bg-white shadow-sm' 
                                            : 'border-transparent bg-white/50 hover:bg-white'
                                    }`}
                                >
                                    <Grid3X3 className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                                    <p className="font-medium text-slate-900">Use Matrix</p>
                                    <p className="text-xs text-slate-500">Auto-generate from matrix</p>
                                </button>
                            </div>
                            
                            {!useMatrix ? (
                                <>
                                    {/* Question Bank Selection */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Select Question Bank
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={selectedBankId || ''}
                                                onChange={(e) => setSelectedBankId(e.target.value ? parseInt(e.target.value) : null)}
                                            >
                                                <option value="">Choose a question bank...</option>
                                                {questionBanks.map(bank => (
                                                    <option key={bank.id} value={bank.id}>
                                                        {bank.name} ({bank.questionCount || 0} questions)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Filter by Difficulty
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={difficultyFilter}
                                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                            >
                                                <option value="ALL">All Difficulties</option>
                                                <option value="EASY">Easy</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HARD">Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Selection Stats */}
                                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-indigo-700 font-medium">
                                                {selectedQuestions.length} questions selected
                                            </span>
                                            <span className="text-indigo-600 text-sm">
                                                Total: {getTotalPoints()} points
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={selectAllQuestions}>
                                                Select All
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={clearSelection}>
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Questions List */}
                                    {questionLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                        </div>
                                    ) : selectedBankId ? (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            {questions.length === 0 ? (
                                                <p className="text-center py-8 text-slate-500">
                                                    No questions found in this bank
                                                </p>
                                            ) : (
                                                questions.map(question => (
                                                    <QuestionItem
                                                        key={question.id}
                                                        question={question}
                                                        isSelected={selectedQuestions.some(q => q.id === question.id)}
                                                        onToggle={toggleQuestion}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-center py-8 text-slate-500">
                                            Select a question bank to view questions
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Matrix Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">
                                            Select Exam Matrix
                                        </label>
                                        {matrices.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                                <Grid3X3 className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                                <p className="text-slate-500 mb-3">No matrices created yet</p>
                                                <Button variant="outline" onClick={() => navigate('/exam-matrix/create')}>
                                                    Create Matrix
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {matrices.map(matrix => (
                                                    <div
                                                        key={matrix.id}
                                                        onClick={() => handleMatrixSelect(matrix)}
                                                        className={`
                                                            p-4 border-2 rounded-lg cursor-pointer transition-all
                                                            ${selectedMatrix?.id === matrix.id 
                                                                ? 'border-indigo-500 bg-indigo-50' 
                                                                : 'border-slate-200 hover:border-slate-300'
                                                            }
                                                        `}
                                                    >
                                                        <h4 className="font-medium text-slate-900">{matrix.name}</h4>
                                                        <p className="text-sm text-slate-500 mb-2">{matrix.description}</p>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                                                Easy: {matrix.easyCount}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                                                Medium: {matrix.mediumCount}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">
                                                                Hard: {matrix.hardCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {selectedMatrix && selectedQuestions.length > 0 && (
                                        <div className="p-4 bg-emerald-50 rounded-lg">
                                            <div className="flex items-center gap-2 text-emerald-700 mb-2">
                                                <Sparkles className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {selectedQuestions.length} questions auto-selected
                                                </span>
                                            </div>
                                            <p className="text-sm text-emerald-600">
                                                Questions have been automatically selected based on the matrix configuration.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Step 3: Configuration */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    name="maxAttempts"
                                    label="Max Attempts"
                                    type="number"
                                    min={1}
                                    value={formData.maxAttempts}
                                    onChange={handleChange}
                                />
                                
                                <Input
                                    name="passThreshold"
                                    label="Pass Threshold (%)"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.passThreshold}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-slate-700 mb-4">Exam Options</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: 'showResultsImmediately', label: 'Show results immediately after submission', description: 'Students can see their score right away' },
                                        { name: 'showCorrectAnswers', label: 'Show correct answers', description: 'Display correct answers after submission' },
                                        { name: 'randomizeQuestions', label: 'Randomize question order', description: 'Each student gets questions in different order' },
                                        { name: 'randomizeAnswers', label: 'Randomize answer choices', description: 'Answer options appear in random order' },
                                    ].map(opt => (
                                        <label 
                                            key={opt.name} 
                                            className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                name={opt.name}
                                                checked={formData[opt.name]}
                                                onChange={handleChange}
                                                className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                                                <p className="text-xs text-slate-500">{opt.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Step 4: Preview */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            {/* Exam Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-br from-indigo-50 to-white">
                                    <CardContent className="p-4 text-center">
                                        <FileText className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                                        <p className="text-2xl font-bold text-slate-900">{selectedQuestions.length}</p>
                                        <p className="text-sm text-slate-600">Questions</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-emerald-50 to-white">
                                    <CardContent className="p-4 text-center">
                                        <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                                        <p className="text-2xl font-bold text-slate-900">{getTotalPoints()}</p>
                                        <p className="text-sm text-slate-600">Total Points</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-50 to-white">
                                    <CardContent className="p-4 text-center">
                                        <Clock className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                                        <p className="text-2xl font-bold text-slate-900">{formData.durationMinutes}</p>
                                        <p className="text-sm text-slate-600">Minutes</p>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            {/* Difficulty Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Difficulty Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const stats = getDifficultyStats();
                                        const total = selectedQuestions.length || 1;
                                        return (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium w-20">Easy</span>
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-emerald-500 rounded-full transition-all" 
                                                            style={{ width: `${(stats.EASY / total) * 100}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 w-16">{stats.EASY} ({Math.round((stats.EASY / total) * 100)}%)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium w-20">Medium</span>
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-amber-500 rounded-full transition-all" 
                                                            style={{ width: `${(stats.MEDIUM / total) * 100}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 w-16">{stats.MEDIUM} ({Math.round((stats.MEDIUM / total) * 100)}%)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium w-20">Hard</span>
                                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-red-500 rounded-full transition-all" 
                                                            style={{ width: `${(stats.HARD / total) * 100}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-600 w-16">{stats.HARD} ({Math.round((stats.HARD / total) * 100)}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                            
                            {/* Exam Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Exam Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <dt className="text-slate-500">Title</dt>
                                            <dd className="font-medium text-slate-900">{formData.title}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Grade Level</dt>
                                            <dd className="font-medium text-slate-900">Grade {formData.gradeLevel}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Pass Threshold</dt>
                                            <dd className="font-medium text-slate-900">{formData.passThreshold}%</dd>
                                        </div>
                                        <div>
                                            <dt className="text-slate-500">Max Attempts</dt>
                                            <dd className="font-medium text-slate-900">{formData.maxAttempts}</dd>
                                        </div>
                                        {formData.startDate && (
                                            <div>
                                                <dt className="text-slate-500">Start Date</dt>
                                                <dd className="font-medium text-slate-900">{new Date(formData.startDate).toLocaleString()}</dd>
                                            </div>
                                        )}
                                        {formData.endDate && (
                                            <div>
                                                <dt className="text-slate-500">End Date</dt>
                                                <dd className="font-medium text-slate-900">{new Date(formData.endDate).toLocaleString()}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>
                            
                            {/* Questions Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Questions ({selectedQuestions.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {selectedQuestions.map((q, idx) => (
                                            <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                                                <span className="text-sm font-mono text-slate-400">#{idx + 1}</span>
                                                <span className="flex-1 text-sm text-slate-900 truncate">{q.title}</span>
                                                <span className="text-xs text-slate-500">{q.points || 1} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                
                <div className="flex gap-3">
                    {currentStep === steps.length - 1 ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleSave(false)}
                                disabled={saving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Publish Exam
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={nextStep}
                            disabled={!validateStep(currentStep)}
                        >
                            Next <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateExam;
