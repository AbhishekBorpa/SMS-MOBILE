export const theme = {
    colors: {
        primary: '#4A148C', // Deep Purple
        secondary: '#FF6D00', // Bright Orange
        accent: '#F50057', // Pinkish Red
        success: '#00C853', // Green
        warning: '#FFAB00', // Amber
        error: '#D50000', // Red
        info: '#2962FF', // Blue

        background: '#F4F6F8', // Light Grey/Lavender tint
        surface: '#FFFFFF',

        text: '#263238', // Dark Blue Grey
        textLight: '#78909C', // Blue Grey
        textWhite: '#FFFFFF',

        border: '#ECEFF1',
        cardShadow: '#455A64',
    },
    gradients: {
        primary: ['#7B1FA2', '#4A148C'], // Purple Gradient
        secondary: ['#FF9100', '#FF6D00'], // Orange Gradient
        accent: ['#FF4081', '#F50057'], // Pink Gradient
        success: ['#69F0AE', '#00C853'],
        blue: ['#448AFF', '#2962FF'],
        card: ['#FFFFFF', '#F8F9FA'],
        dark: ['#37474F', '#263238'],
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        round: 100,
    },
    shadows: {
        sm: {
            shadowColor: '#455A64',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#455A64',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#4A148C',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    }
};
