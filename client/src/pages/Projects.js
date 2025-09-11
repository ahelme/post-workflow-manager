import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Icons removed for clean minimal design

const Projects = () => {
  const { user, isAdmin, isProducer } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Set status filter from URL parameter
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Fetch projects with filters
  const { data: projectsData, isLoading, refetch } = useQuery(
    ['projects', { page, search, statusFilter, studentFilter, sortBy, sortOrder }],
    () =>
      projectsAPI.getAll({
        page,
        limit: 20,
        search,
        status: statusFilter,
        student: studentFilter,
        sortBy,
        sortOrder,
      }).then(res => res.data),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch students for filter dropdown
  const { data: studentsData } = useQuery(
    'studentsSimple',
    () => studentsAPI.getSimpleList().then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const projects = projectsData?.projects || [];
  const totalPages = projectsData?.totalPages || 1;
  const totalCount = projectsData?.totalCount || 0;

  const statusOptions = [
    { value: 'development', label: 'Development' },
    { value: 'pre-production', label: 'Pre-Production' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'post-production', label: 'Post-Production' },
    { value: 'grading', label: 'Grading' },
    { value: 'audio-mix', label: 'Audio Mix' },
    { value: 'complete', label: 'Complete' },
  ];

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'development': 'badge-development',
      'pre-production': 'badge-pre-production',
      'shooting': 'badge-shooting',
      'post-production': 'badge-post-production',
      'grading': 'badge-grading',
      'audio-mix': 'badge-audio-mix',
      'complete': 'badge-complete',
    };
    return statusClasses[status] || 'badge-development';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <div className="w-3 h-3 rounded-full bg-green-500"></div>;
      case 'grading':
      case 'audio-mix':
        return <div className="w-3 h-3 rounded-full bg-yellow-500"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500"></div>;
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStudentFilter('');
    setPage(1);
  };

  // Get the next workflow date based on current status
  const getNextWorkflowDate = (project, currentStatus) => {
    const workflow = {
      'development': project.shootDate, // Next: Pre-Production (Shoot Date)
      'pre-production': project.shootDate, // Next: Shooting
      'shooting': project.rushesDeliveryDate, // Next: Post-Production (Rushes)
      'post-production': project.gradeDate, // Next: Grading
      'grading': project.mixDate, // Next: Audio Mix
      'audio-mix': project.finalDeliveryDate, // Next: Complete (Final Delivery)
      'complete': null, // No next step
    };
    return workflow[currentStatus] || project.finalDeliveryDate;
  };

  // Get the column header label based on current status filter
  const getDateColumnLabel = () => {
    const labels = {
      'development': 'Pre Date',
      'pre-production': 'Shoot Date',
      'shooting': 'Rushes Date',
      'post-production': 'Grade Date',
      'grading': 'Mix Date',
      'audio-mix': 'Delivery Date',
      'complete': 'Delivered',
    };
    return labels[statusFilter] || 'Delivery Date';
  };

  const exportProjects = async () => {
    try {
      // This would typically call an export endpoint
      console.log('Export functionality would be implemented here');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const importProjects = async () => {
    try {
      // This would typically call an import endpoint
      console.log('Import functionality would be implemented here');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-7 text-gray-900">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your film production projects ({totalCount} total)
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={importProjects}
              className="btn text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-primary-500"
            >
              Import
            </button>
            <button
              onClick={exportProjects}
              className="btn text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:ring-primary-500"
            >
              Export
            </button>
            <Link
              to="/projects/new"
              className="btn-primary"
            >
              New Project
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="form-input pl-10"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter */}
              <div>
                <select
                  value={studentFilter}
                  onChange={(e) => {
                    setStudentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="form-select"
                >
                  <option value="">All Students</option>
                  {studentsData?.map((student) => (
                    <option key={student.id} value={student.studentId}>
                      {student.label}
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
                  
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="card">
          <div className="card-body p-0">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 mb-4">
                  {search || statusFilter || studentFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first project'}
                </p>
                {!search && !statusFilter && !studentFilter && (
                  <Link to="/projects/new" className="btn-primary">
                    +
                    Create Project
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
                            onClick={() => handleSort('title')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Project</span>
                            {sortBy === 'title' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>
                          <button
                            onClick={() => handleSort('student_id')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Student</span>
                            {sortBy === 'student_id' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>
                          <button
                            onClick={() => handleSort('status')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Status</span>
                            {sortBy === 'status' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>
                          <button
                            onClick={() => handleSort('final_delivery_date')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>{getDateColumnLabel()}</span>
                            {sortBy === 'final_delivery_date' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th>
                          <button
                            onClick={() => handleSort('updated_at')}
                            className="flex items-center space-x-1 hover:text-gray-700"
                          >
                            <span>Last Updated</span>
                            {sortBy === 'updated_at' && (
                              <span className="text-xs">
                                {sortOrder === 'ASC' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td>
                            <div className="flex items-center">
                              {getStatusIcon(project.status)}
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  <Link to={`/projects/${project.id}`} className="hover:text-primary-600">
                                    {project.title}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {project.genre} • {project.duration}min
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center">
                              
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {project.student
                                    ? `${project.student.firstName} ${project.student.lastName}`
                                    : 'Unassigned'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {project.student?.studentId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="text-sm text-gray-900">
                              {(() => {
                                const nextDate = getNextWorkflowDate(project, statusFilter);
                                return nextDate
                                  ? new Date(nextDate).toLocaleDateString()
                                  : 'Not set';
                              })()}
                            </div>
                          </td>
                          <td className="text-sm text-gray-500">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/projects/${project.id}`}
                                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded"
                                title="View Details"
                              >
                                View
                              </Link>
                              <Link
                                to={`/projects/${project.id}/edit`}
                                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 rounded"
                                title="Edit Project"
                              >
                                Edit
                              </Link>
                              {(isAdmin || isProducer) && (
                                <button
                                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded"
                                  title="Delete Project"
                                >
                                  Delete
                                </button>
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
                  {projects.map((project) => (
                    <div key={project.id} className="border-b border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(project.status)}
                            <h3 className="ml-2 text-sm font-medium text-gray-900 truncate">
                              <Link to={`/projects/${project.id}`} className="hover:text-primary-600">
                                {project.title}
                              </Link>
                            </h3>
                          </div>
                          <div className="mb-2">
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center">
                              
                              {project.student
                                ? `${project.student.firstName} ${project.student.lastName}`
                                : 'Unassigned'}
                            </div>
                            {(() => {
                              const nextDate = getNextWorkflowDate(project, statusFilter);
                              return nextDate && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-400 mr-1">{getDateColumnLabel()}:</span>
                                  {new Date(nextDate).toLocaleDateString()}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/projects/${project.id}`}
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
                      Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalCount)} of {totalCount} projects
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

export default Projects;