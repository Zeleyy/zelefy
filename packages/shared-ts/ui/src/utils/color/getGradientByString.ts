const GRADIENT_PRESETS = [
    "linear-gradient(135deg, #FF5500 0%, #FF2200 100%)",
    "linear-gradient(135deg, #7028E8 0%, #E3286B 100%)",
    "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
    "linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)",
    "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",
    "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
    "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
];

export const getGradientByString = (s?: string): string => {
    if (!s) return GRADIENT_PRESETS[0];

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % GRADIENT_PRESETS.length;
    return GRADIENT_PRESETS[index];
};
