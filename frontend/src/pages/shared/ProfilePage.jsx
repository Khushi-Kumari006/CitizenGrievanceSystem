import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/users';
import { RoleBadge } from '../../components/common/RoleBadge';
import { User, Mail, Phone, Lock, Save, Shield, KeyRound, Building2, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await userApi.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || undefined,
      });

      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        await refreshUser();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) {
      showToast('Current password is required', 'warning');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await userApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1050px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          Account Settings & Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Manage your personal details, contact number, and update account security credentials
        </p>
      </div>

      {/* Account Overview Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
          flexWrap: 'wrap',
          padding: '2rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <div
          style={{
            width: '74px',
            height: '74px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '2rem',
            fontWeight: 800,
            boxShadow: '0 6px 16px var(--primary-glow)',
            flexShrink: 0,
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {user?.name}
            </h2>
            <RoleBadge role={user?.role} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            <span>{user?.email}</span>
            {user?.phone && <span> • 📞 {user.phone}</span>}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Update Profile & Change Password */}
      <div className="grid grid-cols-2 md-grid-cols-1 gap-6 items-start">
        {/* Personal Details Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center gap-2">
              <User size={20} color="var(--primary)" />
              <h3 className="card-title">Personal Details</h3>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                disabled={isUpdatingProfile}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isUpdatingProfile} style={{ fontWeight: 700 }}>
                <Save size={16} />
                <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center gap-2">
              <KeyRound size={20} color="var(--primary)" />
              <h3 className="card-title">Security & Password</h3>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">
                Current Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
                disabled={isChangingPassword}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                New Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                disabled={isChangingPassword}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm New Password <span className="required">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isChangingPassword}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isChangingPassword} style={{ fontWeight: 700 }}>
                <Lock size={16} />
                <span>{isChangingPassword ? 'Changing Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
