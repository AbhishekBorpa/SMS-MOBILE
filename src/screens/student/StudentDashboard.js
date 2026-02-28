import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Image, Linking, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { formatNumber, formatPercent } from '../../utils/formatters';

const StudentDashboard = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        attendance: 0,
        averageGrade: 'N/A',
        pendingAssignments: 0,
        upcomingClasses: [],
        recentNotices: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let attendance = 0, avgGrade = 'N/A', pending = 0, recentNotices = [];

            // Fetch attendance data (student-specific)
            try {
                const attendanceRes = await axios.get(`${API_URL}/attendance/student/${userInfo._id}`, config);
                attendance = calculateAttendancePercentage(attendanceRes.data);
            } catch (err) {
                console.log('Attendance fetch failed, using default');
            }

            // Fetch marks data
            try {
                const marksRes = await axios.get(`${API_URL}/marks`, config);
                avgGrade = calculateAverageGrade(marksRes.data);
            } catch (err) {
                console.log('Marks fetch failed, using default');
            }

            // Fetch assignments
            try {
                const assignmentsRes = await axios.get(`${API_URL}/assignments`, config);
                pending = assignmentsRes.data.filter(a => !a.submitted).length;
            } catch (err) {
                console.log('Assignments fetch failed, using default');
            }

            // Fetch notices
            try {
                const noticesRes = await axios.get(`${API_URL}/notices`, config);
                recentNotices = noticesRes.data.slice(0, 3);
            } catch (err) {
                console.log('Notices fetch failed, using default');
            }

            setDashboardData({
                attendance,
                averageGrade: avgGrade,
                pendingAssignments: pending,
                upcomingClasses: [],
                recentNotices
            });
        } catch (error) {
            console.log('Error fetching dashboard data:', error);
            // Keep default values on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateAttendancePercentage = (attendanceData) => {
        if (!attendanceData || attendanceData.length === 0) return 0;
        const present = attendanceData.filter(a => a.status === 'Present').length;
        return Math.round((present / attendanceData.length) * 100);
    };

    const calculateAverageGrade = (marksData) => {
        if (!marksData || marksData.length === 0) return 'N/A';
        const total = marksData.reduce((sum, mark) => sum + (mark.marksObtained || 0), 0);
        const maxTotal = marksData.reduce((sum, mark) => sum + (mark.totalMarks || 100), 0);
        const percentage = (total / maxTotal) * 100;

        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'D';
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboardData();
    }, []);

    const handleEmergencyContact = () => {
        Alert.alert(
            'Emergency Contact',
            'Choose an option',
            [
                { text: 'Call School', onPress: () => Linking.openURL('tel:+911234567890') },
                { text: 'Call Parent', onPress: () => Linking.openURL('tel:+919876543210') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >

                {/* 1. Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.nameText}>{userInfo?.name?.split(' ')[0] || 'Student'}!</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=' + (userInfo?.name || 'User') + '&background=random' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.onlineBadge} />
                    </TouchableOpacity>
                </View>

                {/* 2. Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <LinearGradient colors={theme.gradients.success} style={styles.statGradient}>
                            <MaterialCommunityIcons name="calendar-check" size={24} color="#fff" />
                            <Text style={styles.statValue}>{loading ? '...' : formatPercent(dashboardData.attendance)}</Text>
                            <Text style={styles.statLabel}>Attendance</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                        <LinearGradient colors={theme.gradients.secondary} style={styles.statGradient}>
                            <MaterialCommunityIcons name="certificate" size={24} color="#fff" />
                            <Text style={styles.statValue}>{loading ? '...' : dashboardData.averageGrade}</Text>
                            <Text style={styles.statLabel}>Avg Grade</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                        <LinearGradient colors={theme.gradients.blue} style={styles.statGradient}>
                            <MaterialCommunityIcons name="clipboard-text" size={24} color="#fff" />
                            <Text style={styles.statValue}>{loading ? '...' : formatNumber(dashboardData.pendingAssignments)}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* 3. Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('DigitalIDCard')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#2196F3" />
                        </View>
                        <Text style={styles.quickActionText}>Scan QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickAction} onPress={handleEmergencyContact}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FFEBEE' }]}>
                            <MaterialCommunityIcons name="phone-alert" size={24} color="#F44336" />
                        </View>
                        <Text style={styles.quickActionText}>Emergency</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('ComplaintBox')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                            <MaterialCommunityIcons name="message-alert" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.quickActionText}>Report</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Timetable')}>
                        <View style={[styles.quickActionIcon, { backgroundColor: '#F3E5F5' }]}>
                            <MaterialCommunityIcons name="calendar-today" size={24} color="#9C27B0" />
                        </View>
                        <Text style={styles.quickActionText}>Schedule</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. Recent Notices */}
                {dashboardData.recentNotices.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Announcements</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('NoticeBoard')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.noticesContainer}>
                            {dashboardData.recentNotices.map((notice, index) => (
                                <TouchableOpacity key={index} style={styles.noticeCard} onPress={() => navigation.navigate('NoticeBoard')}>
                                    <View style={styles.noticeIcon}>
                                        <MaterialCommunityIcons name="bell" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.noticeContent}>
                                        <Text style={styles.noticeTitle} numberOfLines={1}>{notice.title}</Text>
                                        <Text style={styles.noticeDate}>{new Date(notice.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* 5. Continue Learning */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Continue Learning</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <TouchableOpacity style={styles.learningCard} onPress={() => navigation.navigate('QuizList')}>
                        <LinearGradient colors={theme.gradients.secondary} style={styles.learningCardGradient}>
                            <MaterialCommunityIcons name="atom" size={32} color="#fff" />
                            <View style={styles.learningCardContent}>
                                <Text style={styles.learningSubject}>Physics</Text>
                                <Text style={styles.learningTopic}>Motion & Force</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '60%' }]} />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.playBtn}>
                                <MaterialCommunityIcons name="play" size={20} color={theme.colors.secondary} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.learningCard} onPress={() => navigation.navigate('AssignmentsList')}>
                        <LinearGradient colors={theme.gradients.blue} style={styles.learningCardGradient}>
                            <MaterialCommunityIcons name="calculator" size={32} color="#fff" />
                            <View style={styles.learningCardContent}>
                                <Text style={styles.learningSubject}>Mathematics</Text>
                                <Text style={styles.learningTopic}>Calculus II</Text>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: '30%' }]} />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.playBtn}>
                                <MaterialCommunityIcons name="play" size={20} color={theme.colors.info} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>

                {/* 6. Menu Grid */}
                <Text style={[styles.sectionTitle, { marginLeft: 20, marginBottom: 15, marginTop: 10 }]}>Explore</Text>
                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                            </View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};


const menuItems = [
    // Academic
    { title: 'Assignments', icon: 'book-open-page-variant', screen: 'AssignmentsList', color: theme.colors.primary },
    { title: 'Quizzes', icon: 'brain', screen: 'QuizList', color: '#9C27B0' },
    { title: 'Timetable', icon: 'calendar-clock', screen: 'Timetable', color: theme.colors.secondary },
    { title: 'Attendance', icon: 'calendar-check', screen: 'ViewAttendance', color: theme.colors.success },
    { title: 'Marks', icon: 'format-list-numbered', screen: 'ViewMarks', color: theme.colors.accent },
    { title: 'Exams', icon: 'clipboard-text', screen: 'ExamSchedule', color: '#FF6F00' },

    // Learning Tools
    { title: 'Study Timer', icon: 'timer', screen: 'StudyTimer', color: '#FF5722' },
    { title: 'Materials', icon: 'book-open-variant', screen: 'StudyMaterials', color: '#673AB7' },
    { title: 'Calculator', icon: 'calculator-variant', screen: 'GradeCalculator', color: '#00BCD4' },
    { title: 'AI Report Card', icon: 'robot-confused', screen: 'AIReportCard', color: '#E91E63' },
    { title: 'Achievements', icon: 'trophy-variant', screen: 'Achievements', color: '#FFC107' },
    { title: 'Leaderboard', icon: 'trophy', screen: 'Leaderboard', color: '#FFB300' },

    // Campus Services
    { title: 'Library', icon: 'book-multiple', screen: 'Library', color: '#5E35B1' },
    { title: 'Transport', icon: 'bus-school', screen: 'Transport', color: '#1976D2' },
    { title: 'Canteen', icon: 'food', screen: 'Canteen', color: '#F57C00' },
    { title: 'Health', icon: 'medical-bag', screen: 'HealthWellness', color: '#D32F2F' },
    { title: 'Clubs', icon: 'account-group', screen: 'ClubList', color: '#7B1FA2' },
    { title: 'Lost & Found', icon: 'package-variant-closed', screen: 'LostFound', color: '#0097A7' },

    // Admin
    { title: 'Digital ID', icon: 'card-account-details', screen: 'DigitalIDCard', color: '#00897B' },
    { title: 'Messages', icon: 'message-text', screen: 'ChatList', color: theme.colors.primary },
    { title: 'Leave', icon: 'calendar-remove', screen: 'StudentLeave', color: '#C62828' },
    { title: 'Fee Status', icon: 'currency-usd', screen: 'FeeStatus', color: '#388E3C' },
    { title: 'Notices', icon: 'bulletin-board', screen: 'NoticeBoard', color: '#607D8B' },
    { title: 'Profile', icon: 'account', screen: 'Profile', color: theme.colors.info },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 130 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    welcomeText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '600' },
    nameText: { fontSize: 22, color: theme.colors.text, fontWeight: 'bold' },
    profileBtn: { position: 'relative' },
    profileImage: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: '#fff' },

    // Stats Cards
    statsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12 },
    statCard: { flex: 1, borderRadius: 16, overflow: 'hidden', ...theme.shadows.md },
    statGradient: { padding: 15, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },

    // Quick Actions
    quickActionsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 25, justifyContent: 'space-between' },
    quickAction: { alignItems: 'center', flex: 1 },
    quickActionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8, ...theme.shadows.sm },
    quickActionText: { fontSize: 11, color: theme.colors.text, fontWeight: '600' },

    // Notices
    noticesContainer: { paddingHorizontal: 20, marginBottom: 20 },
    noticeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, ...theme.shadows.sm },
    noticeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    noticeContent: { flex: 1 },
    noticeTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 2 },
    noticeDate: { fontSize: 12, color: theme.colors.textLight },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    seeAllText: { color: theme.colors.primary, fontWeight: '600' },

    horizontalScroll: { paddingLeft: 20, marginBottom: 25 },
    learningCard: { marginRight: 15, width: 260, borderRadius: 22, overflow: 'hidden', ...theme.shadows.md },
    learningCardGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', height: 100 },
    learningCardContent: { flex: 1, marginLeft: 15 },
    learningSubject: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 'bold' },
    learningTopic: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
    progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
    playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
    menuItem: { width: '33.33%', alignItems: 'center', padding: 10, marginBottom: 10 },
    iconContainer: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, ...theme.shadows.sm },
    menuTitle: { fontSize: 12, color: theme.colors.text, fontWeight: '600', textAlign: 'center' },
});

export default StudentDashboard;
