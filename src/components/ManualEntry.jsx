import { useState, useEffect } from 'react';
import { saveEntry } from '../lib/storage';

export default function ManualEntry({ projects, onEntryAdded }) {
    const [search, setSearch] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [duration, setDuration] = useState(15);
    const [comment, setComment] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectProject = (project) => {
        setSelectedProjectId(project.id);
        setSearch(project.name);
        setShowDropdown(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedProjectId) {
            alert('Please select a project');
            return;
        }

        saveEntry({
            projectId: selectedProjectId,
            durationMinutes: duration,
            comment,
            date: new Date().toISOString()
        });

        // Reset form
        setDuration(15);
        setComment('');
        setSearch('');
        setSelectedProjectId('');
        if (onEntryAdded) onEntryAdded();
    };

    const adjustDuration = (delta) => {
        setDuration(prev => Math.max(15, prev + delta));
    };

    return (
        <div className="card">
            <h2>Book Time</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

                {/* Project Selection */}
                <div style={{ position: 'relative' }}>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Project</label>
                    <input
                        type="text"
                        placeholder="Search project..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                            setSelectedProjectId(''); // Clear selection on edit
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredProjects.length > 0) {
                                e.preventDefault();
                                handleSelectProject(filteredProjects[0]);
                            }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                    />
                    {showDropdown && filteredProjects.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#161b22',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            zIndex: 10,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}>
                            {filteredProjects.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelectProject(p)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        borderBottom: '1px solid var(--border-subtle)'
                                    }}
                                >
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color }}></span>
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Duration */}
                <div>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Duration (15m increments)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => adjustDuration(-15)}>-</button>
                        <div style={{
                            flex: 1,
                            textAlign: 'center',
                            background: 'var(--bg-input)',
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            {Math.floor(duration / 60)}h {duration % 60}m
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={() => adjustDuration(15)}>+</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {[15, 30, 45, 60].map(m => (
                            <button
                                key={m}
                                type="button"
                                className={`btn ${duration === m ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, fontSize: '12px', padding: '4px' }}
                                onClick={() => setDuration(m)}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Comment</label>
                    <textarea
                        rows="3"
                        placeholder="What did you work on?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Book Time</button>
            </form>
        </div>
    );
}
