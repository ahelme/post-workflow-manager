import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Film,
} from 'lucide-react';

const Projects = () => {
  const { user, isAdmin, isProducer } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');

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
    { value: 'pre-production', label: 'Pre-Production' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'post-production', label: 'Post-Production' },
    { value: 'grading', label: 'Grading' },
    { value: 'audio-mix', label: 'Audio Mix' },
    { value: 'complete', label: 'Complete' },
  ];

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pre-production': 'badge-pre-production',
      'shooting': 'badge-shooting',
      'post-production': 'badge-post-production',
      'grading': 'badge-grading',
      'audio-mix': 'badge-audio-mix',
      'complete': 'badge-complete',
    };
    return statusClasses[status] || 'badge-pre-production';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'grading':
      case 'audio-mix':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  const exportProjects = async () => {
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
            <p className="mt-4 text-gray-500">Loading projects...</p>
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
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your film production projects ({totalCount} total)
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={exportProjects}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <Link
              to="/projects/new"
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
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
                  <Search className="h-5 w-5 text-gray-400" />
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
                  <Filter className="w-4 h-4 mr-2" />
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
                <Film className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 mb-4">
                  {search || statusFilter || studentFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first project'}
                </p>
                {!search && !statusFilter && !studentFilter && (
                  <Link to="/projects/new" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
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
                            <span>Delivery Date</span>
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
                                  {project.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {project.genre} • {project.duration}min
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
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
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              {project.finalDeliveryDate
                                ? new Date(project.finalDeliveryDate).toLocaleDateString()
                                : 'Not set'}
                            </div>
                          </td>
                          <td className="text-sm text-gray-500">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/projects/${project.id}`}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/projects/${project.id}/edit`}
                                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                title="Edit Project"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              {(isAdmin || isProducer) && (
                                <button
                                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                              {project.title}
                            </h3>
                          </div>
                          <div className="mb-2">
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {project.student
                                ? `${project.student.firstName} ${project.student.lastName}`
                                : 'Unassigned'}
                            </div>
                            {project.finalDeliveryDate && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(project.finalDeliveryDate).toLocaleDateString()}
                              </div>
                            )}
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