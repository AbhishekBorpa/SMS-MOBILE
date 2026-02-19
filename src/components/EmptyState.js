import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import AppButton from './AppButton';

const EmptyState = ({
    icon = 'database-off',
    title = 'No Records Found',
    description = "We couldn't find any information to display here at the moment.",
    actionLabel,
    onAction
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={icon} size={80} color="#E0E0E0" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {actionLabel && (
                <AppButton
                    title={actionLabel}
                    onPress={onAction}
                    style={styles.action}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    action: {
        marginTop: 30,
        width: '100%',
    },
});

export default EmptyState;
