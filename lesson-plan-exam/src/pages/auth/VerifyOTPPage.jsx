import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyOTPPage = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const { verifyAccount } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const res = await verifyAccount(email, otp);
            if (res.success) {
                toast.success('Account verified successfully! You can now login.');
                navigate('/login');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check your OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-50/50">
            <Card className="w-full max-w-md shadow-2xl border-white/40 bg-white/60 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center border-b border-slate-900/5 pb-6 mb-6">
                    <div className="mx-auto mb-3 p-3 bg-indigo-600/10 rounded-2xl w-fit ring-1 ring-indigo-600/20">
                        <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Verify your email</CardTitle>
                    <CardDescription className="text-slate-600">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-slate-900">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50/80 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="000000"
                                label="Verification Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-white/50"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-slate-500 text-center">
                                Entry the 6-digit code from your inbox
                            </p>
                        </div>

                        <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-indigo-500/20" isLoading={isLoading}>
                            Verify Account
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-4 border-t border-slate-900/5 pt-6 pb-8">
                    <button 
                        onClick={() => navigate('/register')}
                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        Use a different email address?
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default VerifyOTPPage;
