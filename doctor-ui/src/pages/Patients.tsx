import { useState } from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { PatientCard } from '../components/PatientCard';
import { PatientsTable } from '../components/PatientsTable';
import { ScheduleModal } from '../components/ScheduleModal';
import { useTranslation } from 'react-i18next';
import { usePatients } from '../api/features/patients';

export function Patients() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const { data: patientsData } = usePatients();
  const patients = patientsData?.data || [];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          patient.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const handleSchedule = (patient: any) => {
    setSelectedPatient(patient);
    setIsScheduleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('patients.title')}</h1>
            <p className="text-brand-muted">{t('patients.subtitle')}</p>
         </div>
       </div>

       {/* Toolbar */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-soft/50 flex flex-col md:flex-row gap-4 items-center justify-between">
           {/* Search */}
           <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                   type="text" 
                   placeholder={t('patients.searchPlaceholder')}
                   className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-soft/50 focus:outline-none focus:ring-2 focus:ring-brand-default/20 focus:border-brand-default transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
               />
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
               {/* Filter */}
               <div className="relative">
                   <select 
                        className="appearance-none pl-10 pr-8 py-2 bg-white border border-brand-soft/50 rounded-lg focus:outline-none focus:border-brand-default cursor-pointer text-sm font-medium text-brand-dark"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                   >
                       <option value="all">{t('patients.allStatus')}</option>
                       <option value="active">{t('common.active')}</option>
                       <option value="inactive">{t('common.inactive')}</option>
                   </select>
                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
               </div>

               {/* View Toggle */}
               <div className="flex bg-brand-light p-1 rounded-lg border border-brand-soft/50">
                   <button 
                        onClick={() => setViewMode('card')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'card' ? "bg-white text-brand-default shadow-sm" : "text-brand-muted hover:text-brand-dark"
                        )}
                   >
                       <LayoutGrid className="w-4 h-4" />
                   </button>
                   <button 
                        onClick={() => setViewMode('table')}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            viewMode === 'table' ? "bg-white text-brand-default shadow-sm" : "text-brand-muted hover:text-brand-dark"
                        )}
                   >
                       <List className="w-4 h-4" />
                   </button>
               </div>
           </div>
       </div>

       {/* Content */}
       <div className="min-h-[500px]">
           {filteredPatients.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                   </div>
                   <h3 className="text-lg font-medium text-gray-900">{t('patients.noPatients')}</h3>
                   <p className="text-gray-500">{t('patients.tryAdjusting')}</p>
               </div>
           ) : (
                viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPatients.map(patient => (
                            <PatientCard 
                                key={patient.id} 
                                patient={patient} 
                                onViewDetails={handleViewDetails}
                                onSchedule={handleSchedule}
                            />
                        ))}
                    </div>
                ) : (
                    <PatientsTable 
                        patients={filteredPatients} 
                        onViewDetails={handleViewDetails}
                        onSchedule={handleSchedule}
                    />
                )
           )}
       </div>

       <ScheduleModal 
          isOpen={isScheduleModalOpen}
          onClose={handleCloseModal}
          patientName={selectedPatient?.name || ''}
       />
    </div>
  );
}
