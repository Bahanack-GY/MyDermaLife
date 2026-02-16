import { useState, useEffect } from 'react';
import { X, Video, Bell, User, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';


import { useSendRecall } from '../api/features/agenda';

interface Appointment {
  id?: string;
  start: number;
  duration: number;
  patient: string;
  type: string;
  critical: boolean;
  isPatientOnline?: boolean;
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function ConsultationModal({ isOpen, onClose, appointment }: ConsultationModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reminderSent, setReminderSent] = useState(false);
  const sendRecallMutation = useSendRecall();

  // Use the real status from appointment. Ensure fallback to false.
  const isPatientOnline = appointment?.isPatientOnline || false;

  useEffect(() => {
    if (!isOpen) {
        setReminderSent(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const handleStartConsultation = () => {
    onClose();
    // Navigate with the consultation ID for WebRTC
    navigate(`/telemedicine/${appointment?.id || 'new'}`);
  };

  const handleSendReminder = () => {
    if (appointment.id) {
        setReminderSent(true);
        sendRecallMutation.mutate(appointment.id, {
            onSuccess: () => {
                 // Success feedback
            },
            onError: () => {
                setReminderSent(false);
            }
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-light/30">
          <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-default" />
            {t('modals.consultation.title')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
            
            {/* Patient Info */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 bg-brand-soft/50 rounded-full flex items-center justify-center mb-4 relative ring-4 ring-white shadow-lg">
                    {/* Placeholder Avatar */}
                    <User className="w-10 h-10 text-brand-default" />
                    <div className={cn(
                        "absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center",
                        isPatientOnline ? "bg-green-500" : "bg-gray-400"
                    )}>
                        {isPatientOnline ? <Wifi className="w-3 h-3 text-white" /> : <WifiOff className="w-3 h-3 text-white" />}
                    </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{appointment.patient}</h2>
                <p className="text-sm text-gray-500">{appointment.type}</p>
            </div>

            {/* Status Message */}
            <div className={cn(
                "mb-8 p-4 rounded-xl border flex items-center gap-3",
                isPatientOnline 
                    ? "bg-green-50 border-green-100 text-green-700" 
                    : "bg-gray-50 border-gray-100 text-gray-600"
            )}>
                <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isPatientOnline ? "bg-green-500" : "bg-gray-400"
                )}></div>
                <span className="font-medium text-sm">
                    {isPatientOnline 
                        ? t('modals.consultation.patientOnline')
                        : t('modals.consultation.patientOffline')
                    }
                </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button 
                    onClick={handleStartConsultation}
                    className="w-full py-3 bg-brand-default text-white rounded-xl font-semibold hover:bg-brand-dark transition-all shadow-lg shadow-brand-default/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Video className="w-5 h-5" />
                    {t('modals.consultation.startConsultation')}
                </button>
                
                {!isPatientOnline && (
                    <button 
                        onClick={handleSendReminder}
                        disabled={reminderSent || sendRecallMutation.isPending}
                        className="w-full py-3 bg-white border border-brand-soft text-brand-dark rounded-xl font-medium hover:bg-brand-light/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <Bell className="w-4 h-4" />
                        {reminderSent ? t('modals.consultation.reminderSent') : t('modals.consultation.sendReminder')}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
