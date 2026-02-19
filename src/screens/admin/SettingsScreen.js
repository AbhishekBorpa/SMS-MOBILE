import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const SettingsScreen = ({ navigation }) => {
    const [schoolName, setSchoolName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [themeColor, setThemeColor] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/settings`, config);

            if (data) {
                setSchoolName(data.schoolName || '');
                setLogoUrl(data.logoUrl || '');
                setThemeColor(data.themeColor || '');
                setContactEmail(data.contactEmail || '');
                setAcademicYear(data.academicYear || '');
            }
        } catch (error) {
            console.log('Error fetching settings:', error);
            Alert.alert('Error', 'Failed to load settings');
        } finally {
            setFetching(false);
        }
    };

    const handleUpdateSettings = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${API_URL}/settings`, {
                schoolName,
                logoUrl,
                themeColor,
                contactEmail,
                academicYear
            }, config);

            Alert.alert('Success', 'Settings updated successfully');
        } catch (error) {
            console.log('Error updating settings:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="System Settings"
                onBack={() => navigation.goBack()}
                rightIcon="cog-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="cog" size={50} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>Configuration</Text>
                        <Text style={styles.subtitle}>Manage global school system settings</Text>
                    </View>

                    {fetching ? (
                        <View style={styles.loadingContainer}>
                            <Text>Loading settings...</Text>
                        </View>
                    ) : (
                        <AppCard style={styles.card} padding={20}>
                            <AppInput
                                label="School Name"
                                value={schoolName}
                                onChangeText={setSchoolName}
                                placeholder="e.g. Springfield High"
                                icon="school-outline"
                            />

                            <AppInput
                                label="Logo URL"
                                value={logoUrl}
                                onChangeText={setLogoUrl}
                                placeholder="https://example.com/logo.png"
                                icon="image-outline"
                            />

                            <AppInput
                                label="Theme Color (Hex)"
                                value={themeColor}
                                onChangeText={setThemeColor}
                                placeholder="#4A90E2"
                                icon="palette-outline"
                            />

                            <AppInput
                                label="Contact Email"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                placeholder="admin@school.com"
                                icon="email-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <AppInput
                                label="Current Academic Year"
                                value={academicYear}
                                onChangeText={setAcademicYear}
                                placeholder="e.g. 2023-2024"
                                icon="calendar-clock-outline"
                            />

                            <View style={styles.divider} />

                            <AppButton
                                title="Save Configuration"
                                onPress={handleUpdateSettings}
                                loading={loading}
                                icon="content-save-outline"
                            />
                        </AppCard>
                    )}
                </ScrollView>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    headerSection: { alignItems: 'center', marginBottom: 25 },
    iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 5 },
    subtitle: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center' },
    card: { elevation: 3 },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
    loadingContainer: { alignItems: 'center', marginTop: 50 }
});

export default SettingsScreen;
