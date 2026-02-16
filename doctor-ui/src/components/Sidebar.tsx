import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  ClipboardList,
  LogOut,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useLogout } from '../api/features/auth';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      }
    });
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), to: '/' },
    { icon: Calendar, label: t('sidebar.agenda'), to: '/agenda' },
    { icon: Clock, label: t('sidebar.availability'), to: '/availability' },
    { icon: Users, label: t('sidebar.patients'), to: '/patients' },
    { icon: ClipboardList, label: t('sidebar.reports'), to: '/reports' },
    { icon: User, label: t('sidebar.profile', 'Profile'), to: '/profile' },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-white border-r border-brand-soft/50 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b border-brand-soft/50 overflow-hidden whitespace-nowrap",
        isCollapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <h1 className="font-serif text-2xl font-bold text-brand-dark animate-fade-in">
            {t('sidebar.appName')}<span className="text-brand-default">{t('sidebar.appNameHighlight')}</span>
          </h1>
        )}
        <button
            onClick={toggleSidebar}
            className={cn(
                "p-2 rounded-lg hover:bg-brand-soft/50 text-brand-text transition-colors",
                isCollapsed && "mx-auto" 
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-3 rounded-lg group transition-colors duration-200",
                    isActive
                      ? "bg-brand-default text-white shadow-md shadow-brand-default/20"
                      : "text-brand-text hover:bg-brand-soft/50",
                    isCollapsed ? "justify-center" : ""
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 transition-colors shrink-0" />
                <span className={cn(
                  "ms-3 font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isCollapsed ? "w-0 opacity-0 ms-0" : "w-auto opacity-100"
                )}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-brand-soft/50 space-y-2">
        <button 
          onClick={toggleLanguage}
          className={cn(
            "flex items-center w-full p-3 text-brand-text rounded-lg hover:bg-brand-soft/50 transition-colors group",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? (i18n.language === 'fr' ? 'English' : 'Français') : undefined}
        >
          <Languages className="w-5 h-5 shrink-0" />
          <span className={cn(
            "ms-3 font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
            isCollapsed ? "w-0 opacity-0 ms-0" : "w-auto opacity-100"
          )}>
            {i18n.language === 'fr' ? 'English' : 'Français'}
          </span>
        </button>
        
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={cn(
            "flex items-center w-full p-3 text-brand-text rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group disabled:opacity-50",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? t('sidebar.logout') : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={cn(
            "ms-3 font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
            isCollapsed ? "w-0 opacity-0 ms-0" : "w-auto opacity-100"
          )}>
            {t('sidebar.logout')}
          </span>
        </button>
      </div>
    </aside>
  );
}
