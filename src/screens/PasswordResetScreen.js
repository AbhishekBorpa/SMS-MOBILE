import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import KeyboardWrapper from '../components/KeyboardWrapper';
import { theme } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const PasswordResetScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { changePassword, isLoading } = useContext(AuthContext);

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        const result = await changePassword(currentPassword, newPassword);
        if (result.success) {
            Alert.alert('Success', 'Password updated successfully!');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Security Settings"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="shield-lock-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.content}>
                    <AppCard padding={25} style={styles.card}>
                        <View style={styles.formHeader}>
                            <Text style={styles.title}>Update Password</Text>
                            <Text style={styles.subtitle}>Protect your account with a strong password.</Text>
                        </View>

                        <AppInput
                            label="Current Password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            icon="lock-outline"
                        />

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
                            title="Secure Account Now"
                            onPress={handleSubmit}
                            loading={isLoading}
                            icon="shield-key-outline"
                            style={styles.submitBtn}
                        />
                    </AppCard>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    card: { elevation: 4 },
    formHeader: { marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 13, color: theme.colors.textLight, lineHeight: 18, fontWeight: '500' },
    submitBtn: { marginTop: 15 }
});

export default PasswordResetScreen;
