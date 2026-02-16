import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Calendar as CalendarIcon } from 'lucide-react';

interface AddPhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (photo: { date: string; title: string; note: string; img: string }) => void;
}

export function AddPhotoModal({ isOpen, onClose, onSave }: AddPhotoModalProps) {
    const { t } = useTranslation();
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSave = () => {
        if (!date || !title || !imageUrl) {
            alert(t('profile.addPhotoModal.validationError'));
            return;
        }

        onSave({
            date,
            title,
            note,
            img: imageUrl
        });

        // Reset form
        setDate('');
        setTitle('');
        setNote('');
        setImageUrl('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-light/30">
                    <h3 className="text-lg font-serif font-semibold text-brand-dark flex items-center gap-2">
                        <Upload className="w-5 h-5 text-brand-default" />
                        {t('profile.addPhotoModal.title')}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Date Input */}
                    <div>
                        <label className="block text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">
                            {t('profile.addPhotoModal.date')} *
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 transition-all font-medium text-brand-dark"
                                required
                            />
                            <CalendarIcon className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">
                            {t('profile.addPhotoModal.titleLabel')} *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('profile.addPhotoModal.titlePlaceholder')}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 transition-all font-medium text-brand-dark"
                            required
                        />
                    </div>

                    {/* Image URL Input */}
                    <div>
                        <label className="block text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">
                            {t('profile.addPhotoModal.imageUrl')} *
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder={t('profile.addPhotoModal.imageUrlPlaceholder')}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 transition-all font-medium text-brand-dark"
                            required
                        />
                        {imageUrl && (
                            <div className="mt-2 aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Note Textarea */}
                    <div>
                        <label className="block text-sm font-bold text-brand-muted uppercase tracking-wider mb-2">
                            {t('profile.addPhotoModal.note')}
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('profile.addPhotoModal.notePlaceholder')}
                            rows={3}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-brand-default focus:ring-2 focus:ring-brand-default/20 transition-all font-medium text-brand-dark resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        {t('profile.addPhotoModal.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
                    >
                        {t('profile.addPhotoModal.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
