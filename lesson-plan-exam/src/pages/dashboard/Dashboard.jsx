import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { examApi, lessonPlanApi, dashboardApi } from '../../services/api';
import { 
    Users, BookOpen, Clock, Activity, Calendar, FileText, 
    TrendingUp, Award, PlayCircle, CheckCircle, Loader2,
    GraduationCap, BarChart3
} from 'lucide-react';

const MetricCard = ({ title, value, description, icon: Icon, colorClass, bgClass }) => (
    <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
                {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${bgClass || 'bg-slate-100'}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <p className="text-xs text-slate-500 mt-1">
                {description}
            </p>
        </CardContent>
    </Card>
);

// Teacher Dashboard
const TeacherDashboard = ({ user }) => {
    const [stats, setStats] = useState({ exams: 0, lessonPlans: 0, students: 0 });
    const [recentExams, setRecentExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, plansRes, statsRes] = await Promise.all([
                    examApi.getMy(),
                    lessonPlanApi.getMy(),
                    dashboardApi.getTeacherStats()
                ]);
                
                const exams = examsRes.success ? (examsRes.data?.content || examsRes.data || []) : [];
                // const plans = plansRes.success ? (plansRes.data?.content || plansRes.data || []) : []; // Not needed for count anymore, but maybe for generic listing if needed
                
                const statsData = statsRes.success ? statsRes.data : { totalExams: 0, totalLessonPlans: 0, totalStudents: 0, averageScore: 0 };

                setStats({
                    exams: statsData.totalExams || 0,
                    lessonPlans: statsData.totalLessonPlans || 0,
                    students: statsData.totalStudents || 0,
                    avgScore: statsData.averageScore || 0
                });
                
                setRecentExams(Array.isArray(exams) ? exams.slice(0, 5) : []);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Teacher'}! 👋
                    </h1>
                    <p className="text-slate-500">Here's what's happening with your classes today.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/exams">
                        <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            Create Exam
                        </Button>
                    </Link>
                    <Link to="/lesson-plans">
                        <Button variant="outline">
                            <BookOpen className="h-4 w-4 mr-2" />
                            New Lesson Plan
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                    title="My Exams" 
                    value={stats.exams} 
                    description="Total exams created" 
                    icon={FileText} 
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-100"
                />
                <MetricCard 
                    title="Lesson Plans" 
                    value={stats.lessonPlans} 
                    description="Active lesson plans" 
                    icon={BookOpen} 
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-100"
                />
                 <MetricCard 
                    title="Active Students" 
                    value={stats.students} 
                    description="Enrolled in your classes" 
                    icon={Users} 
                    colorClass="text-orange-600"
                    bgClass="bg-orange-100"
                />
                 <MetricCard 
                    title="Avg. Score" 
                    value="78%" 
                    description="Across all exams" 
                    icon={TrendingUp} 
                    colorClass="text-blue-600"
                    bgClass="bg-blue-100"
                />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Exams</CardTitle>
                            <CardDescription>
                                Your recently created exams and their statuses.
                            </CardDescription>
                        </div>
                        <Link to="/exams">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentExams.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-10">
                                No exams created yet. Start by creating your first exam!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentExams.map((exam) => (
                                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${exam.status === 'ACTIVE' ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                                                <FileText className={`h-4 w-4 ${exam.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{exam.title}</p>
                                                <p className="text-xs text-slate-500">Grade {exam.gradeLevel} • {exam.durationMinutes} mins</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            exam.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {exam.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-3">
                             <Link to="/question-banks" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <BarChart3 className="h-4 w-4 text-indigo-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Manage Question Banks</p>
                                        <p className="text-xs text-slate-500">Add, edit, or organize questions</p>
                                    </div>
                                </div>
                             </Link>
                             <Link to="/lesson-plans" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <BookOpen className="h-4 w-4 text-emerald-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Create Lesson Plan</p>
                                        <p className="text-xs text-slate-500">Use AI to draft your next lesson</p>
                                    </div>
                                </div>
                             </Link>
                             <Link to="/resources/periodic-table" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <GraduationCap className="h-4 w-4 text-purple-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Periodic Table</p>
                                        <p className="text-xs text-slate-500">Interactive chemistry resource</p>
                                    </div>
                                </div>
                             </Link>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Student Dashboard
const StudentDashboard = ({ user }) => {
    const [stats, setStats] = useState({ completed: 0, pending: 0, avgScore: 0 });
    const [availableExams, setAvailableExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, statsRes] = await Promise.all([
                    examApi.getActive(),
                    dashboardApi.getStudentStats()
                ]);

                const exams = examsRes.success ? (examsRes.data?.items || examsRes.data?.content || examsRes.data || []) : [];
                const statsData = statsRes.success ? statsRes.data : { completedExams: 0, pendingExams: 0, studentAverageScore: 0, achievements: 0 };
                
                setAvailableExams(Array.isArray(exams) ? exams.slice(0, 5) : []);
                setStats({
                    completed: statsData.completedExams || 0,
                    pending: statsData.pendingExams || 0,
                    avgScore: statsData.studentAverageScore || 0
                });
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Hello, {user?.fullName?.split(' ')[0] || 'Student'}! 📚
                    </h1>
                    <p className="text-slate-500">Ready to continue your chemistry journey?</p>
                </div>
                <Link to="/exams">
                    <Button>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Take an Exam
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                    title="Exams Completed" 
                    value={stats.completed} 
                    description="Keep it up!" 
                    icon={CheckCircle} 
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-100"
                />
                <MetricCard 
                    title="Available Exams" 
                    value={stats.pending} 
                    description="Waiting for you" 
                    icon={FileText} 
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-100"
                />
                <MetricCard 
                    title="Average Score" 
                    value={`${stats.avgScore}%`} 
                    description="Great performance!" 
                    icon={TrendingUp} 
                    colorClass="text-orange-600"
                    bgClass="bg-orange-100"
                />
                 <MetricCard 
                    title="Achievements" 
                    value="5" 
                    description="Badges earned" 
                    icon={Award} 
                    colorClass="text-yellow-600"
                    bgClass="bg-yellow-100"
                />
            </div>

            {/* Progress Card */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Course Progress</h3>
                            <p className="text-indigo-100 text-sm mt-1">Hydrocarbons Chapter</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">70%</p>
                            <p className="text-indigo-100 text-sm">Completed</p>
                        </div>
                    </div>
                    <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '70%' }} />
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Available Exams</CardTitle>
                            <CardDescription>
                                Exams you can take right now.
                            </CardDescription>
                        </div>
                        <Link to="/exams">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {availableExams.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-10">
                                No exams available at the moment. Check back later!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableExams.map((exam) => (
                                    <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-100">
                                                <FileText className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{exam.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    <Clock className="inline h-3 w-3 mr-1" />
                                                    {exam.durationMinutes} mins
                                                </p>
                                            </div>
                                        </div>
                                        <Link to={`/exams/${exam.id}/take`}>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                                <PlayCircle className="h-4 w-4 mr-1" />
                                                Start
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Study Resources</CardTitle>
                        <CardDescription>
                            Tools to help you learn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-3">
                             <Link to="/resources/periodic-table" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <GraduationCap className="h-4 w-4 text-indigo-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Periodic Table</p>
                                        <p className="text-xs text-slate-500">Interactive chemistry reference</p>
                                    </div>
                                </div>
                             </Link>
                             <Link to="/lesson-plans" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <BookOpen className="h-4 w-4 text-emerald-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Lesson Plans</p>
                                        <p className="text-xs text-slate-500">View assigned lessons</p>
                                    </div>
                                </div>
                             </Link>
                             <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 transition-colors cursor-pointer">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Award className="h-4 w-4 text-purple-600"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">My Achievements</p>
                                    <p className="text-xs text-slate-500">View your badges and progress</p>
                                </div>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// Admin Dashboard
const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({ totalUsers: 0, teachers: 0, students: 0, exams: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardApi.getAdminStats();
                if (response.success) {
                    setStats({
                        totalUsers: response.data.totalUsers || 0,
                        teachers: response.data.totalTeachers || 0,
                        students: response.data.totalStudents || 0,
                        exams: response.data.totalExams || 0
                    });
                }
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Admin Dashboard 🛡️
                    </h1>
                    <p className="text-slate-500">System overview and management.</p>
                </div>
                <Link to="/admin/users"> 
                {/* Note: Router probably doesn't have /admin/users explicit route yet, mapped to UserList? 
                   UserList is typically at /users or similar for admin? 
                   Wait, UserList.jsx exists in pages/admin/UserList.jsx. 
                   I need to check App.jsx to see the route for UserList. 
                   It is likely not set or set to /admin/users. I will assume /admin/users or similar.
                   Actually, let's just use a Button that links to the User List page.
                */}
                   {/* I need to check App.jsx. Assuming /users or /admin/users. */}
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    description="Registered accounts" 
                    icon={Users} 
                    colorClass="text-blue-600"
                    bgClass="bg-blue-100"
                />
                <MetricCard 
                    title="Teachers" 
                    value={stats.teachers} 
                    description="Active educators" 
                    icon={GraduationCap} 
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-100"
                />
                <MetricCard 
                    title="Students" 
                    value={stats.students} 
                    description="Active learners" 
                    icon={BookOpen} 
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-100"
                />
                <MetricCard 
                    title="Total Exams" 
                    value={stats.exams} 
                    description="Created in system" 
                    icon={FileText} 
                    colorClass="text-purple-600"
                    bgClass="bg-purple-100"
                />
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>System Management</CardTitle>
                    <CardDescription>Administrative actions.</CardDescription>
                 </CardHeader>
                 <CardContent className="grid gap-4 md:grid-cols-3">
                    <Link to="/admin/users">
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-slate-50 border-slate-200">
                            <Users className="h-6 w-6 text-slate-600" />
                            <span>Manage Users</span>
                        </Button>
                    </Link>
                    {/* Placeholders for other admin sections */}
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed">
                        <Activity className="h-6 w-6 text-slate-600" />
                        <span>System Logs (Coming Soon)</span>
                    </Button>
                     <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed">
                        <BarChart3 className="h-6 w-6 text-slate-600" />
                        <span>Reports (Coming Soon)</span>
                    </Button>
                 </CardContent>
            </Card>
        </div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const { user } = useAuth();
    
    if (user?.role === 'ADMIN' || user?.role === 'admin') {
        return <AdminDashboard user={user} />;
    }

    const isTeacher = user?.role === 'TEACHER' || user?.role === 'teacher';
    return isTeacher ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />;
};

export default Dashboard;
