import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { formatNumber } from '../../utils/formatters';

const TeacherDashboard = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [statsData, setStatsData] = useState({
        schedule: '...',
        students: '...',
        pending: '...'
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTeacherStats();
    }, []);

    const fetchTeacherStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [classesRes, assignmentsRes] = await Promise.all([
                axios.get(`${API_URL}/classes/teacher`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/assignments`, config).catch(() => ({ data: [] }))
            ]);

            const classes = classesRes.data;
            const assignments = assignmentsRes.data;

            const studentIds = new Set();
            classes.forEach(c => c.students?.forEach(s => studentIds.add(s._id)));

            setStatsData({
                schedule: `${classes.length} Total`,
                students: formatNumber(studentIds.size),
                pending: `${assignments.length} Items`
            });
        } catch (error) {
            console.log('Error fetching teacher stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTeacherStats();
        setRefreshing(false);
    };

    const stats = [
        { label: 'Classes', value: statsData.schedule, icon: 'notebook', color: '#fff', screen: 'Schedule' },
        { label: 'Students', value: statsData.students, icon: 'account-group', color: '#fff', screen: 'StudentsList' },
        { label: 'Pending', value: statsData.pending, icon: 'clock-alert', color: '#fff', screen: 'AssignmentsList' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {/* 1. Command Center Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Faculty Command Center</Text>
                        <Text style={styles.nameText}>Prof. {userInfo?.name?.split(' ')[0] || 'Teacher'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('TeacherProfile')} style={styles.profileBtn}>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=' + (userInfo?.name || 'Teacher') + '&background=random' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.onlineBadge} />
                    </TouchableOpacity>
                </View>

                {/* 2. Quick Stats Glass Cards */}
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={styles.statsBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.statsRow}>
                        {stats.map((stat, i) => (
                            <TouchableOpacity key={i} style={styles.statItem} onPress={() => navigation.navigate(stat.screen)}>
                                <View style={styles.statIconCircle}>
                                    <MaterialCommunityIcons name={stat.icon} size={22} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.statValueText}>{stat.value}</Text>
                                <Text style={styles.statLabelText}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Decorators */}
                    <View style={[styles.shape, styles.shape1]} />
                    <View style={[styles.shape, styles.shape2]} />
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Instructional Tools</Text>
                </View>

                {/* 3. Next Class Card */}
                <AppCard style={styles.featuredCard} padding={0}>
                    <LinearGradient
                        colors={['#fff', '#F3E5F5']} // Light purple tint
                        style={styles.featuredContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.featuredTextContent}>
                            <Text style={styles.featuredTitle}>Next Class</Text>
                            <Text style={styles.featuredSubtitle}>Advanced Mathematics • Grade 10A</Text>
                            <View style={styles.timeWrapper}>
                                <MaterialCommunityIcons name="clock-time-four" size={16} color="#fff" />
                                <Text style={styles.timeText}>Starts in 15 mins</Text>
                            </View>
                        </View>
                        <View style={styles.featuredIconBox}>
                            <MaterialCommunityIcons name="presentation-play" size={40} color={theme.colors.primary} />
                        </View>
                    </LinearGradient>
                </AppCard>

                {/* 4. Menu Grid */}
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
    { title: 'Lesson Planner', icon: 'notebook-edit', screen: 'LessonPlanner', color: '#ff7675' },
    { title: 'Take Attendance', icon: 'calendar-check', screen: 'TakeAttendance', color: theme.colors.success },
    { title: 'Upload Marks', icon: 'format-list-numbered', screen: 'UploadMarks', color: theme.colors.accent },
    { title: 'Assignments', icon: 'book-open-page-variant', screen: 'AssignmentsList', color: theme.colors.info },
    { title: 'Directory', icon: 'account-group', screen: 'StudentsList', color: theme.colors.primary },
    { title: 'Create Quiz', icon: 'brain', screen: 'CreateQuiz', color: '#9C27B0' },
    { title: 'Study Materials', icon: 'file-document-outline', screen: 'StudyMaterialList', color: '#ff9a9e' },
    { title: 'Notice Board', icon: 'bulletin-board', screen: 'NoticeBoard', color: '#a18cd1' },
    { title: 'Requisitions', icon: 'basket-plus', screen: 'Requisition', color: '#FD79A8' },
    { title: 'PTM', icon: 'account-clock-outline', screen: 'PTMScheduler', color: '#0984e3' },
    { title: 'Apply Leave', icon: 'calendar-remove', screen: 'TeacherLeave', color: '#ffd800' },
    { title: 'AI Assistant', icon: 'robot', screen: 'AIChat', color: '#6200ea' },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 130 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    welcomeText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    nameText: { fontSize: 20, color: theme.colors.text, fontWeight: '900' },
    profileBtn: { position: 'relative' },
    profileImage: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: '#fff' },

    statsBanner: { margin: 20, marginTop: 10, borderRadius: 25, padding: 25, position: 'relative', overflow: 'hidden', ...theme.shadows.lg },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
    statItem: { alignItems: 'center', width: '33%' },
    statIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 5 },
    statValueText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    statLabelText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 2, fontWeight: 'bold' },
    shape: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
    shape1: { width: 120, height: 120, top: -40, right: -40 },
    shape2: { width: 80, height: 80, bottom: -20, left: 20 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },

    featuredCard: { marginHorizontal: 20, marginBottom: 25, overflow: 'hidden', borderWidth: 0, ...theme.shadows.md },
    featuredContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
    featuredTextContent: { flex: 1 },
    featuredTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
    featuredSubtitle: { fontSize: 13, color: theme.colors.textLight, marginTop: 4, marginBottom: 12, fontWeight: '600' },
    featuredIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(74, 20, 140, 0.05)', justifyContent: 'center', alignItems: 'center' },
    timeWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, alignSelf: 'flex-start' },
    timeText: { fontSize: 11, color: '#fff', marginLeft: 6, fontWeight: 'bold' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
    menuItem: { width: '33.33%', alignItems: 'center', padding: 10, marginBottom: 10 },
    iconContainer: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, ...theme.shadows.sm },
    menuTitle: { fontSize: 12, color: theme.colors.text, fontWeight: '600', textAlign: 'center' },
});

export default TeacherDashboard;
