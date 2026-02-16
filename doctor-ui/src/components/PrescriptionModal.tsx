import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Printer, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useCreatePrescription } from '../api/features/prescriptions';
import { toast } from 'sonner';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string; // Ensure ID is required
    name: string;
    age: number;
    gender: string;
  };
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

import { useProfile } from '../api/features/auth';

export function PrescriptionModal({ isOpen, onClose, patient }: PrescriptionModalProps) {
  const { t } = useTranslation();
  const { data: doctor } = useProfile();
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  
  const createPrescriptionMutation = useCreatePrescription();
  
  if (!isOpen) return null;

  const doctorName = doctor?.user?.profile 
    ? `${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`
    : 'Doctor';

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handlePrint = async () => {
    try {
        // Validate inputs
        if (!diagnosis) {
            toast.error(t('modals.prescription.errors.diagnosisRequired') || 'Diagnosis is required');
            return;
        }
        
        const validMedicines = medicines.filter(m => m.name.trim() !== '');
        if (validMedicines.length === 0) {
            toast.error(t('modals.prescription.errors.medicinesRequired') || 'At least one medicine is required');
            return;
        }

        // Create prescription via API
        await createPrescriptionMutation.mutateAsync({
            patientId: patient.id,
            diagnosis: diagnosis,
            medications: validMedicines.map(({ id, ...rest }) => rest), // Remove temp ID
            notes: '' // Optional notes if we add a field later
        });

        toast.success(t('modals.prescription.success') || 'Prescription saved successfully');
        
        // Trigger print after a short delay to ensure toast is seen or ensure saving happened
        setTimeout(() => {
            window.print();
            // Close modal after printing (optional, or let user close)
            // onClose(); 
        }, 500);
        
    } catch (error) {
        toast.error(t('modals.prescription.error') || 'Failed to save prescription');
        console.error('Prescription creation error:', error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b border-brand-soft/50 flex items-center justify-between bg-brand-light/30">
            <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
              <Pill className="w-5 h-5 text-brand-default" />
              {t('modals.prescription.title')}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
             <div className="flex gap-6 h-full flex-col lg:flex-row">
                 {/* Left: Input Form */}
                 <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                     <div className="bg-white p-4 rounded-xl border border-brand-soft/50 shadow-sm">
                         <label className="block text-sm font-medium text-brand-dark mb-1">{t('modals.prescription.diagnosis')}</label>
                         <input 
                            type="text" 
                            className="w-full p-2 rounded-lg border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20"
                            placeholder={t('modals.prescription.diagnosisPlaceholder')}
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                         />
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center justify-between">
                             <h4 className="font-semibold text-brand-dark">{t('modals.prescription.medications')}</h4>
                             <button 
                                onClick={addMedicine}
                                className="text-sm flex items-center gap-1 text-brand-default hover:text-brand-dark font-medium"
                             >
                                 <Plus className="w-4 h-4" /> {t('modals.prescription.addMedicine')}
                             </button>
                         </div>

                         {medicines.map((med, index) => (
                             <div key={med.id} className="bg-white p-4 rounded-xl border border-brand-soft/50 shadow-sm relative group">
                                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        onClick={() => removeMedicine(med.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Remove"
                                     >
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                 </div>
                                 <h5 className="text-xs font-bold text-brand-muted mb-3 uppercase tracking-wide">{t('modals.prescription.medicine')} {index + 1}</h5>
                                 <div className="grid grid-cols-2 gap-3 mb-3">
                                     <div className="col-span-2">
                                         <input 
                                            placeholder={t('modals.prescription.medicineName')}
                                            className="w-full p-2 text-sm border-b border-gray-200 focus:border-brand-default focus:outline-none"
                                            value={med.name}
                                            onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                                         />
                                     </div>
                                     <div>
                                         <input 
                                            placeholder={t('modals.prescription.dosage')}
                                            className="w-full p-2 text-sm border-b border-gray-200 focus:border-brand-default focus:outline-none"
                                            value={med.dosage}
                                            onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                                         />
                                     </div>
                                     <div>
                                         <input 
                                            placeholder={t('modals.prescription.frequency')}
                                            className="w-full p-2 text-sm border-b border-gray-200 focus:border-brand-default focus:outline-none"
                                            value={med.frequency}
                                            onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                                         />
                                     </div>
                                     <div>
                                         <input 
                                            placeholder={t('modals.prescription.duration')}
                                            className="w-full p-2 text-sm border-b border-gray-200 focus:border-brand-default focus:outline-none"
                                            value={med.duration}
                                            onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                                         />
                                     </div>
                                      <div>
                                         <input 
                                            placeholder={t('modals.prescription.notes')}
                                            className="w-full p-2 text-sm border-b border-gray-200 focus:border-brand-default focus:outline-none"
                                            value={med.instructions}
                                            onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
                                         />
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Right: Preview (Mock) */}
                 <div className="hidden lg:block w-[400px] border border-gray-200 rounded-xl bg-gray-100 p-4 overflow-y-auto">
                     <p className="text-center text-sm font-medium text-gray-500 mb-4">{t('modals.prescription.printPreview')}</p>
                     
                     <div className="bg-white shadow-md min-h-[500px] p-6 text-[10px] leading-relaxed relative isolate">
                         {/* Header */}
                         <div className="flex justify-between items-start border-b-2 border-brand-default/20 pb-4 mb-4">
                             <div>
                                 <h1 className="text-lg font-bold text-brand-dark">Dr. {doctorName}</h1>
                                 <p className="text-gray-500">{doctor?.specialization}, MD</p>
                                 <p className="text-gray-400 mt-1">Lic: {doctor?.licenseNumber}</p>
                             </div>
                             <div className="text-right">
                                  <div className="flex items-center justify-end gap-1 text-brand-default mb-1">
                                      <div className="w-8 h-8 rounded bg-brand-default/10 flex items-center justify-center">
                                          <Pill className="w-5 h-5" />
                                      </div>
                                  </div>
                                  <p className="font-bold text-brand-dark">MyDermaLife</p>
                             </div>
                         </div>
                         
                         {/* Patient Info */}
                         <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                             <div>
                                 <p><span className="text-gray-500">Patient:</span> <span className="font-semibold">{patient.name}</span></p>
                                 <p><span className="text-gray-500">Age/Gender:</span> {patient.age} / {patient.gender}</p>
                             </div>
                             <div className="text-right">
                                 <p><span className="text-gray-500">Date:</span> {format(new Date(), 'MMM d, yyyy')}</p>
                                 <p><span className="text-gray-500">Ref:</span> #{Math.floor(Math.random() * 10000)}</p>
                             </div>
                         </div>

                         {/* Diagnosis */}
                         <div className="mb-6">
                            <h3 className="font-bold text-brand-dark border-b border-gray-100 mb-1">Diagnosis</h3>
                            <p>{diagnosis || "..."}</p>
                         </div>

                         {/* Rx Symbol */}
                         <div className="text-2xl font-serif text-brand-default font-bold mb-2">Rx</div>

                         {/* Medications */}
                         <ul className="space-y-4">
                             {medicines.map((m) => (
                                 <li key={m.id} className="relative pl-4 border-l-2 border-brand-light">
                                     <div className="flex justify-between font-bold text-brand-dark text-xs">
                                         <span>{m.name || "Medicine Name"}</span>
                                         <span>{m.dosage}</span>
                                     </div>
                                     <div className="text-gray-600 text-[9px] mt-0.5">
                                         {m.frequency} • {m.duration}
                                     </div>
                                     {m.instructions && <div className="text-gray-400 italic mt-0.5">{m.instructions}</div>}
                                 </li>
                             ))}
                         </ul>

                         {/* Footer */}
                         <div className="absolute bottom-6 left-6 right-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                             <div className="text-[8px] text-gray-400">
                                 <p>123 Rue de la Santé, Bonanjo</p>
                                 <p>Douala, Cameroun</p>
                                 <p>+237 600 00 00 00</p>
                             </div>
                              <div className="text-center">
                                  {doctor?.signature && (
                                      <img src={doctor.signature} alt="Signature" className="h-8 mb-1 mx-auto object-contain" />
                                  )}
                                  <div className="border-b border-gray-300 w-24 mb-1"></div>
                                  <p className="text-[8px] font-bold text-brand-dark">Doctor's Signature</p>
                              </div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          <div className="p-4 border-t border-brand-soft/50 flex justify-end bg-gray-50/50">
            <button 
                onClick={handlePrint}
                className="px-6 py-2 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors shadow-lg shadow-brand-default/20 flex items-center gap-2"
            >
                <Printer className="w-4 h-4" />
                {createPrescriptionMutation.isPending ? 'Saving...' : t('modals.prescription.printPrescription')}
            </button>
          </div>
        </div>
      </div>

import { createPortal } from 'react-dom';

// ... (previous imports)

// Inside the component return
      {/* Hidden Print Section - Rendered via Portal */}
      {createPortal(
        <div className="hidden print:block print:w-full print:h-screen print:absolute print:top-0 print:left-0 bg-white p-8 z-[9999] print-portal">
             {/* Header */}
             <div className="flex justify-between items-start border-b-2 border-brand-default pb-6 mb-8">
                 <div className="space-y-1">
                     <h1 className="text-3xl font-serif font-bold text-brand-dark">Dr. {doctorName}</h1>
                     <p className="text-gray-600 font-medium tracking-wide">{doctor?.specialization?.toUpperCase()}, MD</p>
                     <p className="text-brand-muted text-sm">Lic: {doctor?.licenseNumber}</p>
                 </div>
                 <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 text-brand-default mb-2">
                          <Pill className="w-8 h-8" />
                          <span className="text-xl font-bold tracking-tight text-brand-dark">MyDermaLife</span>
                      </div>
                      <div className="text-right text-xs text-gray-500 space-y-0.5">
                          <p>123 Rue de la Santé, Bonanjo</p>
                          <p>Douala, Cameroun</p>
                      </div>
                 </div>
             </div>
             
             {/* Patient Info */}
             <div className="bg-brand-light/10 p-6 rounded-xl border border-brand-soft/20 flex justify-between items-center mb-10">
                 <div className="space-y-1">
                     <p><span className="text-brand-muted uppercase text-xs font-bold tracking-wider">Patient Name</span></p>
                     <p className="text-xl font-medium text-brand-dark">{patient.name}</p>
                     <p className="text-sm text-gray-500">{patient.age} years • {patient.gender}</p>
                 </div>
                 <div className="text-right space-y-1">
                     <p><span className="text-brand-muted uppercase text-xs font-bold tracking-wider">Date</span></p>
                     <p className="text-lg font-medium text-brand-dark">{format(new Date(), 'MMMM d, yyyy')}</p>
                     <p className="text-sm text-gray-500">#{Math.floor(Math.random() * 10000)}</p>
                 </div>
             </div>
 
             {/* Diagnosis */}
             {diagnosis && (
               <div className="mb-8">
                  <span className="text-brand-muted uppercase text-xs font-bold tracking-wider block mb-1">Diagnosis</span>
                  <p className="text-lg text-gray-800">{diagnosis}</p>
               </div>
             )}
 
             {/* Rx Symbol */}
             <div className="text-5xl font-serif text-brand-default font-bold mb-6">Rx</div>
 
             {/* Medications */}
             <div className="space-y-6">
                 {medicines.map((m) => (
                     <div key={m.id} className="relative pl-6 border-l-4 border-brand-light">
                         <div className="flex justify-between items-baseline mb-1">
                             <h3 className="font-bold text-xl text-brand-dark">{m.name}</h3>
                             <span className="font-semibold text-lg text-gray-700">{m.dosage}</span>
                         </div>
                         <div className="text-gray-600 mb-1">
                             <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-sm">{m.frequency}</span>
                             <span className="mx-2 text-gray-300">|</span>
                             <span>{m.duration}</span>
                         </div>
                         {m.instructions && <div className="text-gray-500 italic mt-1">"{m.instructions}"</div>}
                     </div>
                 ))}
             </div>
 
             {/* Footer */}
             <div className="fixed bottom-0 left-0 right-0 p-12 flex justify-between items-end">
                 <div className="text-sm text-gray-400">
                     <p className="font-medium text-brand-dark mb-1">Dr. {doctorName}</p>
                     <p>Generated by MyDermaLife</p>
                 </div>
                  <div className="text-center w-64">
                      {/* Signature line */}
                      {doctor?.signature && (
                          <img src={doctor.signature} alt="Signature" className="h-16 mb-2 mx-auto object-contain" />
                      )}
                      <div className="border-b-2 border-gray-300 w-full mb-2"></div>
                      <p className="text-sm font-bold text-brand-dark uppercase tracking-widest">Doctor's Signature</p>
                  </div>
             </div>
        </div>,
        document.body
      )}
    </>
  );
}
