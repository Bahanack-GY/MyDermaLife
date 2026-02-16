import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export interface MedicalEventFormData {
    title: string;
    description: string;
    date: string;
    type: string;
}

interface AddMedicalEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MedicalEventFormData) => void;
    initialData?: MedicalEventFormData;
    title?: string;
}

export function AddMedicalEventModal({ isOpen, onClose, onSubmit, initialData, title }: AddMedicalEventModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<MedicalEventFormData>(
        initialData || {
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'checkup'
        }
    );

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-brand-soft/50">
                    <h2 className="text-xl font-serif font-bold text-brand-dark">
                        {title || t('patientProfile.addMedicalEvent')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-brand-light/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-brand-muted" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                            {t('patientProfile.eventTitle')}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-brand-soft/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-default/50"
                            placeholder={t('patientProfile.eventTitle')}
                            required
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                            {t('patientProfile.eventDate')}
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 border border-brand-soft/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-default/50"
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                            {t('patientProfile.eventType')}
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 border border-brand-soft/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-default/50"
                        >
                            <option value="checkup">Checkup</option>
                            <option value="vaccination">Vaccination</option>
                            <option value="surgery">Surgery</option>
                            <option value="treatment">Treatment</option>
                            <option value="diagnosis">Diagnosis</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">
                            {t('patientProfile.eventDescription')}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-brand-soft/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-default/50 min-h-[100px]"
                            placeholder={t('patientProfile.eventDescription')}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-brand-soft/50 rounded-lg text-brand-dark hover:bg-brand-light/20 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
