import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdDelete, MdArrowBack } from 'react-icons/md';
import { useCreateDoctor, useUpdateDoctor, useDoctor } from '../hooks/useDoctors';
import type { Education, Certification } from '../services/doctor.service';

export default function DoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Fetch doctor data if editing
  const { data: doctorData, isLoading: isLoadingDoctor } = useDoctor(id || '');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: 0,
    bio: '',
    education: [{ degree: '', institution: '', year: new Date().getFullYear() }] as Education[],
    certifications: [{ name: '', year: new Date().getFullYear() }] as Certification[],
    languagesSpoken: [''],
  });

  // Update form when doctor data is loaded
  useEffect(() => {
    if (doctorData && isEditMode) {
      setFormData({
        email: doctorData.user.email,
        password: '', // Password not needed for edit
        firstName: doctorData.user.profile.firstName,
        lastName: doctorData.user.profile.lastName,
        phone: doctorData.user.phone || '',
        licenseNumber: doctorData.licenseNumber,
        specialization: doctorData.specialization,
        yearsOfExperience: doctorData.yearsOfExperience,
        bio: doctorData.bio,
        education: doctorData.education.length > 0 ? doctorData.education : [{ degree: '', institution: '', year: new Date().getFullYear() }],
        certifications: doctorData.certifications.length > 0 ? doctorData.certifications : [{ name: '', year: new Date().getFullYear() }],
        languagesSpoken: doctorData.languagesSpoken.length > 0 ? doctorData.languagesSpoken : [''],
      });
    }
  }, [doctorData, isEditMode]);

  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();

  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Filter out empty education entries
    const filteredEducation = formData.education.filter(
      (edu) => edu.degree && edu.institution && edu.year
    );

    // Filter out empty certification entries
    const filteredCertifications = formData.certifications.filter(
      (cert) => cert.name && cert.year
    );

    // Filter out empty languages
    const filteredLanguages = formData.languagesSpoken.filter((lang) => lang.trim());

    const payload = {
      ...formData,
      education: filteredEducation.length > 0 ? filteredEducation : undefined,
      certifications: filteredCertifications.length > 0 ? filteredCertifications : undefined,
      languagesSpoken: filteredLanguages.length > 0 ? filteredLanguages : undefined,
    };

    if (isEditMode && id) {
      // Remove password and email from edit payload
      const { password, email, ...editPayload } = payload;
      updateDoctor(
        { id, data: editPayload },
        { onSuccess: () => navigate('/doctors') }
      );
    } else {
      createDoctor(payload, { onSuccess: () => navigate('/doctors') });
    }
  };

  // Education handlers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: new Date().getFullYear() }],
    });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  // Certification handlers
  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', year: new Date().getFullYear() }],
    });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  const updateCertification = (index: number, field: keyof Certification, value: string | number) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, certifications: updated });
  };

  // Language handlers
  const addLanguage = () => {
    setFormData({
      ...formData,
      languagesSpoken: [...formData.languagesSpoken, ''],
    });
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languagesSpoken: formData.languagesSpoken.filter((_, i) => i !== index),
    });
  };

  const updateLanguage = (index: number, value: string) => {
    const updated = [...formData.languagesSpoken];
    updated[index] = value;
    setFormData({ ...formData, languagesSpoken: updated });
  };

  if (isLoadingDoctor && isEditMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B563A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/doctors')}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <MdArrowBack className="text-2xl text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-brand-text">
            {isEditMode ? 'Edit Doctor' : 'Add New Doctor'}
          </h1>
          <p className="text-brand-muted text-sm lg:text-base">
            {isEditMode ? 'Update doctor information' : 'Create a new doctor profile'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="dr.dupont@example.com"
                  disabled={isEditMode}
                />
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                    placeholder="Secure password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="+237600000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="e.g., DRM-CM-2020-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="e.g., Dermatologie générale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent resize-none"
                placeholder="Experienced dermatologist specializing in..."
              />
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-gray-900">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 text-[#9B563A] hover:text-[#7A4429] font-medium text-sm"
              >
                <MdAdd className="text-lg" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                        placeholder="Docteur en Médecine"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                        placeholder="Université de Douala"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                        placeholder="2015"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-gray-900">Certifications</h2>
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 text-[#9B563A] hover:text-[#7A4429] font-medium text-sm"
              >
                <MdAdd className="text-lg" />
                Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                        placeholder="Board Certified Dermatologist"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={cert.year}
                        onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                        placeholder="2018"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-gray-900">Languages Spoken</h2>
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-2 text-[#9B563A] hover:text-[#7A4429] font-medium text-sm"
              >
                <MdAdd className="text-lg" />
                Add Language
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.languagesSpoken.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lang}
                    onChange={(e) => updateLanguage(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A]"
                    placeholder="French"
                  />
                  {formData.languagesSpoken.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-[#9B563A] text-white rounded-lg hover:bg-[#7A4429] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Doctor' : 'Create Doctor')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              disabled={isPending}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
