import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { departmentApi } from '../../api/departments';
import { categoryApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlusCircle, ArrowLeft, Building2, Tags, AlertTriangle, MapPin, FileText } from 'lucide-react';

export const SubmitGrievancePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department_id: '',
    category_id: '',
    priority: 'MEDIUM',
    location: '',
  });

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          departmentApi.getAll({ active: true }),
          categoryApi.getAll({ active: true }),
        ]);

        if (deptRes.success && deptRes.data) {
          setDepartments(deptRes.data.departments || []);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsMetadataLoading(false);
      }
    };

    const setIsMetadataLoading = (state) => setIsLoadingMetadata(state);
    fetchMetadata();
  }, [showToast]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Grievance title is required';
    }
    if (!formData.department_id) {
      errs.department_id = 'Please select the responsible department';
    }
    if (!formData.category_id) {
      errs.category_id = 'Please select a grievance category';
    }
    if (!formData.description.trim()) {
      errs.description = 'Please provide detailed description of the issue';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await grievanceApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        department_id: parseInt(formData.department_id, 10),
        category_id: parseInt(formData.category_id, 10),
        priority: formData.priority,
        location: formData.location.trim() || undefined,
      });

      if (res.success && res.data?.grievance) {
        showToast('Grievance registered successfully!', 'success');
        navigate(`/grievances/${res.data.grievance.id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMetadata) {
    return <LoadingSpinner text="Loading departments & categories..." fullPage={true} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/citizen/dashboard" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Lodge Civic Grievance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Provide complete details of the civic or municipal problem so the assigned department can take action.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Grievance Summary / Title <span className="required">*</span>
            </label>
            <input
              type="text"
              name="title"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Broken street light outside community center"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          {/* Department & Category Select */}
          <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
            <div className="form-group">
              <label className="form-label">
                Concerned Department <span className="required">*</span>
              </label>
              <select
                name="department_id"
                className={`form-select ${errors.department_id ? 'error' : ''}`}
                value={formData.department_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && <div className="form-error">{errors.department_id}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Issue Category <span className="required">*</span>
              </label>
              <select
                name="category_id"
                className={`form-select ${errors.category_id ? 'error' : ''}`}
                value={formData.category_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <div className="form-error">{errors.category_id}</div>}
            </div>
          </div>

          {/* Priority & Location */}
          <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="LOW">Low (Minor disturbance)</option>
                <option value="MEDIUM">Medium (Standard attention)</option>
                <option value="HIGH">High (Urgent civic issue)</option>
                <option value="CRITICAL">Critical (Hazardous / Emergency)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Specific Location / Landmark</label>
              <div style={{ position: 'relative' }}>
                <MapPin
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Ward 12, Main Market Road near Bus Stop"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              name="description"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              rows={5}
              placeholder="Describe what happened, how long the issue has persisted, and any additional details that will help inspectors..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/citizen/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              <PlusCircle size={18} />
              <span>{isSubmitting ? 'Submitting Grievance...' : 'Submit Grievance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitGrievancePage;
