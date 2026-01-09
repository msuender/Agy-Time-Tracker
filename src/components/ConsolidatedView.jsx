import { calculateExpectedMinutes, formatDuration, generateSchedule } from '../lib/utils';
import { useState, useMemo } from 'react';

export default function ConsolidatedView({ entries, projects, workDay }) {
    const today = new Date().toDateString();
    const todaysEntries = entries.filter(e => new Date(e.date).toDateString() === today);

    // Group by project
    const summary = todaysEntries.reduce((acc, entry) => {
        if (!acc[entry.projectId]) {
            acc[entry.projectId] = {
                id: entry.projectId,
                projectName: (projects.find(p => p.id === entry.projectId) || { name: 'Unknown' }).name,
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

    // Prepare items for schedule
    const scheduleItems = useMemo(() => {
        return Object.values(summary).map(item => ({
            projectId: item.id,
            projectName: item.projectName,
            durationMinutes: item.totalMinutes,
            comments: item.comments.join('; ')
        }));
    }, [summary]);

    const schedule = useMemo(() => {
        if (!workDay) return [];
        return generateSchedule(workDay.startTime, workDay.lunchDuration, scheduleItems);
    }, [workDay, scheduleItems]);

    // Comparison logic
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

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Consolidated Report Card */}
            <div className="card">
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
                                    <span style={{ fontWeight: 600 }}>{formatDuration(data.totalMinutes)}</span>
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

            {/* Booking Proposal Card */}
            {schedule.length > 0 && (
                <div className="card">
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Booking Proposal</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {schedule.map((item, index) => {
                            if (item.type === 'break') {
                                return (
                                    <div key={index} style={{
                                        padding: '8px 12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-secondary)',
                                        fontStyle: 'italic',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{item.start} - {item.end}</span>
                                        <span>Lunch Break</span>
                                    </div>
                                );
                            }

                            // Work Item
                            const project = projects.find(p => p.id === item.projectId) || { color: '#ccc' };
                            return (
                                <div key={index} style={{
                                    padding: '12px',
                                    background: 'var(--bg-input)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    borderLeft: `3px solid ${project.color}`
                                }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '14px', minWidth: '90px' }}>{item.start} - {item.end}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500' }}>{item.projectName}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.comments}</div>
                                    </div>
                                    {item.comments && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleCopy(item.comments)}
                                            title="Copy comment"
                                            style={{ padding: '6px' }}
                                        >
                                            <span style={{ fontSize: '14px' }}>📋</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
