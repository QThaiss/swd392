import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LayoutDashboard, FileText, User, LogOut, BookOpen, Settings, Database, Atom, Grid3X3 } from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all text-sm font-medium",
      active 
        ? "bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-100" 
        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
    )}
  >
    <Icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-slate-400")} />
    <span>{label}</span>
  </Link>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen relative">
      {/* Wireless/Floating Glass Sidebar */}
      <aside className="w-72 glass fixed inset-y-4 left-4 z-20 flex flex-col rounded-3xl overflow-hidden border border-white/40">
        <div className="p-6 flex items-center gap-3 border-b border-white/20 bg-white/10 backdrop-blur-md">
            <img src="/icon.svg" alt="CLS Logo" className="h-10 w-10 drop-shadow-md" />
            <div>
                 <h1 className="font-bold text-xl tracking-tight text-slate-900 leading-none">CLS</h1>
                 <p className="text-[10px] text-blue-600 font-bold tracking-wide">CHEMISTRY SYSTEM</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 opacity-70">Main Menu</p>
          <SidebarItem 
            to="/" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={location.pathname === '/'} 
          />
          <SidebarItem 
            to="/exams" 
            icon={FileText} 
            label="Exams" 
            active={location.pathname.startsWith('/exams')} 
          />
          <SidebarItem 
            to="/lesson-plans" 
            icon={BookOpen} 
            label="Lesson Plans" 
            active={location.pathname.startsWith('/lesson-plans')} 
          />
          <SidebarItem 
            to="/question-banks" 
            icon={Database} 
            label="Question Banks" 
            active={location.pathname.startsWith('/question-banks')} 
          />
          {(user?.role === 'TEACHER' || user?.role === 'teacher' || user?.role === 'ADMIN' || user?.role === 'admin') && (
            <SidebarItem 
              to="/exam-matrix" 
              icon={Grid3X3} 
              label="Exam Matrix" 
              active={location.pathname.startsWith('/exam-matrix')} 
            />
          )}
          {user?.role === 'ADMIN' && (
             <>
                 <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-8 opacity-70">Administration</p>
                 <SidebarItem 
                    to="/admin/users" 
                    icon={User} 
                    label="Users" 
                    active={location.pathname === '/admin/users'} 
                />
             </>
          )}

           <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-8 opacity-70">Resources</p>
           <SidebarItem 
            to="/resources/periodic-table" 
            icon={Atom} 
            label="Periodic Table" 
            active={location.pathname === '/resources/periodic-table'} 
          />

           <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-8 opacity-70">Settings</p>
           <SidebarItem 
            to="/profile" 
            icon={User} 
            label="Profile" 
            active={location.pathname === '/profile'} 
          />
        </div>

        <div className="p-4 border-t border-white/20 bg-white/20 backdrop-blur-md">
           <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-white/40 border border-white/30 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white ring-2 ring-blue-100">
                    <span className="text-blue-700 font-bold">{user?.fullName?.[0] || 'U'}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                </div>
           </div>
           <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/50" onClick={logout}>
             <LogOut className="h-4 w-4 mr-2" />
             Sign Out
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-6 relative z-0">
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Top Bar or Breadcrumb could go here */}
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
