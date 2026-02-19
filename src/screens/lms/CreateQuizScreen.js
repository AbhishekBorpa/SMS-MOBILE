import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
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

const CreateQuizScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIdx, oIdx, value) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a quiz title');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/quizzes`, {
                title,
                courseId,
                questions
            }, config);
            Alert.alert('Success', 'Quiz created successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Create Course Quiz"
                onBack={() => navigation.goBack()}
                rightIcon="help-circle-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="comment-question-outline" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>Add Assessment</Text>
                        <Text style={styles.formSubtitle}>Create interactive quizzes to test student understanding.</Text>
                    </View>

                    <AppCard style={styles.titleCard} padding={20}>
                        <AppInput
                            label="Quiz Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Unit 1 Mastery Check"
                            icon="format-title"
                        />
                    </AppCard>

                    {questions.map((q, qIdx) => (
                        <AppCard key={qIdx} style={styles.questionCard} padding={20}>
                            <View style={styles.questionHeaderRow}>
                                <Text style={styles.questionHeader}>Question {qIdx + 1}</Text>
                                <View style={[styles.badge, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Multiple Choice</Text>
                                </View>
                            </View>

                            <AppInput
                                placeholder="Enter question text..."
                                value={q.questionText}
                                onChangeText={(val) => updateQuestion(qIdx, 'questionText', val)}
                                multiline={true}
                                style={styles.questionInput}
                            />

                            <Text style={styles.subLabel}>Options (Select the correct one)</Text>
                            {q.options.map((opt, oIdx) => (
                                <View key={oIdx} style={styles.optionRow}>
                                    <TouchableOpacity
                                        onPress={() => updateQuestion(qIdx, 'correctAnswerIndex', oIdx)}
                                        style={[
                                            styles.radio,
                                            q.correctAnswerIndex === oIdx && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                    >
                                        {q.correctAnswerIndex === oIdx && <MaterialCommunityIcons name="check" size={12} color="#fff" />}
                                    </TouchableOpacity>
                                    <AppInput
                                        containerStyle={styles.optionInputContainer}
                                        placeholder={`Option ${oIdx + 1}`}
                                        value={opt}
                                        onChangeText={(val) => updateOption(qIdx, oIdx, val)}
                                        noLabel={true}
                                    />
                                </View>
                            ))}
                        </AppCard>
                    ))}

                    <AppButton
                        title="Add Another Question"
                        onPress={addQuestion}
                        icon="plus"
                        type="secondary"
                        style={styles.addBtn}
                    />

                    <AppButton
                        title="Save Assessment"
                        onPress={handleCreate}
                        loading={loading}
                        icon="content-save-outline"
                        style={styles.submitBtn}
                    />
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 60 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    titleCard: { marginBottom: 20, elevation: 3 },
    questionCard: { marginBottom: 20, elevation: 3 },
    questionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    questionHeader: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    questionInput: { height: 80 },
    subLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    optionInputContainer: { flex: 1, marginBottom: 0 },
    addBtn: { marginBottom: 15 },
    submitBtn: { marginTop: 10 }
});

export default CreateQuizScreen;
