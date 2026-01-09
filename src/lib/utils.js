export const calculateExpectedMinutes = (startTime, endTime, lunchDuration = 30) => {
    if (!startTime || !endTime) return 0;

    // Use arbitrary date for time calculation
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(`${today}T${startTime}`);
    const end = new Date(`${today}T${endTime}`);
    let diffMs = end - start;

    if (diffMs <= 0) return 0;

    const lunchMs = lunchDuration * 60 * 1000;
    diffMs -= lunchMs;

    if (diffMs < 0) return 0;

    return Math.floor(diffMs / (1000 * 60));
};

export const formatDuration = (minutes) => {
    const isNegative = minutes < 0;
    const absMinutes = Math.abs(minutes);
    const h = Math.floor(absMinutes / 60);
    const m = absMinutes % 60;
    return `${isNegative ? '-' : ''}${h}h ${m}m`;
};

export const generateSchedule = (startTime, lunchDuration, items) => {
    if (!startTime || !items || items.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];
    let cursor = new Date(`${today}T${startTime}`);
    const startOfWork = new Date(cursor.getTime());
    const schedule = [];
    let lunchAdded = false;
    const workLimitMs = 6 * 60 * 60 * 1000; // 6 hours in ms

    // Helper to format time as HH:MM
    const formatTime = (date) => {
        return date.toTimeString().substr(0, 5);
    };

    // Helper to add minutes to a date
    const addMinutes = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    };

    for (const item of items) {
        if (!lunchAdded && lunchDuration > 0) {
            // Check if adding this item would exceed 6 hours from start
            const projectedEnd = addMinutes(cursor, item.durationMinutes);
            const timeSinceStart = projectedEnd - startOfWork;

            if (timeSinceStart > workLimitMs) {
                // Must add lunch now
                schedule.push({
                    start: formatTime(cursor),
                    end: formatTime(addMinutes(cursor, lunchDuration)),
                    type: 'break',
                    name: 'Lunch Break'
                });
                cursor = addMinutes(cursor, lunchDuration);
                lunchAdded = true;
            }
        }

        // Add Item
        const currentEnd = addMinutes(cursor, item.durationMinutes);
        schedule.push({
            start: formatTime(cursor),
            end: formatTime(currentEnd),
            type: 'work',
            ...item
        });
        cursor = currentEnd;
    }
    
    // If we finished all items and still haven't had lunch, but we worked > 6 hours?
    // The loop handles "before" the item.
    // What if the generated schedule ends > 6 hours but we never triggered the condition?
    // (e.g. strict equality or logic gap).
    // The condition `timeSinceStart > workLimitMs` handles the overflow.
    // If the valid schedule is exactly 6 hours, no lunch is added. This is correct.
    
    return schedule;
};
