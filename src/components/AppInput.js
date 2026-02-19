import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

const AppInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = 'default',
    secureTextEntry = false,
    multiline = false,
    style
}) => {
    return (
        <View style={[styles.inputGroup, style]}>
            {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
            <View style={[styles.inputContainer, multiline && styles.textAreaContainer]}>
                {icon && (
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
                    </View>
                )}
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textLight}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    autoCapitalize={secureTextEntry ? 'none' : 'none'}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.textLight,
        marginBottom: 10,
        marginLeft: 5,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        paddingHorizontal: 15,
        minHeight: 60,
    },
    textAreaContainer: {
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '600',
    },
    textArea: {
        height: 120,
        paddingTop: 0,
    },
});

export default AppInput;
