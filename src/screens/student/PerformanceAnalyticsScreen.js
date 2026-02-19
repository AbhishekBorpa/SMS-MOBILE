import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const PerformanceAnalyticsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        attendanceTrend: [],
        gradesTrend: [],
        subjectPerformance: {},
        overallStats: {
            attendance: 0,
            avgGrade: 0,
            improvement: 0
        },
        insights: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [attendanceRes, marksRes] = await Promise.all([
                axios.get(`${API_URL}/attendance/student/${userInfo._id}`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/marks`, config).catch(() => ({ data: [] }))
            ]);

            const processedData = processAnalytics(attendanceRes.data, marksRes.data);
            setAnalytics(processedData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalytics = (attendance, marks) => {
        // Process attendance trend (last 30 days)
        const attendanceTrend = processAttendanceTrend(attendance);

        // Process grades trend
        const gradesTrend = processGradesTrend(marks);

        // Process subject performance
        const subjectPerformance = processSubjectPerformance(marks);

        // Calculate overall stats
        const attendanceRate = attendance.length > 0
            ? (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100
            : 0;

        const avgGrade = marks.length > 0
            ? marks.reduce((sum, m) => {
                const score = m.score || 0;
                const total = m.total || 100;
                return sum + (score / total) * 100;
            }, 0) / marks.length
            : 0;

        // Generate insights
        const insights = generateInsights(attendanceRate, avgGrade, subjectPerformance);

        return {
            attendanceTrend,
            gradesTrend,
            subjectPerformance,
            overallStats: {
                attendance: Math.round(attendanceRate),
                avgGrade: Math.round(avgGrade),
                improvement: 5 // Mock improvement
            },
            insights
        };
    };

    const processAttendanceTrend = (attendance) => {
        const last7Days = attendance.slice(-7);
        return last7Days.map(a => a.status === 'Present' ? 100 : 0);
    };

    const processGradesTrend = (marks) => {
        const last6Marks = marks.slice(-6);
        return last6Marks.map(m => {
            const score = m.score || 0;
            const total = m.total || 100;
            return (score / total) * 100;
        });
    };

    const processSubjectPerformance = (marks) => {
        const subjects = {};
        marks.forEach(mark => {
            const subject = mark.subject || mark.class?.subject || 'General';
            const score = mark.score || 0;
            const total = mark.total || 100;

            if (!subjects[subject]) {
                subjects[subject] = { total: 0, count: 0 };
            }
            subjects[subject].total += (score / total) * 100;
            subjects[subject].count += 1;
        });

        const performance = {};
        Object.keys(subjects).forEach(subject => {
            performance[subject] = subjects[subject].total / subjects[subject].count;
        });

        return performance;
    };

    const generateInsights = (attendance, avgGrade, subjectPerformance) => {
        const insights = [];

        if (attendance >= 95) {
            insights.push({
                icon: 'check-circle',
                color: '#4CAF50',
                text: 'Excellent attendance! Keep it up!'
            });
        } else if (attendance < 75) {
            insights.push({
                icon: 'alert-circle',
                color: '#FF5722',
                text: 'Attendance needs improvement. Aim for 95%+'
            });
        }

        if (avgGrade >= 90) {
            insights.push({
                icon: 'trophy',
                color: '#FFD700',
                text: 'Outstanding academic performance!'
            });
        } else if (avgGrade < 60) {
            insights.push({
                icon: 'school',
                color: '#2196F3',
                text: 'Consider extra study sessions'
            });
        }

        // Subject-specific insights
        const subjects = Object.entries(subjectPerformance);
        if (subjects.length > 0) {
            const weakest = subjects.reduce((min, curr) => curr[1] < min[1] ? curr : min);
            if (weakest[1] < 70) {
                insights.push({
                    icon: 'book-open',
                    color: '#FF9800',
                    text: `Focus more on ${weakest[0]} (${Math.round(weakest[1])}%)`
                });
            }
        }

        return insights;
    };

    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
        strokeWidth: 3,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: theme.colors.primary
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Performance Analytics"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="chart-line"
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Overall Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="calendar-check" size={28} color="#fff" />
                            <Text style={styles.statValue}>{analytics.overallStats.attendance}%</Text>
                            <Text style={styles.statLabel}>Attendance</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.statCard}>
                        <LinearGradient colors={['#2196F3', '#42A5F5']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="chart-line" size={28} color="#fff" />
                            <Text style={styles.statValue}>{analytics.overallStats.avgGrade}%</Text>
                            <Text style={styles.statLabel}>Avg Grade</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.statCard}>
                        <LinearGradient colors={['#FF9800', '#FFA726']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="trending-up" size={28} color="#fff" />
                            <Text style={styles.statValue}>+{analytics.overallStats.improvement}%</Text>
                            <Text style={styles.statLabel}>Growth</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Attendance Trend */}
                {analytics.attendanceTrend.length > 0 && (
                    <View style={styles.chartSection}>
                        <Text style={styles.sectionTitle}>Attendance Trend (Last 7 Days)</Text>
                        <View style={styles.chartCard}>
                            <LineChart
                                data={{
                                    labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
                                    datasets: [{ data: analytics.attendanceTrend }]
                                }}
                                width={screenWidth - 60}
                                height={200}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </View>
                )}

                {/* Grades Trend */}
                {analytics.gradesTrend.length > 0 && (
                    <View style={styles.chartSection}>
                        <Text style={styles.sectionTitle}>Grades Progress</Text>
                        <View style={styles.chartCard}>
                            <LineChart
                                data={{
                                    labels: analytics.gradesTrend.map((_, i) => `T${i + 1}`),
                                    datasets: [{ data: analytics.gradesTrend }]
                                }}
                                width={screenWidth - 60}
                                height={200}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
                                }}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    </View>
                )}

                {/* Subject Performance */}
                {Object.keys(analytics.subjectPerformance).length > 0 && (
                    <View style={styles.chartSection}>
                        <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
                        <View style={styles.subjectsContainer}>
                            {Object.entries(analytics.subjectPerformance).map(([subject, score]) => (
                                <View key={subject} style={styles.subjectCard}>
                                    <View style={styles.subjectHeader}>
                                        <Text style={styles.subjectName}>{subject}</Text>
                                        <Text style={styles.subjectScore}>{Math.round(score)}%</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, {
                                            width: `${score}%`,
                                            backgroundColor: score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'
                                        }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Insights */}
                {analytics.insights.length > 0 && (
                    <View style={styles.insightsSection}>
                        <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
                        {analytics.insights.map((insight, index) => (
                            <View key={index} style={styles.insightCard}>
                                <MaterialCommunityIcons name={insight.icon} size={24} color={insight.color} />
                                <Text style={styles.insightText}>{insight.text}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },

    statsContainer: { flexDirection: 'row', padding: 20, gap: 12 },
    statCard: { flex: 1, borderRadius: 16, overflow: 'hidden', ...theme.shadows.md },
    statGradient: { padding: 16, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },

    chartSection: { paddingHorizontal: 20, marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
    chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, ...theme.shadows.sm },
    chart: { borderRadius: 16 },

    subjectsContainer: { gap: 12 },
    subjectCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, ...theme.shadows.sm },
    subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    subjectName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    subjectScore: { fontSize: 15, fontWeight: 'bold', color: theme.colors.primary },
    progressBar: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4 },
    progressFill: { height: '100%', borderRadius: 4 },

    insightsSection: { paddingHorizontal: 20, paddingBottom: 30 },
    insightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, ...theme.shadows.sm },
    insightText: { flex: 1, fontSize: 14, color: theme.colors.text, marginLeft: 12, fontWeight: '500' }
});

export default PerformanceAnalyticsScreen;
