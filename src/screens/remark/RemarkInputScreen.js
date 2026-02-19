import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
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

const RemarkInputScreen = ({ route, navigation }) => {
    const { student } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_URL}/remarks`, {
                studentId: student._id,
                title,
                description
            }, config);

            Alert.alert('Success', 'Remark added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add remark');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Performance Remark"
                onBack={() => navigation.goBack()}
                rightIcon="message-draw"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <AppCard style={styles.studentCard} padding={20}>
                        <View style={styles.studentInfoRow}>
                            <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{student.name?.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentDetail}>Reg No: {student._id?.slice(-6)?.toUpperCase()}</Text>
                            </View>
                        </View>
                    </AppCard>

                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondary + '10' }]}>
                            <MaterialCommunityIcons name="comment-text-multiple-outline" size={60} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.formTitle}>Observation Note</Text>
                        <Text style={styles.formSubtitle}>Provide detailed feedback on student performance and behavior.</Text>
                    </View>

                    <AppCard style={styles.formCard} padding={20}>
                        <AppInput
                            label="Remark Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Outstanding Leadership"
                            icon="star-outline"
                        />
                        <AppInput
                            label="Detailed Note"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Write your observations..."
                            icon="text-account"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Submit Remark"
                            onPress={handleSubmit}
                            loading={loading}
                            icon="check-decagram"
                            style={styles.submitBtn}
                            type="secondary"
                        />
                    </AppCard>

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="shield-check-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            This remark will be visible to parents and the student.
                        </Text>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    studentCard: { marginBottom: 20, elevation: 4 },
    studentInfoRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 22, fontWeight: 'bold' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    studentDetail: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    formCard: { elevation: 4 },
    textArea: { height: 150 },
    submitBtn: { marginTop: 15 },
    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    note: { color: theme.colors.textLight, fontSize: 13, fontWeight: '600' }
});

export default RemarkInputScreen;
