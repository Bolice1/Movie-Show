import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TABS = ['Content', 'Actors', 'Genres'];

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Content');

    useEffect(() => {
        if (!user || user.role !== 'admin') navigate('/');
    }, [user]);

    return (
        <div className="page">
            <h1 style={{ marginBottom: '24px' }}>
                Admin Panel — <span style={{ color: '#e50914' }}>Dashboard</span>
            </h1>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Content' && <ContentTab />}
            {activeTab === 'Actors'  && <ActorsTab />}
            {activeTab === 'Genres'  && <GenresTab />}
        </div>
    );
}

function ContentTab() {
    const [content, setContent]   = useState([]);
    const [genres, setGenres]     = useState([]);
    const [actors, setActors]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [message, setMessage]   = useState('');
    const [error, setError]       = useState('');

    const emptyForm = { title: '', description: '', duration: '', type: 'Movie', genreIds: [], actorIds: [] };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [contentRes, genresRes, actorsRes] = await Promise.all([
                api.get('/content'),
                api.get('/genres'),
                api.get('/actors')
            ]);
            setContent(contentRes.data.content);
            setGenres(genresRes.data.genres);
            setActors(actorsRes.data.actors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleGenreToggle = (genreId) => {
        setForm(prev => ({
            ...prev,
            genreIds: prev.genreIds.includes(genreId)
                ? prev.genreIds.filter(id => id !== genreId)
                : [...prev.genreIds, genreId]
        }));
    };

    const handleActorToggle = (actorId) => {
        setForm(prev => ({
            ...prev,
            actorIds: prev.actorIds.some(a => a.id === actorId)
                ? prev.actorIds.filter(a => a.id !== actorId)
                : [...prev.actorIds, { id: actorId, role: '' }]
        }));
    };

    const handleActorRole = (actorId, role) => {
        setForm(prev => ({
            ...prev,
            actorIds: prev.actorIds.map(a => a.id === actorId ? { ...a, role } : a)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            if (editing) {
                await api.put(`/content/${editing}`, {
                    title: form.title,
                    description: form.description,
                    duration: Number(form.duration),
                    type: form.type
                });
                setMessage('Content updated successfully!');
            } else {
                await api.post('/content', {
                    ...form,
                    duration: Number(form.duration)
                });
                setMessage('Content created successfully!');
            }
            setForm(emptyForm);
            setShowForm(false);
            setEditing(null);
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed.');
        }
    };

    const handleEdit = (item) => {
        setEditing(item.ContentID);
        setForm({
            title:       item.Title,
            description: item.Description,
            duration:    item.Duration,
            type:        item.Type,
            genreIds:    [],
            actorIds:    []
        });
        setShowForm(true);
        setError('');
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;
        try {
            await api.delete(`/content/${id}`);
            setMessage('Content deleted.');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>All Content ({content.length})</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); setError(''); setMessage(''); }}
                >
                    {showForm ? 'Cancel' : '+ Add Content'}
                </button>
            </div>

            {message && <p style={{ color: '#4caf50', marginBottom: '16px' }}>{message}</p>}
            {error   && <p className="error" style={{ marginBottom: '16px' }}>{error}</p>}

            {showForm && (
                <div style={{
                    backgroundColor: '#1f1f1f',
                    padding: '30px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ marginBottom: '20px', color: '#e50914' }}>
                        {editing ? 'Edit Content' : 'Add New Content'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            name="title"
                            placeholder="Title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            style={{
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #333',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                        <input
                            name="duration"
                            type="number"
                            placeholder="Duration (minutes)"
                            value={form.duration}
                            onChange={handleChange}
                            required
                        />
                        <select name="type" value={form.type} onChange={handleChange}>
                            <option value="Movie">Movie</option>
                            <option value="Serie">Serie</option>
                        </select>

                        {!editing && (
                            <>
                                <div>
                                    <p style={{ marginBottom: '10px', color: '#b3b3b3' }}>Select Genres:</p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {genres.map(g => (
                                            <button
                                                key={g.GenreID}
                                                type="button"
                                                onClick={() => handleGenreToggle(g.GenreID)}
                                                className={`btn ${form.genreIds.includes(g.GenreID) ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                            >
                                                {g.GenreName}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p style={{ marginBottom: '10px', color: '#b3b3b3' }}>Select Actors & Roles:</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {actors.map(a => (
                                            <div key={a.ActorID} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleActorToggle(a.ActorID)}
                                                    className={`btn ${form.actorIds.some(x => x.id === a.ActorID) ? 'btn-primary' : 'btn-secondary'}`}
                                                    style={{ padding: '6px 14px', fontSize: '0.85rem', minWidth: '160px' }}
                                                >
                                                    {a.Name}
                                                </button>
                                                {form.actorIds.some(x => x.id === a.ActorID) && (
                                                    <input
                                                        placeholder="Role (e.g. Batman)"
                                                        value={form.actorIds.find(x => x.id === a.ActorID)?.role || ''}
                                                        onChange={e => handleActorRole(a.ActorID, e.target.value)}
                                                        style={{ flex: 1 }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary">
                                {editing ? 'Update Content' : 'Add Content'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {content.map(item => (
                    <div key={item.ContentID} style={{
                        backgroundColor: '#1f1f1f',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                                <h3>{item.Title}</h3>
                                <span style={{
                                    backgroundColor: '#e50914',
                                    padding: '2px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.75rem'
                                }}>{item.Type}</span>
                            </div>
                            <p style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>
                                {item.Duration} min
                                {item.genres && ` • ${item.genres}`}
                                {item.actors && ` • ${item.actors}`}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleEdit(item)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 16px' }}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(item.ContentID)}
                                style={{
                                    backgroundColor: '#e50914',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActorsTab() {
    const [actors, setActors]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [message, setMessage]   = useState('');
    const [error, setError]       = useState('');

    const emptyForm = { name: '', birthDate: '', bio: '' };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchActors(); }, []);

    const fetchActors = async () => {
        try {
            const res = await api.get('/actors');
            setActors(res.data.actors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            if (editing) {
                await api.put(`/actors/${editing}`, form);
                setMessage('Actor updated successfully!');
            } else {
                await api.post('/actors', form);
                setMessage('Actor added successfully!');
            }
            setForm(emptyForm);
            setShowForm(false);
            setEditing(null);
            fetchActors();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed.');
        }
    };

    const handleEdit = (actor) => {
        setEditing(actor.ActorID);
        setForm({
            name:      actor.Name,
            birthDate: actor.BirthDate?.split('T')[0] || '',
            bio:       actor.Bio || ''
        });
        setShowForm(true);
        setError('');
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this actor?')) return;
        try {
            await api.delete(`/actors/${id}`);
            setMessage('Actor deleted.');
            fetchActors();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed.');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>All Actors ({actors.length})</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); setError(''); setMessage(''); }}
                >
                    {showForm ? 'Cancel' : '+ Add Actor'}
                </button>
            </div>

            {message && <p style={{ color: '#4caf50', marginBottom: '16px' }}>{message}</p>}
            {error   && <p className="error" style={{ marginBottom: '16px' }}>{error}</p>}

            {showForm && (
                <div style={{
                    backgroundColor: '#1f1f1f',
                    padding: '30px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ marginBottom: '20px', color: '#e50914' }}>
                        {editing ? 'Edit Actor' : 'Add New Actor'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="birthDate"
                            type="date"
                            value={form.birthDate}
                            onChange={handleChange}
                        />
                        <textarea
                            name="bio"
                            placeholder="Biography"
                            value={form.bio}
                            onChange={handleChange}
                            rows={3}
                            style={{
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #333',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary">
                                {editing ? 'Update Actor' : 'Add Actor'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {actors.map(actor => (
                    <div key={actor.ActorID} style={{
                        backgroundColor: '#1f1f1f',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>{actor.Name}</h3>
                            <p style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>
                                {actor.BirthDate?.split('T')[0] || 'No birth date'}
                            </p>
                            {actor.Bio && (
                                <p style={{ color: '#b3b3b3', fontSize: '0.85rem', marginTop: '4px', maxWidth: '500px' }}>
                                    {actor.Bio}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleEdit(actor)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 16px' }}
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={() => handleDelete(actor.ActorID)}
                                style={{
                                    backgroundColor: '#e50914',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── GENRES TAB ──────────────────────────────────────────────
function GenresTab() {
    const [genres, setGenres]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError]     = useState('');

    useEffect(() => {
        api.get('/genres')
            .then(res => setGenres(res.data.genres))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>All Genres ({genres.length})</h2>
            </div>

            {message && <p style={{ color: '#4caf50', marginBottom: '16px' }}>{message}</p>}
            {error   && <p className="error" style={{ marginBottom: '16px' }}>{error}</p>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
            }}>
                {genres.map(genre => (
                    <div key={genre.GenreID} style={{
                        backgroundColor: '#1f1f1f',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginBottom: '8px' }}>{genre.GenreName}</h3>
                        <span style={{
                            color: genre.isTheBest === 'Yes' ? '#e50914' : '#b3b3b3',
                            fontSize: '0.85rem'
                        }}>
                            {genre.isTheBest === 'Yes' ? '⭐ Best Genre' : 'Regular'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}