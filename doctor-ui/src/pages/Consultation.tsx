import { useState } from 'react';
import { 
    Brain, 
    AlertTriangle, 
    Pill, 
    ShoppingCart, 
    ChevronRight,
    Sparkles,

} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { usePatient } from '../api/features/patients';


export function Consultation() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'summary' | 'exam' | 'plan'>('summary');
  
  // NOTE: In a real scenario, we would get the ID from the route or a context.
  // For now, we reuse the hardcoded '1' or similar if available, or just mock it.
  // The original design had hardcoded "Sophie Miller".
  // We will try to fetch patient with ID '1' as a default for demonstration if no params.
  const patientId = '1'; 

  // Data Fetching
  const { data: patient } = usePatient(patientId);


  // Initial load provided notes



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center text-brand-dark font-serif font-bold text-lg overflow-hidden">
                {patient?.photoUrl ? (
                    <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{patient?.name?.charAt(0) || 'S'}</span>
                )}
            </div>
            <div>
                <h1 className="text-2xl font-serif font-bold text-brand-dark">{patient?.name || 'Sophie Miller'}</h1>
                <p className="text-brand-muted text-sm">
                    {patient?.gender || 'Female'}, {patient?.age || '29'} • Allergies: {patient?.allergies?.join(', ') || 'Penicillin'} 
                    {/* Placeholder for critical alert */}
                    {patient?.allergies?.includes('Penicillin') && (
                         <> • <span className="text-brand-dark font-bold underline decoration-brand-default/50">Critical Alert</span></>
                    )}
                </p>
            </div>
         </div>
         <div className="flex gap-2">
             <button className="px-4 py-2 border border-brand-soft rounded-lg text-brand-dark hover:bg-brand-light font-medium">
                 {t('consultation.endConsultation')}
             </button>
             <button className="px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark shadow-sm font-medium">
                 {t('consultation.savePrescribe')}
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Clinical Area */}
          <div className="lg:col-span-2 space-y-6">
              {/* AI Insight Header */}
              <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-soft flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-brand-default">
                      <Brain className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="font-semibold text-brand-dark flex items-center gap-2">
                          {t('consultation.aiSummary')}
                          <Sparkles className="w-3 h-3 text-brand-default" />
                      </h3>
                      <p className="text-sm text-brand-text mt-1 leading-relaxed">
                          Patient reports recurring eczema flare-ups on forearms. <br/>
                          <strong>Key Symptoms:</strong> Itching (7/10), Redness, Dryness. <br/>
                          <strong>History:</strong> Worsened after changing laundry detergent 3 days ago.
                      </p>
                  </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-brand-soft/50 min-h-[500px] flex flex-col">
                  <div className="flex border-b border-brand-soft/50 overflow-x-auto">
                      {[
                          { id: 'summary', label: 'History & Summary' },
                          { id: 'exam', label: 'Examination' },
                          { id: 'plan', label: 'Diagnosis & Plan' }
                      ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "flex-1 py-4 text-sm font-medium transition-colors relative",
                                activeTab === tab.id ? "text-brand-dark" : "text-brand-muted hover:text-brand-text"
                            )}
                          >
                              {tab.label}
                              {activeTab === tab.id && (
                                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-default"></span>
                              )}
                          </button>
                      ))}
                  </div>
                  
                  <div className="p-6 flex-1">
                      {activeTab === 'summary' && (
                          <div className="space-y-6">
                              <section>
                                  <h4 className="font-serif font-medium text-brand-dark mb-3">Timeline</h4>
                                  <div className="pl-4 border-l-2 border-brand-soft space-y-4">
                                      <div className="relative">
                                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-default"></div>
                                          <p className="text-sm font-medium text-brand-dark">Today</p>
                                          <p className="text-sm text-brand-muted">Reported severe itching.</p>
                                      </div>
                                      <div className="relative">
                                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-soft"></div>
                                          <p className="text-sm font-medium text-brand-dark">3 Days Ago</p>
                                          <p className="text-sm text-brand-muted">Changed detergent brand.</p>
                                      </div>
                                  </div>
                              </section>
                          </div>
                      )}

                      {activeTab === 'exam' && (
                          <div className="text-center text-brand-muted py-12">
                              <p>Interactive examination form placeholder.</p>
                          </div>
                      )}

                       {activeTab === 'plan' && (
                          <div className="space-y-6">
                             {/* AI Diagnosis Support */}
                             <div className="space-y-3">
                                 <h4 className="font-serif font-medium text-brand-dark flex items-center gap-2">
                                     <Brain className="w-4 h-4 text-brand-default" />
                                     {t('consultation.differentialDiagnoses')}
                                 </h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     <div className="p-3 border border-brand-default/40 bg-brand-default/5 rounded-lg cursor-pointer hover:bg-brand-default/10 transition-colors">
                                         <div className="flex justify-between">
                                             <span className="font-medium text-brand-dark text-sm">Contact Dermatitis</span>
                                             <span className="text-brand-default text-xs font-bold">92% Match</span>
                                         </div>
                                         <p className="text-xs text-brand-muted mt-1">Triggers match detergent history.</p>
                                     </div>
                                     <div className="p-3 border border-brand-soft rounded-lg cursor-pointer hover:bg-brand-light transition-colors">
                                         <div className="flex justify-between">
                                             <span className="font-medium text-brand-dark text-sm">Atopic Dermatitis</span>
                                             <span className="text-brand-muted text-xs font-bold">60% Match</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Safety Alert */}
                             <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                                 <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                 <div>
                                     <h5 className="text-sm font-bold text-red-800">Drug Interaction Alert</h5>
                                     <p className="text-xs text-red-700 mt-1">
                                         Patient is allergic to Penicillin. Avoid prescribing Amoxicillin-based treatments.
                                     </p>
                                 </div>
                             </div>
                          </div>
                      )}


                  </div>
              </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
              {/* Product Recommendations */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-soft/50">
                  <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      WeRecommend
                  </h3>
                  <div className="space-y-3">
                      <div className="group flex gap-3 items-start p-2 hover:bg-brand-light/30 rounded-lg transition-colors cursor-pointer">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                          <div>
                              <p className="text-sm font-medium text-brand-dark group-hover:text-brand-default transition-colors">La Roche-Posay Cicaplast</p>
                              <p className="text-xs text-brand-muted">Soothing Baum</p>
                              <button className="mt-2 text-xs text-brand-default font-medium flex items-center gap-1">
                                  {t('common.recommend')} <ChevronRight className="w-3 h-3" />
                              </button>
                          </div>
                      </div>
                      <div className="group flex gap-3 items-start p-2 hover:bg-brand-light/30 rounded-lg transition-colors cursor-pointer">
                           <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                           <div>
                               <p className="text-sm font-medium text-brand-dark group-hover:text-brand-default transition-colors">CeraVe Moisturizer</p>
                               <p className="text-xs text-brand-muted">For Dry Skin</p>
                               <button className="mt-2 text-xs text-brand-default font-medium flex items-center gap-1">
                                   Recommend <ChevronRight className="w-3 h-3" />
                               </button>
                           </div>
                       </div>
                  </div>
              </div>

               {/* Quick Prescriptions */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-soft/50">
                  <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      {t('consultation.quickPrescribe')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                      {['Cortisone Cream', 'Antihistamine', 'Emollient'].map(med => (
                          <button key={med} className="px-3 py-1.5 text-xs font-medium bg-brand-light/50 border border-brand-soft rounded-full text-brand-text hover:bg-brand-default hover:text-white transition-all">
                              + {med}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
}
