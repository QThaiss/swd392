import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOTPPage from './pages/auth/VerifyOTPPage';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ExamList from './pages/exam/ExamList';
import CreateExam from './pages/exam/CreateExam';
import ExamPreview from './pages/exam/ExamPreview';
import TakeExam from './pages/exam/TakeExam';
import LessonPlanList from './pages/lessonplan/LessonPlanList';
import LessonPlanDetail from './pages/lessonplan/LessonPlanDetail';
import QuestionBankList from './pages/questionbank/QuestionBankList';
import QuestionBankDetail from './pages/questionbank/QuestionBankDetail';
import ExamMatrixList from './pages/exammatrix/ExamMatrixList';
import ProfilePage from './pages/profile/ProfilePage';
import UserList from './pages/admin/UserList';
import PeriodicTable from './pages/resources/PeriodicTable';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const token = localStorage.getItem('token');
  
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          
          {/* TakeExam - Fullscreen without Layout */}
          <Route path="/exams/:id/take" element={
            <ProtectedRoute>
              <TakeExam />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="exams" element={<ExamList />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams/:id/edit" element={<CreateExam />} />
            <Route path="exams/:id/preview" element={<ExamPreview />} />
            <Route path="lesson-plans" element={<LessonPlanList />} />
            <Route path="lesson-plans/:id" element={<LessonPlanDetail />} />
            <Route path="question-banks" element={<QuestionBankList />} />
            <Route path="question-banks/:id" element={<QuestionBankDetail />} />
            <Route path="exam-matrix" element={<ExamMatrixList />} />
            <Route path="resources/periodic-table" element={<PeriodicTable />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin/users" element={<UserList />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
