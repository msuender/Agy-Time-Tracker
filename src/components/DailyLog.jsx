import { useState } from 'react';
import { calculateExpectedMinutes, formatDuration } from '../lib/utils';

export default function DailyLog({ entries, projects, onDelete, onUpdate, workDay }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ projectId: '', durationMinutes: 0, comment: '' });

    const getProject = (id) => projects.find(p => p.id === id);

    const startEditing = (entry) => {
        setEditingId(entry.id);
        setEditForm({
            projectId: entry.projectId,
            durationMinutes: entry.durationMinutes,
            comment: entry.comment || ''
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ projectId: '', durationMinutes: 0, comment: '' });
    };

    const handleSave = (originalEntry) => {
        if (!editForm.projectId || editForm.durationMinutes <= 0) {
            alert('Please select a project and enter a valid duration.');
            return;
        }

        onUpdate({
            ...originalEntry,
            projectId: editForm.projectId,
            durationMinutes: parseInt(editForm.durationMinutes),
            comment: editForm.comment
        });
        cancelEditing();
    };

    // Filter for today? Or parent passes filtered? Let's filter for today here for safety
    // or assume parent handles date context. For "Daily Log", let's show today's entries.

    const today = new Date().toDateString(); // For display/logic

    const todaysEntries = entries.filter(e => new Date(e.date).toDateString() === today)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first

    const totalMinutes = todaysEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);

    // Work Day Calculation
    let comparison = null;
    if (workDay) {
        const expectedMinutes = calculateExpectedMinutes(workDay.startTime, workDay.endTime, workDay.lunchDuration);
        if (expectedMinutes > 0) {
            const diff = totalMinutes - expectedMinutes;
            const diffColor = diff >= 0 ? 'var(--success)' : 'var(--danger)';
            comparison = (
                <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                    Target: {formatDuration(expectedMinutes)} | Diff: <span style={{ color: diffColor, fontWeight: 'bold' }}>{diff > 0 ? '+' : ''}{formatDuration(diff)}</span>
                </span>
            );
        }
    }

    return (
        <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <h2>Today's Log</h2>
                    <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({formatDuration(totalMinutes)})</span>
                    {comparison}
                </div>
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
                    const isEditing = editingId === entry.id;
                    const project = getProject(entry.projectId) || { name: 'Unknown', color: '#ccc' };

                    if (isEditing) {
                        return (
                            <li key={entry.id} style={{
                                padding: '12px 0',
                                borderBottom: '1px solid var(--border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={editForm.projectId}
                                        onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                                        style={{ flex: 1 }}
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 8px' }}
                                            onClick={() => setEditForm(prev => ({
                                                ...prev,
                                                durationMinutes: Math.max(15, prev.durationMinutes - 15)
                                            }))}
                                        >
                                            -
                                        </button>
                                        <div style={{
                                            padding: '4px 8px',
                                            background: 'var(--bg-input)',
                                            borderRadius: '4px',
                                            minWidth: '70px',
                                            textAlign: 'center',
                                            fontSize: '14px'
                                        }}>
                                            {Math.floor(editForm.durationMinutes / 60)}h {editForm.durationMinutes % 60}m
                                        </div>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 8px' }}
                                            onClick={() => setEditForm(prev => ({
                                                ...prev,
                                                durationMinutes: prev.durationMinutes + 15
                                            }))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Comment (optional)"
                                    value={editForm.comment}
                                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave(entry);
                                        if (e.key === 'Escape') cancelEditing();
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={cancelEditing}>Cancel</button>
                                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleSave(entry)}>Save</button>
                                </div>
                            </li>
                        );
                    }

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
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {onUpdate && (
                                        <button
                                            onClick={() => startEditing(entry)}
                                            className="btn btn-secondary"
                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                        >
                                            Edit
                                        </button>
                                    )}
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
