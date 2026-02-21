import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const QuizAttemptScreen = ({ route, navigation }) => {
    const { quizId } = route.params;
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Timer Ref
    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();

        // Prevent accidental back press
        const backAction = () => {
            Alert.alert("Hold on!", "Are you sure you want to quit this quiz?", [
                { text: "Cancel", onPress: () => null, style: "cancel" },
                { text: "YES", onPress: () => navigation.goBack() }
            ]);
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => {
            backHandler.remove();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (quiz && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [quiz]);

    const fetchQuiz = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const { data } = await axios.get(`${API_URL}/quizzes/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuiz(data);
            setTimeLeft(data.duration * 60);
        } catch (error) {
            Alert.alert('Error', 'Failed to load quiz');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionIndex) => {
        setAnswers({
            ...answers,
            [currentQuestion]: optionIndex
        });
    };

    const handleSubmit = async (auto = false) => {
        if (!auto) {
            const unanswered = quiz.questions.length - Object.keys(answers).length;
            if (unanswered > 0) {
                // Confirm before submit
                return Alert.alert(
                    'Submit Quiz?',
                    `You have ${unanswered} unanswered questions. Are you sure?`,
                    [
                        { text: 'Keep Playing', style: 'cancel' },
                        { text: 'Submit', onPress: processSubmission }
                    ]
                );
            }
        }
        processSubmission();
    };

    const processSubmission = async () => {
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const token = await SecureStore.getItemAsync('userToken');

            // Format answers for backend (simple array format for now, matching backend controller)
            const answersArray = quiz.questions.map((_, idx) => answers[idx]);

            const { data } = await axios.post(
                `${API_URL}/quizzes/${quizId}/submit`,
                {
                    answers: answersArray,
                    timeTaken: (quiz.duration * 60) - timeLeft
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert(
                data.passed ? 'Congratulations! 🎉' : 'Quiz Completed',
                `You scored ${data.score.toFixed(1)}%\n(${data.correctCount}/${data.totalQuestions} correct)`,
                [{ text: 'OK', onPress: () => navigation.replace('QuizList') }]
            );

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to submit quiz');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!quiz) return null;

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{quiz.title}</Text>
                    <Text style={styles.questionCounter}>Question {currentQuestion + 1}/{quiz.questions.length}</Text>
                </View>
                <View style={[styles.timerBadge, timeLeft < 60 && styles.timerDanger]}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={timeLeft < 60 ? '#D32F2F' : theme.colors.primary} />
                    <Text style={[styles.timerText, timeLeft < 60 && { color: '#D32F2F' }]}>{formatTime(timeLeft)}</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.questionText}>{question.questionText}</Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionCard,
                                answers[currentQuestion] === index && styles.optionSelected
                            ]}
                            onPress={() => handleOptionSelect(index)}
                        >
                            <View style={[
                                styles.optionCircle,
                                answers[currentQuestion] === index && styles.optionCircleSelected
                            ]}>
                                {answers[currentQuestion] === index && <View style={styles.optionDot} />}
                            </View>
                            <Text style={[
                                styles.optionText,
                                answers[currentQuestion] === index && styles.optionTextSelected
                            ]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer Navigation */}
            <View style={styles.footer}>
                <TouchableOpacity
                    disabled={currentQuestion === 0}
                    onPress={() => setCurrentQuestion(curr => curr - 1)}
                    style={[styles.navBtn, currentQuestion === 0 && styles.navBtnDisabled]}
                >
                    <MaterialCommunityIcons name="chevron-left" size={24} color={currentQuestion === 0 ? '#ccc' : theme.colors.text} />
                    <Text style={[styles.navBtnText, currentQuestion === 0 && { color: '#ccc' }]}>Prev</Text>
                </TouchableOpacity>

                {currentQuestion === quiz.questions.length - 1 ? (
                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={() => handleSubmit(false)}
                        disabled={submitting}
                    >
                        <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Quiz'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => setCurrentQuestion(curr => curr + 1)}
                        style={styles.navBtn}
                    >
                        <Text style={styles.navBtnText}>Next</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, maxWidth: 200 },
    questionCounter: { fontSize: 12, color: theme.colors.textLight, marginTop: 4 },
    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
    timerText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
    timerDanger: { backgroundColor: '#FFEBEE' },
    progressBarBg: { height: 4, backgroundColor: '#f0f0f0', width: '100%' },
    progressBarFill: { height: '100%', backgroundColor: theme.colors.success },
    content: { padding: 20 },
    questionText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 30, lineHeight: 28 },
    optionsContainer: { gap: 12 },
    optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#f0f0f0' },
    optionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '05' },
    optionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    optionCircleSelected: { borderColor: theme.colors.primary },
    optionDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
    optionText: { fontSize: 16, color: theme.colors.text, flex: 1 },
    optionTextSelected: { color: theme.colors.primary, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 10 },
    navBtnText: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    navBtnDisabled: { opacity: 0.5 },
    submitBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default QuizAttemptScreen;
