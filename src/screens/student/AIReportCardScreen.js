import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const AIReportCardScreen = ({ navigation, route }) => {
    const { userInfo } = useContext(AuthContext);
    const { studentId, studentName } = route.params || {};

    // Use parameters if provided (Admin view), otherwise use logged-in user's info
    const targetUserId = studentId || userInfo._id;
    const targetUserName = studentName || userInfo.name;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchAIReport = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Using the existing AI analyze endpoint with the target ID
            const response = await axios.get(`${API_URL}/ai/analyze/${targetUserId}`, config);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching AI Report:', error);
            // Fallback data for demo if API fails or is empty
            setData({
                rawStats: { academicScore: 0, attendanceScore: 0, quizScore: 0 },
                analysis: {
                    summary: "Unable to generate AI analysis at this moment.",
                    strengths: ["Data not available"],
                    weaknesses: ["Data not available"],
                    recommendations: ["Please try again later"]
                }
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAIReport();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAIReport();
    }, []);

    const getGradeColor = (score) => {
        if (score >= 90) return ['#4CAF50', '#009688']; // A+ Green
        if (score >= 80) return ['#8BC34A', '#4CAF50']; // A  Light Green
        if (score >= 70) return ['#FFC107', '#FF9800']; // B  Yellow/Orange
        if (score >= 60) return ['#FF9800', '#F57C00']; // C  Orange
        return ['#F44336', '#D32F2F']; // D  Red
    };

    const getGradeLetter = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        return 'D';
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Asking AI Tutor...</Text>
            </View>
        );
    }

    const { rawStats, analysis } = data || {};
    const overallScore = rawStats?.academicScore || 0;
    const gradeColors = getGradeColor(overallScore);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="AI Report Card"
                variant="transparent"
                onBack={() => navigation.goBack()}
                rightIcon="robot"
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* 1. Hero Grade Circle */}
                <View style={styles.heroSection}>
                    <LinearGradient colors={gradeColors} style={styles.gradeCircle}>
                        <Text style={styles.gradeText}>{getGradeLetter(overallScore)}</Text>
                        <Text style={styles.scoreText}>{overallScore}%</Text>
                    </LinearGradient>
                    <Text style={styles.studentName}>{targetUserName}</Text>
                    <Text style={styles.termText}>Current Term Performance</Text>
                </View>

                {/* 2. AI Summary Card */}
                <AppCard style={styles.aiCard}>
                    <View style={styles.aiHeader}>
                        <MaterialCommunityIcons name="sparkles" size={24} color={theme.colors.primary} />
                        <Text style={styles.aiTitle}>AI Insights</Text>
                    </View>
                    <Text style={styles.aiSummary}>"{analysis?.summary}"</Text>
                </AppCard>

                {/* 3. Stats Grid */}
                <View style={styles.statsRow}>
                    <AppCard style={styles.statItem}>
                        <MaterialCommunityIcons name="calendar-check" size={28} color={theme.colors.success} />
                        <Text style={styles.statValue}>{rawStats?.attendanceScore}%</Text>
                        <Text style={styles.statLabel}>Attendance</Text>
                    </AppCard>
                    <AppCard style={styles.statItem}>
                        <MaterialCommunityIcons name="brain" size={28} color={theme.colors.secondary} />
                        <Text style={styles.statValue}>{rawStats?.quizScore}%</Text>
                        <Text style={styles.statLabel}>Quiz Avg</Text>
                    </AppCard>
                </View>

                {/* 4. Actionable Steps (Recommendations) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended Actions</Text>
                </View>

                {analysis?.recommendations?.map((rec, index) => (
                    <View key={index} style={styles.recommendationRow}>
                        <View style={[styles.numberBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={styles.numberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.recText}>{rec}</Text>
                    </View>
                ))}

                {/* 5. Strengths & Weaknesses Pills */}
                <View style={styles.pillsContainer}>
                    <Text style={styles.sectionTitle}>Key Takeaways</Text>
                    <View style={styles.pillsWrapper}>
                        {analysis?.strengths?.map((s, i) => (
                            <View key={`str-${i}`} style={[styles.pill, { backgroundColor: '#E8F5E9' }]}>
                                <MaterialCommunityIcons name="arrow-up-bold" size={16} color="green" />
                                <Text style={[styles.pillText, { color: 'green' }]}>{s}</Text>
                            </View>
                        ))}
                        {analysis?.weaknesses?.map((w, i) => (
                            <View key={`weak-${i}`} style={[styles.pill, { backgroundColor: '#FFEBEE' }]}>
                                <MaterialCommunityIcons name="arrow-down-bold" size={16} color="red" />
                                <Text style={[styles.pillText, { color: 'red' }]}>{w}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: theme.colors.textLight },
    scrollContent: { paddingBottom: 40 },

    heroSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    gradeCircle: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
    },
    gradeText: { fontSize: 48, fontWeight: '900', color: '#fff' },
    scoreText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
    studentName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    termText: { fontSize: 14, color: theme.colors.textLight, marginTop: 4 },

    aiCard: { marginHorizontal: 20, marginBottom: 25, padding: 20, backgroundColor: '#F8F9FA', borderRadius: 20 },
    aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    aiTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    aiSummary: { fontSize: 16, color: theme.colors.text, lineHeight: 24, fontStyle: 'italic' },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 30 },
    statItem: { flex: 1, alignItems: 'center', padding: 20, borderRadius: 16 },
    statValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, color: theme.colors.text },
    statLabel: { fontSize: 12, color: theme.colors.textLight, textTransform: 'uppercase' },

    sectionHeader: { paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },

    recommendationRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 15,
        backgroundColor: '#fff', padding: 15, borderRadius: 15,
        borderWidth: 1, borderColor: '#F0F0F0'
    },
    numberBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    numberText: { color: theme.colors.primary, fontWeight: 'bold' },
    recText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 20 },

    pillsContainer: { paddingHorizontal: 20, marginTop: 10 },
    pillsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 },
    pill: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        gap: 6
    },
    pillText: { fontSize: 12, fontWeight: 'bold' }
});

export default AIReportCardScreen;
