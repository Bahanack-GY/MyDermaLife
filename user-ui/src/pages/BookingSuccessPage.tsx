import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function BookingSuccessPage() {
    const location = useLocation();
    const bookingData = location.state;

    if (!bookingData) {
        return <Navigate to="/" replace />;
    }

    const formattedDate = format(new Date(bookingData.scheduledDate), 'EEEE, d MMMM yyyy', { locale: fr });

    
    // Calculate end time (assuming 30 mins)
    const [startHour, startMinute] = bookingData.slot.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(startHour, startMinute + 30);
    const endTimeSlot = `${bookingData.slot} - ${format(endDate, 'HH:mm')}`;

    const handleDownloadReceipt = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(212, 163, 115); // brand-default color approximate
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("My Derma Life", 20, 25);
        
        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text("Reçu de Consultation", 20, 60);
        
        // Details
        doc.setFontSize(12);
        doc.setTextColor(100);
        
        const details = [
            { label: "N° Consultation", value: bookingData.consultationNumber || "Pending" },
            { label: "Médecin", value: bookingData.doctorName },
            { label: "Spécialité", value: bookingData.specialization || "Dermatologue" },
            { label: "Date", value: formattedDate },
            { label: "Heure", value: endTimeSlot },
            { label: "Lieu", value: bookingData.location || "En ligne" },
            { label: "Type", value: bookingData.consultationType === 'video' ? 'Vidéo Consultation' : 'En Cabinet' },
            { label: "Montant payé", value: `${bookingData.fee?.toLocaleString()} FCFA` },
            { label: "Statut", value: "Confirmé" }
        ];
        
        let y = 80;
        details.forEach(item => {
            doc.setFont("helvetica", "bold");
            doc.text(item.label + ":", 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(item.value, 60, y);
            y += 10;
        });
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Merci de votre confiance.", 20, 180);
        doc.text("Ce document est une preuve de paiement électronique.", 20, 185);
        
        doc.save(`recu_reservation_${bookingData.consultationNumber}.pdf`);
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-brand-light/30 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-[scaleIn_0.3s_ease-out]">
                    <div className="w-20 h-20 bg-brand-default text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    
                    <h1 className="text-2xl font-serif font-bold text-brand-text mb-2">Rendez-vous confirmé !</h1>
                    <p className="text-gray-500 mb-8">Votre consultation a été programmée avec succès.</p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-default border border-gray-100">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted uppercase font-bold tracking-wider">Médecin</p>
                                <p className="font-medium text-brand-text">{bookingData.doctorName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-default border border-gray-100">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted uppercase font-bold tracking-wider">Date</p>
                                <p className="font-medium text-brand-text first-letter:capitalize">{formattedDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-default border border-gray-100">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted uppercase font-bold tracking-wider">Heure</p>
                                <p className="font-medium text-brand-text">{endTimeSlot}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-default border border-gray-100">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted uppercase font-bold tracking-wider">N° Dossier</p>
                                <p className="font-medium text-brand-text font-mono">{bookingData.consultationNumber}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-default border border-gray-100">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted uppercase font-bold tracking-wider">Lieu</p>
                                <p className="font-medium text-brand-text">{bookingData.location || "En ligne"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleDownloadReceipt}
                            className="w-full py-3 rounded-xl border-2 border-brand-default text-brand-default font-bold hover:bg-brand-default hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Télécharger le reçu
                        </button>
                        <Link to="/profile/appointments" className="w-full py-3 rounded-xl bg-gray-100 text-brand-text font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                             <Calendar className="w-5 h-5" />
                             voir mes rendez vous
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
