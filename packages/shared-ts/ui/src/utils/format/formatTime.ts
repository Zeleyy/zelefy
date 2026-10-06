type TimeFormatOptions = {
    showHours?: boolean;
    showDays?: boolean;
    padHours?: boolean;
};

export const formatTime = (
    seconds: number,
    { showHours, showDays, padHours = false }: TimeFormatOptions = {},
) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const totalSecs = Math.floor(seconds);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const hasDays = showDays === true || (showDays === undefined && totalSecs >= 86400);
    const hasHours = showHours === true || (showHours === undefined && totalSecs >= 3600);

    const hrs = hasDays ? Math.floor((totalSecs % 86400) / 3600) : Math.floor(totalSecs / 3600);

    const days = hasDays ? Math.floor(totalSecs / 86400) : 0;
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const parts: string[] = [];

    if (hasDays) parts.push(`${days}д`);
    if (hasHours) parts.push(hasDays || padHours ? pad(hrs) : hrs.toString());

    parts.push(hasDays || hasHours ? pad(mins) : mins.toString());
    parts.push(pad(secs));

    return parts.join(":");
};
