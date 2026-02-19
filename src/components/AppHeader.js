import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

const AppHeader = ({
    title,
    subtitle,
    onBack,
    rightIcon,
    onRightPress,
    transparent = false,
    showBack = true,
    variant = 'default' // 'default' or 'primary'
}) => {
    const isPrimary = variant === 'primary';
    const textColor = isPrimary ? '#fff' : theme.colors.text;
    const subtitleColor = isPrimary ? 'rgba(255,255,255,0.8)' : theme.colors.textLight;
    const bgColor = isPrimary ? theme.colors.primary : '#fff';

    return (
        <View style={[
            styles.header,
            { backgroundColor: bgColor },
            transparent && styles.transparentHeader,
            !transparent && !isPrimary && styles.borderHeader
        ]}>
            <View style={styles.leftSection}>
                {showBack && (
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={32} color={textColor} />
                    </TouchableOpacity>
                )}
                <View>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>}
                </View>
            </View>

            {rightIcon && (
                <TouchableOpacity
                    onPress={onRightPress}
                    style={[
                        styles.actionIcon,
                        isPrimary && { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }
                    ]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name={rightIcon} size={24} color={textColor} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    transparentHeader: {
        backgroundColor: 'transparent',
    },
    borderHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F6F8',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 10,
        padding: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textLight,
        fontWeight: '700',
        marginTop: -2,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
});

export default AppHeader;
