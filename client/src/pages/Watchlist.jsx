import { useState, useEffect } from 'react';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';

export default function Watchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        api.get('/watchlist')
            .then(res => setWatchlist(res.data.watchlist))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const removeFromWatchlist = async (contentId) => {
        try {
            await api.delete(`/watchlist/${contentId}`);
            setWatchlist(prev => prev.filter(item => item.ContentID !== contentId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page">
            <h1 style={{ marginBottom: '30px' }}>My Watchlist</h1>

            {watchlist.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#b3b3b3', marginTop: '60px' }}>
                    <p style={{ fontSize: '1.2rem' }}>Your watchlist is empty.</p>
                    <p>Browse content and add movies or series to watch later.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    {watchlist.map(item => (
                        <div key={item.listID}>
                            <ContentCard content={item} />
                            <button
                                onClick={() => removeFromWatchlist(item.ContentID)}
                                className="btn btn-secondary"
                                style={{ width: '100%', marginTop: '8px', fontSize: '0.85rem' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}