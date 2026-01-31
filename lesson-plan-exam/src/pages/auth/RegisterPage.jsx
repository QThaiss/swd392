import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, School, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    studentCode: '', // Student Only
    major: '', // Student Only
    department: '', // Teacher Only
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerStudent, registerTeacher } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
        let res;
      if (role === 'student') {
        const { confirmPassword, department, firstName, lastName, ...rest } = formData;
        const studentData = { ...rest, fullName: `${firstName} ${lastName}` };
        res = await registerStudent(studentData);
      } else {
         const { confirmPassword, studentCode, major, firstName, lastName, ...rest } = formData;
         const teacherData = { ...rest, fullName: `${firstName} ${lastName}` };
         res = await registerTeacher(teacherData);
      }
      
      if(res.success) {
          toast.success('Registration successful! Please check your email for the OTP.');
          navigate(`/verify-otp?email=${formData.email}`);
      } else {
          setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 py-8">
      <Card className="w-full max-w-xl shadow-2xl border-white/40 bg-white/60 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center border-b border-slate-900/5 pb-6 mb-6">
             <div className="mx-auto mb-4">
                 <img src="/icon.svg" alt="App Logo" className="h-24 w-24 mx-auto drop-shadow-lg" />
             </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Create your account</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Join the Lesson Plan Exam platform today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className={cn(
                "cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all duration-300",
                role === 'student' 
                    ? 'border-blue-500 bg-blue-50/80 text-blue-700 shadow-md ring-1 ring-blue-500' 
                    : 'border-slate-200/60 bg-white/40 text-slate-500 hover:bg-white/60 hover:border-slate-300'
              )}
              onClick={() => setRole('student')}
            >
              <GraduationCap className={cn("h-8 w-8 transition-colors", role === 'student' ? "text-blue-600" : "text-slate-400")} />
              <span className="font-semibold text-sm">I am a Student</span>
            </div>
            <div
               className={cn(
                "cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition-all duration-300",
                role === 'teacher' 
                    ? 'border-cyan-500 bg-cyan-50/80 text-cyan-700 shadow-md ring-1 ring-cyan-500' 
                    : 'border-slate-200/60 bg-white/40 text-slate-500 hover:bg-white/60 hover:border-slate-300'
              )}
              onClick={() => setRole('teacher')}
            >
              <School className={cn("h-8 w-8 transition-colors", role === 'teacher' ? "text-cyan-600" : "text-slate-400")} />
               <span className="font-semibold text-sm">I am a Teacher</span>
            </div>
          </div>

          {error && (
             <div className="mb-6 p-3 rounded-lg bg-red-50/80 border border-red-100 text-red-600 text-sm backdrop-blur-sm">
                 {error}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="John"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
              />
              <Input
                name="lastName"
                placeholder="Doe"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            
            <Input
              name="email"
              type="email"
              placeholder="name@example.com"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
            />

            <Input
                name="phoneNumber"
                placeholder="0901234567"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
            />

             {role === 'student' ? (
                 <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                     <Input
                        name="studentCode"
                        placeholder="SE123456"
                        label="Student Code"
                        value={formData.studentCode}
                        onChange={handleChange}
                        required
                        className="bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                      <Input
                        name="major"
                        placeholder="Software Engineering"
                        label="Major"
                        value={formData.major}
                        onChange={handleChange}
                        required
                        className="bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                 </div>
             ) : (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                    <Input
                        name="department"
                        placeholder="Computer Science"
                        label="Department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="bg-white border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                </div>
             )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-white/70 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
               </div>
            </div>

            <Button type="submit" className="w-full mt-6 h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 border-0" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-900/5 pt-6 pb-8">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
