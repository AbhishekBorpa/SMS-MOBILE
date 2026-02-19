import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

const AppButton = ({
    title,
    onPress,
    type = 'primary',
    icon,
    loading = false,
    disabled = false,
    style
}) => {
    const isPrimary = type === 'primary';
    const isDanger = type === 'danger';
    const isSecondary = type === 'secondary';

    const getColors = () => {
        if (isPrimary) return [theme.colors.primary, theme.colors.secondary];
        if (isDanger) return [theme.colors.accent, '#d32f2f'];
        return ['#F9FAFB', '#F5F6F8']; // Default/Secondary fallback if used as gradient
    };

    const renderContent = () => (
        <View style={styles.btnContent}>
            {loading ? (
                <ActivityIndicator color={isPrimary || isDanger ? '#fff' : theme.colors.primary} />
            ) : (
                <>
                    <Text style={[
                        styles.text,
                        isPrimary || isDanger ? styles.textWhite : styles.textDark
                    ]}>
                        {title ? title.toUpperCase() : 'BUTTON'}
                    </Text>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon}
                            size={18}
                            color={isPrimary || isDanger ? '#fff' : theme.colors.text}
                        />
                    )}
                </>
            )}
        </View>
    );

    if (isPrimary || isDanger) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                disabled={loading || disabled}
                style={[styles.container, style, disabled && styles.disabled]}
            >
                <LinearGradient
                    colors={getColors()}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={loading || disabled}
            style={[
                styles.container,
                styles.outline,
                style,
                disabled && styles.disabled
            ]}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    gradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outline: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingVertical: 18,
        elevation: 0,
        shadowOpacity: 0,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    text: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    textWhite: {
        color: '#fff',
    },
    textDark: {
        color: theme.colors.text,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default AppButton;
