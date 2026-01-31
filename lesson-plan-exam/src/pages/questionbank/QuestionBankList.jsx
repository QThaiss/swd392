import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionBankApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, Edit, Trash2, Loader2, X, AlertCircle, Database, FileQuestion } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { Modal } from '../../components/ui/Modal';

// Question Bank Form Component
const QuestionBankForm = ({ questionBank, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: questionBank?.name || '',
        gradeLevel: questionBank?.gradeLevel || 10,
        description: questionBank?.description || '',
    });

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Input
                    name="name"
                    label="Name *"
                    placeholder="Enter question bank name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>
                    {questionBank ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
};

// Delete Confirmation Modal
const DeleteConfirm = ({ isOpen, onClose, onConfirm, isLoading, name }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Question Bank">
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

const QuestionBankList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [questionBanks, setQuestionBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, bank: null });

    // Show CRUD buttons only for teachers/admins
    const canManage = user?.role === 'TEACHER' || user?.role === 'teacher' || user?.role === 'ADMIN' || user?.role === 'admin';

    const fetchQuestionBanks = async () => {
        try {
            setLoading(true);
            const response = canManage ? await questionBankApi.getMy() : await questionBankApi.getAll();
            if (response.success) {
                let data = response.data;
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                     if (Array.isArray(data.items)) data = data.items;
                     else if (Array.isArray(data.content)) data = data.content;
                }

                if (Array.isArray(data)) {
                    setQuestionBanks(data);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setQuestionBanks([]);
                }
            }
        } catch (err) {
            setError('Failed to load question banks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestionBanks();
    }, []);

    const handleCreate = () => {
        setEditingBank(null);
        setIsFormOpen(true);
    };

    const handleEdit = (bank) => {
        setEditingBank(bank);
        setIsFormOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsSubmitting(true);
            if (editingBank) {
                await questionBankApi.update(editingBank.id, formData);
            } else {
                await questionBankApi.create(formData);
            }
            setIsFormOpen(false);
            fetchQuestionBanks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save question bank');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await questionBankApi.delete(deleteConfirm.bank.id);
            setDeleteConfirm({ open: false, bank: null });
            fetchQuestionBanks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete question bank');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBanks = Array.isArray(questionBanks) ? questionBanks.filter(bank =>
        bank.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: 'bg-emerald-100 text-emerald-700',
            DRAFT: 'bg-slate-100 text-slate-600',
            ARCHIVED: 'bg-amber-100 text-amber-700',
        };
        return styles[status] || styles.DRAFT;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Question Banks</h1>
                    <p className="text-slate-500">Organize and manage your question collections.</p>
                </div>
                {canManage && (
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Question Bank
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
                        <CardTitle>All Question Banks</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search question banks..."
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
                    ) : filteredBanks.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Database className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>No question banks found.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Teacher</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredBanks.map((bank) => (
                                        <tr key={bank.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                                        <FileQuestion className="h-4 w-4 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0" onClick={() => navigate(`/question-banks/${bank.id}`)} role="button">
                                                        <h3 className="text-lg font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                                            {bank.name}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2">
                                                            {bank.description || 'No description provided.'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                Grade {bank.gradeLevel}
                                                            </span>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                                {bank.questionCount || 0} Questions
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{bank.teacherName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(bank.status)}`}>
                                                    {bank.status || 'DRAFT'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {canManage && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(bank)}
                                                        >
                                                            <Edit className="h-4 w-4 text-slate-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeleteConfirm({ open: true, bank })}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                )}
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
                title={editingBank ? 'Edit Question Bank' : 'Create New Question Bank'}
            >
                <QuestionBankForm
                    questionBank={editingBank}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, bank: null })}
                onConfirm={handleDelete}
                isLoading={isSubmitting}
                name={deleteConfirm.bank?.name}
            />
        </div>
    );
};

export default QuestionBankList;
