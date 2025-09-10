import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Users,
  Film,
} from 'lucide-react';

const Students = () => {
  const { isAdmin, isProducer } = useAuth();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Fetch students with filters
  const { data: studentsData, isLoading } = useQuery(
    ['students', { page, search, yearFilter, programFilter, sortBy, sortOrder }],
    () =>
      studentsAPI.getAll({
        page,
        limit: 20,
        search,
        year: yearFilter,
        program: programFilter,
        sortBy,
        sortOrder,
      }).then(res => res.data),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const students = studentsData?.students || [];
  const totalPages = studentsData?.totalPages || 1;
  const totalCount = studentsData?.totalCount || 0;

  const yearOptions = [1, 2, 3, 4];
  const programOptions = [
    'Film Production',
    'Cinematography', 
    'Film Editing',
    'Sound Design',
    'Directing',
    'Screenwriting',
  ];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setYearFilter('');
    setProgramFilter('');
    setPage(1);
  };

  const exportStudents = async () => {
    try {
      // This would typically call an export endpoint
      console.log('Export functionality would be implemented here');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Students
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage student information and assignments ({totalCount} total)
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={exportStudents}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            {(isAdmin || isProducer) && (
              <Link
                to="/students/new"
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Student
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="form-input pl-10"
                />
              </div>

              {/* Year Filter */}
              <div>
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Filter */}
              <div>
                <select
                  value={programFilter}
                  onChange={(e) => {
                    setProgramFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  <option value="">All Programs</option>
                  {programOptions.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn-secondary"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="card">
          <div className="card-body p-0">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500 mb-4">
                  {search || yearFilter || programFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first student'}
                </p>
                {!search && !yearFilter && !programFilter && (isAdmin || isProducer) && (
                  <Link to="/students/new" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <button
                            onClick={() => handleSort('lastName')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Student</span>
                            {sortBy === 'lastName' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>
                          <button
                            onClick={() => handleSort('studentId')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Student ID</span>
                            {sortBy === 'studentId' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>Contact</th>
                        <th>
                          <button
                            onClick={() => handleSort('year')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Year & Program</span>
                            {sortBy === 'year' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>Projects</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <User className="h-6 w-6 text-primary-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm text-gray-900 font-mono">
                            {student.studentId}
                          </td>
                          <td>
                            <div className="text-sm text-gray-900 space-y-1">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <a href={`mailto:${student.email}`} className="hover:text-primary-600">
                                  {student.email}
                                </a>
                              </div>
                              {student.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                  <a href={`tel:${student.phone}`} className="hover:text-primary-600">
                                    {student.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center text-sm text-gray-900">
                              <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium">Year {student.year}</div>
                                <div className="text-gray-500">{student.program}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center text-sm text-gray-900">
                              <Film className="w-4 h-4 text-gray-400 mr-2" />
                              {student.projects?.length || 0} projects
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/students/${student.id}`}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {(isAdmin || isProducer) && (
                                <>
                                  <Link
                                    to={`/students/${student.id}/edit`}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                    title="Edit Student"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  <button
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {students.map((student) => (
                    <div key={student.id} className="border-b border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-600" />
                              </div>
                            </div>
                            <h3 className="ml-2 text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>ID: {student.studentId}</div>
                            <div>Year {student.year} • {student.program}</div>
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {student.email}
                            </div>
                            {student.phone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {student.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/students/${student.id}`}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalCount)} of {totalCount} students
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;