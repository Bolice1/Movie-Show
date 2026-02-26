import { useState, useEffect } from 'react';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';

export default function Home() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('All');

    useEffect(() => {
        api.get('/content')
            .then(res => setContent(res.data.content))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'All'
        ? content
        : content.filter(c => c.Type === filter);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page">
            <div style={{
                background: 'linear-gradient(to right, #1a1a1a, #141414)',
                padding: '60px 40px',
                borderRadius: '8px',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                    Welcome to <span style={{ color: '#e50914' }}>MovieShow</span>
                </h1>
                <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>
                    Discover movies and series. Add to your watchlist. Rate and review.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                {['All', 'Movie', 'Serie'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`btn ${filter === type ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {type === 'All' ? '🎬 All' : type === 'Movie' ? '🎥 Movies' : '📺 Series'}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <p style={{ color: '#b3b3b3' }}>No content found.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    {filtered.map(item => (
                        <ContentCard key={item.ContentID} content={item} />
                    ))}
                </div>
            )}
        </div>
    );
}