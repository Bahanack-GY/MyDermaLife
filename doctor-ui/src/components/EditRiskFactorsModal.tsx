import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, AlertTriangle, Loader2 } from 'lucide-react';

interface EditRiskFactorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFactors: { familyHistoryCancer: boolean; sunExposure: string } | undefined;
  onSave: (factors: { familyHistoryCancer: boolean; sunExposure: string }) => Promise<void>;
  isLoading?: boolean;
}

export function EditRiskFactorsModal({ isOpen, onClose, currentFactors, onSave, isLoading }: EditRiskFactorsModalProps) {
  const { t } = useTranslation();
  
  const [familyHistory, setFamilyHistory] = useState(false);
  const [sunExposure, setSunExposure] = useState('Low');

  useEffect(() => {
    if (isOpen && currentFactors) {
      setFamilyHistory(currentFactors.familyHistoryCancer || false);
      setSunExposure(currentFactors.sunExposure || 'Low');
    }
  }, [isOpen, currentFactors]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ familyHistoryCancer: familyHistory, sunExposure });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-orange-50/50">
          <h3 className="font-semibold text-brand-dark flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {t('patientProfile.riskFactors')}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.checked)}
                className="w-5 h-5 text-brand-default rounded border-gray-300 focus:ring-brand-default"
              />
              <span className="text-sm font-medium text-brand-dark">Family History of Skin Cancer</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Sun Exposure Level
              </label>
              <select
                value={sunExposure}
                onChange={(e) => setSunExposure(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
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
