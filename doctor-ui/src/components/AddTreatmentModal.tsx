import { useState } from 'react';
import { X, Check, Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: { name: string; dosage: string; frequency: string; startDate: string; prescribedBy?: string }) => void;
  isLoading?: boolean;
}

export function AddTreatmentModal({ isOpen, onClose, onSave, isLoading }: AddTreatmentModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    prescribedBy: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-brand-light/10">
          <h3 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
            <Pill className="w-5 h-5 text-brand-default" />
            {t('patientProfile.addTreatment')}
          </h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              {t('patientProfile.medicationName')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 transition-all"
              placeholder="e.g. Amoxicillin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                {t('patientProfile.dosage')}
              </label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 transition-all"
                placeholder="e.g. 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                {t('patientProfile.frequency')}
              </label>
              <input
                type="text"
                required
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 transition-all"
                placeholder="e.g. 3x daily"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-brand-dark mb-1">
               {t('patientProfile.startDate')}
             </label>
             <input
               type="date"
               required
               value={formData.startDate}
               onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
               className="w-full px-4 py-2 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 transition-all"
             />
          </div>
          
           <div>
             <label className="block text-sm font-medium text-brand-dark mb-1">
               {t('patientProfile.prescribedBy')} ({t('common.optional')})
             </label>
             <input
               type="text"
               value={formData.prescribedBy}
               onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
               className="w-full px-4 py-2 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 transition-all"
               placeholder="Dr. Name"
             />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-brand-muted hover:bg-gray-50 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors font-medium shadow-md shadow-brand-default/20 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
