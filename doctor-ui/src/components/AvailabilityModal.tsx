import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSave: (date: Date, slots: TimeSlot[], isRecurring: boolean) => void;
  initialSlots?: TimeSlot[];
  readOnly?: boolean;
}

export function AvailabilityModal({ isOpen, onClose, selectedDate, onSave, initialSlots = [], readOnly = false }: AvailabilityModalProps) {
  const { t } = useTranslation();
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [isRecurring, setIsRecurring] = useState(false);

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setSlots(initialSlots);
        setHasInteracted(false);
        setIsRecurring(false);
    }
  }, [isOpen, initialSlots]);

  if (!isOpen) return null;

  const handleAddSlot = () => {
    if (!newStart || !newEnd) return;
    
    // Simple validation
    if (newStart >= newEnd) {
        alert('End time must be after start time');
        return;
    }

    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      start: newStart,
      end: newEnd,
    };

    setSlots([...slots, newSlot].sort((a, b) => a.start.localeCompare(b.start)));
    setHasInteracted(true);
    setNewStart('');
    setNewEnd('');
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
    setHasInteracted(true);
  };

  const handleSave = () => {
    let finalSlots = slots;
    
    // Smart Save: If list is empty, user hasn't interacted (deleted/added), 
    // and inputs are present, assume they want the default slot.
    if (slots.length === 0 && !hasInteracted && newStart && newEnd) {
        finalSlots = [{
            id: Math.random().toString(36).substr(2, 9),
            start: newStart,
            end: newEnd
        }];
    }
    
    onSave(selectedDate, finalSlots, isRecurring);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-light/20">
          <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-default" />
            {readOnly ? t('modals.availability.viewTitle') : t('modals.availability.manageTitle')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
            <div className="mb-6 text-center">
                <p className="text-sm text-brand-muted uppercase tracking-wider font-medium">{t('modals.availability.selectedDate')}</p>
                <p className="text-2xl font-serif font-bold text-brand-dark mt-1">
                    {format(selectedDate, 'MMMM d, yyyy')}
                </p>
            </div>

            <div className="space-y-4">
                {!readOnly && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-xs font-semibold text-brand-muted uppercase block mb-3">{t('modals.availability.addNewSlot')}</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <input 
                                    type="time" 
                                    value={newStart}
                                    onChange={(e) => setNewStart(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="flex-1">
                                 <input 
                                    type="time" 
                                    value={newEnd}
                                    onChange={(e) => setNewEnd(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
                                />
                            </div>
                            <button 
                                onClick={handleAddSlot}
                                disabled={!newStart || !newEnd}
                                className="p-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-brand-muted uppercase">{t('modals.availability.currentSlots')}</label>
                        <span className="text-xs text-brand-default font-medium">{slots.length} {t('modals.availability.slotsConfigured')}</span>
                    </div>
                    
                    {slots.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                            <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">{t('modals.availability.noSlots')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {slots.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group hover:border-brand-default/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-brand-light/50 rounded text-brand-default">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-brand-text">
                                            {slot.start} - {slot.end}
                                        </span>
                                    </div>
                                    {!readOnly && (
                                        <button 
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex gap-3">
                <button 
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                    {readOnly ? t('common.close') : t('common.cancel')}
                </button>
                {!readOnly && (
                    <button 
                        onClick={handleSave}
                        className="flex-1 px-4 py-2.5 bg-brand-default text-white font-medium rounded-xl hover:bg-brand-dark shadow-lg shadow-brand-default/20 transition-all active:scale-[0.98]"
                    >
                        {t('modals.availability.saveAvailability')}
                    </button>
                )}
            </div>

            {!readOnly && (
                <div className="mt-4 flex items-center gap-2 px-1">
                    <input
                        type="checkbox"
                        id="applyToAll"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-brand-default border-gray-300 rounded focus:ring-brand-default accent-brand-default"
                    />
                    <label htmlFor="applyToAll" className="text-sm text-gray-600 font-medium cursor-pointer select-none">
                        {t('modals.availability.applyToAllDays', { dayName: t(`dashboard.days.${format(selectedDate, 'eee').toLowerCase()}`) })}
                    </label>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
