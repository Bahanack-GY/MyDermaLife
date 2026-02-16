import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile, useUpdateProfilePhoto } from '../api/features/auth';
import { useUpdateDoctorProfile, useSyncStats } from '../api/features/doctors';
import type { UpdateDoctorProfileDto } from '../api/features/doctors';
import { User, Mail, Phone, Award, Globe, DollarSign, FileText, BadgeCheck, Save, Loader2, X, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const { t } = useTranslation();
  const { data: doctor, isLoading } = useProfile();
  const updateProfileMutation = useUpdateDoctorProfile();
  const updateProfilePhotoMutation = useUpdateProfilePhoto();
  const syncStatsMutation = useSyncStats();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateDoctorProfileDto>({});

  // Initialize form data when doctor loads or when editing starts
  useEffect(() => {
    if (doctor) {
      setFormData({
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
        yearsOfExperience: doctor.yearsOfExperience,
        bio: doctor.bio,
        languagesSpoken: doctor.languagesSpoken,
        consultationFee: doctor.consultationFee,
        videoConsultationFee: doctor.videoConsultationFee,
        signature: doctor.signature
      });
    }
  }, [doctor, isEditing]);

  const handleInputChange = (field: keyof UpdateDoctorProfileDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguagesChange = (value: string) => {
    // Split by comma and trim
    const languages = value.split(',').map(l => l.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, languagesSpoken: languages }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(t('profile.updateSuccess', 'Profile updated successfully'));
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(t('profile.updateError', 'Failed to update profile'));
        console.error(error);
      }
    });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(t('profile.photoTooLarge', 'Image size must be less than 10MB'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfilePhotoMutation.mutate(base64String, {
            onSuccess: () => {
                toast.success(t('profile.photoUpdateSuccess', 'Profile photo updated successfully'));
            },
            onError: (error) => {
                toast.error(t('profile.photoUpdateError', 'Failed to update profile photo'));
                console.error(error);
            }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin text-brand-default" /></div>;
  }

  const firstName = doctor?.user?.profile?.firstName || '';
  const lastName = doctor?.user?.profile?.lastName || '';
  const fullName = `Dr. ${firstName} ${lastName}`;
  const profilePhoto = doctor?.user?.profile?.profilePhoto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark">{t('profile.title', 'My Profile')}</h1>
          <p className="text-brand-muted">{t('profile.subtitle', 'Manage your account settings and preferences')}</p>
        </div>
        <div className="flex gap-2">
            {isEditing && (
                <button 
                onClick={() => setIsEditing(false)}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 border border-brand-soft text-brand-text rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                <X className="w-4 h-4" />
                {t('common.cancel', 'Cancel')}
                </button>
            )}
            <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={updateProfileMutation.isPending}
            className="px-4 py-2 bg-brand-default text-white rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-70"
            >
            {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? t('common.save', 'Save Changes') : t('common.edit', 'Edit Profile')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer" onClick={handlePhotoClick}>
              <img 
                src={profilePhoto} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-brand-light shadow-md transition-opacity group-hover:opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {updateProfilePhotoMutation.isPending ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                    <div className="flex flex-col items-center">
                        <Camera className="w-8 h-8 text-white mb-2" />
                        <span className="text-white text-xs font-medium">{t('profile.changePhoto', 'Change Photo')}</span>
                    </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                disabled={updateProfilePhotoMutation.isPending}
              />
            </div>
            
            <h2 className="text-xl font-bold text-brand-dark mb-1">{fullName}</h2>
            <p className="text-brand-default font-medium mb-3">{doctor?.specialization}</p>
            
            <div className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-brand-muted bg-brand-light/30 py-2 rounded-lg">
              <BadgeCheck className="w-4 h-4 text-green-500" />
              <span>{doctor?.verificationStatus}</span>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <div className="flex justify-between items-center mb-4 border-b border-brand-soft pb-2">
                <h3 className="font-serif font-semibold text-brand-dark">
                {t('profile.accountStatus', 'Account Status')}
                </h3>
                <button 
                  onClick={() => syncStatsMutation.mutate()} 
                  disabled={syncStatsMutation.isPending} 
                  className="text-brand-muted hover:text-brand-default transition-colors p-1 rounded-full hover:bg-gray-100" 
                  title={t('common.refresh', 'Refresh')}
                >
                    <RefreshCw className={`w-4 h-4 ${syncStatsMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">{t('profile.consultations', 'Consultations')}</span>
                <span className="font-semibold text-brand-dark">{doctor?.totalConsultations || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">{t('profile.rating', 'Rating')}</span>
                <span className="font-semibold text-brand-dark">{doctor?.rating || 0}/5.0</span>
              </div>
               <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">{t('profile.memberSince', 'Member Since')}</span>
                <span className="font-semibold text-brand-dark">
                  {new Date(doctor?.createdAt || '').getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form/View */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information (Read Only) */}
          <section className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-default" />
              {t('profile.personalInfo', 'Personal Information')}
              <span className="ml-auto text-xs text-brand-muted font-normal">(Contact admin to change)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.firstName', 'First Name')}</label>
                <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg border border-transparent">
                  {doctor?.user?.profile?.firstName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.lastName', 'Last Name')}</label>
                <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg border border-transparent">
                  {doctor?.user?.profile?.lastName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.email', 'Email')}</label>
                <div className="flex items-center gap-2 text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                  <Mail className="w-4 h-4 text-brand-muted" />
                  {doctor?.user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.phone', 'Phone')}</label>
                <div className="flex items-center gap-2 text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                  <Phone className="w-4 h-4 text-brand-muted" />
                  {doctor?.user?.phone}
                </div>
              </div>
            </div>
          </section>

          {/* Professional Information (Editable) */}
          <section className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-default" />
              {t('profile.professionalInfo', 'Professional Information')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.specialization', 'Specialization')}</label>
                {isEditing ? (
                    <input 
                        type="text"
                        value={formData.specialization || ''}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                    />
                ) : (
                    <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                    {doctor?.specialization}
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.licenseNumber', 'License Number')}</label>
                {isEditing ? (
                    <input 
                        type="text"
                        value={formData.licenseNumber || ''}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                    />
                ) : (
                    <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                    {doctor?.licenseNumber}
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.yearsOfExperience', 'Years of Experience')}</label>
                {isEditing ? (
                    <input 
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience || 0}
                        onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                        className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                    />
                ) : (
                    <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                    {doctor?.yearsOfExperience} {t('profile.years', 'years')}
                    </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.languages', 'Languages')}</label>
                {isEditing ? (
                    <input 
                        type="text"
                        value={formData.languagesSpoken?.join(', ') || ''}
                        onChange={(e) => handleLanguagesChange(e.target.value)}
                        placeholder={t('profile.languagesPlaceholder', 'English, French, Spanish')}
                        className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                    />
                ) : (
                    <div className="flex items-center gap-2 flex-wrap bg-gray-50 p-2.5 rounded-lg min-h-[42px]">
                    <Globe className="w-4 h-4 text-brand-muted mr-1" />
                    {doctor?.languagesSpoken?.map((lang: string, idx: number) => (
                        <span key={idx} className="bg-white border border-brand-soft px-2 py-0.5 rounded text-xs text-brand-text">
                        {lang}
                        </span>
                    ))}
                    </div>
                )}
              </div>
            </div>
          </section>

          {/* Consultation Fees (Editable) */}
          <section className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-default" />
              {t('profile.consultationFees', 'Consultation Fees')}
            </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.inPersonConsultation', 'In-Person Consultation')}</label>
                <div className="relative">
                    {isEditing ? (
                        <input 
                            type="number"
                            min="0"
                            value={formData.consultationFee || 0}
                            onChange={(e) => handleInputChange('consultationFee', parseFloat(e.target.value) || 0)}
                            className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                        />
                    ) : (
                        <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                        {doctor?.consultationFee} 
                        </div>
                    )}
                    <span className="absolute right-3 top-2.5 text-brand-muted text-sm font-medium pointer-events-none">FCFA</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">{t('profile.videoConsultation', 'Video Consultation')}</label>
                <div className="relative">
                    {isEditing ? (
                        <input 
                            type="number"
                            min="0"
                            value={formData.videoConsultationFee || 0}
                            onChange={(e) => handleInputChange('videoConsultationFee', parseFloat(e.target.value) || 0)}
                            className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none"
                        />
                    ) : (
                        <div className="text-brand-text font-medium bg-gray-50 p-2.5 rounded-lg">
                        {doctor?.videoConsultationFee} 
                        </div>
                    )}
                     <span className="absolute right-3 top-2.5 text-brand-muted text-sm font-medium pointer-events-none">FCFA</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bio (Editable) */}
           <section className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-default" />
              {t('profile.bio', 'Professional Bio')}
            </h3>
             {isEditing ? (
                <textarea 
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full text-brand-text p-2.5 rounded-lg border border-brand-soft focus:ring-1 focus:ring-brand-default focus:border-brand-default outline-none resize-none"
                />
            ) : (
                <div className="text-brand-text bg-gray-50 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
                {doctor?.bio || t('profile.noBio', "No bio available.")}
                </div>
            )}
            
          </section>

          {/* Signature Upload */}
          <section className="bg-white rounded-xl shadow-sm border border-brand-soft/50 p-6">
            <h3 className="font-serif font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-default" />
              {t('profile.signature', 'Digital Signature')}
            </h3>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-soft rounded-lg p-6 bg-gray-50">
                {formData.signature || doctor?.signature ? (
                    <div className="relative group w-full max-w-sm mb-4 flex justify-center">
                         <img 
                            src={formData.signature || doctor?.signature} 
                            alt="Signature" 
                            className="h-32 object-contain bg-white rounded border border-brand-soft"
                        />
                         {isEditing && (
                            <button
                                onClick={() => setFormData(prev => ({...prev, signature: ''}))}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                         )}
                    </div>
                ) : (
                    <div className="text-center text-brand-muted mb-4">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>{t('profile.noSignature', 'No signature uploaded')}</p>
                    </div>
                )}

                {isEditing && (
                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            id="signature-upload"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                     if (file.size > 2 * 1024 * 1024) { // 2MB
                                        toast.error(t('profile.photoTooLarge', 'Image size must be less than 2MB'));
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleInputChange('signature', reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label 
                            htmlFor="signature-upload"
                            className="cursor-pointer px-4 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-soft transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Camera className="w-4 h-4" />
                            {t('profile.uploadSignature', 'Upload Signature')}
                        </label>
                    </div>
                )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
