// Native Dates used intentionally

// Using native Intl for now to avoid dependency add (unless I add date-fns). 
// User requested "local", native is safer unless complex formatting needed.

export default function DailyLog({ entries, projects, onDelete }) {
    const getProject = (id) => projects.find(p => p.id === id);

    // Filter for today? Or parent passes filtered? Let's filter for today here for safety
    // or assume parent handles date context. For "Daily Log", let's show today's entries.

    const today = new Date().toDateString();
    const todaysEntries = entries.filter(e => new Date(e.date).toDateString() === today)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    return (
        <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Today's Log</h2>
                {todaysEntries.length > 0 && onDelete && (
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to clear all entries for today?')) {
                                onDelete(todaysEntries.map(e => e.id));
                            }
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >
                        Clear Day
                    </button>
                )}
            </div>
            <ul style={{ listStyle: 'none', marginTop: '16px' }}>
                {todaysEntries.map(entry => {
                    const project = getProject(entry.projectId) || { name: 'Unknown', color: '#ccc' };
                    return (
                        <li key={entry.id} style={{
                            padding: '12px 0',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.color }}></span>
                                    <span style={{ fontWeight: 500 }}>{project.name}</span>
                                    <span className="text-muted" style={{ fontSize: '12px' }}>
                                        {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                                    </span>
                                </div>
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="btn btn-secondary"
                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {entry.comment || <em className="text-muted">No comment</em>}
                            </div>
                        </li>
                    );
                })}
                {todaysEntries.length === 0 && <p className="text-muted">No entries for today.</p>}
            </ul>
        </div>
    );
}
