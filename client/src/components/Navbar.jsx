import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav style={{
            backgroundColor: '#111',
            padding: '0 40px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #333',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <Link to="/" style={{ color: '#e50914', fontSize: '1.5rem', fontWeight: 'bold' }}>
                🎬 MovieShow
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#b3b3b3' }}>Home</Link>

                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={{ color: '#e50914', fontWeight: 'bold' }}>
                                Admin
                            </Link>
                        )}
                        <Link to="/watchlist" style={{ color: '#b3b3b3' }}>Watchlist</Link>
                        <span style={{ color: '#b3b3b3' }}>Hi, {user.userName}</span>
                        <button
                            onClick={logout}
                            className="btn btn-secondary"
                            style={{ padding: '6px 16px' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            <button className="btn btn-secondary" style={{ padding: '6px 16px' }}>
                                Login
                            </button>
                        </Link>
                        <Link to="/register">
                            <button className="btn btn-primary" style={{ padding: '6px 16px' }}>
                                Sign Up
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}