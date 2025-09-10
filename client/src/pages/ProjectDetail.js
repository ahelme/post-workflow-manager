import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Icons removed for clean minimal design

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isProducer } = useAuth();

  const { data: project, isLoading, error } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

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
        return <span className="text-green-500 text-lg">✓</span>;
      case 'grading':
      case 'audio-mix':
        return <span className="text-yellow-500 text-lg">⏳</span>;
      default:
        return <span className="text-gray-500 text-lg">•</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsAPI.delete(id);
        navigate('/projects');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-6xl text-red-500 mb-4 block">!</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
            <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/projects"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              Back to Projects
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {getStatusIcon(project.status)}
                <h1 className="ml-3 text-3xl font-bold text-gray-900">{project.title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`badge text-base px-3 py-1 ${getStatusBadgeClass(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
                <span className="text-gray-500">
                  {project.genre} • {project.duration} minutes
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-6">
              <Link
                to={`/projects/${project.id}/edit`}
                className="btn-secondary"
              >
                Edit
              </Link>
              {(isAdmin || isProducer) && (
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {project.description && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Description
                  </h3>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              </div>
            )}

            {/* Production Team */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Production Team
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Supervising Producer</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.supervisingProducer || 'Not assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Director</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.director || 'Not assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Editor</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.editor || 'Not assigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sound Engineer</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.soundEngineer || 'Not assigned'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Equipment & Resources */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Equipment & Resources
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Camera Equipment</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.cameraEquipment || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Editing Suite</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.editingSuite || 'Not assigned'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notes
                  </h3>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Student
                </h3>
              </div>
              <div className="card-body">
                {project.student ? (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {project.student.firstName} {project.student.lastName}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      ID: {project.student.studentId}
                    </p>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <a href={`mailto:${project.student.email}`} className="hover:text-primary-600">
                          {project.student.email}
                        </a>
                      </div>
                      {project.student.phone && (
                        <div className="text-xs text-gray-600">
                          <a href={`tel:${project.student.phone}`} className="hover:text-primary-600">
                            {project.student.phone}
                          </a>
                        </div>
                      )}
                      <div className="text-xs text-gray-600">
                        Year {project.student.year} • {project.student.program}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No student assigned</p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Schedule
                </h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Shoot Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(project.shootDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rushes Delivery</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(project.rushesDeliveryDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Grade Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(project.gradeDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mix Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(project.mixDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Final Delivery</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">
                      {formatDate(project.finalDeliveryDate)}
                    </dd>
                  </div>
                  {project.reviewDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Review Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(project.reviewDate)}</dd>
                    </div>
                  )}
                  {project.screeningDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Screening Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(project.screeningDate)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Project Metadata */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">
                  Project Info
                </h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">#{project.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;