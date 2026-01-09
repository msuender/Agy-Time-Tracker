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
