import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Search, Loader2, Play, Pause, AlertCircle, Shield, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserList = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTeacherData, setNewTeacherData] = useState({
        firstName: '', lastName: '', email: '', password: '', phoneNumber: '', schoolName: '', dateOfBirth: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getAllAccounts({ size: 100 }); 
            if (response.success) {
                let data = response.data;
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                     if (Array.isArray(data.items)) data = data.items;
                     else if (Array.isArray(data.content)) data = data.content;
                }
                
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    setUsers([]);
                }
            }
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (account) => {
        try {
            const response = await adminApi.toggleStatus(account.id);
            if (response.success) {
                setUsers(prev => prev.map(u => 
                    u.id === account.id ? { ...u, isActive: !u.isActive } : u
                ));
            }
        } catch (err) {
            setError('Failed to update user status');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const payload = {
                ...newTeacherData,
                fullName: `${newTeacherData.firstName} ${newTeacherData.lastName}`,
                // Ensure date format or other requirements
            };
            const response = await adminApi.createTeacher(payload);
            if (response.success) {
                setIsCreateModalOpen(false);
                fetchUsers(); // Refresh list
                setNewTeacherData({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '', schoolName: '', dateOfBirth: '' });
            } else {
                setError(response.message || 'Failed to create teacher');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create teacher');
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    }) : [];

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            case 'TEACHER': return 'bg-indigo-100 text-indigo-700';
            case 'STUDENT': return 'bg-slate-100 text-slate-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Shield className="h-12 w-12 mb-4 text-slate-300" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage user accounts and system access.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Create Teacher
                </Button>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <CardTitle>All Users</CardTitle>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select 
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="ALL">All Roles</option>
                                <option value="TEACHER">Teachers</option>
                                <option value="STUDENT">Students</option>
                                <option value="ADMIN">Admins</option>
                            </select>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">School</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredUsers.map((account) => (
                                        <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                                        {account.avatarUrl ? (
                                                            <img src={account.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                                                        ) : (
                                                            <span className="text-indigo-600 font-bold text-xs">
                                                                {account.fullName?.[0] || account.email?.[0] || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{account.fullName || 'No Name'}</p>
                                                        <p className="text-xs text-slate-500">{account.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(account.role)}`}>
                                                    {account.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {account.schoolName ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <GraduationCap className="h-3 w-3 text-slate-400" />
                                                        {account.schoolName}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                                    account.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${account.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    {account.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleStatus(account)}
                                                    title={account.isActive ? 'Deactivate' : 'Activate'}
                                                    disabled={account.role === 'ADMIN'} 
                                                >
                                                    {account.isActive ? (
                                                        <Pause className="h-4 w-4 text-amber-600" />
                                                    ) : (
                                                        <Play className="h-4 w-4 text-emerald-600" />
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Teacher Modal - Simple implementation using fixed position overlay */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Create New Teacher</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                        </div>
                        <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    placeholder="First Name" 
                                    value={newTeacherData.firstName} 
                                    onChange={e => setNewTeacherData({...newTeacherData, firstName: e.target.value})}
                                    required
                                />
                                <Input 
                                    placeholder="Last Name" 
                                    value={newTeacherData.lastName} 
                                    onChange={e => setNewTeacherData({...newTeacherData, lastName: e.target.value})}
                                    required
                                />
                            </div>
                            <Input 
                                type="email" placeholder="Email Address" 
                                value={newTeacherData.email} 
                                onChange={e => setNewTeacherData({...newTeacherData, email: e.target.value})}
                                required
                            />
                             <Input 
                                type="tel" placeholder="Phone Number" 
                                value={newTeacherData.phoneNumber} 
                                onChange={e => setNewTeacherData({...newTeacherData, phoneNumber: e.target.value})}
                                required
                            />
                            <Input 
                                type="password" placeholder="Password" 
                                value={newTeacherData.password} 
                                onChange={e => setNewTeacherData({...newTeacherData, password: e.target.value})}
                                required
                            />
                            <Input 
                                placeholder="School Name" 
                                value={newTeacherData.schoolName} 
                                onChange={e => setNewTeacherData({...newTeacherData, schoolName: e.target.value})}
                                required
                            />
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Date of Birth</label>
                                <Input 
                                    type="date"
                                    value={newTeacherData.dateOfBirth} 
                                    onChange={e => setNewTeacherData({...newTeacherData, dateOfBirth: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit" isLoading={createLoading}>Create Account</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
