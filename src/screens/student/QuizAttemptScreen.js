import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const QuizAttemptScreen = ({ route, navigation }) => {
    const { quizId, title, duration } = route.params;

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, []);

    useEffect(() => {
        if (!quiz || result) return;

        const timer = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, result]);

    const fetchQuiz = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/quizzes/${quizId}`, config);
            setQuiz(data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            Alert.alert('Error', 'Failed to load quiz');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        const unanswered = quiz.questions.length - Object.keys(answers).length;

        if (unanswered > 0) {
            Alert.alert(
                'Incomplete Quiz',
                `You have ${unanswered} unanswered question(s). Submit anyway?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit', onPress: submitQuiz }
                ]
            );
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Convert answers object to array
            const answersArray = quiz.questions.map((_, idx) => answers[idx] ?? -1);

            const { data } = await axios.post(
                `${API_URL}/quizzes/${quizId}/submit`,
                {
                    answers: answersArray,
                    timeTaken: secondsElapsed
                },
                config
            );

            setResult(data);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            Alert.alert('Error', 'Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: theme.colors.textLight }}>Loading quiz...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!quiz) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Quiz not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show results screen
    if (result) {
        const passed = result.passed;
        const percentage = Math.round(result.score);

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.resultContent}>
                    <LinearGradient
                        colors={passed ? ['#4CAF50', '#66BB6A'] : ['#F44336', '#EF5350']}
                        style={styles.scoreCircleGradient}
                    >
                        <View style={styles.scoreInnerCircle}>
                            <Text style={styles.scoreText}>{percentage}%</Text>
                            <Text style={styles.scoreSub}>SCORE</Text>
                        </View>
                    </LinearGradient>

                    <Text style={[styles.statusText, { color: passed ? '#4CAF50' : '#F44336' }]}>
                        {passed ? '🎉 Passed!' : '😔 Failed'}
                    </Text>

                    <Text style={styles.resultMeta}>
                        You answered {result.correctCount} out of {result.totalQuestions} questions correctly
                    </Text>

                    <View style={styles.resultStatsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Correct</Text>
                            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{result.correctCount}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Wrong</Text>
                            <Text style={[styles.statValue, { color: '#F44336' }]}>
                                {result.totalQuestions - result.correctCount}
                            </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Time</Text>
                            <Text style={styles.statValue}>{formatTime(secondsElapsed)}</Text>
                        </View>
                    </View>

                    <View style={styles.actionsContainer}>
                        <AppButton
                            title="View Leaderboard"
                            variant="outline"
                            onPress={() => navigation.navigate('Leaderboard')}
                            style={{ marginBottom: 10 }}
                        />
                        <AppButton
                            title="Back to Quizzes"
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Quiz taking screen
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                </View>
                <View style={styles.timerBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.timerText}>{formatTime(secondsElapsed)}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.questionHeader}>
                    <Text style={styles.questionCount}>
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </Text>
                    <Text style={styles.pointsText}>{question.marks || 1} Point(s)</Text>
                </View>

                <Text style={styles.questionText}>{question.questionText}</Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option, index) => {
                        const isSelected = answers[currentQuestion] === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.optionCard, isSelected && styles.optionSelected]}
                                onPress={() => handleOptionSelect(index)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                                    {isSelected && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                                </View>
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Previous"
                    variant="outline"
                    disabled={currentQuestion === 0}
                    onPress={handlePrev}
                    width="48%"
                />
                {isLastQuestion ? (
                    <AppButton
                        title="Submit Quiz"
                        color={theme.colors.success}
                        loading={submitting}
                        onPress={handleSubmit}
                        width="48%"
                    />
                ) : (
                    <AppButton
                        title="Next"
                        onPress={handleNext}
                        width="48%"
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    backBtn: { padding: 5 },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: theme.colors.primary + '10',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20
    },
    timerText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
    },

    progressContainer: { height: 4, backgroundColor: '#F0F0F0', width: '100%' },
    progressBar: { height: 4, backgroundColor: theme.colors.primary },

    content: { padding: 20 },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    questionCount: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    pointsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        backgroundColor: theme.colors.secondary + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    questionText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 30, lineHeight: 28 },

    optionsContainer: { gap: 15 },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    optionSelected: { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary },
    optionCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D5DD',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionCircleSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    optionText: { fontSize: 16, color: theme.colors.text, fontWeight: '500', flex: 1 },
    optionTextSelected: { color: theme.colors.primary, fontWeight: '700' },

    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    // Result Styles
    resultContent: { flex: 1, alignItems: 'center', padding: 30, paddingTop: 50 },
    scoreCircleGradient: {
        width: 180,
        height: 180,
        borderRadius: 90,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        elevation: 10,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 15
    },
    scoreInnerCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 85,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    scoreText: { fontSize: 48, fontWeight: '900', color: theme.colors.text },
    scoreSub: { fontSize: 11, color: theme.colors.textLight, fontWeight: 'bold', letterSpacing: 1.5, marginTop: 4 },
    statusText: { fontSize: 28, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
    resultMeta: { fontSize: 15, color: theme.colors.textLight, marginBottom: 40, textAlign: 'center' },
    resultStatsRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 24,
        width: '100%',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    statBox: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: theme.colors.textLight, fontWeight: 'bold', marginBottom: 5 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    statDivider: { width: 1, height: '100%', backgroundColor: '#EEE' },
    actionsContainer: { width: '100%' }
});

export default QuizAttemptScreen;
