import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(74, 20, 140, ${opacity})`, // Deep Purple
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.secondary }
};

const SchoolAnalyticsScreen = ({ navigation }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/stats/analytics`, config);
            setData(data);
        } catch (error) {
            console.log('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="School Analytics" variant="primary" onBack={() => navigation.goBack()} />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: theme.colors.textLight }}>Loading Analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="School Analytics" variant="primary" onBack={() => navigation.goBack()} />
                <View style={styles.center}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.colors.error} />
                    <Text style={{ marginTop: 10, color: theme.colors.textLight }}>Failed to load analytics data.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="School Analytics"
                subtitle="Performance & Growth"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="refresh"
                onRightPress={onRefresh}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {/* 1. Revenue Trends (Line Chart) */}
                <AppCard style={styles.chartCard} padding={20}>
                    <Text style={styles.chartTitle}>Revenue Growth (6 Months)</Text>
                    {data.revenueTrend?.data?.length > 0 && data.revenueTrend.data.some(val => val > 0) ? (
                        <LineChart
                            data={{
                                labels: data.revenueTrend.labels,
                                datasets: [{ data: data.revenueTrend.data }]
                            }}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`, // Green
                                formatYLabel: (val) => formatCurrency(val, true),
                            }}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <View style={styles.emptyChart}><Text style={styles.noDataText}>No revenue data available yet</Text></View>
                    )}
                </AppCard>

                {/* 2. Attendance Stats (Bar Chart) */}
                <AppCard style={styles.chartCard} padding={20}>
                    <Text style={styles.chartTitle}>Class Attendance (%)</Text>
                    {data.attendanceStats?.data?.length > 0 ? (
                        <BarChart
                            data={{
                                labels: data.attendanceStats.labels,
                                datasets: [{ data: data.attendanceStats.data }]
                            }}
                            width={screenWidth - 80}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(255, 109, 0, ${opacity})`, // Orange
                                formatYLabel: (val) => formatPercent(val),
                            }}
                            style={styles.chart}
                            verticalLabelRotation={30}
                        />
                    ) : (
                        <View style={styles.emptyChart}><Text style={styles.noDataText}>No attendance data available</Text></View>
                    )}
                </AppCard>

                {/* 3. Academic Performance (Bar Chart) */}
                <AppCard style={styles.chartCard} padding={20}>
                    <Text style={styles.chartTitle}>Academic Performance (Avg %)</Text>
                    {data.academicStats?.data?.length > 0 ? (
                        <BarChart
                            data={{
                                labels: data.academicStats.labels,
                                datasets: [{ data: data.academicStats.data }]
                            }}
                            width={screenWidth - 80}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix="%"
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(124, 77, 255, ${opacity})`, // Deep Purple/Indigo
                            }}
                            style={styles.chart}
                            verticalLabelRotation={30}
                        />
                    ) : (
                        <View style={styles.emptyChart}><Text style={styles.noDataText}>No academic data available</Text></View>
                    )}
                </AppCard>

                {/* 3. Enrollment Growth */}
                <AppCard style={styles.chartCard} padding={20}>
                    <Text style={styles.chartTitle}>New Admissions</Text>
                    {data.growthTrend?.data?.length > 0 && data.growthTrend.data.some(val => val > 0) ? (
                        <LineChart
                            data={{
                                labels: data.growthTrend.labels,
                                datasets: [{ data: data.growthTrend.data }]
                            }}
                            width={screenWidth - 80}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`, // Blue
                                formatYLabel: (val) => formatNumber(val),
                            }}
                            style={styles.chart}
                        />
                    ) : (
                        <View style={styles.emptyChart}><Text style={styles.noDataText}>No admission data available</Text></View>
                    )}
                </AppCard>

                {/* 4. Faculty Leaderboard */}
                <Text style={styles.sectionTitle}>Top Contributing Faculty</Text>
                <View style={styles.leaderboardList}>
                    {data.facultyLeaderboard.map((teacher, index) => (
                        <AppCard key={index} style={styles.leaderboardItem} padding={15}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <View style={styles.teacherInfo}>
                                <Text style={styles.teacherName}>{teacher.name}</Text>
                                <Text style={styles.teacherRole}>Faculty</Text>
                            </View>
                            <View style={styles.scoreBadge}>
                                <MaterialCommunityIcons name="star" size={14} color="#FFF" />
                                <Text style={styles.scoreText}>{teacher.count} Acts</Text>
                            </View>
                        </AppCard>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    chartCard: { marginBottom: 20, overflow: 'hidden', alignItems: 'center' },
    chart: { borderRadius: 16 },
    emptyChart: { height: 180, justifyContent: 'center', alignItems: 'center' },
    noDataText: { color: theme.colors.textLight, fontSize: 13, fontStyle: 'italic' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15, alignSelf: 'flex-start' },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.text, marginBottom: 15 },
    leaderboardList: { gap: 10 },
    leaderboardItem: { flexDirection: 'row', alignItems: 'center' },
    rankBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankText: { fontSize: 14, fontWeight: '900', color: theme.colors.primary },
    teacherInfo: { flex: 1 },
    teacherName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    teacherRole: { fontSize: 12, color: theme.colors.textLight },
    scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
    scoreText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' }
});

export default SchoolAnalyticsScreen;
