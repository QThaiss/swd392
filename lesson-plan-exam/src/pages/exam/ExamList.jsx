import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, Edit, Trash2, Play, Pause, Loader2, X, AlertCircle, PlayCircle, Eye, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Exam Form Component
const ExamForm = ({ exam, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        title: exam?.title || '',
        description: exam?.description || '',
        gradeLevel: exam?.gradeLevel || 10,
        durationMinutes: exam?.durationMinutes || 60,
        maxAttempts: exam?.maxAttempts || 1,
        passThreshold: exam?.passThreshold || 50,
        showResultsImmediately: exam?.showResultsImmediately ?? true,
        showCorrectAnswers: exam?.showCorrectAnswers ?? false,
        randomizeQuestions: exam?.randomizeQuestions ?? false,
        randomizeAnswers: exam?.randomizeAnswers ?? false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Input
                        name="title"
                        label="Title *"
                        placeholder="Enter exam title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
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
                <Input
                    name="durationMinutes"
                    label="Duration (minutes) *"
                    type="number"
                    min={1}
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    required
                />
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
                <p className="text-sm font-medium text-slate-700 mb-3">Options</p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { name: 'showResultsImmediately', label: 'Show results immediately' },
                        { name: 'showCorrectAnswers', label: 'Show correct answers' },
                        { name: 'randomizeQuestions', label: 'Randomize questions' },
                        { name: 'randomizeAnswers', label: 'Randomize answers' },
                    ].map(opt => (
                        <label key={opt.name} className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                name={opt.name}
                                checked={formData[opt.name]}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>
                    {exam ? 'Update Exam' : 'Create Exam'}
                </Button>
            </div>
        </form>
    );
};

// Delete Confirmation Modal
const DeleteConfirm = ({ isOpen, onClose, onConfirm, isLoading, examTitle }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Exam">
        <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-slate-600 mb-2">Are you sure you want to delete</p>
            <p className="font-semibold text-slate-900 mb-6">"{examTitle}"?</p>
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>Delete</Button>
            </div>
        </div>
    </Modal>
);

// Exam Attempt History Modal
const ExamAttemptHistory = ({ isOpen, onClose, examId, examTitle, passThreshold }) => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && examId) {
            fetchAttempts();
        }
    }, [isOpen, examId]);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await examApi.getMyAttempts(examId);
            if (response.success) {
                setAttempts(response.data || []);
            } else {
                setError(response.message || 'Failed to load attempts');
            }
        } catch (err) {
            console.error('Error fetching attempts:', err);
            setError(err.response?.data?.message || 'Failed to load attempt history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Attempt History - ${examTitle}`}>
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : attempts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500">Bạn chưa làm bài thi này.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attempts.map((attempt, index) => {
                            const score = attempt.scorePercentage ?? attempt.score ?? 0;
                            const passed = score >= (passThreshold || 50);
                            const isCompleted = attempt.status === 'COMPLETED';
                            
                            return (
                                <div
                                    key={attempt.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        isCompleted 
                                            ? (passed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')
                                            : 'border-yellow-200 bg-yellow-50'
                                    }`}
                                >
                                    {/* Header with attempt number and status */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-slate-800">
                                            Lần {attempt.attemptNumber || (attempts.length - index)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt.status)}`}>
                                            {attempt.status === 'COMPLETED' ? 'Đã nộp' : attempt.status === 'IN_PROGRESS' ? 'Đang làm' : attempt.status}
                                        </span>
                                    </div>

                                    {/* Score display - always show for completed attempts */}
                                    {isCompleted && (
                                        <div className="flex items-center gap-4 mb-3 p-3 rounded-lg bg-white/80">
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-slate-900">
                                                        {typeof score === 'number' ? score.toFixed(1) : score}%
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                                    }`}>
                                                        {passed ? '✓ ĐẬU' : '✗ RỚT'}
                                                    </span>
                                                </div>
                                                {attempt.totalScore !== undefined && (
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Điểm: {attempt.totalScore} / {attempt.maxScore || '?'} điểm
                                                    </p>
                                                )}
                                                {(attempt.correctCount !== undefined || attempt.incorrectCount !== undefined) && (
                                                    <div className="flex gap-3 mt-1 text-sm">
                                                        <span className="text-emerald-600">✓ {attempt.correctCount || 0} đúng</span>
                                                        <span className="text-red-500">✗ {attempt.incorrectCount || 0} sai</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Time info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">Bắt đầu:</span>
                                            <p className="font-medium text-slate-700">{formatDate(attempt.startedAt)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Nộp bài:</span>
                                            <p className="font-medium text-slate-700">{formatDate(attempt.submittedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const ExamList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, exam: null });
    const [historyModal, setHistoryModal] = useState({ open: false, exam: null });

    // Show all CRUD buttons - backend enforces permissions
    const canManage = user?.role === 'TEACHER' || user?.role === 'teacher' || user?.role === 'ADMIN' || user?.role === 'admin';

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = canManage ? await examApi.getMy() : await examApi.getActive();
            if (response.success) {
                // Handle both direct array and paginated response (content property)
                let examData = response.data;
                if (examData && typeof examData === 'object' && !Array.isArray(examData)) {
                    if (Array.isArray(examData.content)) {
                        examData = examData.content;
                    } else if (Array.isArray(examData.exams)) { // Handle possible 'exams' property
                        examData = examData.exams;
                    } else if (Array.isArray(examData.items)) { // Handle 'items' property (confirmed by logs)
                        examData = examData.items;
                    }
                }
                
                if (Array.isArray(examData)) {
                    setExams(examData);
                } else {
                    console.error('API returned unexpected data format for exams:', response.data);
                    setExams([]);
                }
            }
        } catch (err) {
            setError('Failed to load exams');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleCreate = () => {
        navigate('/exams/create');
    };

    const handleEdit = (exam) => {
        navigate(`/exams/${exam.id}/edit`);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsSubmitting(true);
            if (editingExam) {
                await examApi.update(editingExam.id, formData);
            } else {
                await examApi.create(formData);
            }
            setIsFormOpen(false);
            fetchExams();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await examApi.delete(deleteConfirm.exam.id);
            setDeleteConfirm({ open: false, exam: null });
            fetchExams();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete exam');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (exam) => {
        try {
            if (exam.status === 'ACTIVE') {
                await examApi.deactivate(exam.id);
            } else {
                await examApi.activate(exam.id);
            }
            fetchExams();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredExams = Array.isArray(exams) ? exams.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-emerald-100 text-emerald-700',
            DRAFT: 'bg-slate-100 text-slate-600',
            COMPLETED: 'bg-blue-100 text-blue-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return styles[status] || styles.DRAFT;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exams</h1>
                    <p className="text-slate-500">Create and manage your examination papers.</p>
                </div>
                {canManage && (
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Exam
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>All Exams</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search exams..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No exams found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Grade</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Teacher</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredExams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">{exam.title}</td>
                                            <td className="px-4 py-3">Grade {exam.gradeLevel}</td>
                                            <td className="px-4 py-3">{exam.durationMinutes} mins</td>
                                            <td className="px-4 py-3">{exam.teacherName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(exam.status)}`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {!canManage && exam.status === 'ACTIVE' && (
                                                        <>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => navigate(`/exams/${exam.id}/take`)}
                                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                            >
                                                                <PlayCircle className="h-4 w-4 mr-1" />
                                                                Start
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setHistoryModal({ open: true, exam })}
                                                                title="View Attempt History"
                                                            >
                                                                <History className="h-4 w-4 mr-1" />
                                                                History
                                                            </Button>
                                                        </>
                                                    )}
                                                    {canManage && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleToggleStatus(exam)}
                                                                title={exam.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {exam.status === 'ACTIVE' ? (
                                                                    <Pause className="h-4 w-4 text-orange-600" />
                                                                ) : (
                                                                    <Play className="h-4 w-4 text-emerald-600" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/exams/${exam.id}/preview`)}
                                                                title="Preview"
                                                            >
                                                                <Eye className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(exam)}
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4 text-slate-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeleteConfirm({ open: true, exam })}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingExam ? 'Edit Exam' : 'Create New Exam'}
            >
                <ExamForm
                    exam={editingExam}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, exam: null })}
                onConfirm={handleDelete}
                isLoading={isSubmitting}
                examTitle={deleteConfirm.exam?.title}
            />

            {/* Attempt History Modal */}
            <ExamAttemptHistory
                isOpen={historyModal.open}
                onClose={() => setHistoryModal({ open: false, exam: null })}
                examId={historyModal.exam?.id}
                examTitle={historyModal.exam?.title}
                passThreshold={historyModal.exam?.passThreshold}
            />
        </div>
    );
};

export default ExamList;
