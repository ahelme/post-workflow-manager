import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  AlertCircle,
} from 'lucide-react';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isProducer } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!id;

  // Redirect if user doesn't have permission
  if (!isAdmin && !isProducer) {
    navigate('/students');
    return null;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      year: 1,
      isActive: true,
    },
  });

  // Fetch student data if editing
  const { data: student, isLoading } = useQuery(
    ['student', id],
    () => studentsAPI.getById(id).then(res => res.data),
    {
      enabled: isEditing,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        // Populate form with existing data
        reset({
          studentId: data.studentId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          year: data.year,
          program: data.program,
          notes: data.notes || '',
          isActive: data.isActive,
        });
      },
    }
  );

  const yearOptions = [1, 2, 3, 4];
  
  const programOptions = [
    'Film Production',
    'Cinematography', 
    'Film Editing',
    'Sound Design',
    'Directing',
    'Screenwriting',
    'Documentary Filmmaking',
    'Animation',
    'Visual Effects',
    'Production Design',
    'Other',
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Convert year to integer
      const processedData = {
        ...data,
        year: parseInt(data.year),
        phone: data.phone || null, // Convert empty string to null
      };

      if (isEditing) {
        await studentsAPI.update(id, processedData);
        toast.success('Student updated successfully!');
        navigate(`/students/${id}`);
      } else {
        const response = await studentsAPI.create(processedData);
        toast.success('Student created successfully!');
        navigate(`/students/${response.data.student.id}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the student';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/students/${id}`);
    } else {
      navigate('/students');
    }
  };

  if (isEditing && isLoading) {
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
            Back to {isEditing ? 'Student' : 'Students'}
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Student' : 'New Student'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEditing ? 'Update student information' : 'Add a new student to the system'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Student ID */}
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    {...register('studentId', { 
                      required: 'Student ID is required',
                      maxLength: { value: 20, message: 'Student ID must be less than 20 characters' },
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: 'Student ID must contain only uppercase letters and numbers'
                      }
                    })}
                    className={`mt-1 form-input ${errors.studentId ? 'border-red-300' : ''}`}
                    placeholder="e.g. FS001"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.studentId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.studentId.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="isActive"
                    {...register('isActive')}
                    className="mt-1 form-select"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register('firstName', { 
                      required: 'First name is required',
                      maxLength: { value: 50, message: 'First name must be less than 50 characters' }
                    })}
                    className={`mt-1 form-input ${errors.firstName ? 'border-red-300' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register('lastName', { 
                      required: 'Last name is required',
                      maxLength: { value: 50, message: 'Last name must be less than 50 characters' }
                    })}
                    className={`mt-1 form-input ${errors.lastName ? 'border-red-300' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', { 
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={`mt-1 form-input ${errors.email ? 'border-red-300' : ''}`}
                    placeholder="student@filmschool.edu"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone', {
                      pattern: {
                        value: /^[\d\s\-\+\(\)]+$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    className={`mt-1 form-input ${errors.phone ? 'border-red-300' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Academic Year *
                  </label>
                  <select
                    id="year"
                    {...register('year', { required: 'Academic year is required' })}
                    className={`mt-1 form-select ${errors.year ? 'border-red-300' : ''}`}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.year.message}
                    </p>
                  )}
                </div>

                {/* Program */}
                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                    Program *
                  </label>
                  <select
                    id="program"
                    {...register('program', { required: 'Program is required' })}
                    className={`mt-1 form-select ${errors.program ? 'border-red-300' : ''}`}
                  >
                    <option value="">Select program</option>
                    {programOptions.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                  {errors.program && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.program.message}
                    </p>
                  )}
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
                placeholder="Additional notes about the student..."
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
                  {isEditing ? 'Update Student' : 'Create Student'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;