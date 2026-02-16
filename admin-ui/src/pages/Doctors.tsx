import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd, MdSearch, MdFilterList, MdEdit, MdDelete, MdVerified } from 'react-icons/md';
import { useDoctors, useDeleteDoctor } from '../hooks/useDoctors';

export default function Doctors() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useDoctors({
    search: search || undefined,
    status: status as any || undefined,
    page,
    limit,
  });

  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();

  const handleDelete = (id: string, firstName: string, lastName: string) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${firstName} ${lastName}?`)) {
      deleteDoctor(id);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-brand-text mb-2">
            Doctors Management
          </h1>
          <p className="text-brand-muted text-sm lg:text-base">
            Manage doctor profiles and credentials
          </p>
        </div>
        <Link
          to="/doctors/add"
          className="mt-4 lg:mt-0 inline-flex items-center gap-2 bg-[#9B563A] text-white px-4 py-2.5 rounded-lg hover:bg-[#7A4429] transition-colors font-medium"
        >
          <MdAdd className="text-xl" />
          Add New Doctor
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B563A] focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B563A] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        ) : data?.doctors && data.doctors.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      Doctor
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      License
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      Specialization
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      Experience
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9B563A] to-[#7A4429] flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              Dr
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                Dr. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                              </p>
                              {doctor.verificationStatus === 'verified' && (
                                <MdVerified className="text-[#9B563A] text-sm" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {doctor.languagesSpoken.join(', ')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{doctor.licenseNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">{doctor.specialization}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-900">
                          {doctor.yearsOfExperience} years
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            doctor.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : doctor.status === 'inactive'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {doctor.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/doctors/edit/${doctor.id}`}
                            className="p-2 text-[#9B563A] hover:bg-[#FDDDCB]/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="text-lg" />
                          </Link>
                          <button
                            onClick={() => handleDelete(doctor.id, doctor.user.profile.firstName, doctor.user.profile.lastName)}
                            disabled={isDeleting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} doctors
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No doctors found</p>
            <Link
              to="/doctors/add"
              className="inline-flex items-center gap-2 bg-[#9B563A] text-white px-4 py-2 rounded-lg hover:bg-[#7A4429] transition-colors font-medium"
            >
              <MdAdd className="text-xl" />
              Add First Doctor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
