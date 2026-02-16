import type { DoctorAvailability } from '../api/types';

export function generateTimeSlots(
    availability: DoctorAvailability[] | undefined,
    selectedDate: Date | null,
    bookedSlots: string[] = []
): string[] {
    if (!availability || !selectedDate) {
        return [];
    }

    const dayOfWeek = selectedDate.getDay();
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    // 1. Check for ANY specific-date matches first (overrides recurring)
    const specificEntries = availability.filter(
        a => a.date === dateString
    );

    let dayAvailabilities: DoctorAvailability[] = [];

    if (specificEntries.length > 0) {
        // If specific entries exist, use them ONLY.
        // Filter for those that are actually available.
        dayAvailabilities = specificEntries.filter(a => a.isAvailable);
    } else {
        // 2. Fall back to recurring matches (date is null/undefined) for this dayOfWeek
        dayAvailabilities = availability.filter(a => !a.date && a.dayOfWeek === dayOfWeek && a.isAvailable);
    }

    if (dayAvailabilities.length === 0) {
        return [];
    }

    const slots: string[] = [];

    // Simple parser "HH:mm" -> minutes from midnight
    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    dayAvailabilities.forEach(avail => {
        const startMinutes = parseTime(avail.startTime);
        const endMinutes = parseTime(avail.endTime);
        const interval = 30; // 30 minutes

        for (let time = startMinutes; time < endMinutes; time += interval) {
            const h = Math.floor(time / 60);
            const m = time % 60;
            const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            // Avoid duplicates if overlapping ranges exist
            if (!slots.includes(timeString)) {
                slots.push(timeString);
            }
        }
    });

    // Sort slots chronologically and filter
    return slots.sort().filter(slot => {
        // Filter out booked slots
        if (bookedSlots.includes(slot)) {
            return false;
        }

        // If selected date is today, filter out past times
        const now = new Date();
        const isToday = selectedDate.getDate() === now.getDate() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear();

        if (isToday) {
            const [h, m] = slot.split(':').map(Number);
            const slotTime = new Date(selectedDate);
            slotTime.setHours(h, m, 0, 0);
            return slotTime > now;
        }
        return true;
    });
}
