import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const res = await login(formData.email, formData.password);
    setIsLoading(false);
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-[1000px] grid lg:grid-cols-2 overflow-hidden p-0 gap-0 border-0 shadow-2xl bg-white/30 backdrop-blur-xl">
            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center p-12 relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-center">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 p-4">
                        <img src="/icon.svg" alt="App Logo" className="h-40 w-40 drop-shadow-2xl filter brightness-110" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Chemistry Lecture System</h1>
                    <h2 className="text-xl font-medium mb-6 leading-tight text-blue-50 opacity-90">
                        Lesson Plan & Exam Management
                    </h2>
                    <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
                        Manage exams and students seamlessly with our comprehensive platform.
                    </p>
                </div>
                {/* Abstract Shapes */}
                 <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-400 rounded-full blur-3xl opacity-30 mix-blend-overlay"></div>
                 <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-30 mix-blend-overlay"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col justify-center p-8 lg:p-12 bg-white/60 backdrop-blur-md">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500">Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50/80 text-red-600 border border-red-100 text-sm backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
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
                        </div>
                        <div className="space-y-2">
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
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <div className="flex justify-end pt-1">
                                 <Link to="#" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Forgot password?</Link>
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 border-0" isLoading={isLoading}>
                        Sign In
                        </Button>
                    </form>
                    
                    <div className="text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
                        Create account
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
};

export default LoginPage;
