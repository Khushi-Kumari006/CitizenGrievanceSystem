import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../api/departments';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Building2, PlusCircle, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';

export const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', active: true });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', active: true });
  const [isEditing, setIsEditing] = useState(false);

  const { showToast } = useToast();

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.success && res.data) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(
    (d) =>
      !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Department name is required', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const res = await departmentApi.create({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        active: createForm.active,
      });
      if (res.success) {
        showToast('Department added successfully!', 'success');
        setIsCreateModalOpen(false);
        setCreateForm({ name: '', description: '', active: true });
        fetchDepartments();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (dept) => {
    setSelectedDept(dept);
    setEditForm({
      name: dept.name,
      description: dept.description || '',
      active: Boolean(dept.active),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept || !editForm.name.trim()) return;

    setIsEditing(true);
    try {
      const res = await departmentApi.update(selectedDept.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        active: editForm.active,
      });
      if (res.success) {
        showToast('Department updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Civic Departments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Configure and maintain municipal departments that handle civic grievances
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Departments Table / Cards */}
      {isLoading ? (
        <LoadingSpinner text="Fetching municipal departments..." fullPage={true} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Description / Responsibilities</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.875rem' }}>
                      {d.description || <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>No description provided</span>}
                    </td>
                    <td>
                      {d.active ? (
                        <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          Active
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(d)} className="btn btn-secondary btn-sm">
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Department */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Civic Department"
        footer={
          <>
            <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateSubmit} className="btn btn-primary" disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Add Department'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Solid Waste Management"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe what civic issues this department handles..."
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={createForm.active}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, active: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Active Department (Visible for new citizen grievances)</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Department */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Department: ${selectedDept?.name || ''}`}
        footer={
          <>
            <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleEditSubmit} className="btn btn-primary" disabled={isEditing}>
              {isEditing ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm((prev) => ({ ...prev, active: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Active Department</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;
