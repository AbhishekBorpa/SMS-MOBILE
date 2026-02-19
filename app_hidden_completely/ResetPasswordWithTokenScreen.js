import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import { theme } from '../constants/theme';
import axios from 'axios';
import API_URL from '../config/api';

const ResetPasswordWithTokenScreen = ({ route, navigation }) => {
    const { resetToken } = route.params; // Get resetToken from navigation params
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please enter both new password and confirm password.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.put(`${API_URL}/auth/reset-password/${resetToken}`, {
                password: newPassword,
            });
            Alert.alert('Success', 'Your password has been reset successfully. Please log in with your new password.');
            navigation.navigate('Login'); // Navigate back to login screen
        } catch (error) {
            console.error('Password reset error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to reset password. The token might be invalid or expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Reset Password"
                variant="primary"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.content}>
                <AppCard padding={25} style={styles.card}>
                    <View style={styles.formHeader}>
                        <Text style={styles.title}>Set New Password</Text>
                        <Text style={styles.subtitle}>Enter your new password below.</Text>
                    </View>

                    <AppInput
                        label="New Password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        icon="lock-reset"
                    />

                    <AppInput
                        label="Confirm New Password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        icon="check-decagram-outline"
                    />

                    <AppButton
                        title="Reset My Password"
                        onPress={handleSubmit}
                        loading={isLoading}
                        icon="shield-key-outline"
                        style={styles.submitBtn}
                    />
                </AppCard>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: { elevation: 4 },
    formHeader: { marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 13, color: theme.colors.textLight, lineHeight: 18, fontWeight: '500' },
    submitBtn: { marginTop: 15 }
});

export default ResetPasswordWithTokenScreen;
