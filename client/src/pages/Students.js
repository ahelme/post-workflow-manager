import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Icons removed for clean minimal design

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

  const importStudents = async () => {
    try {
      // This would typically call an import endpoint
      console.log('Import functionality would be implemented here');
    } catch (error) {
      console.error('Import failed:', error);
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
              onClick={importStudents}
              className="btn text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-primary-500"
            >
              Import
            </button>
            <button
              onClick={exportStudents}
              className="btn text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-primary-500"
            >
              Export
            </button>
            {(isAdmin || isProducer) && (
              <Link
                to="/students/new"
                className="btn-primary"
              >
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
                  <span className="text-gray-400"></span>
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
                  <span className="mr-2">✖</span>
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
                <span className="text-6xl text-gray-300 mb-4 block"></span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500 mb-4">
                  {search || yearFilter || programFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first student'}
                </p>
                {!search && !yearFilter && !programFilter && (isAdmin || isProducer) && (
                  <Link to="/students/new" className="btn-primary">
                    <span className="mr-2">+</span>
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
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                          </td>
                          <td className="text-sm text-gray-900 font-mono">
                            {student.studentId}
                          </td>
                          <td>
                            <div className="text-sm text-gray-900 space-y-1">
                              <div>
                                <a href={`mailto:${student.email}`} className="hover:text-primary-600">
                                  {student.email}
                                </a>
                              </div>
                              {student.phone && (
                                <div className="text-xs text-gray-500">
                                  <a href={`tel:${student.phone}`} className="hover:text-primary-600">
                                    {student.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">Year {student.year}</div>
                              <div className="text-xs text-gray-500">{student.program}</div>
                            </div>
                          </td>
                          <td>
                            <div className="text-sm text-gray-900">
                              {student.projects?.length || 0} projects
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/students/${student.id}`}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded"
                                title="View Details"
                              >
                                View
                              </Link>
                              {(isAdmin || isProducer) && (
                                <>
                                  <Link
                                    to={`/students/${student.id}/edit`}
                                    className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded"
                                    title="Edit Student"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    className="px-3 py-1 text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded"
                                    title="Delete Student"
                                  >
                                    Delete
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
                          <div className="mb-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>ID: {student.studentId}</div>
                            <div className="text-xs">Year {student.year} • {student.program}</div>
                            <div>
                              {student.email}
                            </div>
                            {student.phone && (
                              <div>
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