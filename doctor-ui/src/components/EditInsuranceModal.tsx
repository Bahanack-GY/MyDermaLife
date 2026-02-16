import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Loader2 } from 'lucide-react';

interface EditInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNumber: string;
  onSave: (newNumber: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditInsuranceModal({ isOpen, onClose, currentNumber, onSave, isLoading }: EditInsuranceModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(currentNumber);

  // Update local state when prop changes, but only if modal is just opening effectively
  // or user hasn't typed yet? Better to just init from prop
  React.useEffect(() => {
    setValue(currentNumber || '');
  }, [currentNumber, isOpen]); 

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-brand-dark">
            {t('patientProfile.enterInsuranceNumber')}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
              placeholder="e.g. INS-123456789"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-brand-default hover:bg-brand-dark text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
