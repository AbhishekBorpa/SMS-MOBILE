import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AddTeacherScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateTeacher = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Name, Email, and Password are required');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(`${API_URL}/users/teacher`, {
                name,
                email,
                mobileNumber: mobile,
                address,
                password
            }, config);

            Alert.alert('Success', 'Teacher created successfully.\nAn invitation has been sent to their email.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create teacher');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Register Teacher"
                onBack={() => navigation.goBack()}
                rightIcon="account-tie-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.formContainer}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondary + '10' }]}>
                            <MaterialCommunityIcons name="account-tie-voice-outline" size={60} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.formTitle}>Faculty Onboarding</Text>
                        <Text style={styles.formSubtitle}>Enter teacher details to create their official academic account.</Text>
                    </View>

                    <AppCard style={styles.card} padding={20}>
                        <AppInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Prof. Robert Brown"
                            icon="account-outline"
                        />
                        <AppInput
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="teacher@school.com"
                            icon="email-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <AppInput
                            label="Mobile Number (Optional)"
                            value={mobile}
                            onChangeText={setMobile}
                            placeholder="+1 234 567 890"
                            icon="phone-outline"
                            keyboardType="phone-pad"
                        />
                        <AppInput
                            label="Resident Address"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Primary residence location"
                            icon="map-marker-outline"
                        />
                        <AppInput
                            label="Login Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 6 characters"
                            icon="lock-outline"
                            secureTextEntry={true}
                        />

                        <AppButton
                            title="Onboard Faculty"
                            onPress={handleCreateTeacher}
                            loading={loading}
                            icon="arrow-right"
                            style={styles.submitButton}
                            type="secondary"
                        />
                    </AppCard>

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            A welcome email with login instructions will be sent automatically.
                        </Text>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    formContainer: { padding: 20, paddingBottom: 40 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    card: { elevation: 4 },
    submitButton: { marginTop: 15 },
    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    note: { color: theme.colors.textLight, fontSize: 13, fontWeight: '600' }
});

export default AddTeacherScreen;
