import { getWorkDay } from '../lib/storage';
import { calculateExpectedMinutes, formatDuration } from '../lib/utils';

export default function ConsolidatedView({ entries, projects }) {
    const today = new Date().toDateString();
    const todaysEntries = entries.filter(e => new Date(e.date).toDateString() === today);

    // Group by project
    const summary = todaysEntries.reduce((acc, entry) => {
        if (!acc[entry.projectId]) {
            acc[entry.projectId] = {
                totalMinutes: 0,
                comments: []
            };
        }
        acc[entry.projectId].totalMinutes += entry.durationMinutes;
        if (entry.comment) {
            acc[entry.projectId].comments.push(entry.comment);
        }
        return acc;
    }, {});

    const totalMinutes = todaysEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);

    // Work Day Calculation - Reusing logic
    // In a real app we might hoist this up to App.jsx or context to avoid duplicate reads,
    // but for this scale, reading from localStorage again is fine and safe.
    const todayISO = new Date().toISOString().split('T')[0];
    const workDay = getWorkDay(todayISO);
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h2>Consolidated Report</h2>
                <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({formatDuration(totalMinutes)})</span>
                {comparison}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(summary).map(projectId => {
                    const project = projects.find(p => p.id === projectId) || { name: 'Unknown', color: '#ccc' };
                    const data = summary[projectId];

                    return (
                        <div key={projectId} style={{
                            padding: '12px',
                            background: 'var(--bg-input)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${project.color}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600 }}>{project.name}</span>
                                <span style={{ fontWeight: 600 }}>{data.totalMinutes / 60}h</span>
                                {/* User requested decimal hours? Or just duration? "Sum of booked time". Usually decimal hours is good for reporting. */}
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                {data.comments.join('; ')}
                            </p>
                        </div>
                    );
                })}
                {Object.keys(summary).length === 0 && <p className="text-muted">No data to consolidate.</p>}
            </div>
        </div>
    );
}
