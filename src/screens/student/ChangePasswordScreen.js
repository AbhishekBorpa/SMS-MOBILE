import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return false;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Error', 'New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(
                `${API_URL}/users/change-password`,
                {
                    currentPassword,
                    newPassword
                },
                config
            );

            Alert.alert(
                'Success',
                'Password changed successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to change password. Please check your current password.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '#E0E0E0' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: '#F44336' };
        if (strength <= 3) return { strength: 66, label: 'Medium', color: '#FF9800' };
        return { strength: 100, label: 'Strong', color: '#4CAF50' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Change Password"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="shield-lock"
            />

            <KeyboardWrapper backgroundColor="#F5F7FA">
                <View style={styles.content}>
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
                        <Text style={styles.infoText}>
                            Choose a strong password with at least 6 characters, including uppercase, lowercase, numbers, and symbols.
                        </Text>
                    </View>

                    {/* Current Password */}
                    <AppInput
                        label="Current Password"
                        placeholder="Enter current password"
                        secureTextEntry={!showCurrent}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        autoCapitalize="none"
                        icon="lock"
                        rightIcon={showCurrent ? 'eye-off' : 'eye'}
                        onRightIconPress={() => setShowCurrent(!showCurrent)}
                    />

                    {/* New Password */}
                    <AppInput
                        label="New Password"
                        placeholder="Enter new password"
                        secureTextEntry={!showNew}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        autoCapitalize="none"
                        icon="lock-plus"
                        rightIcon={showNew ? 'eye-off' : 'eye'}
                        onRightIconPress={() => setShowNew(!showNew)}
                    />

                    {/* Password Strength Indicator */}
                    {newPassword.length > 0 && (
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthBar}>
                                <View
                                    style={[
                                        styles.strengthFill,
                                        { width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                {passwordStrength.label}
                            </Text>
                        </View>
                    )}

                    {/* Confirm Password */}
                    <AppInput
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        secureTextEntry={!showConfirm}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        icon="lock-check"
                        rightIcon={showConfirm ? 'eye-off' : 'eye'}
                        onRightIconPress={() => setShowConfirm(!showConfirm)}
                        containerStyle={{ marginTop: 15 }}
                    />

                    {/* Match Indicator */}
                    {confirmPassword.length > 0 && (
                        <View style={styles.matchContainer}>
                            <MaterialCommunityIcons
                                name={newPassword === confirmPassword ? 'check-circle' : 'close-circle'}
                                size={16}
                                color={newPassword === confirmPassword ? '#4CAF50' : '#F44336'}
                            />
                            <Text style={[
                                styles.matchText,
                                { color: newPassword === confirmPassword ? '#4CAF50' : '#F44336' }
                            ]}>
                                {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </Text>
                        </View>
                    )}

                    {/* Password Requirements */}
                    <View style={[styles.requirementsCard, { marginTop: 25 }]}>
                        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                        <View style={styles.requirement}>
                            <MaterialCommunityIcons
                                name={newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={newPassword.length >= 6 ? '#4CAF50' : '#999'}
                            />
                            <Text style={styles.requirementText}>At least 6 characters</Text>
                        </View>
                        <View style={styles.requirement}>
                            <MaterialCommunityIcons
                                name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={/[A-Z]/.test(newPassword) ? '#4CAF50' : '#999'}
                            />
                            <Text style={styles.requirementText}>One uppercase letter</Text>
                        </View>
                        <View style={styles.requirement}>
                            <MaterialCommunityIcons
                                name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={/[0-9]/.test(newPassword) ? '#4CAF50' : '#999'}
                            />
                            <Text style={styles.requirementText}>One number</Text>
                        </View>
                    </View>

                    {/* Change Password Button */}
                    <AppButton
                        title="Change Password"
                        onPress={handleChangePassword}
                        loading={loading}
                        disabled={loading}
                        style={{ marginTop: 30 }}
                    />
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flex: 1, padding: 20 },

    infoCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary + '10',
        padding: 15,
        borderRadius: 12,
        marginBottom: 25,
        gap: 12
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 20
    },

    inputContainer: { marginBottom: 20 },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8
    },
    passwordInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 10
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: theme.colors.text
    },

    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10
    },
    strengthBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden'
    },
    strengthFill: {
        height: '100%',
        borderRadius: 3
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        width: 60
    },

    matchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 6
    },
    matchText: {
        fontSize: 12,
        fontWeight: '600'
    },

    requirementsCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 10
    },
    requirement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6
    },
    requirementText: {
        fontSize: 13,
        color: theme.colors.textLight
    }
});

export default ChangePasswordScreen;
