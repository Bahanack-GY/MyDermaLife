import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  startOfWeek, 
  endOfWeek,
  isToday
} from 'date-fns';
import { cn } from '../lib/utils';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function CalendarPicker({ selectedDate, onDateSelect, className, hasAvailability }: CalendarPickerProps & { hasAvailability?: (date: Date) => boolean }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  
  // Get days to display, including padding from prev/next months
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className={cn("p-4 rounded-xl border border-brand-soft/30 bg-brand-light/30", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-dark font-serif font-bold text-lg select-none">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={prevMonth}
            className="p-1 hover:bg-brand-default/10 rounded-full text-brand-dark transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 hover:bg-brand-default/10 rounded-full text-brand-dark transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="text-xs font-semibold text-brand-muted py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const hasSlots = hasAvailability?.(day);

          return (
            <button
              key={day.toString()}
              onClick={() => {
                onDateSelect(day);
                // If selecting a day from another month, switch view
                if (!isCurrentMonth) {
                  setCurrentMonth(day);
                }
              }}
              className={cn(
                "h-9 w-9 rounded-full text-sm flex items-center justify-center transition-all relative",
                !isCurrentMonth && "text-brand-muted/40",
                isCurrentMonth && !isSelected && "text-brand-text hover:bg-brand-default/10",
                isSelected && "bg-brand-default text-white font-medium hover:bg-brand-dark shadow-md shadow-brand-default/20",
                isDayToday && !isSelected && "text-brand-default font-semibold",
                hasSlots && !isSelected && "border-2 border-dotted border-brand-default"
              )}
            >
              {format(day, 'd')}
              {isDayToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-default"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
