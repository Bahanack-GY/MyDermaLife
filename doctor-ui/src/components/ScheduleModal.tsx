import { useState } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfToday } from 'date-fns';
import { CalendarPicker } from './CalendarPicker';
import { useTranslation } from 'react-i18next';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
}

export function ScheduleModal({ isOpen, onClose, patientName }: ScheduleModalProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState('Routine Checkup');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [step, setStep] = useState(1);

  if (!isOpen) return null;

  // Mock time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleConfirm = () => {
    // Logic to save appointment would go here
    alert(`Appointment confirmed for ${patientName} on ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`);
    onClose();
    // Reset state
    setSelectedTime(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-soft/50 flex items-center justify-between bg-brand-light/30">
          <div>
              <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-default" />
                {t('modals.schedule.title')}
              </h3>
              <p className="text-sm text-brand-muted">{t('modals.schedule.forPatient')} <span className="font-semibold text-brand-dark">{patientName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
                {/* Date Selection */}
                <div>
                    <h4 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand-default flex items-center justify-center text-xs">1</span>
                        {t('modals.schedule.selectDate')}
                    </h4>
                    <div className="bg-white border border-brand-soft/50 rounded-xl p-1 shadow-sm">
                        <CalendarPicker 
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            className="border-none shadow-none"
                        />
                    </div>
                </div>

                {/* Time Selection */}
                <div>
                    <h4 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand-default flex items-center justify-center text-xs">2</span>
                        {t('modals.schedule.selectTime')}
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                    "py-2 px-1 rounded-lg text-sm font-medium border transition-all",
                                    selectedTime === time 
                                        ? "bg-brand-dark text-white border-brand-dark shadow-md ring-2 ring-brand-light"
                                        : "bg-white text-gray-600 border-brand-soft/50 hover:border-brand-default hover:text-brand-default"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                    {!selectedTime && <p className="text-xs text-orange-500 mt-2 font-medium">{t('modals.schedule.pleaseSelectTime')}</p>}
                </div>

                {/* Type Selection */}
                <div>
                     <h4 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-light text-brand-default flex items-center justify-center text-xs">3</span>
                        {t('modals.schedule.consultationType')}
                    </h4>
                    <select 
                        className="w-full p-3 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 bg-white"
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value)}
                    >
                        <option>Routine Checkup</option>
                        <option>Follow-up Visit</option>
                        <option>Dermatoscopy</option>
                        <option>Laser Treatment</option>
                        <option>Urgent Consultation</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-soft/50 flex justify-end bg-gray-50/50">
            <button 
                onClick={onClose}
                className="px-6 py-2 text-brand-muted font-medium hover:text-brand-dark transition-colors mr-2"
            >
                {t('common.cancel')}
            </button>
            <button 
                onClick={handleConfirm}
                disabled={!selectedTime}
                className="px-6 py-2 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-default/20 flex items-center gap-2"
            >
                <Check className="w-4 h-4" />
                {t('modals.schedule.confirmBooking')}
            </button>
        </div>
      </div>
    </div>
  );
}
