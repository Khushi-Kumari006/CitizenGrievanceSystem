import React, { useState, useEffect, useMemo } from 'react';
import { userApi } from '../../api/users';
import { departmentApi } from '../../api/departments';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../../components/common/RoleBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  CheckCircle,
  XCircle,
  Building2,
  RotateCcw,
} from 'lucide-react';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'OFFICER',
    department_id: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: '',
    department_id: '',
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  const { showToast } = useToast();

  const fetchUsersAndDepts = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        userApi.getAll(),
        departmentApi.getAll(),
      ]);
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.users || []);
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data.departments || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDepts();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search.trim() ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.phone && u.phone.includes(search));

      const matchRole = !roleFilter || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  // Handle Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const res = await userApi.create({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        phone: createForm.phone.trim() || undefined,
        role: createForm.role,
        department_id: createForm.role === 'OFFICER' && createForm.department_id ? parseInt(createForm.department_id, 10) : undefined,
      });

      if (res.success) {
        showToast('User created successfully!', 'success');
        setIsCreateModalOpen(false);
        setCreateForm({ name: '', email: '', password: '', phone: '', role: 'OFFICER', department_id: '' });
        fetchUsersAndDepts();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      department_id: user.department_id ? String(user.department_id) : '',
      active: Boolean(user.active),
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsEditing(true);
    try {
      const res = await userApi.update(selectedUser.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role,
        department_id: editForm.role === 'OFFICER' && editForm.department_id ? parseInt(editForm.department_id, 10) : null,
        active: editForm.active,
      });

      if (res.success) {
        showToast('User updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchUsersAndDepts();
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>User Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage civic system accounts, role assignments, officer department allocations, and account activation
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid grid-cols-3 md-grid-cols-1 gap-3 items-center">
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search user by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="CITIZEN">Citizen</option>
              <option value="OFFICER">Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('');
              }}
              className="btn btn-outline"
              style={{ width: '100%' }}
            >
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingSpinner text="Fetching user accounts..." fullPage={true} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} {u.phone && `• 📞 ${u.phone}`}</div>
                    </td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      {u.department_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                          <Building2 size={14} color="var(--primary)" />
                          {u.department_name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8125rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          Active
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(u)} className="btn btn-secondary btn-sm">
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

      {/* Modal: Create User */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New User Account"
        footer={
          <>
            <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateSubmit} className="btn btn-primary" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rajesh Kumar"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input
              type="email"
              className="form-input"
              placeholder="rajesh@example.com"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <input
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="9876543210"
              value={createForm.phone}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={createForm.role}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="CITIZEN">Citizen</option>
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {createForm.role === 'OFFICER' && (
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={createForm.department_id}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, department_id: e.target.value }))}
                >
                  <option value="">-- Unassigned --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.name || ''}`}
        footer={
          <>
            <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleEditSubmit} className="btn btn-primary" disabled={isEditing}>
              {isEditing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="CITIZEN">Citizen</option>
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {editForm.role === 'OFFICER' && (
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={editForm.department_id}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, department_id: e.target.value }))}
                >
                  <option value="">-- Unassigned --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm((prev) => ({ ...prev, active: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Account is Active (Allow sign in)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
