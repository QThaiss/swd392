import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examMatrixApi, questionBankApi, questionApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
    Plus, Search, Edit, Trash2, Loader2, X, AlertCircle, 
    Grid3X3, FileText, ArrowRight, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Matrix Form Component
const MatrixForm = ({ matrix, questionBanks, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: matrix?.name || '',
        description: matrix?.description || '',
        questionBankId: matrix?.questionBankId || '',
        easyCount: matrix?.easyCount || 5,
        easyPoints: matrix?.easyPoints || 1,
        mediumCount: matrix?.mediumCount || 10,
        mediumPoints: matrix?.mediumPoints || 2,
        hardCount: matrix?.hardCount || 5,
        hardPoints: matrix?.hardPoints || 3,
    });

    const [bankStats, setBankStats] = useState({ easy: 0, medium: 0, hard: 0 });
    const [fetchingStats, setFetchingStats] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!formData.questionBankId) return;
            setFetchingStats(true);
            try {
                const res = await questionApi.getByBank(formData.questionBankId, { size: 1000 });
                if (res.success) {
                    let questions = res.data;
                    if (res.data.items) questions = res.data.items;
                    if (res.data.content) questions = res.data.content;
                    
                    if (Array.isArray(questions)) {
                        const easy = questions.filter(q => q.difficultyLevel === 1).length;
                        const medium = questions.filter(q => q.difficultyLevel === 2).length;
                        const hard = questions.filter(q => q.difficultyLevel === 3).length;
                        
                        setBankStats({ easy, medium, hard });
                        
                        // Auto-sync if creating new matrix
                        if (!matrix) {
                            setFormData(prev => ({
                                ...prev,
                                easyCount: easy,
                                mediumCount: medium,
                                hardCount: hard
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch bank stats", error);
            } finally {
                setFetchingStats(false);
            }
        };

        fetchStats();
    }, [formData.questionBankId]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getTotalQuestions = () => formData.easyCount + formData.mediumCount + formData.hardCount;
    const getTotalPoints = () => 
        (formData.easyCount * formData.easyPoints) + 
        (formData.mediumCount * formData.mediumPoints) + 
        (formData.hardCount * formData.hardPoints);

    const getPercentage = (count) => {
        const total = getTotalQuestions();
        return total > 0 ? Math.round((count / total) * 100) : 0;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Input
                        name="name"
                        label="Matrix Name *"
                        placeholder="e.g., Chemistry Final Exam Matrix"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                        name="description"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe this matrix configuration"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Bank *</label>
                    <select
                        name="questionBankId"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.questionBankId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a question bank...</option>
                        {questionBanks.map(bank => (
                            <option key={bank.id} value={bank.id}>
                                {bank.name} ({bank.questionCount || 0} questions)
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Difficulty Configuration */}
            <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Difficulty Distribution</h3>
                
                <div className="space-y-4">
                    {/* Easy */}
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="font-medium text-emerald-800">Easy Questions</span>
                            <span className="text-sm text-emerald-600 ml-auto">{getPercentage(formData.easyCount)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-emerald-700">Number of Questions</label>
                                <input
                                    type="number"
                                    name="easyCount"
                                    min={0}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    value={formData.easyCount}
                                    onChange={handleChange}
                                />
                                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                    <span>Available: {fetchingStats ? '...' : bankStats.easy}</span>
                                    {formData.easyCount > bankStats.easy && <span className="text-red-500">Exceeds limit</span>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-emerald-700">Points per Question</label>
                                <input
                                    type="number"
                                    name="easyPoints"
                                    min={1}
                                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    value={formData.easyPoints}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medium */}
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="font-medium text-amber-800">Medium Questions</span>
                            <span className="text-sm text-amber-600 ml-auto">{getPercentage(formData.mediumCount)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-amber-700">Number of Questions</label>
                                <input
                                    type="number"
                                    name="mediumCount"
                                    min={0}
                                    className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={formData.mediumCount}
                                    onChange={handleChange}
                                />
                                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                    <span>Available: {fetchingStats ? '...' : bankStats.medium}</span>
                                    {formData.mediumCount > bankStats.medium && <span className="text-red-500">Exceeds limit</span>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-amber-700">Points per Question</label>
                                <input
                                    type="number"
                                    name="mediumPoints"
                                    min={1}
                                    className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={formData.mediumPoints}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hard */}
                    <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="font-medium text-red-800">Hard Questions</span>
                            <span className="text-sm text-red-600 ml-auto">{getPercentage(formData.hardCount)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-red-700">Number of Questions</label>
                                <input
                                    type="number"
                                    name="hardCount"
                                    min={0}
                                    className="w-full px-3 py-2 border border-red-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    value={formData.hardCount}
                                    onChange={handleChange}
                                />
                                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                    <span>Available: {fetchingStats ? '...' : bankStats.hard}</span>
                                    {formData.hardCount > bankStats.hard && <span className="text-red-500">Exceeds limit</span>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-red-700">Points per Question</label>
                                <input
                                    type="number"
                                    name="hardPoints"
                                    min={1}
                                    className="w-full px-3 py-2 border border-red-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    value={formData.hardPoints}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="text-indigo-700 font-medium">Total: {getTotalQuestions()} questions</span>
                        <span className="text-indigo-600 text-sm ml-4">{getTotalPoints()} points</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${getPercentage(formData.easyCount)}px` }}></div>
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: `${getPercentage(formData.mediumCount)}px` }}></div>
                        <div className="h-2 rounded-full bg-red-500" style={{ width: `${getPercentage(formData.hardCount)}px` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>
                    {matrix ? 'Update Matrix' : 'Create Matrix'}
                </Button>
            </div>
        </form>
    );
};

// Delete Confirmation Modal
const DeleteConfirm = ({ isOpen, onClose, onConfirm, isLoading, name }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Matrix">
        <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-slate-600 mb-2">Are you sure you want to delete</p>
            <p className="font-semibold text-slate-900 mb-6">"{name}"?</p>
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>Delete</Button>
            </div>
        </div>
    </Modal>
);

const ExamMatrixList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [matrices, setMatrices] = useState([]);
    const [questionBanks, setQuestionBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMatrix, setEditingMatrix] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, matrix: null });

    const canManage = user?.role === 'TEACHER' || user?.role === 'teacher' || user?.role === 'ADMIN' || user?.role === 'admin';

    // Helper function to parse matrixItems from backend response
    const parseMatrix = (matrix) => {
        const items = matrix.matrixItems || [];
        const getItemByDifficulty = (diff) => items.find(i => i.difficulty === diff) || {};
        
        return {
            ...matrix,
            easyCount: getItemByDifficulty('EASY').questionCount || 0,
            easyPoints: getItemByDifficulty('EASY').pointsPerQuestion || 1,
            mediumCount: getItemByDifficulty('MEDIUM').questionCount || 0,
            mediumPoints: getItemByDifficulty('MEDIUM').pointsPerQuestion || 2,
            hardCount: getItemByDifficulty('HARD').questionCount || 0,
            hardPoints: getItemByDifficulty('HARD').pointsPerQuestion || 3,
        };
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [matricesRes, banksRes] = await Promise.all([
                examMatrixApi.getMy(),
                questionBankApi.getMy()
            ]);
            
            if (matricesRes.success) {
                let data = matricesRes.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                // Parse matrixItems for each matrix
                setMatrices(data.map(parseMatrix));
            }
            
            if (banksRes.success) {
                let data = banksRes.data;
                if (!Array.isArray(data)) {
                    data = data.items || data.content || [];
                }
                setQuestionBanks(data);
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setEditingMatrix(null);
        setIsFormOpen(true);
    };

    const handleEdit = (matrix) => {
        setEditingMatrix(matrix);
        setIsFormOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsSubmitting(true);
            
            // Validate questionBankId
            const bankId = parseInt(formData.questionBankId);
            if (isNaN(bankId) || bankId <= 0) {
                setError('Please select a valid question bank');
                setIsSubmitting(false);
                return;
            }
            
            // Transform form data to match backend API format with matrixItems
            const apiData = {
                name: formData.name,
                description: formData.description || '',
                questionBankId: bankId,
                matrixItems: [
                    {
                        difficulty: 'EASY',
                        questionCount: parseInt(formData.easyCount) || 0,
                        pointsPerQuestion: parseInt(formData.easyPoints) || 1
                    },
                    {
                        difficulty: 'MEDIUM',
                        questionCount: parseInt(formData.mediumCount) || 0,
                        pointsPerQuestion: parseInt(formData.mediumPoints) || 2
                    },
                    {
                        difficulty: 'HARD',
                        questionCount: parseInt(formData.hardCount) || 0,
                        pointsPerQuestion: parseInt(formData.hardPoints) || 3
                    }
                ].filter(item => item.questionCount > 0) // Only include items with count > 0
            };
            
            console.log('Sending matrix data:', JSON.stringify(apiData, null, 2));
            
            if (editingMatrix) {
                await examMatrixApi.update(editingMatrix.id, apiData);
            } else {
                await examMatrixApi.create(apiData);
            }
            setIsFormOpen(false);
            setError('');
            fetchData();
        } catch (err) {
            console.error('Matrix API Error:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to save matrix');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await examMatrixApi.delete(deleteConfirm.matrix.id);
            setDeleteConfirm({ open: false, matrix: null });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete matrix');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateExamFromMatrix = (matrix) => {
        navigate('/exams/create', { state: { selectedMatrix: matrix } });
    };

    const filteredMatrices = matrices.filter(m =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBankName = (bankId) => {
        const bank = questionBanks.find(b => b.id === bankId);
        return bank?.name || 'Unknown Bank';
    };

    if (!canManage) {
        return (
            <div className="text-center py-12">
                <Grid3X3 className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Restricted</h2>
                <p className="text-slate-500">Only teachers can manage exam matrices.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Matrices</h1>
                    <p className="text-slate-500">Create and manage exam difficulty distributions.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Matrix
                </Button>
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
                        <CardTitle>All Matrices</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search matrices..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredMatrices.length === 0 ? (
                        <div className="text-center py-12">
                            <Grid3X3 className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                            <p className="text-slate-500 mb-4">No exam matrices found.</p>
                            <Button onClick={handleCreate}>Create Your First Matrix</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMatrices.map((matrix) => (
                                <Card key={matrix.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{matrix.name}</h3>
                                                <p className="text-sm text-slate-500">{getBankName(matrix.questionBankId)}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => handleEdit(matrix)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100"
                                                >
                                                    <Edit className="h-4 w-4 text-slate-500" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteConfirm({ open: true, matrix })}
                                                    className="p-1.5 rounded-lg hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>

                                        {matrix.description && (
                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{matrix.description}</p>
                                        )}

                                        {/* Difficulty Distribution Bar */}
                                        <div className="mb-3">
                                            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                                                <div 
                                                    className="bg-emerald-500" 
                                                    style={{ 
                                                        width: `${(matrix.easyCount / (matrix.easyCount + matrix.mediumCount + matrix.hardCount)) * 100}%` 
                                                    }}
                                                />
                                                <div 
                                                    className="bg-amber-500" 
                                                    style={{ 
                                                        width: `${(matrix.mediumCount / (matrix.easyCount + matrix.mediumCount + matrix.hardCount)) * 100}%` 
                                                    }}
                                                />
                                                <div 
                                                    className="bg-red-500" 
                                                    style={{ 
                                                        width: `${(matrix.hardCount / (matrix.easyCount + matrix.mediumCount + matrix.hardCount)) * 100}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-2 text-xs mb-4">
                                            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                Easy: {matrix.easyCount}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                                Medium: {matrix.mediumCount}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                Hard: {matrix.hardCount}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">
                                                {matrix.easyCount + matrix.mediumCount + matrix.hardCount} questions
                                            </span>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleCreateExamFromMatrix(matrix)}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <FileText className="h-3 w-3 mr-1" />
                                                Create Exam
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingMatrix ? 'Edit Exam Matrix' : 'Create Exam Matrix'}
            >
                <MatrixForm
                    matrix={editingMatrix}
                    questionBanks={questionBanks}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, matrix: null })}
                onConfirm={handleDelete}
                isLoading={isSubmitting}
                name={deleteConfirm.matrix?.name}
            />
        </div>
    );
};

export default ExamMatrixList;
