import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CalendarCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoCall } from '../components/VideoCall';
import { useWebRTC } from '../hooks/useWebRTC';
import api from '../api/client';
import { consultationsApi } from '../api/features/consultations';
import { toast } from 'sonner';

import { Activity, CalendarPlus, Trash2, Edit, Save, Pill } from 'lucide-react';
import { 
  usePatient, 
  usePatientMedicalHistory, 
  useUpdateMedicalRecord, 
  useAddMedicalHistoryEvent, 
  useDeleteMedicalHistoryEvent 
} from '../api/features/patients';
import { useConsultation } from '../api/features/consultations';
import { AddMedicalEventModal, type MedicalEventFormData } from '../components/AddMedicalEventModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { PrescriptionModal } from '../components/PrescriptionModal';

// Extract base URL - remove /api/v1 suffix if present for Socket.IO connection
const RAW_API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3070`;
const BASE_URL = RAW_API_URL.replace(/\/api\/v1\/?$/, '');
const SIGNALING_SERVER = window.location.protocol === 'https:' 
  ? BASE_URL.replace(/^http:/, 'https:') 
  : BASE_URL;

export function Telemedicine() {
  const { t } = useTranslation();
  const { consultationId } = useParams<{ consultationId: string }>();
  
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'carnet' | 'notes' | 'prescription'>('carnet');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  
  // Data Fetching
  const { data: consultation, isLoading: isLoadingConsultation } = useConsultation(consultationId || '');
  
  // Only fetch patient data when we have a valid patientId from consultation
  const patientId = consultation?.patientId;
  
  const { data: patient } = usePatient(patientId || '');
  const { data: medicalHistory } = usePatientMedicalHistory(patientId || '');
  
  // Mutations
  const updateMedicalRecord = useUpdateMedicalRecord();
  const addMedicalEvent = useAddMedicalHistoryEvent();
  const deleteMedicalEvent = useDeleteMedicalHistoryEvent();

  // State for modals/editing
  const [isMedicalEventModalOpen, setIsMedicalEventModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // End Call Workflow State
  const [showEndCallConfirmation, setShowEndCallConfirmation] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  // Ref to allow onPatientStatusChange to call confirmEndConsultation without circular deps
  const confirmEndRef = useRef<() => void>(() => {});

  // Initial load notes
  useEffect(() => {
    if (patient?.chronicConditions) {
        setClinicalNotes(patient.chronicConditions.join(', '));
    }
  }, [patient]);

  // Handlers
  const handleSaveClinicalNotes = () => {
    if (patientId) {
      updateMedicalRecord.mutate(
        { patientId, data: { clinicalNotes } },
        {
          onSuccess: () => {
            setIsEditingNotes(false);
            toast.success('Clinical notes saved');
          }
        }
      );
    }
  };

  const handleAddMedicalEvent = (data: MedicalEventFormData) => {
    if (patientId) {
      addMedicalEvent.mutate({ patientId, data });
      setIsMedicalEventModalOpen(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (patientId && window.confirm(t('patientProfile.deleteEvent'))) {
      deleteMedicalEvent.mutate({ patientId, eventId });
    }
  };
  // const containerRef = useRef<HTMLDivElement>(null);

  // const toggleFullScreen = async () => {
  //   if (!containerRef.current) return;

  //   if (!document.fullscreenElement) {
  //       try {
  //           await containerRef.current.requestFullscreen();
  //           setIsFullScreen(true);
  //       } catch (err) {
  //           console.error("Error attempting to enable full-screen mode:", err);
  //       }
  //   } else {
  //       if (document.exitFullscreen) {
  //           await document.exitFullscreen();
  //           setIsFullScreen(false);
  //       }
  //   }
  // };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    connectionQuality,
    isMuted,
    isVideoEnabled,
    peerVideoEnabled,
    toggleMute,
    toggleVideo,
    endCall,
    startCall,
  } = useWebRTC({
    serverUrl: SIGNALING_SERVER,
    roomId: consultationId || 'default-room',
    role: 'doctor',
    onPatientStatusChange: (status) => {
        if (status === 'waiting') {
            toast.info(t('telemedicine.patientReturnedToWaiting', "L'utilisateur est rentré en salle d'attente"));
        } else if (status === 'finished') {
            toast.info(t('telemedicine.patientFinishedConsultation', "L'utilisateur a quitté la consultation"));
            // Save recording + complete consultation before navigating
            confirmEndRef.current();
        }
    }
  });

  // Auto-start call when page loads with a consultationId AND status is NOT completed
  useEffect(() => {
    if (consultationId && !callStarted && consultation && !isLoadingConsultation) {
      
      // Check if consultation is already completed
      if (consultation.status === 'completed') {
        console.log('Consultation is completed, not starting call.');
        return;
      }

      setCallStarted(true);
      startCall().catch(err => {
        console.error('Failed to start call:', err);
      });
    }
  }, [consultationId, callStarted, startCall, consultation, isLoadingConsultation]);

  const confirmEndConsultation = async () => {
    // endCall() stops recording and returns the blob directly
    const blob = await endCall();

    if (consultationId) {
        // Upload the recording if available
        if (blob && blob.size > 0) {
            try {
                await consultationsApi.uploadRecording(consultationId, blob);
                toast.success(t('consultation.recordingUploaded', 'Audio recording saved'));
            } catch (error) {
                console.error('Failed to upload recording:', error);
                toast.error(t('consultation.recordingFailed', 'Failed to save recording'));
            }
        }

        // Mark consultation as completed
        try {
            await api.post(`/doctor/consultations/${consultationId}/complete`);
            toast.success(t('consultation.completed', 'Consultation marked as completed'));
        } catch (error) {
            console.error('Failed to mark consultation as completed:', error);
            toast.error(t('consultation.completionFailed', 'Failed to update consultation status'));
        }
    }

    navigate('/agenda');
  };

  // Keep ref in sync so onPatientStatusChange can call it
  confirmEndRef.current = confirmEndConsultation;

  const handleEndCall = () => {
      setShowEndCallConfirmation(true);
  };
  
  const handleProceedToPrescription = () => {
      setShowEndCallConfirmation(false);
      setIsEndingCall(true); // Flag that we are in the ending flow
      setIsPrescriptionModalOpen(true);
  };

  const handleJustEndCall = () => {
      setShowEndCallConfirmation(false);
      confirmEndConsultation();
  };

  const handlePrescriptionModalClose = () => {
      setIsPrescriptionModalOpen(false);
      // If we were in the process of ending the call, finish it now
      if (isEndingCall) {
          confirmEndConsultation();
      }
  };

  // If no consultationId, show a message
  if (!consultationId) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-serif font-bold text-brand-dark mb-2">
            {t('telemedicine.noActiveSession')}
          </h2>
          <p className="text-brand-muted mb-4">
            {t('telemedicine.selectFromAgenda')}
          </p>
          <button
            onClick={() => navigate('/agenda')}
            className="px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors"
          >
            {t('telemedicine.goToAgenda')}
          </button>
        </div>
      </div>
    );
  }

  const isConsultationCompleted = consultation?.status === 'completed';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('telemedicine.title')}</h1>
            <p className="text-brand-muted flex items-center gap-2">
                {!isConsultationCompleted && (
                    <>
                        <span className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        )}></span>
                        {isConnected ? t('telemedicine.secureConnection') : t('telemedicine.connecting')}
                    </>
                )}
                {isConsultationCompleted && (
                    <span className="flex items-center gap-2 text-brand-default font-medium">
                        <CalendarCheck className="w-4 h-4" />
                        {t('telemedicine.statusCompleted')}
                    </span>
                )}
            </p>
         </div>
         <div className="flex bg-white rounded-lg border border-brand-soft/50 p-1">
             <button className="px-4 py-1.5 bg-brand-light rounded text-brand-dark font-medium text-sm">{t('telemedicine.activeSession')}</button>
             <button className="px-4 py-1.5 text-brand-muted hover:text-brand-dark font-medium text-sm">{t('telemedicine.pastSessions')}</button>
         </div>
       </div>

       <div className={cn(
           "flex-1 grid gap-6 min-h-0 transition-all duration-300",
           isFullScreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
       )}>
           {/* Video Interface */}
           <div className={cn(
               "bg-black rounded-2xl overflow-hidden relative shadow-lg ring-1 ring-brand-soft/50 flex flex-col transition-all duration-300",
               isFullScreen ? "col-span-1" : "lg:col-span-2"
           )}>
               
               {isConsultationCompleted ? (
                   <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-8">
                       <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                           <CalendarCheck className="w-10 h-10 text-green-400" />
                       </div>
                       <h2 className="text-2xl font-serif font-bold mb-2">{t('telemedicine.completionTitle')}</h2>
                       <p className="text-slate-400 text-center max-w-md mb-8">
                           {t('telemedicine.completionMessage')}
                       </p>
                       <div className="flex gap-4">
                           <button 
                               onClick={() => navigate('/agenda')}
                               className="px-6 py-2.5 bg-brand-default hover:bg-brand-dark text-white rounded-lg font-medium transition-colors"
                           >
                               {t('telemedicine.returnToAgenda')}
                           </button>
                           {/* Potentially add 'Review Summary' button here */}
                       </div>
                   </div>
               ) : (
                   <>
                        {/* Encrypted Badge */}
                        <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-green-400" /> {t('telemedicine.encrypted')}
                        </div>

                        <VideoCall
                            localStream={localStream}
                            remoteStream={remoteStream}
                            isConnected={isConnected}
                            isConnecting={isConnecting}
                            connectionQuality={connectionQuality}
                            isMuted={isMuted}
                            isVideoEnabled={isVideoEnabled}
                            peerVideoEnabled={peerVideoEnabled}
                            onToggleMute={toggleMute}
                            onToggleVideo={toggleVideo}
                            onEndCall={handleEndCall}
                            consultationId={consultationId}
                        />
                   </>
               )}
           </div>

           {/* Sidebar: Tabs & Content */}
           {!isFullScreen && (
               <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 flex flex-col overflow-hidden h-full animate-in slide-in-from-right-4 duration-300">
                   <div className="p-2 border-b border-brand-soft/50 bg-brand-light/30">
                       <div className="flex gap-1 bg-white p-1 rounded-lg border border-brand-soft/50">
                           {[
                                { id: 'carnet', label: 'Carnet Medical' },
                                { id: 'notes', label: 'Notes' },
                                { id: 'prescription', label: 'Prescription' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        activeTab === tab.id 
                                         ? "bg-brand-default text-white shadow-sm" 
                                         : "text-brand-muted hover:text-brand-dark hover:bg-brand-light/50"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                       </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4">
                       {activeTab === 'carnet' && (
                           <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-serif font-medium text-brand-dark">Medical Events</h4>
                                    <button
                                        onClick={() => setIsMedicalEventModalOpen(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-default text-white text-xs rounded-lg hover:bg-brand-dark transition-colors"
                                    >
                                        <CalendarPlus className="w-3 h-3" />
                                        Add Event
                                    </button>
                                </div>
                                
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-brand-soft/50">
                                     {medicalHistory && medicalHistory.length > 0 ? (
                                         medicalHistory.map((event, i) => (
                                         <div key={i} className="relative flex items-center gap-4 pl-6">
                                             <div className="absolute left-0 w-5 h-5 rounded-full border border-white bg-brand-light flex items-center justify-center text-brand-dark shadow-sm z-10 text-[10px]">
                                                 <Activity className="w-3 h-3" />
                                             </div>
                                             <div className="flex-1 p-3 rounded-xl border border-brand-soft/50 bg-white shadow-sm hover:border-brand-default/30 transition-colors">
                                                 <div className="flex items-center justify-between mb-1">
                                                     <time className="font-serif font-bold text-brand-dark text-xs">{event.date}</time>
                                                     <div className="flex items-center gap-2">
                                                         <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 rounded text-gray-500">{event.type}</span>
                                                         <button 
                                                             onClick={() => handleDeleteEvent(event.id)}
                                                             className="text-gray-400 hover:text-red-500 transition-colors"
                                                         >
                                                             <Trash2 className="w-3 h-3" />
                                                         </button>
                                                     </div>
                                                 </div>
                                                 <h5 className="font-medium text-xs text-brand-dark">{event.title}</h5>
                                                 <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                             </div>
                                         </div>
                                     ))
                                     ) : (
                                         <div className="text-center py-8 text-xs text-gray-400 pl-4">
                                             No medical events recorded.
                                         </div>
                                     )}
                                </div>
                           </div>
                       )}

                       {activeTab === 'notes' && (
                           <div className="space-y-4 h-full flex flex-col">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-brand-dark text-sm">Clinical Notes</h4>
                                    {!isEditingNotes ? (
                                        <button
                                            onClick={() => setIsEditingNotes(true)}
                                            className="flex items-center gap-2 px-3 py-1 text-xs text-brand-default hover:bg-brand-light/20 rounded-lg transition-colors border border-transparent hover:border-brand-soft"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditingNotes(false)}
                                                className="px-3 py-1 text-xs text-brand-muted hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveClinicalNotes}
                                                className="flex items-center gap-2 px-3 py-1 text-xs bg-brand-default text-white hover:bg-brand-dark rounded-lg transition-colors"
                                            >
                                                <Save className="w-3 h-3" />
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditingNotes ? (
                                    <textarea
                                        value={clinicalNotes}
                                        onChange={(e) => setClinicalNotes(e.target.value)}
                                        placeholder="Enter clinical notes here..."
                                        className="flex-1 w-full p-4 rounded-xl border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/50 text-sm leading-relaxed resize-none bg-white"
                                    />
                                ) : (
                                    <div className="flex-1 w-full p-4 rounded-xl border border-brand-soft/50 bg-gray-50 text-sm leading-relaxed overflow-y-auto">
                                        {clinicalNotes ? (
                                            <div className="whitespace-pre-wrap">{clinicalNotes}</div>
                                        ) : (
                                            <p className="text-gray-400 italic">No notes available.</p>
                                        )}
                                    </div>
                                )}
                           </div>
                       )}

                       {activeTab === 'prescription' && (
                           <div className="space-y-4">
                               <div className="flex justify-between items-center mb-4">
                                   <h4 className="font-serif font-medium text-brand-dark">Prescriptions</h4>
                                   <button className="flex items-center gap-2 px-3 py-1.5 bg-brand-default text-white text-xs rounded-lg hover:bg-brand-dark transition-colors">
                                       <CalendarPlus className="w-3 h-3" />
                                       Add Prescription
                                   </button>
                                </div>
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-400 text-sm">No prescriptions added yet.</p>
                                    <button className="mt-2 text-brand-default text-xs font-medium hover:underline">
                                        Create a new prescription
                                    </button>
                                </div>
                           </div>
                       )}
                   </div>
                   
                   {/* Quick Action (only show for timeline to avoid clutter, or keep consistent) */}

               </div>
           )}
       </div>
       <AddMedicalEventModal
        isOpen={isMedicalEventModalOpen}
        onClose={() => setIsMedicalEventModalOpen(false)}
        onSubmit={handleAddMedicalEvent}
      />
      
      
       <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        patientName={patient?.name || 'Sophie Miller'}
      />

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={handlePrescriptionModalClose}
        patient={{
            id: patient?.id || '',
            name: patient?.name || 'Unknown',
            age: patient?.age || 0,
            gender: patient?.gender || 'Unknown'
        }}
      />

      {/* End Consultation Confirmation Modal */}
      {showEndCallConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center">
                  <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand-default">
                      <Pill className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-brand-dark mb-2">
                      {t('telemedicine.createPrescriptionPrompt', 'Create Prescription?')}
                  </h3>
                  <p className="text-brand-muted mb-8 text-sm">
                      {t('telemedicine.createPrescriptionDesc', 'The consultation is about to end. Would you like to create and send a prescription to the patient?')}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={handleProceedToPrescription}
                          className="w-full py-2.5 bg-brand-default text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
                      >
                          {t('telemedicine.yesCreatePrescription', 'Yes, Create Prescription')}
                      </button>
                      <button 
                          onClick={handleJustEndCall}
                          className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                          {t('telemedicine.noJustEnd', 'No, Just End Consultation')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
