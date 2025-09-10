import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { projectsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  User,
  Film,
  Settings,
  FileText,
  AlertCircle,
} from 'lucide-react';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!id;
  const preselectedStudentId = searchParams.get('student');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      status: 'pre-production',
      studentId: preselectedStudentId || '',
    },
  });

  // Fetch students for dropdown
  const { data: studentsData } = useQuery(
    'studentsSimple',
    () => studentsAPI.getSimpleList().then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch project data if editing
  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectsAPI.getById(id).then(res => res.data),
    {
      enabled: isEditing,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // Populate form with existing data
        reset({
          title: data.title,
          description: data.description,
          genre: data.genre,
          duration: data.duration,
          status: data.status,
          studentId: data.studentId || '',
          shootDate: data.shootDate || '',
          gradeDate: data.gradeDate || '',
          mixDate: data.mixDate || '',
          rushesDeliveryDate: data.rushesDeliveryDate || '',
          finalDeliveryDate: data.finalDeliveryDate || '',
          reviewDate: data.reviewDate || '',
          screeningDate: data.screeningDate || '',
          supervisingProducer: data.supervisingProducer || '',
          director: data.director || '',
          editor: data.editor || '',
          soundEngineer: data.soundEngineer || '',
          cameraEquipment: data.cameraEquipment || '',
          editingSuite: data.editingSuite || '',
          notes: data.notes || '',
        });
      },
    }
  );

  const statusOptions = [
    { value: 'pre-production', label: 'Pre-Production' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'post-production', label: 'Post-Production' },
    { value: 'grading', label: 'Grading' },
    { value: 'audio-mix', label: 'Audio Mix' },
    { value: 'complete', label: 'Complete' },
  ];

  const genreOptions = [
    'Drama',
    'Comedy',
    'Thriller',
    'Horror',
    'Documentary',
    'Experimental',
    'Animation',
    'Musical',
    'Action',
    'Romance',
    'Sci-Fi',
    'Fantasy',
    'Other',
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Convert empty strings to null for date fields
      const processedData = {
        ...data,
        duration: data.duration ? parseInt(data.duration) : null,
        studentId: data.studentId || null,
        shootDate: data.shootDate || null,
        gradeDate: data.gradeDate || null,
        mixDate: data.mixDate || null,
        rushesDeliveryDate: data.rushesDeliveryDate || null,
        finalDeliveryDate: data.finalDeliveryDate || null,
        reviewDate: data.reviewDate || null,
        screeningDate: data.screeningDate || null,
      };

      if (isEditing) {
        await projectsAPI.update(id, processedData);
        toast.success('Project updated successfully!');
        navigate(`/projects/${id}`);
      } else {
        const response = await projectsAPI.create(processedData);
        toast.success('Project created successfully!');
        navigate(`/projects/${response.data.project.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the project';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/projects/${id}`);
    } else {
      navigate('/projects');
    }
  };

  if (isEditing && isLoading) {
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

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {isEditing ? 'Project' : 'Projects'}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEditing ? 'Update project information and settings' : 'Create a new film production project'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Film className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', { 
                      required: 'Project title is required',
                      maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                    })}
                    className={`mt-1 form-input ${errors.title ? 'border-red-300' : ''}`}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                    Genre
                  </label>
                  <select
                    id="genre"
                    {...register('genre')}
                    className="mt-1 form-select"
                  >
                    <option value="">Select genre</option>
                    {genreOptions.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    {...register('duration', { 
                      min: { value: 1, message: 'Duration must be at least 1 minute' },
                      max: { value: 600, message: 'Duration must be less than 600 minutes' }
                    })}
                    className={`mt-1 form-input ${errors.duration ? 'border-red-300' : ''}`}
                    placeholder="e.g. 15"
                    min="1"
                    max="600"
                  />
                  {errors.duration && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    id="status"
                    {...register('status', { required: 'Status is required' })}
                    className={`mt-1 form-select ${errors.status ? 'border-red-300' : ''}`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Student */}
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student *
                  </label>
                  <select
                    id="studentId"
                    {...register('studentId', { required: 'Student selection is required' })}
                    className={`mt-1 form-select ${errors.studentId ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select student</option>
                    {studentsData?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.label}
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.studentId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="mt-1 form-textarea"
                  placeholder="Brief description of the project..."
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Shoot Date */}
                <div>
                  <label htmlFor="shootDate" className="block text-sm font-medium text-gray-700">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    id="shootDate"
                    {...register('shootDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Rushes Delivery Date */}
                <div>
                  <label htmlFor="rushesDeliveryDate" className="block text-sm font-medium text-gray-700">
                    Rushes Delivery Date
                  </label>
                  <input
                    type="date"
                    id="rushesDeliveryDate"
                    {...register('rushesDeliveryDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Grade Date */}
                <div>
                  <label htmlFor="gradeDate" className="block text-sm font-medium text-gray-700">
                    Grade Date
                  </label>
                  <input
                    type="date"
                    id="gradeDate"
                    {...register('gradeDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Mix Date */}
                <div>
                  <label htmlFor="mixDate" className="block text-sm font-medium text-gray-700">
                    Mix Date
                  </label>
                  <input
                    type="date"
                    id="mixDate"
                    {...register('mixDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Final Delivery Date */}
                <div>
                  <label htmlFor="finalDeliveryDate" className="block text-sm font-medium text-gray-700">
                    Final Delivery Date
                  </label>
                  <input
                    type="date"
                    id="finalDeliveryDate"
                    {...register('finalDeliveryDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Review Date */}
                <div>
                  <label htmlFor="reviewDate" className="block text-sm font-medium text-gray-700">
                    Review Date
                  </label>
                  <input
                    type="date"
                    id="reviewDate"
                    {...register('reviewDate')}
                    className="mt-1 form-input"
                  />
                </div>

                {/* Screening Date */}
                <div>
                  <label htmlFor="screeningDate" className="block text-sm font-medium text-gray-700">
                    Screening Date
                  </label>
                  <input
                    type="date"
                    id="screeningDate"
                    {...register('screeningDate')}
                    className="mt-1 form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Production Team */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Production Team
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Supervising Producer */}
                <div>
                  <label htmlFor="supervisingProducer" className="block text-sm font-medium text-gray-700">
                    Supervising Producer
                  </label>
                  <input
                    type="text"
                    id="supervisingProducer"
                    {...register('supervisingProducer')}
                    className="mt-1 form-input"
                    placeholder="Producer name"
                  />
                </div>

                {/* Director */}
                <div>
                  <label htmlFor="director" className="block text-sm font-medium text-gray-700">
                    Director
                  </label>
                  <input
                    type="text"
                    id="director"
                    {...register('director')}
                    className="mt-1 form-input"
                    placeholder="Director name"
                  />
                </div>

                {/* Editor */}
                <div>
                  <label htmlFor="editor" className="block text-sm font-medium text-gray-700">
                    Editor
                  </label>
                  <input
                    type="text"
                    id="editor"
                    {...register('editor')}
                    className="mt-1 form-input"
                    placeholder="Editor name"
                  />
                </div>

                {/* Sound Engineer */}
                <div>
                  <label htmlFor="soundEngineer" className="block text-sm font-medium text-gray-700">
                    Sound Engineer
                  </label>
                  <input
                    type="text"
                    id="soundEngineer"
                    {...register('soundEngineer')}
                    className="mt-1 form-input"
                    placeholder="Sound engineer name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Equipment & Resources */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Equipment & Resources
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Camera Equipment */}
                <div>
                  <label htmlFor="cameraEquipment" className="block text-sm font-medium text-gray-700">
                    Camera Equipment
                  </label>
                  <input
                    type="text"
                    id="cameraEquipment"
                    {...register('cameraEquipment')}
                    className="mt-1 form-input"
                    placeholder="e.g. Canon C300 Mark III"
                  />
                </div>

                {/* Editing Suite */}
                <div>
                  <label htmlFor="editingSuite" className="block text-sm font-medium text-gray-700">
                    Editing Suite
                  </label>
                  <input
                    type="text"
                    id="editingSuite"
                    {...register('editingSuite')}
                    className="mt-1 form-input"
                    placeholder="e.g. Suite A - Avid"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </h3>
            </div>
            <div className="card-body">
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="form-textarea"
                placeholder="Additional notes about the project..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;