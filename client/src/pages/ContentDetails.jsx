import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ContentDetails() {
    const { id }  = useParams();
    const { user } = useAuth();

    const [content, setContent]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [ratings, setRatings]   = useState([]);
    const [ratingScore, setRatingScore] = useState('');
    const [comment, setComment]   = useState('');
    const [message, setMessage]   = useState('');

    useEffect(() => {
        Promise.all([
            api.get(`/content/${id}`),
            api.get(`/likes/${id}`),
            api.get(`/ratings/${id}`)
        ]).then(([contentRes, likesRes, ratingsRes]) => {
            setContent(contentRes.data.content);
            setLikeCount(likesRes.data.likeCount);
            setRatings(ratingsRes.data.ratings);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        try {
            await api.post(`/likes/${id}`);
            setLikeCount(prev => prev + 1);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to like.');
        }
    };

    const handleWatchlist = async () => {
        try {
            await api.post('/watchlist', { contentId: id });
            setMessage('Added to watchlist!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed.');
        }
    };

    const handleRate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/ratings/${id}`, { ratingScore: Number(ratingScore), comment });
            setMessage('Rating submitted!');
            const res = await api.get(`/ratings/${id}`);
            setRatings(res.data.ratings);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to rate.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!content) return <div className="loading">Content not found.</div>;

    return (
        <div className="page">
            <div style={{
                backgroundColor: '#1f1f1f',
                borderRadius: '8px',
                padding: '40px',
                marginBottom: '30px',
                border: '1px solid #333'
            }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '3rem' }}>
                        {content.Type === 'Movie' ? '🎬' : '📺'}
                    </span>
                    <div>
                        <h1 style={{ fontSize: '2rem' }}>{content.Title}</h1>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <span style={{
                                backgroundColor: '#e50914',
                                padding: '2px 10px',
                                borderRadius: '3px',
                                fontSize: '0.85rem'
                            }}>{content.Type}</span>
                            <span style={{ color: '#b3b3b3' }}>{content.Duration} min</span>
                        </div>
                    </div>
                </div>

                <p style={{ color: '#b3b3b3', marginBottom: '20px', lineHeight: '1.6' }}>
                    {content.Description}
                </p>

                {content.genres?.length > 0 && (
                    <p style={{ color: '#b3b3b3', marginBottom: '12px' }}>
                        <strong style={{ color: 'white' }}>Genres: </strong>
                        {content.genres.map(g => g.GenreName).join(', ')}
                    </p>
                )}

                {content.actors?.length > 0 && (
                    <p style={{ color: '#b3b3b3', marginBottom: '20px' }}>
                        <strong style={{ color: 'white' }}>Actors: </strong>
                        {content.actors.map(a => `${a.Name} as ${a.Role}`).join(', ')}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#b3b3b3' }}>❤️ {likeCount} likes</span>
                    {user && (
                        <>
                            <button onClick={handleLike} className="btn btn-secondary">
                                ❤️ Like
                            </button>
                            <button onClick={handleWatchlist} className="btn btn-secondary">
                                + Watchlist
                            </button>
                        </>
                    )}
                </div>

                {message && <p className="error" style={{ marginTop: '12px' }}>{message}</p>}
            </div>

            {content.Type === 'Serie' && content.seasons?.length > 0 && (
                <div style={{
                    backgroundColor: '#1f1f1f',
                    borderRadius: '8px',
                    padding: '30px',
                    marginBottom: '30px',
                    border: '1px solid #333'
                }}>
                    <h2 style={{ marginBottom: '20px' }}>Seasons & Episodes</h2>
                    {content.seasons.map(season => (
                        <div key={season.SeasonID} style={{ marginBottom: '20px' }}>
                            <h3 style={{ color: '#e50914', marginBottom: '12px' }}>{season.Title}</h3>
                            {season.episodes.map(ep => (
                                <div key={ep.EpisodeID} style={{
                                    backgroundColor: '#2a2a2a',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>E{ep.EpisodeNumber} — {ep.Title}</span>
                                    <span style={{ color: '#b3b3b3' }}>{ep.Duration} min</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <div style={{
                backgroundColor: '#1f1f1f',
                borderRadius: '8px',
                padding: '30px',
                border: '1px solid #333'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Ratings & Reviews</h2>

                {user && (
                    <form onSubmit={handleRate} style={{
                        display: 'flex', flexDirection: 'column',
                        gap: '12px', marginBottom: '30px'
                    }}>
                        <input
                            type="number"
                            placeholder="Score (1-10)"
                            min="1" max="10"
                            value={ratingScore}
                            onChange={e => setRatingScore(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Leave a comment (optional)"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                            Submit Rating
                        </button>
                    </form>
                )}

                {ratings.length === 0 ? (
                    <p style={{ color: '#b3b3b3' }}>No ratings yet. Be the first!</p>
                ) : (
                    ratings.map(r => (
                        <div key={r.RatingID} style={{
                            backgroundColor: '#2a2a2a',
                            padding: '16px',
                            borderRadius: '6px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong>{r.UserName}</strong>
                                <span style={{ color: '#e50914', fontWeight: 'bold' }}>⭐ {r.RatingScore}/10</span>
                            </div>
                            {r.Comment && <p style={{ color: '#b3b3b3' }}>{r.Comment}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}