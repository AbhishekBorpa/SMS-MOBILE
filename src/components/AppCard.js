import { StyleSheet, TouchableOpacity, View } from 'react-native';

const AppCard = ({
    children,
    onPress,
    style,
    padding = 20,
    radius = 24,
    elevated = true
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                styles.card,
                elevated && styles.elevated,
                { borderRadius: radius, padding: padding },
                style
            ]}
        >
            {children}
        </Container>
    );
};

import { theme } from '../constants/theme';

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    elevated: {
        ...theme.shadows.md,
    },
});

export default AppCard;
