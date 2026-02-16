import { Phone, Mail, Calendar, Eye, CalendarPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PatientsTableProps {
  patients: any[];
  onViewDetails: (id: string) => void;
  onSchedule: (patient: any) => void;
}

export function PatientsTable({ patients, onViewDetails, onSchedule }: PatientsTableProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-brand-light/30 border-b border-brand-soft/50">
                <tr>
                    <th className="p-4 font-serif font-semibold text-brand-dark">{t('patients.patient')}</th>
                    <th className="p-4 font-serif font-semibold text-brand-dark">{t('patients.contactInfo')}</th>
                    <th className="p-4 font-serif font-semibold text-brand-dark hidden md:table-cell">{t('patients.status')}</th>
                    <th className="p-4 font-serif font-semibold text-brand-dark hidden lg:table-cell">{t('patients.lastVisit')}</th>
                    <th className="p-4 font-serif font-semibold text-brand-dark text-right">{t('patients.actions')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-brand-soft/30">
                {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-brand-light/10 transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-soft/50 overflow-hidden">
                                    <img 
                                        src={patient.photoUrl || `https://ui-avatars.com/api/?name=${patient.name}&background=d4a373&color=fff`} 
                                        alt={patient.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-dark">{patient.name}</h4>
                                    <p className="text-xs text-brand-muted">{patient.age} yrs • {patient.gender}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-3 h-3 text-brand-muted" />
                                    <span>{patient.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-3 h-3 text-brand-muted" />
                                    <span>{patient.email}</span>
                                </div>
                            </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                            <span className={`text-sm font-medium ${
                                patient.status === 'Active' 
                                    ? 'text-green-700' 
                                    : 'text-gray-600'
                            }`}>
                                {patient.status}
                            </span>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-sm text-gray-600">
                             <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-muted" />
                                {patient.lastVisit}
                             </div>
                        </td>
                        <td className="p-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                 <button 
                                    onClick={() => onViewDetails(patient.id)}
                                    className="p-2 text-brand-muted hover:text-brand-default hover:bg-brand-light rounded-lg transition-colors tooltip"
                                    title="View Profile"
                                 >
                                     <Eye className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => onSchedule(patient)}
                                    className="p-2 text-brand-muted hover:text-brand-default hover:bg-brand-light rounded-lg transition-colors"
                                    title="Book Appointment"
                                 >
                                     <CalendarPlus className="w-4 h-4" />
                                 </button>
                             </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}
