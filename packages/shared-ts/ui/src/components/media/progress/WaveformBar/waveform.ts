export interface PathParams {
    peaks: number[];
    step: number;
    barWidth: number;
    baseY: number;
    topMax: number;
    bottomMax: number;
}

export const toPx = (p: number, max: number) => (p === 0 ? 0 : Math.max(1, Math.round(p * max)));

export const downsample = (data: Uint8Array, bars: number): number[] => {
    if (bars <= 0) return [];
    if (data.length === 0) return new Array(bars).fill(0);

    const out = new Array<number>(bars);
    const bucket = data.length / bars;

    for (let i = 0; i < bars; i++) {
        const start = Math.floor(i * bucket);
        const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
        let max = 0;
        for (let j = start; j < end && j < data.length; j++) {
            if (data[j] > max) max = data[j];
        }
        out[i] = max;
    }
    return out;
};

export const computePeaks = (data: Uint8Array, bars: number): number[] => {
    const sampled = downsample(data, bars);
    let max = 0;
    for (const v of sampled) if (v > max) max = v;
    return max === 0 ? sampled.map(() => 0) : sampled.map((v) => v / max);
};

export const buildPaths = ({ peaks, step, barWidth, baseY, topMax, bottomMax }: PathParams) => {
    let top = "";
    let bottom = "";
    for (let i = 0; i < peaks.length; i++) {
        const topH = toPx(peaks[i], topMax);
        const bottomH = toPx(peaks[i], bottomMax);
        const x = i * step;
        if (topH) top += `M${x} ${baseY - topH}h${barWidth}v${topH}h-${barWidth}z`;
        if (bottomH) bottom += `M${x} ${baseY}h${barWidth}v${bottomH}h-${barWidth}z`;
    }
    return { top, bottom };
};
