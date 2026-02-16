import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../api/features/auth';

export function Header() {
  const { t } = useTranslation();
  const { data: doctor, isLoading } = useProfile();

  const firstName = doctor?.user?.profile?.firstName || 'Doctor';
  const lastName = doctor?.user?.profile?.lastName || '';
  const fullName = `Dr. ${firstName} ${lastName}`;
  const profilePhoto = doctor?.user?.profile?.profilePhoto;

  return (
    <header className="fixed top-0 right-0 left-64 z-30 flex h-16 items-center justify-between bg-white/80 backdrop-blur-md px-6 border-b border-brand-soft/50 transition-all">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-serif font-semibold text-brand-dark">{t('header.doctorPortal')}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-brand-muted" />
            </div>
            <input 
                type="text" 
                className="block w-full p-2 pl-10 text-sm text-brand-text border border-brand-soft rounded-full bg-brand-light/50 focus:ring-brand-default focus:border-brand-default outline-none transition-all placeholder:text-brand-muted" 
                placeholder={t('header.searchPatient')}
            />
        </div>

        <Link to="/notifications" className="relative p-2 text-brand-text hover:bg-brand-soft/50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>
        
        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-brand-soft hover:bg-brand-soft/20 transition-colors p-2 rounded-lg -mr-2">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-brand-dark">
                    {isLoading ? '...' : fullName}
                </p>
                <p className="text-xs text-brand-muted">{doctor?.specialization || t('header.dermatologist')}</p>
            </div>
            <img 
                className="w-9 h-9 rounded-full object-cover border-2 border-brand-default p-0.5" 
                src={profilePhoto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop"} 
                alt="Doctor Profile" 
            />
        </Link>
      </div>
    </header>
  );
}
