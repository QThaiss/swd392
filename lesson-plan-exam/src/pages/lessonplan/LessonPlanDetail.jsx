import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { lessonPlanApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { 
    ArrowLeft, Calendar, User, BookOpen, Clock, 
    Share2, Bookmark, Printer, Download, Wand2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const LessonPlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessonPlan, setLessonPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLessonPlan = async () => {
            try {
                setLoading(true);
                const response = await lessonPlanApi.getById(id);
                if (response.success) {
                    setLessonPlan(response.data);
                } else {
                    setError('Failed to load lesson plan details');
                }
            } catch (err) {
                console.error('Error fetching lesson plan:', err);
                setError('Failed to load lesson plan');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLessonPlan();
        }
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !lessonPlan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-slate-500 mb-6">{error || 'Lesson plan not found'}</p>
                    <Button onClick={() => navigate('/lesson-plans')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Lesson Plans
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/lesson-plans')}
                        className="text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Save Bookmark">
                            <Bookmark className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Print">
                            <Printer className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Share">
                            <Share2 className="h-4 w-4 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Hero Section */}
                    {lessonPlan.imageUrl ? (
                        <div className="w-full h-64 md:h-80 relative">
                            <img 
                                src={lessonPlan.imageUrl} 
                                alt={lessonPlan.title} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                                        Grade {lessonPlan.gradeLevel}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-shadow-sm">
                                    {lessonPlan.title}
                                </h1>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-12 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/30 flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Grade {lessonPlan.gradeLevel}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {lessonPlan.title}
                            </h1>
                        </div>
                    )}

                    {/* Metadata Bar */}
                    <div className="flex flex-wrap items-center gap-6 p-6 border-b border-slate-100 bg-slate-50/50 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium text-slate-700">{lessonPlan.teacherName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <span>Published on {formatDate(lessonPlan.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span>15 min read</span>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 md:p-12">
                        {/* Objectives Box */}
                        {lessonPlan.objectives && (
                            <div className="mb-10 bg-emerald-50/50 border border-emerald-100 rounded-xl p-6">
                                <h3 className="text-emerald-800 font-semibold mb-3 flex items-center gap-2">
                                    <Wand2 className="h-5 w-5" />
                                    Learning Objectives
                                </h3>
                                <p className="text-emerald-900/80 leading-relaxed whitespace-pre-wrap">
                                    {lessonPlan.objectives}
                                </p>
                            </div>
                        )}

                        {/* Markdown Content */}
                        <div className="prose prose-slate prose-lg max-w-none 
                            prose-headings:font-bold prose-headings:text-slate-800 
                            prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                            prose-p:text-slate-600 prose-p:leading-8
                            prose-li:text-slate-600
                            prose-strong:text-slate-900 prose-strong:font-semibold
                            prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:bg-indigo-50/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                            prose-img:rounded-xl prose-img:shadow-md
                        ">
                            <ReactMarkdown>
                                {lessonPlan.description || '*No content provided.*'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>

                {/* Footer / Citation */}
                <div className="mt-8 text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Lesson Plan System. Content created by {lessonPlan.teacherName}.</p>
                </div>
            </main>
        </div>
    );
};

export default LessonPlanDetail;
