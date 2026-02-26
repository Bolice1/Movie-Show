import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
    const { token }  = useParams();
    const navigate   = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm]         = useState('');
    const [message, setMessage]         = useState('');
    const [error, setError]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [success, setSuccess]         = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirm)
            return setError('Passwords do not match.');

        if (newPassword.length < 6)
            return setError('Password must be at least 6 characters.');

        setLoading(true);
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
            setMessage(res.data.message);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (pwd) => {
        if (pwd.length === 0) return null;
        if (pwd.length < 6)   return { label: 'Too short', color: '#e50914' };
        if (pwd.length < 8)   return { label: 'Weak', color: '#ff9800' };
        if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/) && pwd.match(/[^a-zA-Z0-9]/))
            return { label: 'Strong', color: '#4caf50' };
        return { label: 'Medium', color: '#ff9800' };
    };

    const strength = getPasswordStrength(newPassword);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#141414'
        }}>
            <div style={{
                backgroundColor: '#1f1f1f',
                padding: '40px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid #333'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '3rem' }}>{success ? '✅' : '🔑'}</span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '8px' }}>
                        {success ? 'Password Reset!' : 'Reset Password'}
                    </h2>
                    <p style={{ color: '#b3b3b3', marginTop: '8px' }}>
                        {success
                            ? 'Redirecting you to login...'
                            : 'Enter your new password below.'}
                    </p>
                </div>

                {success ? (
                    <div style={{
                        backgroundColor: '#1a3a1a',
                        border: '1px solid #4caf50',
                        borderRadius: '6px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#4caf50' }}>{message}</p>
                        <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginTop: '8px' }}>
                            Redirecting to login in 3 seconds...
                        </p>
                        <Link to="/login" style={{ color: '#e50914', marginTop: '12px', display: 'block' }}>
                            Go to Login now
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                            {strength && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                    <div style={{
                                        flex: 1,
                                        height: '4px',
                                        backgroundColor: '#333',
                                        borderRadius: '2px'
                                    }}>
                                        <div style={{
                                            width: strength.label === 'Too short' ? '25%'
                                                 : strength.label === 'Weak'     ? '50%'
                                                 : strength.label === 'Medium'   ? '75%'
                                                 : '100%',
                                            height: '100%',
                                            backgroundColor: strength.color,
                                            borderRadius: '2px',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <span style={{ color: strength.color, fontSize: '0.8rem' }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                            {confirm && newPassword !== confirm && (
                                <p style={{ color: '#e50914', fontSize: '0.8rem', marginTop: '6px' }}>
                                    Passwords do not match.
                                </p>
                            )}
                            {confirm && newPassword === confirm && confirm.length > 0 && (
                                <p style={{ color: '#4caf50', fontSize: '0.8rem', marginTop: '6px' }}>
                                    ✓ Passwords match
                                </p>
                            )}
                        </div>

                        {error && <p className="error">{error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || newPassword !== confirm || newPassword.length < 6}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '20px', color: '#b3b3b3', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#e50914' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
}