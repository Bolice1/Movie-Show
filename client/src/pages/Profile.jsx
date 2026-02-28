import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const [form, setForm]         = useState({
        firstName: '', lastName: '', userName: '', email: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '', newPassword: '', confirmPassword: ''
    });
    const [activeTab, setActiveTab]   = useState('info');
    const [message, setMessage]       = useState('');
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [stats, setStats]           = useState({ watchlist: 0, likes: 0, ratings: 0 });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        api.get('/auth/me').then(res => {
            const u = res.data.user;
            setForm({
                firstName: u.firstName || '',
                lastName:  u.lastName  || '',
                userName:  u.UserName  || '',
                email:     u.email     || ''
            });
        });

        // Fetch user stats
        Promise.all([
            api.get('/watchlist'),
            api.get('/ratings/user')
        ]).then(([watchlistRes, ratingsRes]) => {
            setStats({
                watchlist: watchlistRes.data.watchlist.length,
                ratings:   ratingsRes.data.ratings?.length || 0
            });
        }).catch(() => {});
    }, [user]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handlePasswordChange = (e) =>
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

    const handleUpdateProfile = async (e) => {

        if(!form.firstName.trim()||!form.lastName.trim()||!form.userName.trim()||!form.email.trim()) return setError("All fields required ☠️ !").preventDefault();
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await api.put('/auth/profile', form);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword)
            return setError('New passwords do not match.');

        if (passwordForm.newPassword.length < 6)
            return setError('Password must be at least 6 characters.');

        setLoading(true);
        try {
            await api.put('/auth/reset-password', {
                userName:    user.userName,
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            setMessage('Password changed successfully!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Password change failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
        try {
            await api.delete('/auth/profile');
            logout();
            navigate('/');
        } catch (err) {
            setError('Failed to delete account.');
        }
    };

    const getPasswordStrength = (pwd) => {
        if (pwd.length === 0) return null;
        if (pwd.length < 6)   return { label: 'Too short', color: '#e50914', width: '25%' };
        if (pwd.length < 8)   return { label: 'Weak',      color: '#ff9800', width: '50%' };
        if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.match(/[^a-zA-Z0-9]/))
            return { label: 'Strong', color: '#4caf50', width: '100%' };
        return { label: 'Medium', color: '#ff9800', width: '75%' };
    };

    const strength = getPasswordStrength(passwordForm.newPassword);

    const TABS = ['info', 'password', 'danger'];

    return (
        <div className="page">
            <h1 style={{ marginBottom: '30px' }}>
                My <span style={{ color: '#e50914' }}>Profile</span>
            </h1>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '30px'
            }}>
                {[
                    { label: 'Watchlist',  value: stats.watchlist, icon: '📋' },
                    { label: 'Ratings',    value: stats.ratings,   icon: '⭐' },
                    { label: 'Member',     value: 'Active',        icon: '✅' },
                    { label: 'Role',       value: user?.role,      icon: user?.role === 'admin' ? '👑' : '👤' }
                ].map(stat => (
                    <div key={stat.label} style={{
                        backgroundColor: '#1f1f1f',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.8rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px' }}>
                            {stat.value}
                        </div>
                        <div style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[
                    { key: 'info',     label: '👤 Personal Info' },
                    { key: 'password', label: '🔐 Change Password' },
                    { key: 'danger',   label: '⚠️ Danger Zone' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setMessage(''); setError(''); }}
                        className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: '#1f1f1f',
                padding: '30px',
                borderRadius: '8px',
                border: '1px solid #333',
                maxWidth: '500px'
            }}>
                {message && (
                    <p style={{ color: '#4caf50', marginBottom: '16px' }}>✅ {message}</p>
                )}
                {error && (
                    <p className="error" style={{ marginBottom: '16px' }}>{error}</p>
                )}

                {/* Personal Info Tab */}
                {activeTab === 'info' && (
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ marginBottom: '8px' }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                    First Name
                                </label>
                                <input
                                    name="firstName"
                                    placeholder="First Name"
                                    value={form.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                    Last Name
                                </label>
                                <input
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={form.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                Username
                            </label>
                            <input
                                name="userName"
                                placeholder="Username"
                                value={form.userName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ marginBottom: '8px' }}>Change Password</h3>
                        <div>
                            <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                Current Password
                            </label>
                            <input
                                name="oldPassword"
                                type="password"
                                placeholder="Current Password"
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                New Password
                            </label>
                            <input
                                name="newPassword"
                                type="password"
                                placeholder="New Password"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            {strength && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                    <div style={{ flex: 1, height: '4px', backgroundColor: '#333', borderRadius: '2px' }}>
                                        <div style={{
                                            width: strength.width,
                                            height: '100%',
                                            backgroundColor: strength.color,
                                            borderRadius: '2px',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <span style={{ color: strength.color, fontSize: '0.8rem' }}>{strength.label}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label style={{ color: '#b3b3b3', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
                                Confirm New Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm New Password"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            {passwordForm.confirmPassword && (
                                <p style={{
                                    color: passwordForm.newPassword === passwordForm.confirmPassword ? '#4caf50' : '#e50914',
                                    fontSize: '0.8rem',
                                    marginTop: '6px'
                                }}>
                                    {passwordForm.newPassword === passwordForm.confirmPassword
                                        ? '✓ Passwords match'
                                        : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ marginBottom: '8px', color: '#e50914' }}>⚠️ Danger Zone</h3>
                        <div style={{
                            border: '1px solid #e50914',
                            borderRadius: '6px',
                            padding: '20px'
                        }}>
                            <h4 style={{ marginBottom: '8px' }}>Delete Account</h4>
                            <p style={{ color: '#b3b3b3', fontSize: '0.9rem', marginBottom: '16px' }}>
                                Once you delete your account, all your data including watchlist,
                                likes and ratings will be permanently removed. This cannot be undone.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                style={{
                                    backgroundColor: '#e50914',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                🗑️ Delete My Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}