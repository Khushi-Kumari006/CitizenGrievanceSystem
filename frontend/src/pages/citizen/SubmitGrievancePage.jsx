import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { grievanceApi } from '../../api/grievances';
import { departmentApi } from '../../api/departments';
import { categoryApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import {
  ArrowLeft,
  MapPin,
  Upload,
  CheckCircle2,
  X,
  Building2,
  Tags,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
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

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', desc: 'Minor inconvenience / routine maintenance' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Standard issue affecting daily life' },
  { value: 'HIGH', label: 'High', desc: 'Severe disruption requiring fast action' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Immediate safety hazard / emergency' },
];

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
    latitude: null,
    longitude: null,
  });

  const [isMapConfirmed, setIsMapConfirmed] = useState(false);
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
      errs.title = 'Grievance title is required';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title should be at least 5 characters';
    }

    if (!formData.department_id) {
      errs.department_id = 'Please select the responsible department';
    }

    if (!formData.category_id) {
      errs.category_id = 'Please select a grievance category';
    }

    if (!formData.location.trim()) {
      errs.location = 'Please specify the street / landmark location';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please provide a detailed description of the problem';
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

  const handleLocationSelect = (lat, lng) => {
    setIsMapConfirmed(false);
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleConfirmLocation = (lat, lng) => {
    setIsMapConfirmed(true);
    setFormData((prev) => {
      const coordsTag = `[GPS: ${lat}, ${lng}]`;
      let newLocation = prev.location.trim();

      if (!newLocation) {
        newLocation = `Location Coordinates: ${lat}, ${lng}`;
      } else if (!newLocation.includes('GPS:') && !newLocation.includes(String(lat))) {
        newLocation = `${newLocation} ${coordsTag}`;
      }

      return {
        ...prev,
        latitude: lat,
        longitude: lng,
        location: newLocation,
      };
    });

    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: null }));
    }

    showToast(`Location coordinates (${lat}, ${lng}) saved!`, 'success');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Attachment file size must be less than 5MB', 'warning');
        return;
      }
      setSelectedFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        attachment_path: `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
      }));
      showToast(`Attached: ${file.name}`, 'info');
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
        showToast('Grievance lodged successfully!', 'success');
        navigate(`/citizen/track?number=${res.data.grievance.grievance_number}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMetadata) {
    return <LoadingSpinner text="Loading departments & categories..." fullPage />;
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            Lodge Civic Grievance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
            Submit an official grievance for inspection and resolution by municipal staff
          </p>
        </div>
        <Link to="/citizen/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Issue Details */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} color="var(--primary)" />
              <span className="card-title">1. Issue Classification & Summary</span>
            </div>
            <span className="badge badge-subtle">Required</span>
          </div>

          <div className="card-body">
            {/* Title Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="grievance-title">
                <span>Summary / Title</span>
                <span className="form-label-required">*</span>
              </label>
              <input
                id="grievance-title"
                type="text"
                name="title"
                maxLength={100}
                className="form-input"
                placeholder="e.g. Broken water pipeline causing low pressure in Block C"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                {errors.title ? (
                  <span className="form-error">{errors.title}</span>
                ) : (
                  <span className="form-hint">Be concise and describe the primary issue</span>
                )}
                <span className="form-hint">{formData.title.length}/100</span>
              </div>
            </div>

            {/* Category & Department Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="grievance-category">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tags size={14} />
                    <span>Category</span>
                  </span>
                  <span className="form-label-required">*</span>
                </label>
                <select
                  id="grievance-category"
                  name="category_id"
                  className="form-select"
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
                {errors.category_id && <span className="form-error">{errors.category_id}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grievance-department">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} />
                    <span>Responsible Department</span>
                  </span>
                  <span className="form-label-required">*</span>
                </label>
                <select
                  id="grievance-department"
                  name="department_id"
                  className="form-select"
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
                {errors.department_id && <span className="form-error">{errors.department_id}</span>}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              <label className="form-label" htmlFor="grievance-desc">
                <span>Detailed Description</span>
                <span className="form-label-required">*</span>
              </label>
              <textarea
                id="grievance-desc"
                name="description"
                rows={4}
                className="form-textarea"
                placeholder="Describe the exact issue, when it started, and how it impacts the locality..."
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>
          </div>
        </div>

        {/* Section 2: Location & Geo-pinning */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--primary)" />
              <span className="card-title">2. Incident Location & Map Pin</span>
            </div>
            {isMapConfirmed && <span className="badge badge-resolved">GPS Pin Confirmed</span>}
          </div>

          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="grievance-location">
                <span>Street Address / Area Landmark</span>
                <span className="form-label-required">*</span>
              </label>
              <input
                id="grievance-location"
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Near Community Center, Sector 4, Main Market Road"
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={handleLocationSelect}
                onConfirmLocation={handleConfirmLocation}
                isConfirmed={isMapConfirmed}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Priority & Classification */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="var(--primary)" />
              <span className="card-title">3. Urgency & Priority Level</span>
            </div>
          </div>

          <div className="card-body">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = formData.priority === opt.value;
                return (
                  <label
                    key={opt.value}
                    style={{
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--text-heading)' }}>
                        {opt.label} Priority
                      </span>
                      <input
                        type="radio"
                        name="priority"
                        value={opt.value}
                        checked={isSelected}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {opt.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Attachments */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={16} color="var(--primary)" />
              <span className="card-title">4. Photos & Evidence (Optional)</span>
            </div>
            <span className="badge badge-subtle">Max 5MB</span>
          </div>

          <div className="card-body">
            {selectedFileName ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={16} color="var(--status-resolved-text)" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {selectedFileName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ready for upload</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--status-danger-text)' }}
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <label
                style={{
                  border: '1.5px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.75rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                  transition: 'background-color var(--transition-fast)',
                  textAlign: 'center',
                }}
              >
                <Upload size={24} color="var(--text-muted)" />
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                    Click to select photo or document
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Section 5: Review & Submit Actions */}
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              By lodging this grievance, you certify that the provided information is accurate.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link to="/citizen/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Registering Complaint...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Grievance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitGrievancePage;
