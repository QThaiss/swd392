import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { lessonPlanApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, Edit, Trash2, Loader2, X, AlertCircle, BookOpen, Calendar, Wand2 } from 'lucide-react';
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

// Lesson Plan Form Component
const LessonPlanForm = ({ lessonPlan, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        title: lessonPlan?.title || '',
        objectives: lessonPlan?.objectives || '',
        description: lessonPlan?.description || '',
        imageUrl: lessonPlan?.imageUrl || '',
        gradeLevel: lessonPlan?.gradeLevel || 10,
    });
    const [generating, setGenerating] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleAiGenerate = async () => {
        if (!formData.title) {
            toast.error("Please enter a Title to generate content.");
            return;
        }

        try {
            setGenerating(true);
            // Use API
            const { aiApi } = await import('../../services/api');
            const res = await aiApi.generateLessonPlan({ 
                topic: formData.title, 
                gradeLevel: formData.gradeLevel.toString() 
            });
            
            if (res.success) {
                const data = res.data;
                setFormData(prev => ({
                    ...prev,
                    objectives: data.objectives || prev.objectives,
                    description: data.description || prev.description
                }));
                toast.success("Content generated successfully!");
            }
        } catch (error) {
            console.error("AI Generation failed", error);
            toast.error("Failed to generate content. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Input
                            name="title"
                            label="Title *"
                            placeholder="Enter topic (e.g., Photosynthesis)"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                
                <div className="flex justify-end">
                     <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleAiGenerate}
                        isLoading={generating}
                        className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Auto-Generate Content
                    </Button>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Objectives</label>
                    <textarea
                        name="objectives"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter learning objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <textarea
                        name="description"
                        rows={6}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter lesson plan description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <Input
                    name="imageUrl"
                    label="Image URL"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>
                    {lessonPlan ? 'Update Lesson Plan' : 'Create Lesson Plan'}
                </Button>
            </div>
        </form>
    );
};

// Delete Confirmation Modal
const DeleteConfirm = ({ isOpen, onClose, onConfirm, isLoading, title }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Lesson Plan">
        <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-slate-600 mb-2">Are you sure you want to delete</p>
            <p className="font-semibold text-slate-900 mb-6">"{title}"?</p>
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>Delete</Button>
            </div>
        </div>
    </Modal>
);

const LessonPlanList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [lessonPlans, setLessonPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, plan: null });

    // Show CRUD buttons only for teachers/admins
    const canManage = user?.role === 'TEACHER' || user?.role === 'teacher' || user?.role === 'ADMIN' || user?.role === 'admin';

    const fetchLessonPlans = async () => {
        try {
            setLoading(true);
            const response = canManage ? await lessonPlanApi.getMy() : await lessonPlanApi.getAll();
            if (response.success) {
                let data = response.data;
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    if (Array.isArray(data.items)) data = data.items;
                    else if (Array.isArray(data.content)) data = data.content;
                }

                if (Array.isArray(data)) {
                    setLessonPlans(data);
                } else {
                    console.error('Unexpected data format:', response.data);
                    setLessonPlans([]);
                }
            }
        } catch (err) {
            setError('Failed to load lesson plans');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonPlans();
    }, []);

    const handleCreate = () => {
        setEditingPlan(null);
        setIsFormOpen(true);
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setIsFormOpen(true);
    };

    const handleSubmit = async (formData) => {
        try {
            setIsSubmitting(true);
            if (editingPlan) {
                await lessonPlanApi.update(editingPlan.id, formData);
            } else {
                await lessonPlanApi.create(formData);
            }
            setIsFormOpen(false);
            fetchLessonPlans();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save lesson plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            await lessonPlanApi.delete(deleteConfirm.plan.id);
            setDeleteConfirm({ open: false, plan: null });
            fetchLessonPlans();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete lesson plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPlans = Array.isArray(lessonPlans) ? lessonPlans.filter(plan =>
        plan.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper to strip markdown for card preview
    const getPlainDescription = (markdown) => {
        if (!markdown) return '';
        return markdown
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
            .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
            .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
            .replace(/^\s*[-+*]\s/gm, '') // Remove list items
            .replace(/^\s*\d+\.\s/gm, '') // Remove list numbers
            .replace(/\n/g, ' ') // Collapse newlines
            .trim();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lesson Plans</h1>
                    <p className="text-slate-500">Create and manage your lesson plans.</p>
                </div>
                {canManage && (
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Lesson Plan
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
                        <CardTitle>All Lesson Plans</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search lesson plans..."
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
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>No lesson plans found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    onClick={() => navigate(`/lesson-plans/${plan.id}`)}
                                    className="group border border-slate-200 rounded-xl p-5 bg-white hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer relative"
                                >
                                    {plan.imageUrl && (
                                        <img
                                            src={plan.imageUrl}
                                            alt={plan.title}
                                            className="w-full h-32 object-cover rounded-lg mb-4"
                                        />
                                    )}
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-slate-900 line-clamp-2">{plan.title}</h3>
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium shrink-0 ml-2">
                                                Grade {plan.gradeLevel}
                                            </span>
                                        </div>
                                        {plan.description && (
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {getPlainDescription(plan.description)}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{plan.teacherName}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(plan.createdAt)}
                                            </span>
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-2 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(plan);
                                                    }}
                                                >
                                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteConfirm({ open: true, plan });
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
            >
                <LessonPlanForm
                    lessonPlan={editingPlan}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isSubmitting}
                />
            </Modal>

            {/* Delete Confirmation */}
            <DeleteConfirm
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, plan: null })}
                onConfirm={handleDelete}
                isLoading={isSubmitting}
                title={deleteConfirm.plan?.title}
            />

            {/* View Details Modal */}
            <Modal
                isOpen={!!viewingPlan}
                onClose={() => setViewingPlan(null)}
                title="Lesson Plan Details"
            >
                {viewingPlan && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="border-b pb-4">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{viewingPlan.title}</h2>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                                    <BookOpen className="h-4 w-4" />
                                    Grade {viewingPlan.gradeLevel}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Created: {formatDate(viewingPlan.createdAt)}
                                </span>
                                <span>Author: {viewingPlan.teacherName}</span>
                            </div>
                        </div>

                        {/* Image if exists */}
                        {viewingPlan.imageUrl && (
                            <img 
                                src={viewingPlan.imageUrl} 
                                alt={viewingPlan.title} 
                                className="w-full h-64 object-cover rounded-lg shadow-sm"
                            />
                        )}

                        {/* Objectives */}
                        {viewingPlan.objectives && (
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                                <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                                    <Wand2 className="h-4 w-4" /> Learning Objectives
                                </h3>
                                <p className="text-emerald-900 text-sm whitespace-pre-wrap leading-relaxed">
                                    {viewingPlan.objectives}
                                </p>
                            </div>
                        )}

                        {/* Content / Markdown */}
                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2 mb-4">Lesson Content</h3>
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-4" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-5 mb-3" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />,
                                    p: ({node, ...props}) => <p className="mb-4 text-slate-600 leading-relaxed" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                    li: ({node, ...props}) => <li className="text-slate-600 pl-1" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-600 my-4" {...props} />,
                                }}
                            >
                                {viewingPlan.description || '*No description provided.*'}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LessonPlanList;
