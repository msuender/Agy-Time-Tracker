import { useState, useMemo } from 'react';
import { getDatesWithEntries, getEntriesForDate } from '../lib/storage';
import { formatDuration, generateSchedule } from '../lib/utils';

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function HistoryView({ projects, workDays }) {
    const availableDates = useMemo(() => getDatesWithEntries(), []);
    const [selectedDate, setSelectedDate] = useState(availableDates[0] || '');

    const entries = useMemo(() => {
        if (!selectedDate) return [];
        return getEntriesForDate(selectedDate);
    }, [selectedDate]);

    const workDay = workDays[selectedDate] || null;

    // Group by project
    const summary = useMemo(() => {
        return entries.reduce((acc, entry) => {
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
    }, [entries, projects]);

    const totalMinutes = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);

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

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleCopyToWorkday = () => {
        const data = schedule
            .filter(item => item.type !== 'break')
            .map(item => ({
                date: selectedDate,
                project: item.projectName,
                startTime: item.start,
                endTime: item.end,
                comment: item.comments,
                location: 'Office'
            }));

        const json = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(json).then(() => {
            alert('Workday data copied to clipboard!');
        });
    };

    if (availableDates.length === 0) {
        return (
            <div className="card" style={{ marginTop: '24px', textAlign: 'center' }}>
                <p className="text-muted">No history available. Start tracking time to build your history.</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Date Selector */}
            <div className="card">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    Select Date
                </label>
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                >
                    {availableDates.map(date => (
                        <option key={date} value={date}>
                            {formatDateLabel(date)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Consolidated Report Card */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <h2>Consolidated Report</h2>
                    <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                        ({formatDuration(totalMinutes)})
                    </span>
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
                    {Object.keys(summary).length === 0 && (
                        <p className="text-muted">No entries for this date.</p>
                    )}
                </div>
            </div>

            {/* Booking Proposal Card */}
            {schedule.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', margin: 0 }}>
                            Booking Proposal ({schedule.filter(item => item.type !== 'break').length})
                        </h3>
                        <button
                            className="btn btn-primary"
                            onClick={handleCopyToWorkday}
                            style={{ fontSize: '14px', padding: '6px 12px' }}
                        >
                            Copy for Workday
                        </button>
                    </div>
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
