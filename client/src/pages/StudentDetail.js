import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Film,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isProducer } = useAuth();

  const { data: student, isLoading, error } = useQuery(
    ['student', id],
    () => studentsAPI.getById(id).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await studentsAPI.delete(id);
        navigate('/students');
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
            <p className="mt-4 text-gray-500">Loading student details...</p>
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
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student not found</h3>
            <p className="text-gray-500 mb-4">The student you're looking for doesn't exist or you don't have permission to view them.</p>
            <Link to="/students" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
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
              to="/students"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-lg text-gray-500">
                  Student ID: {student.studentId}
                </p>
                <div className="flex items-center mt-2">
                  <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Year {student.year} • {student.program}
                  </span>
                </div>
              </div>
            </div>
            
            {(isAdmin || isProducer) && (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/students/${student.id}/edit`}
                  className="btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${student.email}`} className="hover:text-primary-600">
                        {student.email}
                      </a>
                    </dd>
                  </div>
                  {student.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${student.phone}`} className="hover:text-primary-600">
                          {student.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Academic Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Academic Information
                </h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Year</dt>
                    <dd className="mt-1 text-sm text-gray-900">Year {student.year}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Program</dt>
                    <dd className="mt-1 text-sm text-gray-900">{student.program}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Projects */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Film className="w-5 h-5 mr-2" />
                  Projects ({student.projects?.length || 0})
                </h3>
              </div>
              <div className="card-body">
                {student.projects && student.projects.length > 0 ? (
                  <div className="space-y-4">
                    {student.projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusIcon(project.status)}
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                <Link 
                                  to={`/projects/${project.id}`}
                                  className="hover:text-primary-600"
                                >
                                  {project.title}
                                </Link>
                              </h4>
                              <p className="text-sm text-gray-500">
                                {project.genre && `${project.genre} • `}
                                {project.duration && `${project.duration} min`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status.replace('-', ' ')}
                            </span>
                            {project.finalDeliveryDate && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(project.finalDeliveryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        {project.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Film className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No projects assigned yet</p>
                    {(isAdmin || isProducer) && (
                      <Link
                        to="/projects/new"
                        className="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                      >
                        Create a project for this student
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Notes
                  </h3>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 whitespace-pre-wrap">{student.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Projects</dt>
                    <dd className="mt-1 text-2xl font-bold text-gray-900">
                      {student.projects?.length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Completed Projects</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-600">
                      {student.projects?.filter(p => p.status === 'complete').length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">In Progress</dt>
                    <dd className="mt-1 text-2xl font-bold text-yellow-600">
                      {student.projects?.filter(p => p.status !== 'complete').length || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Student Metadata */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Student Info</h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Enrolled</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(student.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`badge ${student.isActive ? 'badge-complete' : 'badge-pre-production'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body space-y-3">
                <a
                  href={`mailto:${student.email}`}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </a>
                {student.phone && (
                  <a
                    href={`tel:${student.phone}`}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Student
                  </a>
                )}
                {(isAdmin || isProducer) && (
                  <Link
                    to={`/projects/new?student=${student.id}`}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;