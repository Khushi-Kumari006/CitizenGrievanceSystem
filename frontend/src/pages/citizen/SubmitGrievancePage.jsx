import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { departmentApi } from '../../api/departments';
import { categoryApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  PlusCircle,
  ArrowLeft,
  Building2,
  Tags,
  AlertTriangle,
  MapPin,
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

const CATEGORY_DEPARTMENT_MAP = {
  'Water Supply': 'Water Department',
  'Roads': 'Road Department',
  'Garbage': 'Sanitation Department',
  'Electricity': 'Electricity Department',
  'Street Lights': 'Electricity Department',
  'Drainage': 'Sanitation Department',
  'Sanitation': 'Sanitation Department',
  'Public Transport': 'Public Transport Department',
  'Other': 'Water Department',
};

export const SubmitGrievancePage = () => {
  const [searchParams] = useSearchParams();
  const initialCategoryName = searchParams.get('category') || '';
  const initialDeptName = searchParams.get('dept') || '';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department_id: '',
    category_id: '',
    priority: 'MEDIUM',
    location: '',
    attachment_path: '',
  });

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFileName, setSelectedFileName] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          departmentApi.getAll({ active: true }),
          categoryApi.getAll({ active: true }),
        ]);

        const depts = (deptRes.success && deptRes.data?.departments) || [];
        const cats = (catRes.success && catRes.data?.categories) || [];

        setDepartments(depts);
        setCategories(cats);

        // Pre-select category and department from URL query params if provided
        let targetCatId = '';
        let targetDeptId = '';

        if (initialCategoryName) {
          const matchedCat = cats.find(
            (c) => c.name.toLowerCase() === initialCategoryName.toLowerCase()
          );
          if (matchedCat) targetCatId = String(matchedCat.id);
        }

        if (initialDeptName) {
          const matchedDept = depts.find(
            (d) => d.name.toLowerCase() === initialDeptName.toLowerCase()
          );
          if (matchedDept) targetDeptId = String(matchedDept.id);
        } else if (initialCategoryName && CATEGORY_DEPARTMENT_MAP[initialCategoryName]) {
          const suggestedDeptName = CATEGORY_DEPARTMENT_MAP[initialCategoryName];
          const matchedDept = depts.find(
            (d) => d.name.toLowerCase() === suggestedDeptName.toLowerCase()
          );
          if (matchedDept) targetDeptId = String(matchedDept.id);
        }

        setFormData((prev) => ({
          ...prev,
          category_id: targetCatId || prev.category_id,
          department_id: targetDeptId || prev.department_id,
        }));
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [initialCategoryName, initialDeptName, showToast]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Grievance summary / title is required';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title should be at least 5 characters';
    }

    if (!formData.department_id) {
      errs.department_id = 'Please select the responsible municipal department';
    }

    if (!formData.category_id) {
      errs.category_id = 'Please select a grievance category';
    }

    if (!formData.location.trim()) {
      errs.location = 'Please specify the exact landmark / address where issue is located';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please provide a detailed description of the issue';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-suggest department when category changes
      if (name === 'category_id' && value) {
        const selectedCat = categories.find((c) => String(c.id) === String(value));
        if (selectedCat && CATEGORY_DEPARTMENT_MAP[selectedCat.name]) {
          const suggestedDeptName = CATEGORY_DEPARTMENT_MAP[selectedCat.name];
          const matchedDept = departments.find(
            (d) => d.name.toLowerCase() === suggestedDeptName.toLowerCase()
          );
          if (matchedDept) {
            updated.department_id = String(matchedDept.id);
          }
        }
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Attachment file size must be less than 5MB', 'warning');
        return;
      }
      setSelectedFileName(file.name);
      // Set attachment path string
      setFormData((prev) => ({
        ...prev,
        attachment_path: `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
      }));
      showToast(`Attachment "${file.name}" attached`, 'info');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFileName('');
    setFormData((prev) => ({ ...prev, attachment_path: '' }));
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
        location: formData.location.trim(),
        attachment_path: formData.attachment_path || null,
      });

      if (res.success && res.data?.grievance) {
        showToast('Grievance registered successfully! Tracking ID generated.', 'success');
        navigate(`/citizen/track?number=${res.data.grievance.grievance_number}`);
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
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/citizen/dashboard" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 lg-grid-cols-1 gap-6">
        {/* Main Form (2 cols) */}
        <div className="card" style={{ gridColumn: 'span 2', padding: '2rem' }}>
          <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Lodge Civic Grievance</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Provide accurate issue parameters so the concerned department can inspect and initiate remedial action.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  Grievance Summary / Title <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {formData.title.length}/100
                </span>
              </div>
              <input
                type="text"
                name="title"
                maxLength={100}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Contaminated drinking water supply in Block C"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            {/* Category & Department Selection */}
            <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
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
            </div>

            {/* Priority & Specific Location */}
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
                  <option value="LOW">Low (Minor inconvenience / standard)</option>
                  <option value="MEDIUM">Medium (General disruption / attention)</option>
                  <option value="HIGH">High (Major municipal malfunction)</option>
                  <option value="CRITICAL">Critical (Hazard / safety emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Location / Landmark <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={18}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                  />
                  <input
                    type="text"
                    name="location"
                    className={`form-input ${errors.location ? 'error' : ''}`}
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. Near Community Park Gate #2, Ward 15"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.location && <div className="form-error">{errors.location}</div>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  Detailed Description <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  Min 10 characters
                </span>
              </div>
              <textarea
                name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                rows={5}
                placeholder="Describe what happened, how long the issue has persisted, and any specific landmarks or details that will assist inspection teams..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Attachment / Photo Input */}
            <div className="form-group">
              <label className="form-label">Supporting Photo / Document Attachment (Optional)</label>
              {selectedFileName ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {selectedFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                    title="Remove file"
                  >
                    <X size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  <Upload size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Click to select a photo or document
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    JPG, PNG, PDF up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
              <Link to="/citizen/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                <PlusCircle size={18} />
                <span>{isSubmitting ? 'Registering Grievance...' : 'Submit Grievance'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Side Helper Guide Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ backgroundColor: '#f8fafc', padding: '1.5rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
              <Info size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Guidelines for Filing</h3>
            </div>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
              <li>Provide clear, precise landmark location details (house number, street name, nearest gate).</li>
              <li>Describe the nature and severity of the civic issue accurately.</li>
              <li>Do not file duplicate grievances for the same issue while one is already pending review.</li>
              <li>Once submitted, track progress at any time via the <strong>Track Grievance</strong> menu.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              What Happens Next?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>An automated unique tracking number (GRV-...) is assigned immediately.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>The municipal department reviews and designates a field officer within 24 hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>You will receive real-time notifications on all officer actions and resolutions.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitGrievancePage;
