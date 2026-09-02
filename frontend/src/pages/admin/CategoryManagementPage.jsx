import React, { useState, useEffect } from 'react';
import { categoryApi } from '../../api/categories';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Tags, PlusCircle, Edit2, Search } from 'lucide-react';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', active: true });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', active: true });
  const [isEditing, setIsEditing] = useState(false);

  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      if (res.success && res.data) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Category name is required', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const res = await categoryApi.create({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        active: createForm.active,
      });
      if (res.success) {
        showToast('Grievance category created successfully!', 'success');
        setIsCreateModalOpen(false);
        setCreateForm({ name: '', description: '', active: true });
        fetchCategories();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setEditForm({
      name: cat.name,
      description: cat.description || '',
      active: Boolean(cat.active),
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCat || !editForm.name.trim()) return;

    setIsEditing(true);
    try {
      const res = await categoryApi.update(selectedCat.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        active: editForm.active,
      });
      if (res.success) {
        showToast('Category updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchCategories();
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Grievance Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Classify and organize types of complaints citizens can file across municipal services
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
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
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching categories..." fullPage={true} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Tags size={18} color="var(--accent)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.875rem' }}>
                      {c.description || <span style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>No description provided</span>}
                    </td>
                    <td>
                      {c.active ? (
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
                      <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm">
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

      {/* Modal: Create Category */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Grievance Category"
        footer={
          <>
            <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateSubmit} className="btn btn-primary" disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Add Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Street Lighting Faults"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe the nature of complaints falling in this category..."
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
              <span>Active Category (Available for citizen filing)</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Category */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Category: ${selectedCat?.name || ''}`}
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
            <label className="form-label">Category Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
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
              <span>Active Category</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
