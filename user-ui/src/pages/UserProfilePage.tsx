import { PageTransition } from '../components/PageTransition';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { User, FileText, Calendar, ShoppingBag, Settings, LogOut, Package, Download, ChevronRight, ChevronLeft, FilePlus, Pill, ClipboardList, Syringe, Image as ImageIcon, X, Plus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState, useRef } from 'react';
import { AddPhotoModal } from '../components/AddPhotoModal';
import { useTranslation } from 'react-i18next';
import { useLogout, useProfile, useUpdateProfilePhoto, useUpdateMedicalRecord, useSkinLogs, useCreateSkinLog, useDeleteSkinLog } from '../hooks/useAuth';
import { usePrescriptions } from '../hooks/usePrescriptions';
import { useMyAppointments, useAcceptConsultation, useRejectConsultation } from '../hooks/useConsultations';
import { useMyOrders } from '../hooks/queries/useOrders';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { API_CONFIG, getImageUrl } from '../api/config';


export function UserProfilePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { section } = useParams<{ section: string }>();
    const activeTab = section || 'info';
    const logoutMutation = useLogout();
    const { data: profile, isLoading, error } = useProfile();
    const updateProfilePhotoMutation = useUpdateProfilePhoto();
    const updateMedicalRecordMutation = useUpdateMedicalRecord();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data: skinLogs, isLoading: isLoadingSkinLogs } = useSkinLogs();
    const createSkinLogMutation = useCreateSkinLog();
    const deleteSkinLogMutation = useDeleteSkinLog();

    const { data: prescriptions, isLoading: isLoadingPrescriptions } = usePrescriptions();
    const { data: appointments, isLoading: isLoadingAppointments } = useMyAppointments();
    const { data: myOrdersData, isLoading: isLoadingOrders } = useMyOrders();
    const acceptConsultationMutation = useAcceptConsultation();
    const rejectConsultationMutation = useRejectConsultation();

    const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
    const [newAllergy, setNewAllergy] = useState('');
    const [newHistory, setNewHistory] = useState('');
    const [newVaccine, setNewVaccine] = useState('');
    const [newVaccineDate, setNewVaccineDate] = useState('');
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    
    const handleAddPhoto = async (photo: { date: string; title: string; note: string; img: string }) => {
        try {
            await createSkinLogMutation.mutateAsync({
                date: photo.date,
                title: photo.title,
                note: photo.note,
                photoUrl: photo.img
            });
            toast.success(t('profile.skinEvolution.addSuccess') || 'Photo ajoutée');
            setIsAddPhotoModalOpen(false);
        } catch (error) {
            toast.error(t('profile.skinEvolution.addError') || 'Erreur lors de l\'ajout');
        }
    };

    const handleDeleteSkinLog = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Supprimer cette entrée ?')) {
             try {
                await deleteSkinLogMutation.mutateAsync(id);
                toast.success('Entrée supprimée');
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleAddAllergy = async () => {
        if (!newAllergy.trim()) return;
        const currentAllergies = profile?.profile?.medicalRecord?.allergies || [];
        try {
            await updateMedicalRecordMutation.mutateAsync({
                allergies: [...currentAllergies, newAllergy.trim()]
            });
            setNewAllergy('');
            toast.success('Allergie ajoutée');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleRemoveAllergy = async (allergy: string) => {
        const currentAllergies = profile?.profile?.medicalRecord?.allergies || [];
        try {
            await updateMedicalRecordMutation.mutateAsync({
                allergies: currentAllergies.filter(a => a !== allergy)
            });
            toast.success('Allergie supprimée');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleAddHistory = async () => {
        if (!newHistory.trim()) return;
        const currentHistory = profile?.profile?.medicalRecord?.history || [];
        try {
            await updateMedicalRecordMutation.mutateAsync({
                history: [...currentHistory, { condition: newHistory.trim(), status: 'ongoing' }]
            });
            setNewHistory('');
            toast.success('Antécédent ajouté');
        } catch (error) {
             toast.error('Erreur lors de la mise à jour');
        }
    };
    
    // Simple remove history by condition name for now (assuming unique)
    const handleRemoveHistory = async (condition: string) => {
         const currentHistory = profile?.profile?.medicalRecord?.history || [];
         try {
            await updateMedicalRecordMutation.mutateAsync({
                history: currentHistory.filter(h => h.condition !== condition)
            });
            toast.success('Antécédent supprimé');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleAddVaccine = async () => {
        if (!newVaccine.trim()) return;
        const currentVaccines = profile?.profile?.medicalRecord?.vaccines || [];
        const date = newVaccineDate || new Date().toISOString().split('T')[0];
        try {
            await updateMedicalRecordMutation.mutateAsync({
                vaccines: [...currentVaccines, { name: newVaccine.trim(), date }]
            });
            setNewVaccine('');
            setNewVaccineDate('');
            toast.success('Vaccin ajouté');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

     const handleRemoveVaccine = async (name: string) => {
         const currentVaccines = profile?.profile?.medicalRecord?.vaccines || [];
         try {
            await updateMedicalRecordMutation.mutateAsync({
                vaccines: currentVaccines.filter(v => v.name !== name)
            });
            toast.success('Vaccin supprimé');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleAcceptConsultation = async (id: string) => {
        try {
            await acceptConsultationMutation.mutateAsync(id);
            toast.success('Rendez-vous confirmé');
        } catch (error) {
            toast.error('Erreur lors de la confirmation');
        }
    };

    const handleRejectConsultation = async (id: string) => {
        if (!confirm('Voulez-vous vraiment refuser ce rendez-vous ?')) return;
        try {
            await rejectConsultationMutation.mutateAsync(id);
            toast.success('Rendez-vous refusé');
        } catch (error) {
            toast.error('Erreur lors du refus');
        }
    };

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            toast.success(t('profile.menu.logout') + ' ' + t('auth.loginSuccess').toLowerCase());
            navigate('/');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    // Helper function to calculate age from date of birth
    const calculateAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Helper function to format date
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Handle profile photo click
    const handleProfilePhotoClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection and convert to base64
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Format invalide. Utilisez JPG, PNG, GIF ou WEBP');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('L\'image est trop grande. Maximum 5MB');
            return;
        }

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                
                // Upload the photo
                await updateProfilePhotoMutation.mutateAsync(base64String);
                toast.success('Photo de profil mise à jour avec succès!');
            };
            reader.onerror = () => {
                toast.error('Erreur lors de la lecture du fichier');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour de la photo');
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-brand-default border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-brand-muted">{t('common.loading')}</p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    // Show error state
    if (error) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{t('common.error')}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-default"
                        >
                            {t('common.retry')}
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    // Extract profile data
    const firstName = profile?.profile?.firstName || profile?.email?.split('@')[0] || 'User';
    const lastName = profile?.profile?.lastName || '';
    const email = profile?.email || '';
    const gender = profile?.profile?.gender || '';
    const dateOfBirth = profile?.profile?.dateOfBirth;
    const age = calculateAge(dateOfBirth);
    const formattedBirthday = formatDate(dateOfBirth);
    const profilePhoto = profile?.profile?.profilePhoto;

    // Grouping the menu items with Brand Colors
    const clinicalItems = [
        { id: 'info', label: t('profile.menu.personalInfo'), icon: User, color: 'bg-brand-default/20 text-brand-dark' }, 
        { id: 'medical-record', label: t('profile.menu.medicalRecord'), icon: ClipboardList, color: 'bg-brand-dark/10 text-brand-dark' },
        { id: 'skin-evolution', label: t('skinEvolution.title'), icon: ImageIcon, color: 'bg-brand-soft/40 text-brand-dark', count: skinLogs?.length || 0 },
        { id: 'prescriptions', label: t('profile.menu.prescriptions'), icon: Pill, color: 'bg-brand-soft text-brand-dark', count: prescriptions?.length || 0 },
        { id: 'appointments', label: t('profile.menu.appointments'), icon: Calendar, color: 'bg-brand-soft/50 text-brand-dark', count: appointments?.length || 0 }, 
        { id: 'orders', label: t('profile.menu.orders'), icon: Package, color: 'bg-brand-default/20 text-brand-dark', count: (Array.isArray(myOrdersData) ? myOrdersData : (myOrdersData as any)?.data || []).length },
        { id: 'cart', label: t('profile.menu.cart'), icon: ShoppingBag, color: 'bg-brand-dark/20 text-brand-dark' }, 
        { id: 'documents', label: t('profile.menu.documents'), icon: Download, color: 'bg-brand-soft/50 text-brand-dark' },
    ];

    const settingsItems = [
        { id: 'settings', label: t('profile.menu.settings'), icon: Settings, color: 'bg-white border border-gray-100 text-brand-muted' },
        { id: 'logout', label: t('profile.menu.logout'), icon: LogOut, color: 'bg-red-50 text-red-500' },
    ];

    return (
        <PageTransition>
            <Navbar />
            <div className="min-h-screen bg-gray-50 font-sans text-brand-text relative pt-20">{/* Added pt-20 for navbar spacing */}
                

                {/* Main Layout Container - Full Screen */}
                <div className="flex flex-col md:flex-row min-h-screen pt-16 md:pt-0">
                    
                    {/* LEFT PANEL: Menu & Header (Fixed width on desktop) */}
                    <div className={cn(
                        "w-full md:w-[400px] lg:w-[450px] p-6 md:p-10 flex flex-col gap-8 md:border-r border-gray-200 bg-white", 
                        section ? "hidden md:flex" : "flex"
                    )}>
                        
                        {/* Custom Header Profile Section */}
                        <div className="flex flex-col items-center md:items-start gap-6 mt-4 md:mt-0">
                            <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                
                                <div className="relative">
                                    <button
                                        onClick={handleProfilePhotoClick}
                                        disabled={updateProfilePhotoMutation.isPending}
                                        className="w-24 h-24 rounded-2xl overflow-hidden shadow-none bg-gray-200 hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                       {profilePhoto ? (
                                           <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                       ) : (
                                           <div className="w-full h-full flex items-center justify-center bg-brand-soft">
                                               <User className="w-12 h-12 text-brand-dark" />
                                           </div>
                                       )}
                                    </button>
                                    <button
                                        onClick={handleProfilePhotoClick}
                                        disabled={updateProfilePhotoMutation.isPending}
                                        className="absolute -top-2 -right-2 bg-brand-soft p-1.5 rounded-full rotate-12 border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FilePlus className="w-4 h-4 text-brand-dark" />
                                    </button>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-serif font-medium leading-tight text-brand-dark">
                                        {firstName} {lastName && <><br/>{lastName}</>}
                                    </h1>
                                    <div className="flex gap-4 mt-3 text-xs font-bold tracking-wider text-brand-muted uppercase">
                                        {gender && (
                                            <div className="flex flex-col items-center md:items-start">
                                                <span>
                                                    {gender === 'male' && t('profile.header.male')}
                                                    {gender === 'female' && t('profile.header.female')}
                                                    {gender === 'other' && t('profile.header.other')}
                                                    {gender === 'prefer_not_to_say' && t('profile.header.preferNot')}
                                                </span>
                                                <span className="text-[10px] font-normal opacity-60">{t('profile.header.gender')}</span>
                                            </div>
                                        )}
                                        {age && (
                                            <div className="flex flex-col items-center md:items-start">
                                                <span>{age}</span>
                                                <span className="text-[10px] font-normal opacity-60">{t('profile.header.age')}</span>
                                            </div>
                                        )}
                                        {formattedBirthday && (
                                            <div className="flex flex-col items-center md:items-start">
                                                <span>{formattedBirthday}</span>
                                                <span className="text-[10px] font-normal opacity-60">{t('profile.header.birthday')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* ID Banner */}
                            <div className="w-full bg-brand-dark text-white rounded-xl px-5 py-4 flex items-center gap-4 text-xs font-bold tracking-widest shadow-lg shadow-brand-dark/10">
                                {/* Profile Picture */}
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white/50" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1 flex flex-col gap-1">
                                    <div className="text-sm font-serif font-medium">
                                        {firstName} {lastName}
                                    </div>
                                    <div className="opacity-60 text-[10px]">
                                        ID: {profile?.id?.substring(0, 12).toUpperCase() || 'N/A'}
                                    </div>
                                </div>
                                
                                {/* Patient Badge */}
                                <span className="bg-white/10 px-3 py-1.5 rounded-lg">Patient</span>
                            </div>
                        </div>

                        {/* Clinical Profile Menu */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.menu.clinicalProfile')}</h3>
                            <div className="flex flex-col gap-2">
                                {clinicalItems.map((item) => (
                                    <Link 
                                        key={item.id}
                                        to={`/profile/${item.id}`}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl transition-all group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100",
                                            activeTab === item.id && section ? "bg-white shadow-sm border-gray-100" : ""
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105 duration-300", item.color)}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-brand-text">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {item.count && (
                                                <span className="bg-brand-text text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.count}</span>
                                            )}
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-default" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Settings Menu */}
                        <div className="flex flex-col gap-4">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.menu.generalSettings')}</h3>
                             <div className="flex flex-col gap-2">
                                {settingsItems.map((item) => (
                                    item.id === 'logout' ? (
                                        <button
                                            key={item.id}
                                            onClick={handleLogout}
                                            disabled={logoutMutation.isPending}
                                            className="flex items-center justify-between p-3 rounded-2xl transition-all group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105 duration-300", item.color)}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-brand-text">
                                                    {logoutMutation.isPending ? 'Déconnexion...' : item.label}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-default" />
                                        </button>
                                    ) : (
                                        <Link 
                                            key={item.id}
                                            to={`/profile/${item.id}`}
                                            className="flex items-center justify-between p-3 rounded-2xl transition-all group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105 duration-300", item.color)}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-brand-text">{item.label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-default" />
                                        </Link>
                                    )
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Content Area (Takes remaining space on desktop) */}
                    <div className={cn(
                        "flex-1 bg-white md:bg-gray-50 min-h-screen p-0 md:p-8",
                        !section ? "hidden md:block" : "block"
                    )}>
                         {/* Mobile Back Header */}
                         <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b border-gray-100 z-10 flex items-center gap-2">
                             <Link to="/profile" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                                 <ChevronLeft className="w-6 h-6 text-brand-text" />
                             </Link>
                             <span className="font-serif font-bold text-lg text-brand-dark">
                                {/* Map section ID to Label for header title */}
                                {clinicalItems.find(i => i.id === section)?.label || settingsItems.find(i => i.id === section)?.label}
                             </span>
                         </div>

                        <div className="p-6 md:p-10 h-full overflow-y-auto">
                            {/* Content container */}
                             <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                                {activeTab === 'info' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.personalInfo.title')}</h2>
                                        {/* Simplified Form */}
                                        <div className="space-y-6 max-w-md">
                                            <div className="grid gap-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t('profile.personalInfo.firstName')}</label>
                                                <input type="text" defaultValue={firstName} className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark" />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t('profile.personalInfo.lastName')}</label>
                                                <input type="text" defaultValue={lastName} className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark" />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t('profile.personalInfo.email')}</label>
                                                <input type="email" defaultValue={email} className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 transition-all font-medium text-brand-dark" />
                                            </div>
                                            <button className="w-full bg-brand-dark text-white py-4 rounded-xl mt-4 font-bold hover:bg-brand-default transition-colors shadow-lg shadow-brand-dark/20">{t('profile.personalInfo.save')}</button>
                                        </div>
                                    </div>
                                )}
                                
                                {activeTab === 'medical-record' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.medicalRecord.title')}</h2>
                                        
                                        <div className="space-y-6">
                                            {/* Medical Events Timeline (Journal des Soins - Carnet) - MOVED TO TOP */}
                                            <div className="mb-8 pb-8 border-b border-gray-100">
                                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-6">{t('profile.medicalRecord.careJournal')}</h3>
                                                
                                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-brand-soft/30">
                                                    {profile?.profile?.medicalRecord?.history?.filter(item => item.date)?.map((event, index) => (
                                                        <div key={index} className="relative pl-12 group">
                                                            {/* Timeline dot */}
                                                            <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center">
                                                                <div className="w-4 h-4 rounded-full bg-brand-default border-4 border-white shadow-sm z-10" />
                                                            </div>
                                                            
                                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-bold text-brand-dark">{event.title || event.condition}</span>
                                                                        <span className="text-xs bg-brand-soft/20 text-brand-dark px-2 py-1 rounded-lg uppercase tracking-wider font-bold">
                                                                            {event.type || 'Event'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-brand-muted">{event.date}</span>
                                                                </div>
                                                                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(!profile?.profile?.medicalRecord?.history || profile?.profile?.medicalRecord?.history.filter(item => item.date).length === 0) && (
                                                        <div className="pl-12 py-4 text-gray-400 text-sm italic">
                                                            {t('profile.medicalRecord.noEvents')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Allergies Section */}
                                            <div>
                                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-3">{t('profile.medicalRecord.allergies')}</h3>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {profile?.profile?.medicalRecord?.allergies?.map((allergy, index) => (
                                                        <span key={index} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 flex items-center gap-2 group">
                                                            {allergy}
                                                            <button onClick={() => handleRemoveAllergy(allergy)} className="invisible group-hover:visible hover:text-red-800" title="Supprimer">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    {(!profile?.profile?.medicalRecord?.allergies || profile?.profile?.medicalRecord?.allergies.length === 0) && (
                                                        <span className="text-gray-400 text-sm italic">Aucune allergie enregistrée</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={newAllergy}
                                                        onChange={(e) => setNewAllergy(e.target.value)}
                                                        placeholder="Nouvelle allergie..."
                                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 text-sm"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                                                    />
                                                    <button onClick={handleAddAllergy} className="px-4 py-2 bg-brand-soft/20 text-brand-dark rounded-xl font-medium hover:bg-brand-soft/40 transition-colors">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Chronic Conditions Section (Antecedents) */}
                                            <div>
                                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-3">{t('profile.medicalRecord.history')}</h3>
                                                <div className="space-y-3 mb-3">
                                                     {profile?.profile?.medicalRecord?.history?.filter(item => !item.date)?.map((item, index) => (
                                                        <div key={index} className={cn(
                                                            "p-4 rounded-2xl flex items-center justify-between border transition-colors group",
                                                            item.status === 'ongoing' 
                                                                ? "bg-brand-soft/20 border-transparent hover:border-brand-soft text-brand-dark" 
                                                                : "bg-gray-50 border-gray-100 text-gray-600 opacity-80"
                                                        )}>
                                                            <span className="font-bold">{item.condition}</span>
                                                            <div className="flex items-center gap-2">
                                                                 <span className={cn(
                                                                    "text-xs font-bold px-2 py-1 rounded-md",
                                                                    item.status === 'ongoing' ? "bg-brand-soft text-brand-dark" : "bg-gray-200 text-gray-600"
                                                                )}>
                                                                    {item.status === 'ongoing' ? t('profile.medicalRecord.ongoing') : t('profile.medicalRecord.resolved')}
                                                                </span>
                                                                <button onClick={() => handleRemoveHistory(item.condition)} className="p-1 hover:bg-black/10 rounded-full invisible group-hover:visible">
                                                                     <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                     {(!profile?.profile?.medicalRecord?.history || profile?.profile?.medicalRecord?.history.filter(item => !item.date).length === 0) && (
                                                        <div className="text-gray-400 text-sm italic">Aucun antécédent médical</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={newHistory}
                                                        onChange={(e) => setNewHistory(e.target.value)}
                                                        placeholder="Nouvel antécédent..."
                                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 text-sm"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddHistory()}
                                                    />
                                                     <button onClick={handleAddHistory} className="px-4 py-2 bg-brand-soft/20 text-brand-dark rounded-xl font-medium hover:bg-brand-soft/40 transition-colors">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>



                                            {/* Vaccines */}
                                             <div>
                                                <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider mb-3">{t('profile.medicalRecord.vaccines')}</h3>
                                                <div className="grid gap-3 mb-3">
                                                     {profile?.profile?.medicalRecord?.vaccines?.map((vaccine, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group relative">
                                                            <button onClick={() => handleRemoveVaccine(vaccine.name)} className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full invisible group-hover:visible text-gray-500">
                                                                     <X className="w-3 h-3" />
                                                            </button>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <Syringe className="w-5 h-5 text-brand-muted" />
                                                                    <span className="font-medium text-brand-dark">{vaccine.name}</span>
                                                                </div>
                                                                <span className="text-sm text-gray-500">{vaccine.date}</span>
                                                            </div>
                                                             <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                                <div className="bg-brand-default h-full w-3/4" />
                                                            </div>
                                                        </div>
                                                     ))}
                                                      {(!profile?.profile?.medicalRecord?.vaccines || profile?.profile?.medicalRecord?.vaccines.length === 0) && (
                                                        <div className="text-gray-400 text-sm italic">Aucun vaccin enregistré</div>
                                                    )}
                                                </div>
                                                 <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={newVaccine}
                                                        onChange={(e) => setNewVaccine(e.target.value)}
                                                        placeholder="Vaccin..."
                                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 text-sm"
                                                    />
                                                    <input 
                                                        type="date" 
                                                        value={newVaccineDate}
                                                        onChange={(e) => setNewVaccineDate(e.target.value)}
                                                        className="w-32 px-4 py-2 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-default focus:ring-0 text-sm"
                                                    />
                                                     <button onClick={handleAddVaccine} className="px-4 py-2 bg-brand-soft/20 text-brand-dark rounded-xl font-medium hover:bg-brand-soft/40 transition-colors">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'skin-evolution' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-serif font-bold text-brand-dark">{t('skinEvolution.title')}</h2>
                                            <button 
                                                onClick={() => setIsAddPhotoModalOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand-default text-white rounded-xl font-bold hover:bg-brand-dark transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                                <span className="hidden md:inline">{t('skinEvolution.addPhoto')}</span>
                                            </button>
                                        </div>

                                        {isLoadingSkinLogs ? (
                                            <div className="text-center py-10 text-gray-400">Loading...</div>
                                        ) : (
                                            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-0.5 before:bg-brand-soft/30">
                                                {skinLogs?.map((item) => (
                                                    <div key={item.id} className="relative pl-10 group">
                                                        {/* Timeline dot */}
                                                        <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center">
                                                            <div className="w-4 h-4 rounded-full bg-brand-default border-4 border-white shadow-sm z-10" />
                                                        </div>
                                                        
                                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                                             <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <div className="inline-flex items-center gap-2 mb-1">
                                                                         <Calendar className="w-4 h-4 text-brand-muted" />
                                                                         <span className="text-sm font-bold text-brand-muted uppercase tracking-wide">{item.date}</span>
                                                                    </div>
                                                                    <h3 className="font-serif font-bold text-xl text-brand-dark">{item.title}</h3>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => handleDeleteSkinLog(item.id, e)} 
                                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                             </div>

                                                             <div className="flex flex-col md:flex-row gap-5">
                                                                <div 
                                                                    className="w-full md:w-48 h-48 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-gray-100"
                                                                    onClick={() => setViewingImage(item.photoUrl)}
                                                                >
                                                                    <img src={item.photoUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-gray-600 leading-relaxed bg-brand-soft/10 p-4 rounded-xl italic border border-brand-soft/20">
                                                                        "{item.note}"
                                                                    </p>
                                                                </div>
                                                             </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {(!skinLogs || skinLogs.length === 0) && (
                                                    <div className="pl-10 text-gray-500 italic">
                                                        {t('skinEvolution.empty')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'prescriptions' && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.prescriptions.title')}</h2>
                                        {isLoadingPrescriptions ? (
                                            <div className="text-center py-10 text-gray-400">Loading...</div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {prescriptions?.map((script) => (
                                                    <div key={script.id} className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-sm transition-all group">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-brand-soft/30 flex items-center justify-center text-brand-dark">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-brand-dark">
                                                                        Dr. {script.doctor?.user?.profile?.firstName} {script.doctor?.user?.profile?.lastName}
                                                                    </h4>
                                                                    <p className="text-xs text-brand-muted">
                                                                        {script.date ? format(new Date(script.date), 'dd MMM yyyy') : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a 
                                                                href={script.pdfUrl ? `${API_CONFIG.BASE_IMAGE_URL}${script.pdfUrl}` : '#'} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className={cn(
                                                                    "p-2 hover:bg-gray-50 rounded-full transition-colors flex items-center justify-center",
                                                                    !script.pdfUrl && "opacity-50 cursor-not-allowed pointer-events-none"
                                                                )}
                                                                title={script.pdfUrl ? "Télécharger le PDF" : "PDF en cours de génération"}
                                                            >
                                                                <Download className="w-5 h-5 text-gray-400 group-hover:text-brand-dark" />
                                                            </a>
                                                        </div>
                                                        <div className="pl-13">
                                                            <p className="text-sm text-gray-600 font-medium bg-gray-50 p-3 rounded-xl inline-block">
                                                                {script.medications?.map(m => m.name).join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!prescriptions || prescriptions.length === 0) && (
                                                    <div className="text-center py-10 text-gray-400 italic">
                                                        {t('profile.prescriptions.empty') || 'Aucune ordonnance'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'appointments' && (
                                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                         <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.appointments.title')}</h2>
                                         
                                         {isLoadingAppointments ? (
                                             <div className="text-center py-10 text-gray-400">Loading...</div>
                                         ) : (
                                             <div className="space-y-4">
                                                 {/* PROPOSED (Needs Action) */}
                                                 {appointments?.filter(a => a.status === 'proposed').map(appointment => (
                                                     <div key={appointment.id} className="bg-brand-soft/20 border-l-4 border-brand-default p-5 rounded-r-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-soft">
                                                         <div className="flex items-start gap-4">
                                                             <div className="w-12 h-12 rounded-full bg-brand-soft/50 flex items-center justify-center text-brand-dark shrink-0">
                                                                 <User className="w-6 h-6" />
                                                             </div>
                                                             <div>
                                                                 <h4 className="font-bold text-brand-dark text-lg">
                                                                     Dr. {appointment.doctor?.user?.profile?.firstName} {appointment.doctor?.user?.profile?.lastName}
                                                                 </h4>
                                                                 <p className="text-sm text-brand-muted mb-1 font-bold uppercase tracking-wider">{t('profile.appointments.proposed')}</p>
                                                                 <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
                                                                     <Calendar className="w-4 h-4" />
                                                                     <span>{format(new Date(appointment.scheduledDate), 'dd MMM yyyy • HH:mm')}</span>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                         <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => handleRejectConsultation(appointment.id)}
                                                                disabled={rejectConsultationMutation.isPending}
                                                                className="px-4 py-2 bg-white text-red-500 text-sm font-bold rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                                                            >
                                                                {rejectConsultationMutation.isPending ? '...' : t('common.reject') || 'Refuser'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAcceptConsultation(appointment.id)}
                                                                disabled={acceptConsultationMutation.isPending}
                                                                className="bg-brand-default text-white text-sm px-4 py-2 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-lg"
                                                            >
                                                                {acceptConsultationMutation.isPending ? '...' : t('common.accept') || 'Accepter'}
                                                            </button>
                                                         </div>
                                                     </div>
                                                 ))}

                                                 {/* UPCOMING */}
                                                  {appointments?.filter(a => a.status === 'scheduled' && new Date(a.scheduledDate) >= new Date()).map(appointment => (
                                                      <div 
                                                          key={appointment.id} 
                                                          onClick={() => navigate(`/consultations/${appointment.id}`)}
                                                          className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer group"
                                                      >
                                                          <div className="flex items-start gap-4">
                                                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 group-hover:bg-brand-default group-hover:text-white transition-colors">
                                                                  <User className="w-6 h-6" />
                                                              </div>
                                                              <div>
                                                                  <h4 className="font-bold text-brand-dark text-lg group-hover:text-brand-default transition-colors">
                                                                      Dr. {appointment.doctor?.user?.profile?.firstName} {appointment.doctor?.user?.profile?.lastName}
                                                                  </h4>
                                                                  <p className="text-sm text-brand-muted mb-1 capitalize">{appointment.consultationType || 'Consultation'}</p>
                                                                  <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
                                                                      <Calendar className="w-4 h-4" />
                                                                      <span>{format(new Date(appointment.scheduledDate), 'dd MMM yyyy • HH:mm')}</span>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                          <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide",
                                                                appointment.status === 'scheduled' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {appointment.status}
                                                            </span>
                                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-default" />
                                                          </div>
                                                      </div>
                                                  ))}
                                                 
                                                 {/* PAST */}
                                                 {appointments && appointments.filter(a => a.status === 'completed' || (new Date(a.scheduledDate) < new Date() && a.status !== 'proposed')).length > 0 && (
                                                     <>
                                                         <h3 className="font-bold text-brand-muted uppercase tracking-wider text-sm mt-8 mb-4">Passés</h3>
                                                         {appointments?.filter(a => a.status === 'completed' || (new Date(a.scheduledDate) < new Date() && a.status !== 'proposed')).map(appointment => (
                                                             <div key={appointment.id} className="bg-gray-50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity">
                                                                 <div className="flex items-start gap-4">
                                                                     <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                                                         <User className="w-6 h-6" />
                                                                     </div>
                                                                     <div>
                                                                         <h4 className="font-bold text-gray-700 text-lg">
                                                                             Dr. {appointment.doctor?.user?.profile?.firstName} {appointment.doctor?.user?.profile?.lastName}
                                                                         </h4>
                                                                         <p className="text-sm text-gray-500 mb-1 capitalize">{appointment.consultationType || 'Consultation'}</p>
                                                                         <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                                             <Calendar className="w-4 h-4" />
                                                                             <span>{format(new Date(appointment.scheduledDate), 'dd MMM yyyy • HH:mm')}</span>
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                                 <div>
                                                                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">{appointment.status}</span>
                                                                 </div>
                                                             </div>
                                                         ))}
                                                     </>
                                                 )}

                                                 {(!appointments || appointments.length === 0) && (
                                                     <div className="text-center py-10 text-gray-400 italic">
                                                         {t('profile.appointments.empty') || 'Aucun rendez-vous'}
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                )}

                                {activeTab === 'orders' && (() => {
                                    const orders = Array.isArray(myOrdersData) ? myOrdersData : (myOrdersData as any)?.data || [];
                                    return (
                                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                         <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.orders.title')}</h2>

                                         {isLoadingOrders && (
                                             <div className="flex items-center justify-center py-16">
                                                 <div className="w-8 h-8 border-3 border-brand-default border-t-transparent rounded-full animate-spin" />
                                             </div>
                                         )}

                                         {!isLoadingOrders && orders.length === 0 && (
                                             <div className="text-center py-16">
                                                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                     <Package className="w-8 h-8 text-gray-300" />
                                                 </div>
                                                 <p className="text-gray-400 italic">{t('profile.orders.empty')}</p>
                                             </div>
                                         )}

                                         {!isLoadingOrders && orders.length > 0 && (
                                             <div className="grid gap-4">
                                                 {orders.map((order: any) => {
                                                     const statusColors: Record<string, string> = {
                                                         pending: 'bg-amber-100 text-amber-700',
                                                         processing: 'bg-blue-100 text-blue-700',
                                                         shipped: 'bg-purple-100 text-purple-700',
                                                         delivered: 'bg-green-100 text-green-700',
                                                         cancelled: 'bg-red-100 text-red-700',
                                                     };
                                                     const paymentColors: Record<string, string> = {
                                                         pending: 'text-amber-600',
                                                         paid: 'text-green-600',
                                                         failed: 'text-red-600',
                                                         refunded: 'text-gray-600',
                                                     };
                                                     return (
                                                         <div key={order.id} className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-sm transition-all">
                                                             <div className="flex items-start justify-between mb-4">
                                                                 <div className="flex items-start gap-4">
                                                                     <div className="w-12 h-12 bg-brand-default/10 text-brand-default rounded-2xl flex items-center justify-center flex-shrink-0">
                                                                         <Package className="w-6 h-6" />
                                                                     </div>
                                                                     <div>
                                                                         <h4 className="font-bold text-gray-700 text-lg">
                                                                             {t('profile.orders.orderNumber', { id: order.orderNumber })}
                                                                         </h4>
                                                                         <p className="text-sm text-gray-500">
                                                                             {format(new Date(order.createdAt), 'dd MMM yyyy • HH:mm')}
                                                                         </p>
                                                                         <p className={cn('text-xs font-medium mt-1', paymentColors[order.paymentStatus] || 'text-gray-500')}>
                                                                             {t(`profile.orders.payment.${order.paymentStatus}`)}
                                                                         </p>
                                                                     </div>
                                                                 </div>
                                                                 <span className={cn('text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide', statusColors[order.status] || 'bg-gray-200 text-gray-600')}>
                                                                     {t(`profile.orders.status.${order.status}`)}
                                                                 </span>
                                                             </div>

                                                             {order.items && order.items.length > 0 && (
                                                                 <div className="border-t border-gray-50 pt-4 mt-2">
                                                                     <div className="flex flex-wrap gap-3">
                                                                         {order.items.map((item: any) => (
                                                                             <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                                                                 {item.productImage && (
                                                                                     <img src={getImageUrl(item.productImage)} alt={item.productName || ''} className="w-8 h-8 rounded-lg object-cover" />
                                                                                 )}
                                                                                 <div className="text-sm">
                                                                                     <span className="font-medium text-gray-700">{item.productName}</span>
                                                                                     <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                                                                 </div>
                                                                             </div>
                                                                         ))}
                                                                     </div>
                                                                 </div>
                                                             )}

                                                             <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                                                 <span className="text-sm font-bold text-brand-dark">
                                                                     {t('profile.orders.total')}: {order.totalAmount?.toLocaleString()} {order.currency || 'FCFA'}
                                                                 </span>
                                                                 {order.trackingToken && (
                                                                     <Link to={`/track/${order.trackingToken}`} className="text-sm text-brand-default font-semibold hover:underline">
                                                                         {t('profile.orders.trackOrder')}
                                                                     </Link>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                         )}
                                     </div>
                                    );
                                })()}

                                {/* Placeholder for other tabs */}


                                {activeTab === 'cart' && (
                                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                         <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.cart.title')}</h2>
                                         <div className="text-center py-10 text-gray-400 italic">
                                              {t('profile.cart.empty') || 'Votre panier est vide'}
                                         </div>
                                     </div>
                                )}

                                {activeTab === 'documents' && (
                                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                         <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.documents.title')}</h2>
                                         <div className="text-center py-10 text-gray-400 italic">
                                              {t('profile.documents.empty') || 'Aucun document disponible'}
                                         </div>
                                     </div>
                                )}

                                {activeTab === 'settings' && (
                                     <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                         <h2 className="text-2xl font-serif font-bold text-brand-dark mb-8">{t('profile.settings.title')}</h2>
                                         <div className="space-y-2">
                                             <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                 <div>
                                                     <h4 className="font-bold text-brand-dark">{t('profile.settings.notifications')}</h4>
                                                     <p className="text-sm text-brand-muted">{t('profile.settings.notificationsDesc')}</p>
                                                 </div>
                                                 <div className="w-12 h-6 bg-brand-default rounded-full relative cursor-pointer">
                                                     <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                                 </div>
                                             </div>
                                             <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                 <div>
                                                     <h4 className="font-bold text-brand-dark">{t('profile.settings.language')}</h4>
                                                     <p className="text-sm text-brand-muted">{t('profile.settings.currentLang')}</p>
                                                 </div>
                                                 <ChevronRight className="w-5 h-5 text-gray-400" />
                                             </div>
                                         </div>
                                     </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Viewer Modal */}
                {viewingImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setViewingImage(null)}
                    >
                        <div className="relative max-w-6xl max-h-[90vh] w-full">
                            <button
                                onClick={() => setViewingImage(null)}
                                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={viewingImage}
                                alt="Full size view"
                                className="w-full h-full object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <AddPhotoModal
                    isOpen={isAddPhotoModalOpen}
                    onClose={() => setIsAddPhotoModalOpen(false)}
                    onSave={handleAddPhoto}
                />
            </div>
            <Footer />
        </PageTransition>
    );
}
