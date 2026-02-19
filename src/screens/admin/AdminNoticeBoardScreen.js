import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AdminNoticeBoardScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('All'); // All, Student, Teacher
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_URL}/notices`, {
                title,
                message,
                targetAudience: audience
            }, config);

            Alert.alert('Success', 'Notice sent and notifications dispatched!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to send notice');
        } finally {
            setLoading(false);
        }
    };

    const getAudienceIcon = (type) => {
        switch (type) {
            case 'All': return 'bullhorn-variant-outline';
            case 'Student': return 'school-outline';
            case 'Teacher': return 'human-male-board';
            default: return 'account-group-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Broadcast"
                onBack={() => navigation.goBack()}
                rightIcon="history"
                variant="primary"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.content}>

                    <View style={styles.headerSection}>
                        <LinearGradient
                            colors={theme.gradients.secondary}
                            style={styles.iconCircle}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name="broadcast" size={40} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.formTitle}>New Announcement</Text>
                        <Text style={styles.formSubtitle}>
                            Send important alerts to the entire school or specific groups instantly.
                        </Text>
                    </View>

                    <AppCard style={styles.formCard} padding={25}>
                        <Text style={styles.label}>TARGET AUDIENCE</Text>
                        <View style={styles.audienceContainer}>
                            {['All', 'Student', 'Teacher'].map((aud) => (
                                <TouchableOpacity
                                    key={aud}
                                    style={[styles.audienceChip, audience === aud && styles.audienceChipActive]}
                                    onPress={() => setAudience(aud)}
                                >
                                    {audience === aud && (
                                        <LinearGradient
                                            colors={theme.gradients.primary}
                                            style={StyleSheet.absoluteFill}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        />
                                    )}
                                    <MaterialCommunityIcons
                                        name={getAudienceIcon(aud)}
                                        size={18}
                                        color={audience === aud ? '#fff' : theme.colors.textLight}
                                        style={{ marginRight: 6, zIndex: 1 }}
                                    />
                                    <Text style={[styles.audienceText, audience === aud && styles.audienceTextActive]}>
                                        {aud}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>NOTICE DETAILS</Text>
                        <AppInput
                            placeholder="Notice Title (e.g. Holiday Alert)"
                            value={title}
                            onChangeText={setTitle}
                            icon="format-title"
                            style={styles.input}
                        />

                        <AppInput
                            placeholder="Type your message here..."
                            multiline={true}
                            numberOfLines={6}
                            value={message}
                            onChangeText={setMessage}
                            style={styles.textArea}
                        />

                        <AppButton
                            title={`Send to ${audience === 'All' ? 'Everyone' : audience + 's'}`}
                            onPress={handleSend}
                            loading={loading}
                            icon="send"
                            style={styles.sendBtn}
                            variant="primary"
                        />
                        <View style={styles.noteBox}>
                            <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.textLight} />
                            <Text style={styles.note}>
                                This will trigger push notifications.
                            </Text>
                        </View>
                    </AppCard>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20 },

    headerSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 80, height: 80, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15, ...theme.shadows.md },
    formTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 40 },

    formCard: { elevation: 4, borderRadius: 24 },
    label: { fontSize: 11, fontWeight: '900', color: theme.colors.textLight, marginBottom: 12, letterSpacing: 1, marginLeft: 4 },

    audienceContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 16, padding: 4, marginBottom: 25 },
    audienceChip: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    audienceChipActive: {},
    audienceText: { fontSize: 13, fontWeight: '600', color: theme.colors.textLight, zIndex: 1 },
    audienceTextActive: { color: '#fff', fontWeight: 'bold' },

    input: { marginBottom: 15 },
    textArea: { height: 140, textAlignVertical: 'top', paddingTop: 15 },
    sendBtn: { marginTop: 10, borderRadius: 16 },

    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 6 },
    note: { color: theme.colors.textLight, fontSize: 12, fontWeight: '500' }
});

export default AdminNoticeBoardScreen;
