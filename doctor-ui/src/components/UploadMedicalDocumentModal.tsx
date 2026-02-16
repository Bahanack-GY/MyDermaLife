import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useUploadMedicalDocument } from '../api/features/patients';
import { toast } from 'sonner';

interface UploadMedicalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

const DOCUMENT_CATEGORIES = [
  'exam_result',
  'derma_exam',
  'correspondence',
  'biopsy',
  'allergy_test',
  'other',
];

export function UploadMedicalDocumentModal({ isOpen, onClose, patientId }: UploadMedicalDocumentModalProps) {
  const { t } = useTranslation();
  const uploadMutation = useUploadMedicalDocument();
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('exam_result');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error(t('common.requiredFields'));
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        patientId,
        data: {
          file,
          category,
          title,
          description,
          metadata: {}
        }
      });
      toast.success(t('common.uploadSuccess'));
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setCategory('exam_result');
    } catch (error) {
      toast.error(t('common.uploadError'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-serif font-semibold text-brand-dark">
            {t('patientProfile.uploadDocument')}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              File
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
              file ? 'border-brand-default/50 bg-brand-light/10' : 'border-gray-200 hover:border-brand-default/30'
            }`}>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png,.webp" 
                onChange={handleFileChange}
                className="hidden" 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 w-full flex flex-col items-center">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-brand-default" />
                    <span className="text-sm font-medium text-brand-dark break-all">{file.name}</span>
                    <span className="text-xs text-brand-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Click to upload</span>
                    <span className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default"
              placeholder="e.g. Blood Test Results"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default bg-white"
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{t(`documentCategories.${cat}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="w-full py-2.5 bg-brand-default hover:bg-brand-dark text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
