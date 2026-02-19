import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const StudyTimerScreen = ({ navigation }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState('General');
    const [todayStats, setTodayStats] = useState({ sessions: 0, totalMinutes: 0 });

    const subjects = ['General', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        if (!isBreak) {
            // Work session completed
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);
            setTodayStats(prev => ({
                sessions: prev.sessions + 1,
                totalMinutes: prev.totalMinutes + 25
            }));

            // Determine break length
            const breakTime = newSessions % 4 === 0 ? 15 * 60 : 5 * 60;
            setTimeLeft(breakTime);
            setIsBreak(true);

            Alert.alert(
                '🎉 Great Work!',
                `Session completed! Take a ${newSessions % 4 === 0 ? '15' : '5'} minute break.`,
                [{ text: 'Start Break', onPress: () => setIsRunning(true) }]
            );
        } else {
            // Break completed
            setTimeLeft(25 * 60);
            setIsBreak(false);
            Alert.alert(
                '⏰ Break Over!',
                'Ready for another study session?',
                [
                    { text: 'Start Now', onPress: () => setIsRunning(true) },
                    { text: 'Later', style: 'cancel' }
                ]
            );
        }
    };

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        Alert.alert(
            'Reset Timer?',
            'This will reset your current session.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setIsRunning(false);
                        setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
                    }
                }
            ]
        );
    };

    const skipBreak = () => {
        setIsRunning(false);
        setTimeLeft(25 * 60);
        setIsBreak(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const total = isBreak ? (sessionsCompleted % 4 === 0 ? 15 * 60 : 5 * 60) : 25 * 60;
        return ((total - timeLeft) / total) * 100;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Study Timer</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Timer Card */}
                <View style={styles.timerCard}>
                    <LinearGradient
                        colors={isBreak ? ['#4CAF50', '#66BB6A'] : theme.gradients.primary}
                        style={styles.timerGradient}
                    >
                        <Text style={styles.timerLabel}>
                            {isBreak ? '☕ Break Time' : '📚 Focus Time'}
                        </Text>

                        <View style={styles.timerCircle}>
                            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                            <Text style={styles.timerSubtext}>
                                {isBreak ? 'Relax & Recharge' : selectedSubject}
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
                        </View>

                        {/* Control Buttons */}
                        <View style={styles.controls}>
                            <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
                                <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.playBtn} onPress={toggleTimer}>
                                <LinearGradient colors={['#fff', '#f5f5f5']} style={styles.playGradient}>
                                    <MaterialCommunityIcons
                                        name={isRunning ? 'pause' : 'play'}
                                        size={40}
                                        color={theme.colors.primary}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>

                            {isBreak && (
                                <TouchableOpacity style={styles.controlBtn} onPress={skipBreak}>
                                    <MaterialCommunityIcons name="skip-next" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {!isBreak && <View style={{ width: 50 }} />}
                        </View>
                    </LinearGradient>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{sessionsCompleted}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{todayStats.sessions}</Text>
                        <Text style={styles.statLabel}>Today</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{todayStats.totalMinutes}m</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                </View>

                {/* Subject Selection */}
                {!isBreak && (
                    <>
                        <Text style={styles.sectionTitle}>Select Subject</Text>
                        <View style={styles.subjectGrid}>
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.subjectChip,
                                        selectedSubject === subject && styles.subjectChipActive
                                    ]}
                                    onPress={() => setSelectedSubject(subject)}
                                    disabled={isRunning}
                                >
                                    <Text style={[
                                        styles.subjectText,
                                        selectedSubject === subject && styles.subjectTextActive
                                    ]}>
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipHeader}>
                        <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.colors.warning} />
                        <Text style={styles.tipTitle}>Pomodoro Tips</Text>
                    </View>
                    <Text style={styles.tipText}>• Work for 25 minutes without distractions</Text>
                    <Text style={styles.tipText}>• Take a 5-minute break after each session</Text>
                    <Text style={styles.tipText}>• After 4 sessions, take a longer 15-minute break</Text>
                    <Text style={styles.tipText}>• Stay hydrated and stretch during breaks</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 30 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text },

    timerCard: { margin: 20, borderRadius: 30, overflow: 'hidden', ...theme.shadows.lg },
    timerGradient: { padding: 30, alignItems: 'center' },
    timerLabel: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 20 },

    timerCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    timerText: { fontSize: 56, fontWeight: 'bold', color: '#fff' },
    timerSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },

    progressBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 30 },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },

    controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    playBtn: { width: 80, height: 80, borderRadius: 40 },
    playGradient: { width: '100%', height: '100%', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },

    statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 25, gap: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', ...theme.shadows.sm },
    statValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary },
    statLabel: { fontSize: 12, color: theme.colors.textLight, marginTop: 5 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 20, marginBottom: 15 },

    subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 25 },
    subjectChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 2, borderColor: '#f0f0f0' },
    subjectChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    subjectText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    subjectTextActive: { color: '#fff' },

    tipsCard: { margin: 20, padding: 20, backgroundColor: '#FFF9E6', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.warning },
    tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    tipTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 },
    tipText: { fontSize: 13, color: theme.colors.text, marginBottom: 6, lineHeight: 20 },
});

export default StudyTimerScreen;
