import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const PerformanceAnalysisScreen = ({ route, navigation }) => {
    const { studentId, studentName } = route.params || {};
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = studentId
                ? `${API_URL}/ai/analyze/${studentId}`
                : `${API_URL}/ai/analyze`;

            const { data } = await axios.get(url, config);
            setData(data);
        } catch (error) {
            console.log('Error fetching AI analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>AI is analyzing performance...</Text>
        </View>
    );

    if (!data) return (
        <View style={styles.center}>
            <Text style={styles.errorText}>Analysis currently unavailable.</Text>
            <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry Analysis</Text>
            </TouchableOpacity>
        </View>
    );

    const rawStats = data?.rawStats || {};
    const analysis = data?.analysis || {
        summary: "Analysis data is currently unavailable.",
        strengths: [],
        weaknesses: [],
        recommendations: []
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="AI Performance Insights"
                onBack={() => navigation.goBack()}
                rightIcon="shield-check-outline"
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.studentBanner}>
                    <Text style={styles.bannerLabel}>Report for</Text>
                    <Text style={styles.bannerValue}>{studentName || userInfo.name}</Text>
                </View>

                {/* Score Cards */}
                <View style={styles.statsGrid}>
                    <AppCard padding={15} style={styles.statCard}>
                        <MaterialCommunityIcons name="school-outline" size={24} color={theme.colors.primary} />
                        <Text style={styles.statValue}>{rawStats.academicScore ?? 0}%</Text>
                        <Text style={styles.statLabel}>Academic</Text>
                    </AppCard>
                    <AppCard padding={15} style={styles.statCard}>
                        <MaterialCommunityIcons name="calendar-check-outline" size={24} color={theme.colors.green} />
                        <Text style={styles.statValue}>{rawStats.attendanceScore ?? 0}%</Text>
                        <Text style={styles.statLabel}>Attendance</Text>
                    </AppCard>
                    <AppCard padding={15} style={styles.statCard}>
                        <MaterialCommunityIcons name="comment-check-outline" size={24} color={theme.colors.blue} />
                        <Text style={styles.statValue}>{rawStats.quizScore ?? 0}%</Text>
                        <Text style={styles.statLabel}>Quizzes</Text>
                    </AppCard>
                </View>

                {/* AI Summary */}
                <AppCard padding={25} style={styles.analysisCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.aiIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>AI Counselor Summary</Text>
                    </View>
                    <Text style={styles.summaryText}>"{analysis.summary}"</Text>
                </AppCard>

                {/* Advanced Analytics */}
                {data.advancedStats && (
                    <>
                        <Text style={[styles.sectionTitle, { marginLeft: 10 }]}>Performance Trend</Text>
                        <AppCard padding={20} style={styles.chartCard}>
                            <View style={styles.chartContainer}>
                                {data.advancedStats.performanceTrend.map((pt, i) => (
                                    <View key={i} style={styles.barWrapper}>
                                        <Text style={styles.barLabel}>{Math.round(pt.score)}%</Text>
                                        <View style={[styles.bar, { height: Math.max(10, pt.score || 0), backgroundColor: (pt.score || 0) >= 80 ? theme.colors.green : (pt.score || 0) >= 50 ? theme.colors.primary : theme.colors.pink }]} />
                                        <Text style={styles.barDate} numberOfLines={1}>{pt.title.substring(0, 6)}..</Text>
                                    </View>
                                ))}
                            </View>
                            {data.advancedStats.performanceTrend.length === 0 && (
                                <Text style={styles.noDataText}>No enough data for trend analysis.</Text>
                            )}
                        </AppCard>

                        <View style={styles.timeStatsRow}>
                            <AppCard padding={15} style={[styles.statCard, { width: '48%' }]}>
                                <MaterialCommunityIcons name="timer-sand" size={24} color={theme.colors.secondary} />
                                <Text style={styles.statValue}>{data.advancedStats.avgTimePerQuestion}s</Text>
                                <Text style={styles.statLabel}>Avg Time/Q</Text>
                            </AppCard>
                            <AppCard padding={15} style={[styles.statCard, { width: '48%' }]}>
                                <MaterialCommunityIcons name="timer-check-outline" size={24} color={theme.colors.green} />
                                <Text style={styles.statValue}>{data.advancedStats.avgTimeCorrect}s</Text>
                                <Text style={styles.statLabel}>Avg Time (Correct)</Text>
                            </AppCard>
                        </View>
                    </>
                )}

                {/* Strengths & Weaknesses */}
                <View style={styles.row}>
                    <AppCard padding={15} style={[styles.listCard, { flex: 1, marginRight: 15 }]}>
                        <Text style={[styles.listTitle, { color: theme.colors.green }]}>Strengths</Text>
                        {analysis.strengths.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <MaterialCommunityIcons name="check-circle" size={14} color={theme.colors.green} />
                                <Text style={styles.listItemText}>{item}</Text>
                            </View>
                        ))}
                    </AppCard>
                    <AppCard padding={15} style={[styles.listCard, { flex: 1 }]}>
                        <Text style={[styles.listTitle, { color: theme.colors.accent }]}>To Improve</Text>
                        {analysis.weaknesses.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <MaterialCommunityIcons name="information" size={14} color={theme.colors.accent} />
                                <Text style={styles.listItemText}>{item}</Text>
                            </View>
                        ))}
                    </AppCard>
                </View>

                {/* Recommendations */}
                <AppCard padding={25} style={styles.recommendationCard}>
                    <Text style={styles.cardTitle}>Actionable Steps</Text>
                    <View style={styles.divider} />
                    {analysis.recommendations.map((item, i) => (
                        <View key={i} style={styles.recItem}>
                            <View style={[styles.recBullet, { backgroundColor: theme.colors.primary + '10' }]}>
                                <Text style={styles.recBulletText}>{i + 1}</Text>
                            </View>
                            <Text style={styles.recText}>{item}</Text>
                        </View>
                    ))}
                </AppCard>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 15, fontSize: 16, color: theme.colors.textLight, fontWeight: '600' },
    errorText: { fontSize: 16, color: theme.colors.textLight, textAlign: 'center' },
    scrollContent: { padding: 20 },
    studentBanner: { marginBottom: 25, backgroundColor: theme.colors.primary + '05', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.primary + '10' },
    bannerLabel: { fontSize: 12, color: theme.colors.textLight, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    bannerValue: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, marginTop: 4 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statCard: { width: '31%', alignItems: 'center', elevation: 2 },
    statValue: { fontSize: 18, fontWeight: '900', color: theme.colors.text, marginTop: 8 },
    statLabel: { fontSize: 11, color: theme.colors.textLight, marginTop: 4, fontWeight: 'bold' },
    analysisCard: { marginBottom: 20, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 12 },
    aiIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    summaryText: { fontSize: 15, color: theme.colors.textLight, lineHeight: 24, fontStyle: 'italic' },
    row: { flexDirection: 'row', marginBottom: 20 },
    listCard: { elevation: 2 },
    listTitle: { fontSize: 14, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase' },
    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    listItemText: { fontSize: 12, color: theme.colors.text, fontWeight: '500', flex: 1 },
    recommendationCard: { marginBottom: 50, elevation: 2 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
    recItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
    recBullet: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    recBulletText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
    recText: { flex: 1, fontSize: 14, color: theme.colors.text, lineHeight: 20, fontWeight: '500' },
    retryBtn: { marginTop: 20, backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 15 },
    retryText: { color: '#fff', fontWeight: 'bold' },

    // Chart Styles
    chartCard: { marginBottom: 20 },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    barWrapper: { alignItems: 'center', width: 40 },
    bar: { width: 12, borderRadius: 6, marginBottom: 8 },
    barLabel: { fontSize: 10, color: theme.colors.textLight, marginBottom: 4, fontWeight: 'bold' },
    barDate: { fontSize: 10, color: theme.colors.textLight },
    noDataText: { textAlign: 'center', color: theme.colors.textLight, fontStyle: 'italic', marginTop: 20 },
    timeStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }
});

export default PerformanceAnalysisScreen;
