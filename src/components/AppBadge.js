import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

const AppBadge = ({
    label,
    type = 'primary',
    color,
    style
}) => {
    const getColors = () => {
        if (color) return { bg: color + '15', text: color };

        switch (type) {
            case 'success': return { bg: theme.colors.green + '15', text: theme.colors.green };
            case 'danger': return { bg: theme.colors.accent + '15', text: theme.colors.accent };
            case 'warning': return { bg: '#FFF9E6', text: '#F5A623' };
            case 'info': return { bg: theme.colors.blue + '15', text: theme.colors.blue };
            default: return { bg: theme.colors.primary + '15', text: theme.colors.primary };
        }
    };

    const colors = getColors();

    return (
        <View style={[
            styles.badge,
            { backgroundColor: colors.bg },
            style
        ]}>
            <Text style={[styles.text, { color: colors.text }]}>
                {label ? label.toUpperCase() : ''}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});

export default AppBadge;
