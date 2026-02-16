import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { consultationsApi } from '../api/features/consultations';

const questions = [
    {
        id: 1,
        question: "Quel est le motif principal de votre consultation ?",
        options: ["Acné", "Taches / Hyperpigmentation", "Chute de cheveux", "Eczéma / Démangeaisons", "Autre"]
    },
    {
        id: 2,
        question: "Depuis combien de temps avez-vous ces symptômes ?",
        options: ["Moins d'une semaine", "1 à 6 mois", "Plus d'un an", "C'est récurrent", "Autre"]
    },
    {
        id: 3,
        question: "Prenez-vous actuellement des médicaments ?",
        options: ["Aucun", "Antibiotiques", "Crèmes corticoïdes", "Traitement hormonal", "Autre"]
    }
];

export function PreConsultationForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const bookingData = location.state;

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [otherText, setOtherText] = useState("");
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    const handleOptionClick = (option: string) => {
        if (option === "Autre") {
            setIsOtherSelected(true);
            setAnswers(prev => ({ ...prev, [currentStep]: "" })); // Clear answer until typed
        } else {
            setIsOtherSelected(false);
            setOtherText("");
            setAnswers(prev => ({ ...prev, [currentStep]: option }));
        }
    };

    const handleNext = async () => {
        const answer = isOtherSelected ? otherText : answers[currentStep];
        
        if (isOtherSelected && !otherText.trim()) return;

        const finalAnswer = isOtherSelected ? `Autre: ${otherText}` : answer;
        const updatedAnswers = { ...answers, [currentStep]: finalAnswer };
        setAnswers(updatedAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setIsOtherSelected(false);
            setOtherText("");
        } else {
            // Submit booking
            if (!bookingData) {
                navigate('/');
                return;
            }

            setIsSubmitting(true);
            try {
                // Combine date and slot time
                const [hours, minutes] = bookingData.slot.split(':').map(Number);
                const scheduledDate = new Date(bookingData.scheduledDate);
                scheduledDate.setHours(hours, minutes, 0, 0);

                // Construct chief complaint from answers
                const chiefComplaint = Object.entries(updatedAnswers)
                    .map(([idx, ans]) => `${questions[parseInt(idx)].question}: ${ans}`)
                    .join('\n');

                const result = await consultationsApi.book({
                    doctorId: bookingData.doctorId,
                    consultationType: bookingData.consultationType,
                    scheduledDate: scheduledDate.toISOString(),
                    chiefComplaint
                });

                navigate('/booking-success', { 
                    state: { 
                        ...bookingData,
                        consultationNumber: result.consultationNumber
                    } 
                });
            } catch (error) {
                console.error('Final booking failed:', error);
                // Handle error
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-brand-default"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-right text-xs text-brand-muted mt-2 font-medium">Question {currentStep + 1}/{questions.length}</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6  min-h-[400px] flex flex-col relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                <h2 className="text-2xl font-serif font-bold text-brand-text mb-6 leading-tight">
                                    {currentQuestion.question}
                                </h2>

                                <div className="space-y-3 flex-1">
                                    {currentQuestion.options.map((option) => {
                                        const isSelected = !isOtherSelected && answers[currentStep] === option;
                                        const isThisOther = option === "Autre" && isOtherSelected;

                                        return (
                                            <div key={option}>
                                                <button
                                                    onClick={() => handleOptionClick(option)}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                                                        isSelected || isThisOther
                                                            ? "border-brand-default bg-brand-light/10 text-brand-dark"
                                                            : "border-gray-100 hover:border-brand-default/50 text-gray-600"
                                                    )}
                                                >
                                                    <span className="font-medium">{option}</span>
                                                    {(isSelected || isThisOther) && (
                                                        <div className="w-6 h-6 rounded-full bg-brand-default text-white flex items-center justify-center">
                                                            <Check className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </button>
                                                
                                                {/* Inline Other Input */}
                                                {isThisOther && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-2"
                                                    >
                                                        <textarea 
                                                            value={otherText}
                                                            onChange={(e) => setOtherText(e.target.value)}
                                                            placeholder="Veuillez préciser..."
                                                            className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-default focus:ring-1 focus:ring-brand-default resize-none bg-gray-50 text-brand-text"
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-6 mt-4 border-t border-gray-100">
                            <button
                                onClick={handleNext}
                                disabled={isSubmitting || (!answers[currentStep] && !isOtherSelected) || (isOtherSelected && !otherText.trim())}
                                className={cn(
                                    "w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                                    isSubmitting || (!answers[currentStep] && !isOtherSelected) || (isOtherSelected && !otherText.trim())
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-brand-default hover:bg-brand-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {currentStep === questions.length - 1 ? "Terminer" : "Suivant"}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
