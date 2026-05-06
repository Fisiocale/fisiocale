
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, Activity, Menu, X, Briefcase, Calendar, FileText, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storageService';
import { CompanySettings } from '../types';
import { Logo } from './Logo';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [companySettings, setCompanySettings] = useState<CompanySettings>({ name: 'Fisiocale', slogan: 'Prevenção e Tratamento da Dor' });

  useEffect(() => {
    setCompanySettings(StorageService.getCompanySettings());
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Agenda', path: '/agenda', icon: <Calendar size={20} /> },
    { name: 'Pacientes', path: '/patients', icon: <Users size={20} /> },
    { name: 'Financeiro', path: '/financials', icon: <DollarSign size={20} /> },
    { name: 'Serviços', path: '/services', icon: <Briefcase size={20} /> },
    { name: 'Parâmetros', path: '/settings', icon: <Settings size={20} /> },
  ];

  const getTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.name : 'FisioCale';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 flex flex-col justify-center border-b border-slate-100">
          <div className="flex items-center space-x-3">
            {companySettings.logoUrl ? (
              <img src={companySettings.logoUrl} alt="Logo" className="max-h-8 object-contain" />
            ) : (
              <Logo size={40} />
            )}
            <span className="text-3xl font-display font-medium tracking-tight text-teal-700 line-clamp-1">{companySettings.name}</span>
          </div>
          {companySettings.slogan && (
            <span className="text-[9px] text-fisiocale-text mt-1 tracking-widest uppercase font-medium line-clamp-1">{companySettings.slogan}</span>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600 font-medium'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center flex justify-between items-center">
          <span>v1.0.0</span>
          <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-teal-600 transition-colors">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileOpen(false)} />
      
      <aside className={`fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              {companySettings.logoUrl ? (
                <img src={companySettings.logoUrl} alt="Logo" className="max-h-6 object-contain" />
              ) : (
                <Logo size={28} />
              )}
              <span className="text-xl font-display font-medium tracking-tight text-teal-700 line-clamp-1">{companySettings.name}</span>
            </div>
            {companySettings.slogan && (
              <span className="text-[7px] text-fisiocale-text mt-0.5 tracking-widest uppercase font-medium line-clamp-1">{companySettings.slogan}</span>
            )}
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition-colors font-medium">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center">
             <button className="md:hidden mr-4 text-slate-600" onClick={() => setIsMobileOpen(true)}>
               <Menu size={24} />
             </button>
             <h1 className="text-2xl font-bold text-slate-800">{getTitle()}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex flex-col items-end mr-2 hidden sm:flex">
               <span className="text-sm font-bold text-slate-700">{user?.name}</span>
               <span className="text-xs text-slate-500">{user?.email}</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
               {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
             </div>
          </div>
        </header>
        
        <main className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
