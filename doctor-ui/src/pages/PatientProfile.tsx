import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Activity, Clock, 
  Send, CalendarPlus, User, Camera, Image as ImageIcon, Edit, Trash2, Save,
  Shield, Pill, AlertTriangle, FileUp, Download, Syringe
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { cn } from '../lib/utils';

import { ScheduleModal } from '../components/ScheduleModal';
import { PrescriptionModal } from '../components/PrescriptionModal';
import { AddPhotoModal } from '../components/AddPhotoModal';
import { AddMedicalEventModal,  type MedicalEventFormData } from '../components/AddMedicalEventModal';
import { UploadMedicalDocumentModal } from '../components/UploadMedicalDocumentModal';
import { EditInsuranceModal } from '../components/EditInsuranceModal';
import { EditRiskFactorsModal } from '../components/EditRiskFactorsModal';
import { AddTreatmentModal } from '../components/AddTreatmentModal';
import { useTranslation } from 'react-i18next';
import { 
  usePatient, 
  usePatientStats, 
  usePatientMedicalHistory, 
  usePatientPhotos,
  useUpdateMedicalRecord,
  useAddMedicalHistoryEvent,
  useDeleteMedicalHistoryEvent,
  useMedicalDocuments,
  useDeleteMedicalDocument,
  useUpdateInsuranceNumber,
  useUpdateCurrentTreatments,
  useUpdateSkinRiskFactors
} from '../api/features/patients';

export function PatientProfile() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dossier' | 'carnet' | 'photos'>('dossier');
  
  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [isMedicalEventModalOpen, setIsMedicalEventModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditInsuranceModalOpen, setIsEditInsuranceModalOpen] = useState(false);
  const [isEditRiskModalOpen, setIsEditRiskModalOpen] = useState(false);
  const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);
  const [, setViewingImage] = useState<string | null>(null);
  
  // Medical Notes Editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState('');
  
  // Data Fetching
  const { data: patient, isLoading: isLoadingPatient } = usePatient(id || '');
  const { data: stats } = usePatientStats(id || '');
  const { data: medicalHistory } = usePatientMedicalHistory(id || '');
  const { data: photos } = usePatientPhotos(id || '');

  // Mutations
  const updateMedicalRecord = useUpdateMedicalRecord();
  const addMedicalEvent = useAddMedicalHistoryEvent();
  const deleteMedicalEvent = useDeleteMedicalHistoryEvent();
  
  // New Mutations & Data
  const { data: medicalDocuments } = useMedicalDocuments(id || '');
  const deleteDocument = useDeleteMedicalDocument();
  const updateInsurance = useUpdateInsuranceNumber();
  const updateTreatments = useUpdateCurrentTreatments();
  const updateRiskFactors = useUpdateSkinRiskFactors();

  // Handlers
  const handleSaveClinicalNotes = () => {
    if (id) {
      updateMedicalRecord.mutate(
        { patientId: id, data: { clinicalNotes } },
        {
          onSuccess: () => {
            setIsEditingNotes(false);
          }
        }
      );
    }
  };

  const handleAddMedicalEvent = (data: MedicalEventFormData) => {
    if (id) {
      addMedicalEvent.mutate({ patientId: id, data });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (id && window.confirm(t('patientProfile.deleteEvent'))) {
      deleteMedicalEvent.mutate({ patientId: id, eventId });
    }
  };

  // Get the appropriate locale based on current language


  if (isLoadingPatient) {
      return <div className="p-8 text-center text-brand-muted">Loading patient profile...</div>;
  }

  if (!patient) {
      return <div className="p-8 text-center text-red-500">Patient not found</div>;
  }

  const handleSendPrescription = () => {
      setIsPrescriptionModalOpen(true);
  };

  const handleScheduleFollowup = () => {
      setIsScheduleModalOpen(true);
  };

  const handleAddPhoto = (photoData: any) => {
      // Logic to refetch photos would be ideal here, or optimistic update
      console.log('Added new photo entry:', photoData);
  };

  const handleAddTreatment = (treatmentData: { name: string; dosage: string; frequency: string; startDate: string; prescribedBy?: string }) => {
    if (patient) {
        const newTreatments = [...(patient.currentTreatments || []), treatmentData];
        updateTreatments.mutate(
            { patientId: patient.id, treatments: newTreatments },
            {
                onSuccess: () => setIsAddTreatmentModalOpen(false)
            }
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header / Back */}
      <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-brand-muted hover:text-brand-dark transition-colors mb-4"
          >
              <ArrowLeft className="w-4 h-4 mr-2" /> {t('patientProfile.backToPatients')}
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
              <div className="flex items-center gap-6">
                  <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-brand-light shadow-md">
                        {patient.photoUrl ? (
                            <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-brand-light flex items-center justify-center text-brand-default text-2xl font-bold">
                                {patient.name.charAt(0)}
                            </div>
                        )}
                      </div>
                      <span className={cn("absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full", patient.status === 'Active' ? "bg-green-500" : "bg-gray-400")}></span>
                  </div>
                  <div>
                      <h1 className="text-3xl font-serif font-bold text-brand-dark mb-1">{patient.name}</h1>
                      <div className="flex items-center gap-4 text-sm text-brand-muted">
                          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {patient.age} years • {patient.gender}</span>
                          <span className="w-1 h-1 bg-brand-muted/50 rounded-full"></span>
                          <span>Blood: {patient.bloodType || 'N/A'}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                          {patient.allergies?.map(alg => (
                              <span key={alg} className="text-red-600 text-xs font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                  Allergy: {alg}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={handleSendPrescription}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-brand-soft text-brand-dark font-medium rounded-xl hover:bg-brand-light transition-colors shadow-sm"
                  >
                      <Send className="w-4 h-4" />
                      {t('patientProfile.sendPrescription')}
                  </button>
                  <button 
                    onClick={handleScheduleFollowup}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-default text-white font-medium rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand-default/20"
                  >
                      <CalendarPlus className="w-4 h-4" />
                      {t('patientProfile.scheduleVisit')}
                  </button>
              </div>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative bg-brand-light/10 p-6 rounded-2xl border border-brand-soft/20 overflow-hidden group hover:border-brand-default/30 transition-colors">
              <div className="relative z-10">
                  <p className="text-sm font-medium text-brand-muted uppercase tracking-wide">Total Consultations</p>
                  <h3 className="text-3xl font-serif font-bold text-brand-dark mt-2">{stats?.totalConsultations || 0}</h3>
              </div>
              <Activity className="absolute -right-4 -bottom-6 w-28 h-28 text-brand-default/5 group-hover:text-brand-default/10 transition-colors rotate-12" />
          </div>
          
          <div className="relative bg-brand-light/10 p-6 rounded-2xl border border-brand-soft/20 overflow-hidden group hover:border-brand-default/30 transition-colors">
              <div className="relative z-10">
                  <p className="text-sm font-medium text-brand-muted uppercase tracking-wide">{t('patientProfile.lastVisit')}</p>
                  <h3 className="text-3xl font-serif font-bold text-brand-dark mt-2">
                    {stats?.lastVisit ? new Date(stats.lastVisit).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </h3>
              </div>
              <Clock className="absolute -right-4 -bottom-6 w-28 h-28 text-brand-default/5 group-hover:text-brand-default/10 transition-colors rotate-12" />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-serif font-bold text-brand-dark">{t('patientProfile.consultationEvolution')}</h3>
                  <select className="text-sm bg-brand-light/30 border border-brand-soft/50 rounded-lg px-2 py-1 text-brand-dark focus:outline-none">
                      <option>Last 6 Months</option>
                  </select>
              </div>
              <div className="h-[300px] w-full">
                  {stats?.visitsByMonth ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.visitsByMonth}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4a373" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#d4a373" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#d4a373', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="visits" stroke="#d4a373" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-brand-muted">
                        No data available
                    </div>
                  )}
              </div>
          </div>

          {/* Pathologies */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-soft/50">
             <h3 className="text-lg font-serif font-bold text-brand-dark mb-6">{t('patientProfile.pathologies')}</h3>
             <div className="space-y-4">
                {patient?.chronicConditions && patient.chronicConditions.length > 0 ? (
                   patient.chronicConditions.map((condition, i) => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                           <Activity className="w-4 h-4" />
                           <span className="font-medium text-sm">{condition}</span>
                       </div>
                   ))
                ) : (
                   <div className="text-center py-6 text-gray-400 text-sm">
                       {t('patientProfile.noActivePathologies')}
                   </div>
                )}
             </div>

             {/* Vaccines */}
             <div className="mt-8 pt-8 border-t border-brand-soft/20">
                <h3 className="text-lg font-serif font-bold text-brand-dark mb-6 flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-brand-default" />
                    Vaccines
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {patient?.medicalRecord?.vaccines && patient.medicalRecord.vaccines.length > 0 ? (
                        patient.medicalRecord.vaccines.map((v, i) => (
                            <div key={i} className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between items-center">
                                <span className="font-medium text-sm text-blue-800">{v.name}</span>
                                <span className="text-xs text-blue-500 bg-white/50 px-1.5 py-0.5 rounded">{v.date}</span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-4 text-gray-400 text-sm italic">
                            No vaccines recorded
                        </div>
                    )}
                </div>
             </div>
          </div>
      </div>

      {/* Tabs Section for Records */}
      <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 overflow-hidden">
          <div className="flex border-b border-brand-soft/50">
              <button 
                onClick={() => setActiveTab('dossier')}
                className={cn(
                    "flex-1 py-4 text-center font-serif font-medium transition-colors relative",
                    activeTab === 'dossier' ? "text-brand-dark bg-brand-light/20" : "text-brand-muted hover:bg-gray-50"
                )}
              >
                  <span className="flex items-center justify-center gap-2">
                       <FileText className="w-4 h-4" /> Dossier Médical
                  </span>
                  {activeTab === 'dossier' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-default"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('carnet')}
                className={cn(
                    "flex-1 py-4 text-center font-serif font-medium transition-colors relative",
                    activeTab === 'carnet' ? "text-brand-dark bg-brand-light/20" : "text-brand-muted hover:bg-gray-50"
                )}
              >
                  <span className="flex items-center justify-center gap-2">
                       <Activity className="w-4 h-4" /> Carnet de Santé
                  </span>
                  {activeTab === 'carnet' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-default"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('photos')}
                className={cn(
                    "flex-1 py-4 text-center font-serif font-medium transition-colors relative",
                    activeTab === 'photos' ? "text-brand-dark bg-brand-light/20" : "text-brand-muted hover:bg-gray-50"
                )}
              >
                  <span className="flex items-center justify-center gap-2">
                       <Camera className="w-4 h-4" /> Photos / Evolution
                  </span>
                  {activeTab === 'photos' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-default"></span>}
              </button>
          </div>

          <div className="p-6 min-h-[400px]">
              {activeTab === 'dossier' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                          {/* Insurance & Risk Factors */}
                          <div className="bg-white p-5 rounded-xl border border-brand-soft/50">
                              <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-brand-dark flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-brand-default" />
                                      {t('patientProfile.medicalInfo')}
                                  </h4>
                              </div>
                              <div className="space-y-4">
                                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                      <span className="text-sm text-gray-500">{t('patientProfile.insuranceNumber')}</span>
                                      <div className="flex items-center gap-2">
                                          <span className="font-medium text-brand-dark">{patient.insuranceNumber || 'Not recorded'}</span>
                                          <button 
                                              onClick={() => setIsEditInsuranceModalOpen(true)}
                                              className="p-1 hover:bg-gray-200 rounded text-brand-muted"
                                          >
                                              <Edit className="w-3 h-3" />
                                          </button>
                                      </div>
                                  </div>
                                  
                                  <div>
                                      <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-brand-dark flex items-center gap-2">
                                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                                              {t('patientProfile.riskFactors')}
                                          </span>
                                          <button 
                                              onClick={() => setIsEditRiskModalOpen(true)}
                                              className="text-xs text-brand-default hover:underline"
                                          >
                                              {t('common.edit')}
                                          </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                          <div className="p-2 bg-orange-50/50 rounded border border-orange-100">
                                              <span className="text-gray-500 block text-xs">Family History</span>
                                              <span className="font-medium text-brand-dark">{patient.skinRiskFactors?.familyHistoryCancer ? 'Yes' : 'No'}</span>
                                          </div>
                                          <div className="p-2 bg-orange-50/50 rounded border border-orange-100">
                                              <span className="text-gray-500 block text-xs">Sun Exposure</span>
                                              <span className="font-medium text-brand-dark">{patient.skinRiskFactors?.sunExposure || 'Unknown'}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Clinical Notes */}
                          <div className="bg-white p-5 rounded-xl border border-brand-soft/50">
                              <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-brand-dark">{t('patientProfile.clinicalNotes')}</h4>
                                  {!isEditingNotes ? (
                                      <button
                                          onClick={() => {
                                              setClinicalNotes(patient.medicalRecord?.clinicalNotes || '');
                                              setIsEditingNotes(true);
                                          }}
                                          className="flex items-center gap-2 px-3 py-1 text-sm text-brand-default hover:bg-brand-light/20 rounded-lg transition-colors"
                                      >
                                          <Edit className="w-4 h-4" />
                                          {t('patientProfile.editClinicalNotes')}
                                      </button>
                                  ) : (
                                      <div className="flex gap-2">
                                          <button
                                              onClick={() => setIsEditingNotes(false)}
                                              className="px-3 py-1 text-sm text-brand-muted hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                              {t('common.cancel')}
                                          </button>
                                          <button
                                              onClick={handleSaveClinicalNotes}
                                              disabled={updateMedicalRecord.isPending}
                                              className="flex items-center gap-2 px-3 py-1 text-sm bg-brand-default text-white hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-50"
                                          >
                                              <Save className="w-4 h-4" />
                                              {t('patientProfile.saveClinicalNotes')}
                                          </button>
                                      </div>
                                  )}
                              </div>
                              {isEditingNotes ? (
                                  <textarea
                                      value={clinicalNotes}
                                      onChange={(e) => setClinicalNotes(e.target.value)}
                                      placeholder={t('patientProfile.clinicalNotesPlaceholder')}
                                      className="w-full h-48 p-4 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/50 text-sm leading-relaxed resize-none"
                                  />
                              ) : (
                                  <div className="w-full h-48 p-4 rounded-xl border border-brand-soft/50 bg-gray-50 text-sm leading-relaxed overflow-y-auto">
                                    {patient.medicalRecord?.clinicalNotes ? (
                                        <div className="whitespace-pre-wrap">
                                            {patient.medicalRecord.clinicalNotes}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 italic">
                                            {t('patientProfile.noClinicalNotes', 'No clinical notes recorded yet.')}
                                        </div>
                                    )}
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-6">
                           {/* Current Treatments */}
                           <div className="bg-white p-5 rounded-xl border border-brand-soft/50">
                               <div className="flex items-center justify-between mb-4">
                                   <h4 className="font-semibold text-brand-dark flex items-center gap-2">
                                       <Pill className="w-4 h-4 text-purple-500" />
                                       {t('patientProfile.currentTreatments')}
                                   </h4>
                                   <button 
                                      onClick={() => setIsAddTreatmentModalOpen(true)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-default text-white text-xs font-medium rounded-lg hover:bg-brand-dark transition-colors"
                                   >
                                       + Add
                                   </button>
                               </div>
                               <div className="space-y-2">
                                   {patient.currentTreatments && patient.currentTreatments.length > 0 ? (
                                       patient.currentTreatments.map((t, i) => (
                                           <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-xs">
                                               <div>
                                                   <span className="font-medium text-sm text-gray-800">{t.name}</span>
                                                   <div className="text-xs text-gray-500">{t.dosage} • {t.frequency}</div>
                                               </div>
                                               <button 
                                                  onClick={() => {
                                                      const newTreatments = patient.currentTreatments?.filter((_, idx) => idx !== i) || [];
                                                      updateTreatments.mutate({ patientId: patient.id, treatments: newTreatments });
                                                  }}
                                                  className="text-gray-400 hover:text-red-500"
                                                >
                                                   <Trash2 className="w-3 h-3" />
                                               </button>
                                           </div>
                                       ))
                                   ) : (
                                       <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                           No active treatments
                                       </div>
                                   )}
                               </div>
                           </div>

                           {/* Documents */}
                           <div className="bg-white p-5 rounded-xl border border-brand-soft/50">
                               <div className="flex items-center justify-between mb-4">
                                   <h4 className="font-semibold text-brand-dark flex items-center gap-2">
                                       <FileText className="w-4 h-4 text-blue-500" />
                                       {t('patientProfile.documents')}
                                   </h4>
                                   <button 
                                       onClick={() => setIsUploadModalOpen(true)}
                                       className="flex items-center gap-2 px-3 py-1.5 bg-brand-default text-white text-xs font-medium rounded-lg hover:bg-brand-dark transition-colors"
                                   >
                                       <FileUp className="w-3 h-3" /> Upload
                                   </button>
                               </div>
                               <div className="space-y-3">
                                   {medicalDocuments && medicalDocuments.length > 0 ? (
                                       medicalDocuments.map(doc => (
                                           <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                                               <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500">
                                                       <FileText className="w-4 h-4" />
                                                   </div>
                                                   <div>
                                                       <div className="font-medium text-sm text-gray-800">{doc.title}</div>
                                                       <div className="text-xs text-gray-500 capitalize">{doc.category.replace('_', ' ')} • {doc.date}</div>
                                                   </div>
                                               </div>
                                               <div className="flex items-center gap-2">
                                                   <a 
                                                    href={doc.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                   >
                                                       <Download className="w-4 h-4" />
                                                   </a>
                                                   <button 
                                                    onClick={() => {
                                                        if (confirm('Delete document?')) deleteDocument.mutate({ patientId: patient.id, documentId: doc.id });
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                   >
                                                       <Trash2 className="w-4 h-4" />
                                                   </button>
                                               </div>
                                           </div>
                                       ))
                                   ) : (
                                       <div className="text-center py-8 text-brand-muted bg-gray-50 rounded-lg dashed border border-gray-200">
                                           No documents uploaded yet.
                                       </div>
                                   )}
                               </div>
                           </div>
                      </div>
                  </div>
              )}

              {activeTab === 'carnet' && (
                  <div className="space-y-8">
                       {/* Add Event Button */}
                       <div className="flex justify-end">
                           <button
                               onClick={() => setIsMedicalEventModalOpen(true)}
                               className="flex items-center gap-2 px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors"
                           >
                               <CalendarPlus className="w-4 h-4" />
                               {t('patientProfile.addMedicalEvent')}
                           </button>
                       </div>
                      
                       {/* Timeline for Carnet */}
                       <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-brand-soft before:to-transparent">
                            {medicalHistory && medicalHistory.length > 0 ? (
                                medicalHistory.map((event, i) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-brand-light group-[.is-active]:bg-brand-default text-brand-dark group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-brand-soft/50 bg-white shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <time className="font-serif font-bold text-brand-dark">{event.date}</time>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-600">{event.type}</span>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                                                    title={t('patientProfile.deleteEvent')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h5 className="font-medium text-sm text-brand-dark mb-1">{event.title}</h5>
                                        <p className="text-sm text-gray-600">{event.description}</p>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className="text-center py-10 text-gray-500">No medical history recorded.</div>
                            )}
                       </div>
                  </div>
              )}
              {activeTab === 'photos' && (
                  <div className="space-y-8">
                       <div className="flex justify-between items-center mb-6">
                           <h4 className="font-semibold text-brand-dark">Skin Evolution Timeline</h4>
                           <button 
                                onClick={() => setIsAddPhotoModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-default text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors shadow-sm"
                           >
                               <Camera className="w-4 h-4" /> {t('patientProfile.addNewPhoto')}
                           </button>
                       </div>

                       <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-brand-soft/50">
                            {photos && photos.length > 0 ? (
                                photos.map((item, i) => (
                                <div key={i} className="relative flex items-start gap-6 group">
                                    <div className="absolute left-0 mt-1 w-10 h-10 rounded-full border-4 border-white bg-brand-light flex items-center justify-center text-brand-default shadow-sm z-10">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div className="ml-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1">
                                            <div 
                                                className="aspect-video w-full rounded-xl overflow-hidden border border-brand-soft/50 shadow-sm relative group cursor-pointer"
                                                onClick={() => setViewingImage(item.url)}
                                            >
                                                <img 
                                                    src={item.url} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">{t('patientProfile.viewFull')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-brand-soft/30 shadow-sm hover:border-brand-soft/80 transition-colors">
                                           <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-serif font-bold text-brand-dark">{item.title}</h5>
                                                <span className="text-xs font-medium text-brand-muted bg-brand-light/30 px-2 py-1 rounded-lg border border-brand-soft/30">{item.date}</span>
                                           </div>
                                           <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 pl-16">No photos uploaded yet.</div>
                            )}
                       </div>
                  </div>
              )}
          </div>
      </div>

      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        patientName={patient.name}
      />
      <PrescriptionModal 
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={patient}
      />
      <AddPhotoModal 
        isOpen={isAddPhotoModalOpen}
        onClose={() => setIsAddPhotoModalOpen(false)}
        onSave={handleAddPhoto}
      />
      <AddMedicalEventModal
        isOpen={isMedicalEventModalOpen}
        onClose={() => setIsMedicalEventModalOpen(false)}
        onSubmit={handleAddMedicalEvent}
      />
      <UploadMedicalDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={id || ''}
      />
      <AddTreatmentModal
        isOpen={isAddTreatmentModalOpen}
        onClose={() => setIsAddTreatmentModalOpen(false)}
        onSave={handleAddTreatment}
        isLoading={updateTreatments.isPending}
      />
      <EditInsuranceModal
        isOpen={isEditInsuranceModalOpen}
        onClose={() => setIsEditInsuranceModalOpen(false)}
        currentNumber={patient?.insuranceNumber || ''}
        onSave={async (num) => {
            await updateInsurance.mutateAsync({ patientId: id || '', insuranceNumber: num });
        }}
        isLoading={updateInsurance.isPending}
      />
      <EditRiskFactorsModal
        isOpen={isEditRiskModalOpen}
        onClose={() => setIsEditRiskModalOpen(false)}
        currentFactors={{
            familyHistoryCancer: patient?.skinRiskFactors?.familyHistoryCancer || false,
            sunExposure: patient?.skinRiskFactors?.sunExposure || 'Low'
        }}
        onSave={async (factors) => {
            await updateRiskFactors.mutateAsync({ patientId: id || '', factors });
        }}
        isLoading={updateRiskFactors.isPending}
      />
    </div>
  );
}
