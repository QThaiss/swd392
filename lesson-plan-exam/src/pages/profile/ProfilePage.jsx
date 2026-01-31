import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { User, Mail, Lock, Shield, Check, AlertCircle, Loader2, Camera, Calendar, Phone, School, LayoutDashboard } from 'lucide-react';

const ProfilePage = () => {
    const { user, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile Form State
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        schoolName: '',
        dateOfBirth: '',
        avatarUrl: '',
    });

    // Initialize state from user object when available
    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                schoolName: user.schoolName || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // Format for date input
                avatarUrl: user.avatarUrl || '',
            });
        }
    }, [user]);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const onUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await userApi.updateProfile(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const onChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await userApi.changePassword({
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get initials
    const getInitials = (name) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    // Role badge color helper
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'TEACHER': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'STUDENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header Section with Gradient Background */}
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                <div className="px-8 pb-6">
                    <div className="relative flex flex-col md:flex-row items-end -mt-12 mb-4 gap-6">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="h-full w-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden relative group">
                                    {profileData.avatarUrl ? (
                                        <img src={profileData.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-400">{getInitials(profileData.fullName)}</span>
                                    )}
                                    {/* Placeholder for avatar upload */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{profileData.fullName || 'User Name'}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role || 'MEMBER'}
                                </span>
                                <span className="text-slate-500 text-sm flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {user?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex gap-6 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                                activeTab === 'general' 
                                ? 'text-indigo-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            General Information
                            {activeTab === 'general' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                                activeTab === 'security' 
                                ? 'text-indigo-600' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Security & Password
                            {activeTab === 'security' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar - Quick Stats / Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Profile Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-white rounded-lg border border-slate-100 flex items-center gap-3 shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Member Since</p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-100 flex items-center gap-3 shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Account Status</p>
                                    <p className="text-sm font-medium text-emerald-600">Active & Verified</p>
                                </div>
                            </div>
                            {/* Role Specific Info */}
                            {user?.role === 'TEACHER' && (
                                <div className="p-3 bg-white rounded-lg border border-slate-100 flex items-center gap-3 shadow-sm">
                                    <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <School className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">School/Organization</p>
                                        <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]" title={profileData.schoolName}>
                                            {profileData.schoolName || 'Not set'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-2">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2 duration-300 ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    {activeTab === 'general' ? (
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle>Edit Personal Details</CardTitle>
                                <CardDescription>Ensure your information is up to date.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={onUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Full Name"
                                            name="fullName"
                                            value={profileData.fullName}
                                            onChange={handleProfileChange}
                                            icon={User}
                                            placeholder="e.g. John Doe"
                                        />
                                        <Input
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            disabled
                                            icon={Mail}
                                            className="bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                        <Input
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            icon={Phone}
                                            placeholder="+84..."
                                        />
                                        <Input
                                            label="Date of Birth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={profileData.dateOfBirth}
                                            onChange={handleProfileChange}
                                            icon={Calendar}
                                        />
                                        <div className="md:col-span-2">
                                            <Input
                                                label="School / Organization"
                                                name="schoolName"
                                                value={profileData.schoolName}
                                                onChange={handleProfileChange}
                                                icon={School}
                                                placeholder="e.g. FPT University"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
                                        <Button type="submit" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password to keep your account secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={onChangePassword} className="space-y-6 max-w-lg">
                                    <Input
                                        label="Current Password"
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        icon={Lock}
                                        placeholder="••••••••"
                                    />
                                    <div className="space-y-4 pt-2">
                                        <Input
                                            label="New Password"
                                            name="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            icon={Lock}
                                            placeholder="••••••••"
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            icon={Check}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
                                        <Button type="submit" variant="secondary" isLoading={isLoading} className="min-w-[140px]">
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
