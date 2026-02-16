import { Phone, Mail, Calendar, MoreHorizontal } from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface PatientCardProps {
  patient: any;
  onViewDetails: (id: string) => void;
  onSchedule: (patient: any) => void;
}

export function PatientCard({ patient, onViewDetails, onSchedule }: PatientCardProps) {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 p-6 flex flex-col group hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
             <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-brand-light">
                <img 
                    src={patient.photoUrl || `https://ui-avatars.com/api/?name=${patient.name}&background=d4a373&color=fff`} 
                    alt={patient.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
             </div>
             {patient.status === 'Active' && (
                 <span className="absolute bottom-1 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></span>
             )}
        </div>
        <button className="p-2 text-brand-muted hover:text-brand-dark hover:bg-brand-light rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-serif font-bold text-brand-dark group-hover:text-brand-default transition-colors">{patient.name}</h3>
        <p className="text-sm text-brand-muted">{patient.age} years • {patient.gender}</p>
      </div>

      <div className="space-y-2 mb-6 flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-brand-default" />
            <span>{patient.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-brand-default" />
            <span className="truncate">{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-brand-default" />
            <span>{t('patientCard.lastVisit')}: {new Date(patient.lastVisit).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-brand-soft/30 flex gap-2">
        <button 
            onClick={() => onViewDetails(patient.id)}
            className="flex-1 py-2 bg-brand-light text-brand-dark rounded-lg text-sm font-medium hover:bg-brand-default hover:text-white transition-colors"
        >
            {t('patientCard.viewDetails')}
        </button>
        <button 
            onClick={() => onSchedule(patient)}
            className="flex-1 py-2 bg-white border border-brand-soft text-brand-muted rounded-lg text-sm font-medium hover:border-brand-default hover:text-brand-default transition-colors"
        >
            {t('patientCard.schedule')}
        </button>
      </div>
    </div>
  );
}
