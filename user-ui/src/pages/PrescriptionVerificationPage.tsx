import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { API_BASE_URL, API_ENDPOINTS } from '../api/config';

interface PrescriptionVerification {
  isValid: boolean;
  id: string;
  date: string;
  doctorName: string;
  patientName: string;
  pdfUrl: string;
}

export function PrescriptionVerificationPage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');
  const [data, setData] = useState<PrescriptionVerification | null>(null);

  useEffect(() => {
    if (!id) return;

    apiClient.get(API_ENDPOINTS.prescriptions.verify(id))
      .then((data: any) => {
        setData(data);
        setStatus('valid');
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setStatus('invalid');
        } else {
          console.error(err);
          setStatus('error');
        }
      });
  }, [id]);

  const handleDownload = () => {
    if (!data) return;
    window.open(`${API_BASE_URL}${API_ENDPOINTS.prescriptions.download(data.id)}`, '_blank');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-default animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header Status */}
        <div className={`p-6 text-center ${status === 'valid' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${status === 'valid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {status === 'valid' ? (
              <ShieldCheck className="w-10 h-10" />
            ) : (
              <AlertTriangle className="w-10 h-10" />
            )}
          </div>
          <h1 className={`text-2xl font-serif font-bold ${status === 'valid' ? 'text-green-800' : 'text-red-800'}`}>
            {status === 'valid' ? 'Valid Prescription' : 'Verification Failed'}
          </h1>
          <p className={`mt-2 text-sm ${status === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
            {status === 'valid' 
              ? 'This document has been verified by MyDermaLife.' 
              : 'We could not verify this prescription. It may be invalid or expired.'}
          </p>
        </div>

        {/* Details Content */}
        {status === 'valid' && data && (
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Issued Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(data.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Doctor</span>
                <span className="font-medium text-gray-900">{data.doctorName}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Patient</span>
                <span className="font-medium text-gray-900">{data.patientName}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Reference ID</span>
                <span className="font-mono text-xs text-gray-500">{data.id}</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </button>
          </div>
        )}

        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                MyDermaLife Verification System &bull; {new Date().getFullYear()}
            </p>
        </div>
      </div>
    </div>
  );
}
