import { Link } from 'react-router-dom';

export default function ContentCard({ content }) {
    return (
        <Link to={`/content/${content.ContentID}`}>
            <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <div style={{
                    backgroundColor: '#1a1a1a',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                }}>
                    {content.Type === 'Movie' ? '🎬' : '📺'}
                </div>

                <div style={{ padding: '12px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                        {content.Title}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                            backgroundColor: '#e50914',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '0.75rem'
                        }}>
                            {content.Type}
                        </span>
                        <span style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>
                            {content.Duration} min
                        </span>
                    </div>
                    {content.genres && (
                        <p style={{ color: '#b3b3b3', fontSize: '0.8rem', marginTop: '6px' }}>
                            {content.genres}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}