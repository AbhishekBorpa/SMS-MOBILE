import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const AssignmentDetailScreen = ({ route, navigation }) => {
    const { assignment } = route.params;
    const { userInfo } = useContext(AuthContext);

    // Submission State
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        if (userInfo.role === 'Student') {
            fetchMySubmission();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchMySubmission = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/submissions/my/${assignment._id}`, config);
            setSubmission(data);
        } catch (error) {
            // 404 means no submission yet, which is fine
            if (error.response?.status !== 404) {
                console.log('Error fetching submission:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            uploadSubmission(asset);

        } catch (error) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const uploadSubmission = async (fileAsset) => {
        setUploading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');

            // In a real app, we would use FormData to upload the file to S3/Cloudinary.
            // For this demo, we will simulate a file upload by sending the local URI and name.
            // NOTE: To make this fully functional, backend needs multer/S3 integration.

            // Simulating upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock File URL (in production this comes from S3)
            const mockFileUrl = `https://school-storage.s3.amazonaws.com/submissions/${fileAsset.name}`;

            const payload = {
                assignmentId: assignment._id,
                fileUrl: mockFileUrl,
                fileName: fileAsset.name
            };

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_URL}/submissions`, payload, config);

            setSubmission(data);
            Alert.alert('Success', 'Assignment submitted successfully!');

        } catch (error) {
            Alert.alert('Error', 'Failed to submit assignment');
            console.log(error);
        } finally {
            setUploading(false);
        }
    };

    const isTeacher = userInfo.role === 'Teacher';
    const dueDate = new Date(assignment.dueDate);
    const isPastDue = new Date() > dueDate;

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Assignment Details"
                onBack={() => navigation.goBack()}
                rightIcon={isTeacher ? "pencil-outline" : undefined}
                onRightPress={isTeacher ? () => navigation.navigate('CreateAssignment', { assignment: assignment }) : undefined}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Assignment Info Card */}
                <AppCard style={styles.card} padding={20}>
                    <View style={styles.headerRow}>
                        <View>
                            <AppBadge label={assignment.subject} type="primary" />
                            <Text style={styles.title}>{assignment.title}</Text>
                        </View>
                    </View>

                    <Text style={styles.gradeText}>Class: {assignment.grade}</Text>

                    <View style={styles.dateRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={18} color={theme.colors.textLight} />
                        <Text style={styles.dateText}>
                            Due: {dueDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>INSTRUCTIONS</Text>
                    <Text style={styles.description}>{assignment.description}</Text>
                </AppCard>

                {/* Loading State */}
                {loading && (
                    <View style={styles.center}>
                        <ActivityIndicator color={theme.colors.primary} />
                    </View>
                )}

                {/* Student Submission Area */}
                {!loading && !isTeacher && (
                    <View style={styles.submissionSection}>
                        <Text style={styles.sectionHeader}>Your Submission</Text>

                        {assignment.gradingType === 'Quiz' ? (
                            <AppCard style={styles.emptyCard} padding={25}>
                                <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '10', padding: 15, borderRadius: 50 }]}>
                                    <MaterialCommunityIcons name="brain" size={40} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.emptyTitle}>Quiz Assignment</Text>
                                <Text style={styles.emptyText}>
                                    This assignment requires you to complete a quiz.
                                </Text>

                                <AppButton
                                    title="Start Quiz"
                                    onPress={() => navigation.navigate('QuizAttempt', { quizId: assignment.linkedQuiz })}
                                    style={{ marginTop: 20, width: '100%' }}
                                    icon="play-circle-outline"
                                />
                            </AppCard>
                        ) : (
                            submission ? (
                                <AppCard style={styles.submissionCard} padding={20}>
                                    <View style={styles.statusRow}>
                                        <View style={styles.fileIcon}>
                                            <MaterialCommunityIcons name="file-document-check" size={32} color={theme.colors.success} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.fileName}>{submission.fileName}</Text>
                                            <Text style={styles.submittedDate}>
                                                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <AppBadge
                                            label={submission.status}
                                            type={submission.status === 'Graded' ? 'success' : 'warning'}
                                        />
                                    </View>

                                    {submission.status === 'Pending' && (
                                        <AppButton
                                            title="Resubmit File"
                                            variant="outline"
                                            onPress={pickDocument}
                                            loading={uploading}
                                            style={{ marginTop: 15 }}
                                        />
                                    )}
                                </AppCard>
                            ) : (
                                <AppCard style={styles.emptyCard} padding={25}>
                                    <View style={styles.emptyIcon}>
                                        <MaterialCommunityIcons name="cloud-upload" size={40} color={theme.colors.primary} />
                                    </View>
                                    <Text style={styles.emptyTitle}>No Submission Yet</Text>
                                    <Text style={styles.emptyText}>
                                        Upload your homework before the deadline to get graded.
                                    </Text>

                                    <AppButton
                                        title={isPastDue ? "Submit Late" : "Upload File"}
                                        onPress={pickDocument}
                                        loading={uploading}
                                        style={{ marginTop: 20, width: '100%' }}
                                        variant={isPastDue ? "danger" : "primary"}
                                    />
                                </AppCard>
                            )
                        )}
                    </View>
                )}

                {/* Teacher View */}
                {isTeacher && (
                    <View style={{ gap: 15 }}>
                        <AppCard style={styles.infoCard} padding={20}>
                            <MaterialCommunityIcons name="information-outline" size={24} color={theme.colors.primary} />
                            <Text style={styles.infoText}>
                                View and grade student submissions for this assignment.
                            </Text>
                        </AppCard>

                        <AppButton
                            title="View Submissions"
                            icon="folder-account-outline"
                            onPress={() => navigation.navigate('AssignmentSubmissionsList', { assignment })}
                        />
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20, paddingBottom: 40 },
    card: { marginBottom: 25 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginTop: 8 },
    gradeText: { fontSize: 13, color: theme.colors.textLight, marginTop: 4, fontWeight: '600' },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
    dateText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 18 },
    sectionLabel: { fontSize: 11, color: theme.colors.textLight, letterSpacing: 1, fontWeight: 'bold', marginBottom: 8 },
    description: { fontSize: 15, color: theme.colors.text, lineHeight: 24 },
    center: { padding: 20 },

    submissionSection: { marginTop: 0 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
    submissionCard: { borderColor: theme.colors.success, borderWidth: 1 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    fileIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.success + '10', justifyContent: 'center', alignItems: 'center' },
    fileName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    submittedDate: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },

    emptyCard: { alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
    emptyIcon: { marginBottom: 15, opacity: 0.8 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    emptyText: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },

    infoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.primary + '05' },
    infoText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 20 }
});

export default AssignmentDetailScreen;
