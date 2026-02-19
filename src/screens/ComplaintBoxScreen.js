import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import KeyboardWrapper from '../components/KeyboardWrapper';
import API_URL from '../config/api';
import { theme } from '../constants/theme';

const ComplaintBoxScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_URL}/complaints`, {
                title,
                description,
                isAnonymous
            }, config);

            Alert.alert('Success', 'Complaint submitted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Grievance Redressal"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="shield-check-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
                        <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
                        <Text style={styles.infoText}>
                            Your voice matters. Submit concerns safely. We value your privacy and school culture.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <AppCard padding={25} style={styles.card}>
                            <AppInput
                                label="Subject"
                                placeholder="Briefly state the issue"
                                value={title}
                                onChangeText={setTitle}
                                icon="format-title"
                            />

                            <AppInput
                                label="Detailed Description"
                                placeholder="Describe your complaint in detail..."
                                value={description}
                                onChangeText={setDescription}
                                multiline={true}
                                style={styles.textArea}
                                icon="text-box-outline"
                            />

                            <View style={styles.divider} />

                            <View style={styles.switchRow}>
                                <View style={styles.switchInfo}>
                                    <Text style={styles.switchLabel}>Submit Anonymously</Text>
                                    <Text style={styles.switchHint}>
                                        {isAnonymous ? "Your identity is hidden from admins" : "Admin will see your name and profile"}
                                    </Text>
                                </View>
                                <Switch
                                    value={isAnonymous}
                                    onValueChange={setIsAnonymous}
                                    trackColor={{ false: '#eee', true: theme.colors.primary + '50' }}
                                    thumbColor={isAnonymous ? theme.colors.primary : "#f4f3f4"}
                                />
                            </View>

                            <AppButton
                                title="Submit Redressal Request"
                                onPress={handleSubmit}
                                loading={loading}
                                icon="send-check-outline"
                                style={styles.submitBtn}
                            />
                        </AppCard>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20 },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 25, gap: 12 },
    infoText: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 18, fontWeight: '600' },
    formContainer: { flex: 1 },
    card: { elevation: 4 },
    textArea: { height: 150 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    switchInfo: { flex: 1, marginRight: 10 },
    switchLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    switchHint: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, fontWeight: '500' },
    submitBtn: { marginTop: 10 }
});

export default ComplaintBoxScreen;
