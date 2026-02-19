import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Linking from 'expo-linking';
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

const GradingScreen = ({ route, navigation }) => {
    const { submission } = route.params;

    const [grade, setGrade] = useState(submission.grade ? submission.grade.toString() : '');
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!grade) {
            Alert.alert('Error', 'Please enter a grade');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${API_URL}/submissions/${submission._id}/grade`, {
                grade: Number(grade),
                feedback
            }, config);

            Alert.alert('Success', 'Grades saved successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save grade');
        } finally {
            setLoading(false);
        }
    };

    const openFile = () => {
        if (submission.fileUrl) {
            Linking.openURL(submission.fileUrl);
        } else {
            Alert.alert('Error', 'No file attached');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Grade Submission"
                onBack={() => navigation.goBack()}
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.content}>

                    {/* Student Info */}
                    <View style={styles.studentHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{submission.student?.name.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.studentName}>{submission.student?.name}</Text>
                            <Text style={styles.dateText}>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* File Attachment */}
                    <AppCard style={styles.fileCard} padding={15}>
                        <View style={styles.fileRow}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fileName}>{submission.fileName || 'Attached File'}</Text>
                                <Text style={styles.tapText}>Tap to view document</Text>
                            </View>
                            <AppButton
                                title="View"
                                size="sm"
                                variant="outline"
                                onPress={openFile}
                            />
                        </View>
                    </AppCard>

                    {/* Grading Form */}
                    <AppCard style={styles.formCard} padding={20}>
                        <Text style={styles.sectionTitle}>EVALUATION</Text>

                        <AppInput
                            label="Grade / Marks"
                            placeholder="e.g. 85"
                            keyboardType="numeric"
                            value={grade}
                            onChangeText={setGrade}
                            icon="star-circle-outline"
                        />

                        <AppInput
                            label="Teacher Feedback"
                            placeholder="Great work! Next time focus on..."
                            multiline={true}
                            numberOfLines={4}
                            value={feedback}
                            onChangeText={setFeedback}
                            icon="comment-text-outline"
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Save & Publish Result"
                            onPress={handleSave}
                            loading={loading}
                            icon="check-circle-outline"
                            style={styles.saveBtn}
                        />
                    </AppCard>

                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20 },

    studentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    dateText: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },

    fileCard: { marginBottom: 25, borderColor: theme.colors.border, borderWidth: 1 },
    fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    fileName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    tapText: { fontSize: 12, color: theme.colors.textLight },

    formCard: { elevation: 3 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 15 },
    textArea: { height: 100, textAlignVertical: 'top' },
    saveBtn: { marginTop: 10 }
});

export default GradingScreen;
