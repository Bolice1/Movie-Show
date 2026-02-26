import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ContentCard from '../components/ContentCard';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [content, setContent]       = useState([]);
    const [genres, setGenres]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch]         = useState(searchParams.get('search') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [type, setType]             = useState(searchParams.get('type') || '');
    const [genre, setGenre]           = useState(searchParams.get('genre') || '');
    const [page, setPage]             = useState(parseInt(searchParams.get('page')) || 1);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (type)   params.set('type',   type);
            if (genre)  params.set('genre',  genre);
            params.set('page',  page);
            params.set('limit', 8);

            const res = await api.get(`/content?${params.toString()}`);
            setContent(res.data.content);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, type, genre, page]);

    useEffect(() => {
        fetchContent();
        const params = {};
        if (search) params.search = search;
        if (type)   params.type   = type;
        if (genre)  params.genre  = genre;
        if (page > 1) params.page = page;
        setSearchParams(params);
    }, [search, type, genre, page]);

    useEffect(() => {
        api.get('/genres').then(res => setGenres(res.data.genres));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleType = (val) => {
        setType(val);
        setPage(1);
    };

    const handleGenre = (val) => {
        setGenre(val === genre ? '' : val);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch('');
        setSearchInput('');
        setType('');
        setGenre('');
        setPage(1);
    };

    const hasFilters = search || type || genre;

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
                <p style={{ color: '#b3b3b3', fontSize: '1.1rem', marginBottom: '24px' }}>
                    Discover movies and series. Add to your watchlist. Rate and review.
                </p>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
                    <input
                        type="text"
                        placeholder="Search movies, series..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        🔍 Search
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {['', 'Movie', 'Serie'].map(t => (
                    <button
                        key={t}
                        onClick={() => handleType(t)}
                        className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 16px' }}
                    >
                        {t === ''      ? '🎬 All'      :
                         t === 'Movie' ? '🎥 Movies'   : '📺 Series'}
                    </button>
                ))}

                <div style={{ width: '1px', height: '30px', backgroundColor: '#333' }} />

                {genres.map(g => (
                    <button
                        key={g.GenreID}
                        onClick={() => handleGenre(g.GenreName)}
                        className={`btn ${genre === g.GenreName ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                        {g.GenreName}
                    </button>
                ))}
            </div>

            {hasFilters && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ color: '#b3b3b3', fontSize: '0.9rem' }}>
                        {pagination?.total || 0} result{pagination?.total !== 1 ? 's' : ''} found
                        {search && ` for "${search}"`}
                        {type   && ` in ${type}`}
                        {genre  && ` • ${genre}`}
                    </span>
                    <button
                        onClick={clearFilters}
                        style={{
                            background: 'none',
                            border: '1px solid #333',
                            color: '#b3b3b3',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        ✕ Clear filters
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : content.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#b3b3b3' }}>
                    <p style={{ fontSize: '3rem' }}>🎬</p>
                    <p style={{ fontSize: '1.2rem', marginTop: '16px' }}>No content found.</p>
                    {hasFilters && (
                        <button onClick={clearFilters} className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    {content.map(item => (
                        <ContentCard key={item.ContentID} content={item} />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '40px'
                }}>
                    <button
                        onClick={() => setPage(1)}
                        disabled={!pagination.hasPrevPage}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', opacity: !pagination.hasPrevPage ? 0.4 : 1 }}
                    >
                        «
                    </button>
                    <button
                        onClick={() => setPage(p => p - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', opacity: !pagination.hasPrevPage ? 0.4 : 1 }}
                    >
                        ‹
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.totalPages ||
                            Math.abs(p - pagination.currentPage) <= 1)
                        .reduce((acc, p, i, arr) => {
                            if (i > 0 && p - arr[i - 1] > 1)
                                acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) => p === '...' ? (
                            <span key={`dots-${i}`} style={{ color: '#b3b3b3', padding: '0 4px' }}>...</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`btn ${pagination.currentPage === p ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '6px 12px', minWidth: '36px' }}
                            >
                                {p}
                            </button>
                        ))
                    }

                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', opacity: !pagination.hasNextPage ? 0.4 : 1 }}
                    >
                        ›
                    </button>
                    <button
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={!pagination.hasNextPage}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', opacity: !pagination.hasNextPage ? 0.4 : 1 }}
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
}
