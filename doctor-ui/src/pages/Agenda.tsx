import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, AlertTriangle, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addHours, addDays, subDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { CalendarPicker } from '../components/CalendarPicker';
import { ConsultationModal } from '../components/ConsultationModal';
import { useTranslation } from 'react-i18next';

import { useDailyAppointments } from '../api/features/agenda';

export function Agenda() {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const { data: consultations, isLoading } = useDailyAppointments(selectedDate);
  // Get the appropriate locale based on current language
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const timeSlots = Array.from({ length: 24 }, (_, i) => addHours(new Date().setHours(0, 0, 0, 0), i));

  const appointments = consultations?.map(c => {
      const dateString = c.scheduledDate || c.date || new Date().toISOString();
      const date = new Date(dateString);
      const patient = c.patient as any; // Cast to avoid type mismatch with Patient interface
      const patientName = patient?.profile 
        ? `${patient.profile.firstName} ${patient.profile.lastName}` 
        : (patient?.email || 'Unknown Patient');

      return {
          id: c.id,
          start: date.getHours(),
          startDate: date, 
          duration: (c.durationMinutes || 30) / 60,
          patient: patientName,
          type: c.consultationType || 'General',
          critical: false, 
          isPatientOnline: c.isPatientOnline,
          status: c.status
      };
  }) || [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Logic to fetch appointments for this date would go here
  };

  const handleAppointmentClick = (appt: any) => {
    setSelectedAppointment(appt);
    setIsConsultationModalOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('agenda.title')}</h1>
           <p className="text-brand-muted">{t('agenda.subtitle')}</p>
        </div>
        <div className="flex bg-white rounded-lg border border-brand-soft p-1">
             <button 
                 onClick={() => setViewMode('calendar')}
                 className={cn(
                     "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                     viewMode === 'calendar' ? "bg-brand-light text-brand-dark shadow-sm" : "text-brand-muted hover:text-brand-dark"
                 )}
             >
                 <CalendarIcon className="w-4 h-4" />
                 {t('agenda.calendarView')}
             </button>
             <button 
                 onClick={() => setViewMode('list')}
                 className={cn(
                     "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                     viewMode === 'list' ? "bg-brand-light text-brand-dark shadow-sm" : "text-brand-muted hover:text-brand-dark"
                 )}
             >
                 <List className="w-4 h-4" />
                 {t('agenda.listView')}
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50 h-fit">
            <h3 className="text-lg font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-default" />
                {t('agenda.selectDate')}
            </h3>
            
            <CalendarPicker 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
            
            <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-light border border-brand-default"></span>
                    <span className="text-sm text-brand-text">{t('agenda.consultation')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-soft border border-brand-dark"></span>
                    <span className="text-sm text-brand-text">{t('agenda.treatment')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-muted/20 border border-brand-muted"></span>
                    <span className="text-sm text-brand-text">{t('agenda.noShowRisk')}</span>
                </div>
            </div>
        </div>

        {/* View Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-brand-soft/50 overflow-hidden flex flex-col h-[700px]">
             <div className="p-4 border-b border-brand-soft/50 flex items-center justify-between bg-brand-light/20">
                 <div className="flex items-center gap-4">
                     <h3 className="text-lg font-serif font-semibold text-brand-dark">{format(selectedDate, 'EEEE, d MMM yyyy', { locale: dateLocale })}</h3>
                     
                 </div>
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setSelectedDate(prev => subDays(prev, 1))}
                        className="p-1.5 hover:bg-brand-soft/50 rounded-lg"
                     >
                         <ChevronRight className="w-5 h-5 rotate-180" />
                     </button>
                     <button 
                        onClick={() => setSelectedDate(prev => addDays(prev, 1))} 
                        className="p-1.5 hover:bg-brand-soft/50 rounded-lg"
                     >
                         <ChevronRight className="w-5 h-5" />
                     </button>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 relative">
                 {isLoading ? (
                     <div className="flex h-full items-center justify-center text-brand-muted">
                         Loading schedule...
                     </div>
                 ) : viewMode === 'list' ? (
                     // List View
                     <div className="space-y-3">
                         {appointments.length > 0 ? (
                             appointments.sort((a,b) => a.startDate.getTime() - b.startDate.getTime()).map((appt, i) => (
                                 <div 
                                    key={i} 
                                    onClick={() => handleAppointmentClick(appt)}
                                    className="p-4 rounded-xl border border-brand-soft/50 hover:bg-brand-light/20 transition-all cursor-pointer flex items-center justify-between group"
                                 >
                                     <div className="flex items-center gap-4">
                                         <div className="p-3 bg-brand-light/50 rounded-lg text-brand-dark font-medium text-sm w-16 text-center">
                                             {format(appt.startDate, 'HH:mm')}
                                         </div>
                                         <div>
                                             <h4 className="font-semibold text-brand-dark text-base flex items-center gap-2">
                                                 {appt.patient}
                                                 {appt.critical && (
                                                     <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                         <AlertTriangle className="w-3 h-3" />
                                                         Risk
                                                     </span>
                                                 )}
                                             </h4>
                                             <div className="flex items-center gap-3 mt-1">
                                                 <span className="text-sm text-brand-muted flex items-center gap-1">
                                                     <Clock className="w-3.5 h-3.5" />
                                                     {appt.duration * 60} mins
                                                 </span>
                                                 <span className="text-xs px-2 py-0.5 rounded-full bg-brand-default/10 text-brand-default border border-brand-default/20">
                                                     {appt.type}
                                                 </span>
                                                 {appt.status !== 'completed' && appt.isPatientOnline && (
                                                     <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold border border-green-200">
                                                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                         En ligne
                                                     </span>
                                                 )}
                                                 {appt.status === 'completed' && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-bold border border-gray-200">
                                                        {t('common.completed', 'Terminée')}
                                                    </span>
                                                )}
                                             </div>
                                         </div>
                                     </div>
                                     <div>
                                         <button className="px-4 py-2 bg-brand-soft/30 text-brand-dark rounded-lg text-sm font-medium group-hover:bg-brand-default group-hover:text-white transition-colors">
                                            {t('common.view')}
                                         </button>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <div className="flex flex-col items-center justify-center py-12 text-brand-muted">
                                 <CalendarIcon className="w-12 h-12 mb-3 text-brand-soft" />
                                 <p>{t('agenda.noAppointments')}</p>
                             </div>
                         )}
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {timeSlots.map((time, i) => {
                         const hour = new Date(time).getHours();
                         const appt = appointments.find(a => a.start === hour);
                         
                         return (
                            <div key={i} className="flex group min-h-[80px]">
                                <div className="w-20 text-right pr-4 pt-1">
                                    <span className="text-sm font-medium text-brand-muted block">{format(time, 'HH:mm')}</span>
                                </div>
                                <div className="flex-1 relative border-t border-brand-soft/30 pt-1">
                                    {appt ? (
                                        <div 
                                        onClick={() => handleAppointmentClick(appt)}
                                        className={cn(
                                            "absolute top-0 inset-x-0 p-3 rounded-lg  transition-all hover:shadow-md cursor-pointer",
                                            appt.critical 
                                              ? "bg-brand-muted/10 border-brand-muted hover:bg-brand-muted/20" 
                                              : "bg-brand-light border-brand-default hover:bg-brand-soft/50"
                                        )}
                                        style={{ height: `${appt.duration * 100}%` }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-brand-dark text-sm flex items-center gap-2">
                                                        {appt.patient}
                                                        {appt.critical && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                                                    </h4>
                                                    <p className="text-xs text-brand-muted mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {appt.duration * 60} mins - {appt.type}
                                                        {appt.status !== 'completed' && appt.isPatientOnline && (
                                                            <span className="ml-2 flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold border border-green-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                En ligne
                                                            </span>
                                                        )}
                                                        {appt.status === 'completed' && (
                                                            <span className="ml-2 flex items-center gap-1 text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-bold border border-gray-200">
                                                                {t('common.completed', 'Terminée')}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {appt.status !== 'completed' && (
                                                        <button className="p-1 bg-white rounded shadow-sm text-xs border border-brand-soft/50 text-brand-dark hover:bg-brand-default hover:text-white transition-colors">
                                                            {t('agenda.startConsult')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {appt.critical && (
                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-muted/80 font-medium">
                                                    <span>{t('agenda.aiAlert')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200 border-dashed flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            
                                        </div>
                                    )}
                                </div>
                            </div>
                         )
                     })}
                 </div>
                 )}
             </div>
        </div>
      </div>

      <ConsultationModal 
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}
