import { useState, useEffect, useRef } from 'react';
import { getWorkDay, saveWorkDay } from '../lib/storage';

export default function WorkDayCalculator({ onUpdate }) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [lunchDuration, setLunchDuration] = useState(30);
    const [totalWorkTime, setTotalWorkTime] = useState('');
    const isLoaded = useRef(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const data = getWorkDay(today);
        if (data) {
            setStartTime(data.startTime || '');
            setEndTime(data.endTime || '');
            setLunchDuration(data.lunchDuration !== undefined ? data.lunchDuration : 30);
        }
        isLoaded.current = true;
    }, [today]);

    useEffect(() => {
        calculateTotal();

        // Only save changes after initial load is complete
        if (isLoaded.current) {
            if (startTime || endTime || lunchDuration !== 30) {
                saveWorkDay(today, { startTime, endTime, lunchDuration });
                if (onUpdate) onUpdate();
            } else {
                // If everything is empty/default, ensure it's cleared from storage
                // This handles the case where user backspaces everything
                saveWorkDay(today, null);
                if (onUpdate) onUpdate();
            }
        }
    }, [startTime, endTime, lunchDuration]);
    const calculateTotal = () => {
        if (!startTime || !endTime) {
            setTotalWorkTime('');
            return;
        }

        const start = new Date(`${today}T${startTime}`);
        const end = new Date(`${today}T${endTime}`);
        let diffMs = end - start;

        if (diffMs <= 0) {
            setTotalWorkTime('Invalid time range');
            return;
        }

        const lunchMs = lunchDuration * 60 * 1000;
        diffMs -= lunchMs;

        if (diffMs < 0) {
            setTotalWorkTime('Lunch longer than work?');
            return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        setTotalWorkTime(`${hours}h ${minutes}m`);
    };
    const handleClear = () => {
        if (confirm('Clear work day settings?')) {
            setStartTime('');
            setEndTime('');
            setLunchDuration(30);
            // Storage update and onUpdate callback will be handled by the useEffect
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Work Day</h2>
                <button type="button" className="btn btn-secondary" onClick={handleClear} style={{ fontSize: '12px', padding: '4px 8px' }}>Clear</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                <div>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Start Time</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>End Time</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Lunch (min)</label>
                    <input
                        type="number"
                        min="0"
                        value={lunchDuration}
                        onChange={(e) => setLunchDuration(parseInt(e.target.value) || 0)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Total</label>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: totalWorkTime.includes('Invalid') || totalWorkTime.includes('?') ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
                        {totalWorkTime || '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}
