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

const AddStudentScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateStudent = async () => {
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

            await axios.post(`${API_URL}/users/student`, {
                name,
                email,
                mobileNumber: mobile,
                address,
                password
            }, config);

            Alert.alert('Success', 'Student created successfully.\nThey will need to change this password on first login.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Add New Student"
                onBack={() => navigation.goBack()}
                rightIcon="account-plus-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.formContainer}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="account-school-outline" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>Student Registration</Text>
                        <Text style={styles.formSubtitle}>Enter student details to register them into the system.</Text>
                    </View>

                    <AppCard style={styles.card} padding={20}>
                        <AppInput
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. John Doe"
                            icon="account-outline"
                        />
                        <AppInput
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="student@college.edu"
                            icon="email-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <AppInput
                            label="Mobile Number (Optional)"
                            value={mobile}
                            onChangeText={setMobile}
                            placeholder="Mobile Number"
                            icon="phone-outline"
                            keyboardType="phone-pad"
                        />
                        <AppInput
                            label="Home Address"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Primary residence location"
                            icon="map-marker-outline"
                        />
                        <AppInput
                            label="Initial Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 6 characters"
                            icon="lock-outline"
                            secureTextEntry={true}
                        />

                        <AppButton
                            title="Register Student"
                            onPress={handleCreateStudent}
                            loading={loading}
                            icon="check-circle-outline"
                            style={styles.submitButton}
                        />
                    </AppCard>

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="shield-check-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            Students must verify their identity on their first login.
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

export default AddStudentScreen;
