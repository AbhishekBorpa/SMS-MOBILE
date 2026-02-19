import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AchievementsScreen = ({ navigation }) => {
    const [stats, setStats] = useState({
        totalBadges: 0,
        streak: 0,
        points: 0,
        rank: 'N/A'
    });
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch student data for achievements
            const [attendanceRes, marksRes, assignmentsRes] = await Promise.all([
                axios.get(`${API_URL}/attendance/student/${await getUserId()}`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/marks`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/assignments`, config).catch(() => ({ data: [] }))
            ]);

            const calculatedAchievements = calculateAchievements(
                attendanceRes.data,
                marksRes.data,
                assignmentsRes.data
            );

            setAchievements(calculatedAchievements);
            setStats({
                totalBadges: calculatedAchievements.filter(a => a.unlocked).length,
                streak: calculateStreak(attendanceRes.data),
                points: calculatedAchievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0),
                rank: 'Top 10%'
            });
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserId = async () => {
        const userInfo = await SecureStore.getItemAsync('userInfo');
        return JSON.parse(userInfo)._id;
    };

    const calculateStreak = (attendance) => {
        if (!attendance || attendance.length === 0) return 0;
        let streak = 0;
        const sorted = attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
        for (const record of sorted) {
            if (record.status === 'Present') streak++;
            else break;
        }
        return streak;
    };

    const calculateAchievements = (attendance, marks, assignments) => {
        const attendanceRate = attendance.length > 0
            ? (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100
            : 0;

        const avgGrade = marks.length > 0
            ? marks.reduce((sum, m) => sum + (m.marksObtained / m.totalMarks) * 100, 0) / marks.length
            : 0;

        const completedAssignments = assignments.filter(a => a.submitted).length;

        return [
            {
                id: '1',
                title: 'Perfect Attendance',
                description: 'Attend all classes for a month',
                icon: 'calendar-check',
                color: '#4CAF50',
                category: 'Attendance',
                points: 100,
                unlocked: attendanceRate >= 95,
                progress: Math.min(attendanceRate, 100)
            },
            {
                id: '2',
                title: 'Academic Excellence',
                description: 'Score above 90% average',
                icon: 'trophy',
                color: '#FFD700',
                category: 'Academic',
                points: 150,
                unlocked: avgGrade >= 90,
                progress: Math.min(avgGrade, 100)
            },
            {
                id: '3',
                title: 'Assignment Master',
                description: 'Complete 10 assignments',
                icon: 'clipboard-check',
                color: '#2196F3',
                category: 'Tasks',
                points: 75,
                unlocked: completedAssignments >= 10,
                progress: (completedAssignments / 10) * 100
            },
            {
                id: '4',
                title: 'Study Streak',
                description: '7 days attendance streak',
                icon: 'fire',
                color: '#FF5722',
                category: 'Consistency',
                points: 50,
                unlocked: calculateStreak(attendance) >= 7,
                progress: (calculateStreak(attendance) / 7) * 100
            },
            {
                id: '5',
                title: 'Quiz Champion',
                description: 'Score 100% in any quiz',
                icon: 'brain',
                color: '#9C27B0',
                category: 'Quizzes',
                points: 100,
                unlocked: false,
                progress: 0
            },
            {
                id: '6',
                title: 'Early Bird',
                description: 'Never late for a week',
                icon: 'weather-sunset-up',
                color: '#FF9800',
                category: 'Punctuality',
                points: 50,
                unlocked: false,
                progress: 0
            }
        ];
    };

    const renderAchievement = ({ item }) => (
        <TouchableOpacity style={styles.achievementCard}>
            <LinearGradient
                colors={item.unlocked ? [item.color, item.color + 'CC'] : ['#E0E0E0', '#BDBDBD']}
                style={styles.achievementGradient}
            >
                <View style={styles.achievementHeader}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={32}
                            color={item.unlocked ? '#fff' : '#999'}
                        />
                    </View>
                    <View style={styles.achievementInfo}>
                        <Text style={[styles.achievementTitle, !item.unlocked && styles.lockedText]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.achievementDesc, !item.unlocked && styles.lockedText]}>
                            {item.description}
                        </Text>
                    </View>
                    {item.unlocked && (
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsText}>+{item.points}</Text>
                        </View>
                    )}
                </View>

                {!item.unlocked && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{Math.round(item.progress)}%</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Achievements"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="medal"
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <LinearGradient colors={['#FFD700', '#FFA000']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="trophy" size={28} color="#fff" />
                            <Text style={styles.statValue}>{stats.totalBadges}</Text>
                            <Text style={styles.statLabel}>Badges</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.statCard}>
                        <LinearGradient colors={['#FF5722', '#E64A19']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="fire" size={28} color="#fff" />
                            <Text style={styles.statValue}>{stats.streak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.statCard}>
                        <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.statGradient}>
                            <MaterialCommunityIcons name="star" size={28} color="#fff" />
                            <Text style={styles.statValue}>{stats.points}</Text>
                            <Text style={styles.statLabel}>Points</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Achievements List */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>Your Achievements</Text>
                    <FlatList
                        data={achievements}
                        renderItem={renderAchievement}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.list}
                    />
                </View>
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

    achievementsSection: { paddingHorizontal: 20, paddingBottom: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
    list: { gap: 12 },

    achievementCard: { borderRadius: 16, overflow: 'hidden', ...theme.shadows.sm },
    achievementGradient: { padding: 16 },
    achievementHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    achievementInfo: { flex: 1 },
    achievementTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    achievementDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
    lockedText: { color: '#999' },
    pointsBadge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    pointsText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

    progressContainer: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
    progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
    progressText: { fontSize: 12, fontWeight: '600', color: '#666', minWidth: 40, textAlign: 'right' }
});

export default AchievementsScreen;
