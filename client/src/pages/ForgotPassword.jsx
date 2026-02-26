import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
    const [email, setEmail]     = useState('');
    const [message, setMessage] = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

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
                    <span style={{ fontSize: '3rem' }}>🔐</span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '8px' }}>Forgot Password</h2>
                    <p style={{ color: '#b3b3b3', marginTop: '8px' }}>
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {message ? (
                    <div style={{
                        backgroundColor: '#1a3a1a',
                        border: '1px solid #4caf50',
                        borderRadius: '6px',
                        padding: '20px',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '2rem' }}>📧</span>
                        <p style={{ color: '#4caf50', marginTop: '8px' }}>{message}</p>
                        <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginTop: '8px' }}>
                            Check your spam folder if you don't see it.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />

                        {error && <p className="error">{error}</p>}

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '20px', color: '#b3b3b3', textAlign: 'center' }}>
                    Remember your password?{' '}
                    <Link to="/login" style={{ color: '#e50914' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}