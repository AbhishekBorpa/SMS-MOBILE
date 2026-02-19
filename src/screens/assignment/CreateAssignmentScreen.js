import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const CreateAssignmentScreen = ({ navigation, route }) => {
    const isEditMode = route.params?.assignment ? true : false;
    const currentAssignment = route.params?.assignment;

    const [title, setTitle] = useState(currentAssignment?.title || '');
    const [subject, setSubject] = useState(currentAssignment?.subject || '');
    const [grade, setGrade] = useState(currentAssignment?.grade || '');
    const [dueDate, setDueDate] = useState(
        currentAssignment?.dueDate ? new Date(currentAssignment.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [description, setDescription] = useState(currentAssignment?.description || '');
    const [loading, setLoading] = useState(false);

    const [gradingType, setGradingType] = useState(currentAssignment?.gradingType || 'Manual');
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState(currentAssignment?.linkedQuiz?._id || null);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetchClasses();
        fetchQuizzes();
    }, []);

    const fetchClasses = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/classes/teacher`, config);
            setClasses(data);
        } catch (error) {
            console.log('Error fetching classes:', error);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/quizzes/teacher`, config);
            setQuizzes(data);
        } catch (error) {
            console.log('Error fetching quizzes:', error);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !subject || !grade) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (gradingType === 'Quiz' && !selectedQuizId) {
            Alert.alert('Error', 'Please select a quiz to link.');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const assignmentData = {
                title,
                description,
                subject,
                grade,
                dueDate: dueDate,
                gradingType,
                linkedQuiz: gradingType === 'Quiz' ? selectedQuizId : null
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/assignments/${currentAssignment._id}`, assignmentData, config);
                Alert.alert('Success', 'Assignment updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await axios.post(`${API_URL}/assignments`, assignmentData, config);
                Alert.alert('Success', 'Assignment created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} assignment`);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={isEditMode ? "Edit Assignment" : "Create Assignment"}
                onBack={() => navigation.goBack()}
                variant="primary"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <LinearGradient
                            colors={theme.gradients.secondary}
                            style={styles.iconCircle}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name="notebook-edit-outline" size={50} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.formTitle}>{isEditMode ? "Edit Assignment" : "New Assignment"}</Text>
                        <Text style={styles.formSubtitle}>Create assignments, set due dates, or link quizzes for auto-grading.</Text>
                    </View>

                    <AppCard style={styles.formCard} padding={20}>
                        <AppInput
                            label="Assignment Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Algebra Homework 3"
                            icon="format-title"
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <AppInput
                                    label="Subject"
                                    value={subject}
                                    onChangeText={setSubject}
                                    placeholder="Math"
                                    icon="book-open-page-variant"
                                />
                            </View>
                            <View style={styles.col}>
                                <AppInput
                                    label="Grade"
                                    value={grade}
                                    onChangeText={setGrade}
                                    placeholder="10th"
                                    icon="school"
                                />
                            </View>
                        </View>

                        <AppInput
                            label="Due Date"
                            value={dueDate}
                            onChangeText={setDueDate}
                            placeholder="YYYY-MM-DD"
                            icon="calendar-clock"
                        />

                        {/* Submission Type Selector */}
                        <Text style={styles.label}>Submission Type</Text>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={styles.typeBtnWrapper}
                                onPress={() => setGradingType('Manual')}
                            >
                                {gradingType === 'Manual' ? (
                                    <LinearGradient colors={theme.gradients.primary} style={styles.typeBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <MaterialCommunityIcons name="file-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.typeTextActive}>File Upload</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.typeBtnInactive}>
                                        <MaterialCommunityIcons name="file-upload-outline" size={18} color={theme.colors.textLight} style={{ marginRight: 6 }} />
                                        <Text style={styles.typeTextInactive}>File Upload</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.typeBtnWrapper}
                                onPress={() => setGradingType('Quiz')}
                            >
                                {gradingType === 'Quiz' ? (
                                    <LinearGradient colors={theme.gradients.accent} style={styles.typeBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <MaterialCommunityIcons name="format-list-checks" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.typeTextActive}>Link Quiz</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.typeBtnInactive}>
                                        <MaterialCommunityIcons name="format-list-checks" size={18} color={theme.colors.textLight} style={{ marginRight: 6 }} />
                                        <Text style={styles.typeTextInactive}>Link Quiz</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Quiz Selector (Visible only if Quiz type) */}
                        {gradingType === 'Quiz' && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={styles.subLabel}>Select Quiz to Link</Text>
                                <View style={styles.quizSelector}>
                                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                        {quizzes.length > 0 ? (
                                            quizzes.map((quiz) => (
                                                <TouchableOpacity
                                                    key={quiz._id}
                                                    style={[styles.quizItem, selectedQuizId === quiz._id && styles.activeQuizItem]}
                                                    onPress={() => setSelectedQuizId(quiz._id)}
                                                >
                                                    <View style={[styles.radio, selectedQuizId === quiz._id && { borderColor: theme.colors.accent }]}>
                                                        {selectedQuizId === quiz._id && <View style={[styles.radioInner, { backgroundColor: theme.colors.accent }]} />}
                                                    </View>
                                                    <Text style={[styles.quizItemText, selectedQuizId === quiz._id && styles.activeQuizItemText]}>
                                                        {quiz.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noDataText}>No quizzes available. Create one first.</Text>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        )}

                        <AppInput
                            label="Instructions"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Provide detailed instructions..."
                            icon="text-box-outline"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <TouchableOpacity
                            style={styles.createBtnContainer}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={gradingType === 'Quiz' ? theme.gradients.accent : theme.gradients.primary}
                                style={styles.createBtn}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.createBtnText}>Publish Assignment</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </AppCard >

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="bell-ring-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            Students are notified immediately.
                        </Text>
                    </View>
                </View >
            </KeyboardWrapper>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 60 },

    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 80, height: 80, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 6, shadowColor: theme.colors.secondary, shadowOpacity: 0.3, shadowRadius: 10 },
    formTitle: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 5 },
    formSubtitle: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },

    formCard: { elevation: 2, borderRadius: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
    col: { flex: 1 },
    textArea: { height: 100 },

    label: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 10, marginTop: 5 },

    // Type Selector
    typeSelector: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 5, height: 50, marginBottom: 20 },
    typeBtnWrapper: { flex: 1 },
    typeBtnActive: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    typeBtnInactive: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    typeTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    typeTextInactive: { color: theme.colors.textLight, fontWeight: '600', fontSize: 13 },

    // Quiz Selector
    subLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    quizSelector: { backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#EEE', padding: 5 },
    quizItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 4 },
    activeQuizItem: { backgroundColor: '#fff', elevation: 1 },
    quizItemText: { marginLeft: 12, fontSize: 14, color: theme.colors.text, fontWeight: '500' },
    activeQuizItemText: { color: theme.colors.accent, fontWeight: 'bold' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5 },
    noDataText: { fontStyle: 'italic', color: theme.colors.textLight, textAlign: 'center', padding: 15 },

    createBtnContainer: { borderRadius: 16, overflow: 'hidden', marginTop: 10, elevation: 4, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    createBtn: { paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    note: { color: theme.colors.textLight, fontSize: 12, fontWeight: '600' }
});

export default CreateAssignmentScreen;
