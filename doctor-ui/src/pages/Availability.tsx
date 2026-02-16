import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Trash2, Clock, RefreshCw, CalendarDays } from 'lucide-react';
import { isBefore, startOfDay, format } from 'date-fns';
import { AvailabilityModal } from '../components/AvailabilityModal';
import { CalendarPicker } from '../components/CalendarPicker';
import { useTranslation } from 'react-i18next';
import { useMyAvailability, useUpdateMyAvailability, useDeleteMyAvailabilitySlot } from '../api/features/doctors';

const DAY_NAMES_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function Availability() {
  const { t } = useTranslation();
  // Debug log
  console.log('Availability component rendering');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: availabilitySlots = [], isLoading } = useMyAvailability();
  const { mutate: updateAvailability, isPending: isSaving } = useUpdateMyAvailability();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteMyAvailabilitySlot();

  const isPastDate = isBefore(selectedDate, startOfDay(new Date()));

  // Get slots for the selected date's day of week (0-6)
  const getSlotsForDate = (date: Date) => {
      if (!date || !Array.isArray(availabilitySlots)) return [];
      
      const dateString = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      // Check for specific date slots first (Override)
      const specificSlots = availabilitySlots.filter(slot => slot.date === dateString);
      if (specificSlots.length > 0) {
          return specificSlots.map(slot => ({
              id: slot.id || Math.random().toString(),
              start: slot.startTime ? String(slot.startTime).slice(0, 5) : '', 
              end: slot.endTime ? String(slot.endTime).slice(0, 5) : ''
          }));
      }

      // Fallback to recurring slots if no specific slots exist
      // Exclude slots that have a date (which are specific exceptions for other days)
      return availabilitySlots
          .filter(slot => !slot.date && Number(slot.dayOfWeek) === dayOfWeek)
          .map(slot => ({
              id: slot.id || Math.random().toString(),
              start: slot.startTime ? String(slot.startTime).slice(0, 5) : '', 
              end: slot.endTime ? String(slot.endTime).slice(0, 5) : ''
          }));
  };

  const handleSaveAvailability = (date: Date, newDaySlots: any[], isRecurring: boolean) => {
      const dayOfWeek = date.getDay();
      const dateString = format(date, 'yyyy-MM-dd');
      
      let finalSlots = [...availabilitySlots];

      if (isRecurring) {
          // Recurring Update:
          // 1. Remove existing RECURRING slots for this dayOfWeek (slots without date)
          finalSlots = finalSlots.filter(slot => slot.date || Number(slot.dayOfWeek) !== dayOfWeek);
          
          // 2. Add new Recurring slots (no date)
          // Note: We KEEP specific slots for other dates (and even this date if they exist, specific overrides recurring)
          const multipleNewSlots = newDaySlots.map(slot => ({
              dayOfWeek,
              startTime: String(slot.start).slice(0, 5),
              endTime: String(slot.end).slice(0, 5),
              isAvailable: true
          }));
          finalSlots = [...finalSlots, ...multipleNewSlots];
      } else {
          // Specific Date Update:
          // 1. Remove existing SPECIFIC slots for this date
          finalSlots = finalSlots.filter(slot => slot.date !== dateString);
          
          // 2. Add new Specific slots
          const specificNewSlots = newDaySlots.map(slot => ({
              dayOfWeek,
              date: dateString,
              startTime: String(slot.start).slice(0, 5),
              endTime: String(slot.end).slice(0, 5),
              isAvailable: true
          }));
          
          finalSlots = [...finalSlots, ...specificNewSlots];
      }
      
      
      // Sanitize slots to match DTO strictly (remove id, dayName, etc.)
      const sanitizedSlots = finalSlots.map(slot => ({
        dayOfWeek: Number(slot.dayOfWeek),
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true
      }));

      updateAvailability({ slots: sanitizedSlots as any }, {
          onSuccess: () => {
              toast.success(t('availability.success.saved', 'Availability saved successfully'));
          },
          onError: (error) => {
              console.error('Failed to save availability', error);
              toast.error(t('errors.generic', 'Failed to save availability')); 
          }
      });
  };

  const handleDeleteSlot = (slotId: string) => {
      if (!confirm(t('availability.deleteConfirm'))) return;
      
      deleteSlot(slotId, {
          onSuccess: () => {
              toast.success(t('availability.deleteSuccess'));
          },
          onError: (error) => {
              console.error('Failed to delete availability slot', error);
              toast.error(t('errors.generic', 'Failed to delete availability slot'));
          }
      });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Check if a specific date has availability slots
  const checkAvailability = (date: Date) => {
      if (!date || !Array.isArray(availabilitySlots)) return false;
      const dayOfWeek = date.getDay();
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Check for specific date match
      const hasSpecific = availabilitySlots.some(slot => slot.date === dateString);
      if (hasSpecific) return true;

      // Check for recurring match (exclude specific overrides for other dates)
      return availabilitySlots.some(slot => !slot.date && Number(slot.dayOfWeek) === dayOfWeek);
  };

  /* const handleGlobalSettings = () => {
    alert("Global availability settings (e.g. weekly patterns) would open here.");
  }; */

  // Separate recurring and specific-date slots
  const recurringSlots = availabilitySlots.filter(slot => !slot.date);
  
  // Filter specific slots: show only future dates or today
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const specificSlots = availabilitySlots.filter(slot => {
      if (!slot.date) return false;
      return slot.date >= todayStr;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('availability.title')}</h1>
           <p className="text-brand-muted">{t('availability.subtitle')}</p>
        </div>
        {/* <button 
            onClick={handleGlobalSettings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-soft rounded-lg text-brand-dark hover:bg-brand-light transition-colors shadow-sm"
        >
            <Settings className="w-4 h-4" />
            <span>{t('availability.globalSettings')}</span>
        </button> */}
      </div>

      <div className="flex flex-col items-center">
        {/* Centered Calendar for Availability Focus */}
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-brand-soft/50">
            <h3 className="text-lg font-serif font-semibold text-brand-dark mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand-default" />
                {t('availability.selectDateToManage')}
            </h3>
            
            {isLoading ? (
                <div className="flex justify-center p-10 text-brand-muted">Loading availability...</div>
            ) : (
                <CalendarPicker 
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  className="border-none bg-transparent p-0"
                  hasAvailability={checkAvailability}
                />
            )}
            
            <div className="mt-8 pt-6 border-t border-brand-soft/30 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-light border border-brand-default"></span>
                    <span className="text-sm text-brand-text">{t('availability.available')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-soft border border-brand-dark"></span>
                    <span className="text-sm text-brand-text">{t('availability.partiallyBooked')}</span>
                </div>
                <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></span>
                    <span className="text-sm text-brand-text">{t('availability.pastUnavailable')}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Current Availability Slots List */}
      <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
        <h3 className="text-lg font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-default" />
            {t('availability.currentSlots')}
        </h3>

        {availabilitySlots.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('availability.noSlotsYet')}</p>
            </div>
        ) : (
            <div className="space-y-5">
                {/* Recurring Slots */}
                {recurringSlots.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5" />
                            {t('availability.recurringSlots')}
                        </h4>
                        <div className="space-y-2">
                            {recurringSlots.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between p-3 bg-brand-light/20 border border-brand-soft/40 rounded-lg group hover:border-brand-default/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-brand-light rounded text-brand-default">
                                            <RefreshCw className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-brand-dark">
                                                {t('availability.everyDay', { day: t(`availability.daysOfWeek.${DAY_NAMES_KEYS[slot.dayOfWeek]}`) })}
                                            </span>
                                            <span className="text-sm text-brand-muted ml-2">
                                                {String(slot.startTime).slice(0, 5)} - {String(slot.endTime).slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSlot(slot.id!)}
                                        disabled={isDeleting}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Specific Date Slots */}
                {specificSlots.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {t('availability.specificSlots')}
                        </h4>
                        <div className="space-y-2">
                            {specificSlots.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg group hover:border-brand-default/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 ">
                                            <CalendarDays className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-brand-dark">
                                                {slot.date}
                                            </span>
                                            <span className="text-sm text-brand-muted ml-2">
                                                {String(slot.startTime).slice(0, 5)} - {String(slot.endTime).slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSlot(slot.id!)}
                                        disabled={isDeleting}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      <AvailabilityModal 
        key={selectedDate.toISOString()}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onSave={handleSaveAvailability}
        initialSlots={getSlotsForDate(selectedDate)}
        readOnly={isPastDate || isSaving}
      />
    </div>
  );
}
