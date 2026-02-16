import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X, Shield, CheckCircle, MapPin, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDoctors, useBookedSlots } from '../hooks/useDoctors';
import type { Doctor } from '../api/types';
import { generateTimeSlots } from '../lib/slots';


interface BookingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId?: string | null;
    preselectedDoctor?: Doctor;
    preselectedDate?: Date | null;
    preselectedSlot?: string | null;
    preselectedType?: 'video' | 'cabinet';
}

export function BookingWizard({ isOpen, onClose, doctorId, preselectedDoctor, preselectedDate, preselectedSlot, preselectedType }: BookingWizardProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language.startsWith('fr') ? fr : enUS;

    const navigate = useNavigate();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(doctorId || null);
    
    // Fetch doctors for the list selection
    const { data: doctorsList, isLoading: isDoctorsLoading, error: doctorsError } = useDoctors();

    // Reset internal state when prop changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDoctorId(doctorId || null);
            if (preselectedDate) setSelectedDate(preselectedDate);
            if (preselectedSlot) setSelectedSlot(preselectedSlot);
        }
    }, [isOpen, doctorId, preselectedDate, preselectedSlot]);

    const [step, setStep] = useState(1);
    
    // Reset step when doctor selection changes (if starting from scratch)
    useEffect(() => {
        if (isOpen) {
            if (preselectedDate && preselectedSlot && selectedDoctorId) {
                setStep(3); // Jump to checkout if everything is preselected
            } else if (!selectedDoctorId) {
                setStep(0); // 0 = Select Doctor
            } else {
                setStep(1);
            }
        }

    }, [selectedDoctorId, isOpen, preselectedDate, preselectedSlot]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(preselectedDate || null);
    const { data: bookedSlots } = useBookedSlots(selectedDoctorId || undefined, selectedDate);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlot || null);
    const [visitType] = useState<'video' | 'cabinet'>(preselectedType || 'video');
    const [paymentMethod, setPaymentMethod] = useState<'om' | 'momo' | 'card'>('om');
    const [isSubmitting] = useState(false);
    
    // Payment details state
    const [mobileNumber, setMobileNumber] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Resolve the selected doctor object
    const doctor = selectedDoctorId 
        ? (preselectedDoctor && preselectedDoctor.id === selectedDoctorId 
            ? preselectedDoctor 
            : doctorsList?.find(d => d.id === selectedDoctorId))
        : null;

    // Helper to get doctor details safely
    const getDoctorImage = (d: Doctor) => d.user.profile.profilePhoto || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400";
    const getDoctorName = (d: Doctor) => `Dr. ${d.user.profile.firstName} ${d.user.profile.lastName}`;
    const getDoctorLocation = (d: Doctor) => d.user.profile.city || 'Unknown Location';

    if (!isOpen) return null;

    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: dateLocale });
    const endDate = endOfWeek(monthEnd, { locale: dateLocale });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const today = startOfToday();

    // Dynamic slots based on availability
    // Note: generateTimeSlots needs to be imported
    const slots = doctor ? generateTimeSlots(doctor.availability, selectedDate, bookedSlots || []) : [];

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => {
        if (step === 3 && preselectedDate && preselectedSlot) {
             onClose(); // If we started at checkout, back closes the wizard? Or goes back to modify?
             // Let's assume user might want to modify, so go to step 2.
             setStep(2);
        } else if (step === 1 && !doctorId) {
            // If we are at Date selection but started without a doctor, go back to doctor selection
            setSelectedDoctorId(null);
            setStep(0);
        } else {
            setStep(s => s - 1);
        }
    };

    const isPaymentValid = () => {
        if (paymentMethod === 'card') {
            return cardNumber.length > 0 && cardExpiry.length > 0 && cardCvc.length > 0;
        }
        return mobileNumber.length > 0;
    };

    const handleBooking = async () => {
        if (!selectedDoctorId || !selectedDate || !selectedSlot || !doctor) return;
        
        // Pass booking data to pre-consultation form
        onClose();
        navigate('/pre-consultation', { 
            state: { 
                doctorId: selectedDoctorId,
                doctorName: getDoctorName(doctor),
                doctorImage: getDoctorImage(doctor),
                specialization: doctor.specialization,
                location: getDoctorLocation(doctor),
                consultationType: visitType === 'cabinet' ? 'in_person' : 'video',
                scheduledDate: selectedDate.toISOString(),
                slot: selectedSlot,
                fee: visitType === 'cabinet' ? doctor.consultationFee : (doctor.videoConsultationFee || doctor.consultationFee)
            } 
        });
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-8 px-8 relative">
            {/* Connecting Line */}
            <div className="absolute top-4 left-10 right-10 h-[2px] bg-gray-100 z-0">
                <div 
                    className="h-full bg-brand-default transition-all duration-500 ease-in-out"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
            </div>

            {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center relative z-10 bg-white">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                        step >= s 
                            ? "bg-brand-default border-brand-default text-white" 
                            : "bg-white border-gray-200 text-gray-400"
                    )}>
                        {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    <span className={cn(
                        "text-xs mt-2 font-medium transition-colors duration-300 absolute top-8 w-20 text-center",
                        step >= s ? "text-brand-text" : "text-gray-300"
                    )}>
                        {s === 1 ? t('booking.steps.date') : s === 2 ? t('booking.steps.time') : t('booking.steps.payment')}
                    </span>
                </div>
            ))}
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full h-dvh sm:w-[500px] sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-3xl flex flex-col shadow-2xl animate-[slideUp_0.3s_ease-out]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-serif font-bold text-brand-text">{t('booking.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {step > 0 && renderStepIndicator()}

                    {/* Step 0: Select Doctor */}
                    {step === 0 && (
                         <div className="animate-[fadeIn_0.3s_ease-out]">
                            <h3 className="font-bold text-lg text-brand-text mb-6">{t('booking.selectDoctor')}</h3>

                            {isDoctorsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-brand-light border-t-brand-default rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-brand-muted">{t('common.loading', 'Loading doctors...')}</p>
                                    </div>
                                </div>
                            ) : doctorsError ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <X className="w-8 h-8 text-red-500" />
                                        </div>
                                        <h4 className="font-bold text-brand-text mb-2">{t('booking.error.title', 'Unable to load doctors')}</h4>
                                        <p className="text-brand-muted text-sm mb-4">{t('booking.error.message', 'Please try again later or contact support.')}</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors"
                                        >
                                            {t('common.retry', 'Retry')}
                                        </button>
                                    </div>
                                </div>
                            ) : !doctorsList || doctorsList.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <p className="text-brand-muted">{t('booking.noDoctors', 'No doctors available at the moment.')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {doctorsList.map(d => (
                                        <div
                                            key={d.id}
                                            onClick={() => setSelectedDoctorId(d.id)}
                                            className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl hover:border-brand-default hover:shadow-md transition-all cursor-pointer bg-white"
                                        >
                                            <img src={getDoctorImage(d)} alt={getDoctorName(d)} className="w-16 h-16 rounded-xl object-cover" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-brand-text">{getDoctorName(d)}</h4>
                                                    <div className="flex items-center gap-1 text-xs font-bold text-brand-default bg-brand-light/20 px-2 py-0.5 rounded-full">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        {d.rating || 'N/A'}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-brand-muted truncate">{d.specialization}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                                    <MapPin className="w-3 h-3" />
                                                    {getDoctorLocation(d)}
                                                </div>
                                                <div className="mt-2 text-sm font-bold text-brand-text">
                                                    {d.consultationFee} FCFA
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                         </div>
                    )}

                    {/* Step 1: Date */}
                    {step === 1 && doctor && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-brand-text capitalize">
                                    {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 mb-2">
                                {(t('booking.weekDays', { returnObjects: true }) as string[]).map((d, i) => (
                                    <div key={i} className="text-center text-xs text-brand-muted font-medium py-2">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {calendarDays.map((day, i) => {
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isCurrent = isSameMonth(day, currentMonth);
                                    const isPast = isBefore(day, today);
                                    
                                    // Check availability
                                    const daySlots = doctor ? generateTimeSlots(doctor.availability, day, []) : [];
                                    const isAvailable = daySlots.length > 0;
                                    const isDisabled = isPast || !isAvailable;

                                    return (
                                        <button
                                            key={i}
                                            disabled={isDisabled}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "h-10 rounded-xl text-sm font-medium transition-all relative",
                                                isDisabled 
                                                    ? "text-gray-200 cursor-not-allowed opacity-50" 
                                                    : !isCurrent 
                                                        ? "text-gray-300"
                                                        : isSelected 
                                                            ? "bg-brand-default text-white shadow-lg scale-105" 
                                                            : "hover:bg-brand-light/50 text-brand-text"
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Time */}
                    {step === 2 && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                             <h3 className="font-bold text-lg text-brand-text mb-6">
                                {t('booking.availabilityFor', { date: selectedDate && format(selectedDate, 'd MMMM', { locale: dateLocale }) })}
                             </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => {
                                            setSelectedSlot(slot);
                                            nextStep();
                                        }}
                                        className={cn(
                                            "py-3 rounded-xl text-sm font-medium border transition-all",
                                            selectedSlot === slot
                                                ? "bg-brand-default text-white border-brand-default shadow-md"
                                                : "bg-white border-gray-200 text-brand-text hover:border-brand-default"
                                        )}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && doctor && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                            <div className="bg-brand-light/30 p-4 rounded-2xl mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={getDoctorImage(doctor)} alt={getDoctorName(doctor)} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-brand-text">{getDoctorName(doctor)}</p>
                                        <p className="text-xs text-brand-muted">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('booking.summary.date')}</span>
                                        <span className="font-medium">{selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: dateLocale })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t('booking.summary.time')}</span>
                                        <span className="font-medium">{selectedSlot}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                        <span className="font-bold text-brand-text">{t('booking.summary.total')}</span>
                                        <span className="font-bold text-brand-text">{doctor.consultationFee} FCFA</span>
                                    </div>
                                </div>
                            </div>

                            <h4 className="font-bold text-brand-text mb-4">{t('booking.paymentMethod.title')}</h4>
                            <div className="space-y-4">
                                {[
                                    { id: 'om', label: t('booking.paymentMethod.om'), icon: '🟠', placeholder: t('booking.paymentMethod.omDetails') },
                                    { id: 'momo', label: t('booking.paymentMethod.momo'), icon: '🟡', placeholder: t('booking.paymentMethod.momoDetails') },
                                    { id: 'card', label: t('booking.paymentMethod.card'), icon: '💳', placeholder: t('booking.paymentMethod.cardPlaceholder') },
                                ].map((method) => (
                                    <div key={method.id} className={cn(
                                        "border rounded-xl transition-all overflow-hidden",
                                        paymentMethod === method.id ? "border-brand-default bg-brand-light/10" : "border-gray-200"
                                    )}>
                                        <button
                                            onClick={() => setPaymentMethod(method.id as any)}
                                            className="w-full flex items-center gap-3 p-4"
                                        >
                                            <span className="text-xl">{method.icon}</span>
                                            <span className="font-medium text-brand-text">{method.label}</span>
                                            <div className={cn(
                                                "ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                paymentMethod === method.id ? "border-brand-default" : "border-gray-300"
                                            )}>
                                                {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-default" />}
                                            </div>
                                        </button>
                                        
                                        {/* Inline Input Fields */}
                                        {paymentMethod === method.id && (
                                            <div className="px-4 pb-4 animate-[fadeIn_0.3s_ease-out]">
                                                {method.id === 'card' ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder={t('booking.paymentMethod.cardPlaceholder')}
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(e.target.value)}
                                                            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default bg-white"
                                                            autoFocus
                                                        />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                placeholder={t('booking.paymentMethod.expiryPlaceholder')}
                                                                value={cardExpiry}
                                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default bg-white"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder={t('booking.paymentMethod.cvcPlaceholder')}
                                                                value={cardCvc}
                                                                onChange={(e) => setCardCvc(e.target.value)}
                                                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default bg-white"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="tel"
                                                        placeholder={method.placeholder}
                                                        value={mobileNumber}
                                                        onChange={(e) => setMobileNumber(e.target.value)}
                                                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default bg-white"
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                <Shield className="w-4 h-4 text-brand-default" />
                                {t('booking.securityNote')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 bg-white md:rounded-b-3xl">
                    <div className="flex gap-4">
                        {(step > 1 || (step === 1 && !doctorId)) && (
                            <button 
                                onClick={prevStep}
                                className="px-6 py-3 rounded-xl font-medium text-brand-text bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                {t('booking.back')}
                            </button>
                        )}
                        {step > 0 && (
                            <button
                                onClick={() => {
                                    if (step === 1 && selectedDate) nextStep();
                                    else if (step === 2 && selectedSlot) nextStep();
                                    else if (step === 3) {
                                        handleBooking();
                                    }
                                }}
                                disabled={
                                    isSubmitting ||
                                    (step === 1 && !selectedDate) || 
                                    (step === 2 && !selectedSlot) ||
                                    (step === 3 && !isPaymentValid()) // Use new validation function
                                }
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2",
                                    isSubmitting || (step === 1 && !selectedDate) || (step === 2 && !selectedSlot) || (step === 3 && !isPaymentValid())
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-brand-default hover:bg-brand-dark"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    step === 3 ? t('booking.confirmPayment') : t('booking.continue')
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
