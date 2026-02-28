import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const AdminDashboard = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [statsData, setStatsData] = useState({
        students: '0',
        teachers: '0',
        totalRevenue: '0',
        activeClasses: '0',
        attendanceTrend: []
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/users/stats`, config);
            setStatsData({
                students: formatNumber(data.students) || '0',
                teachers: formatNumber(data.teachers) || '0',
                totalRevenue: formatCurrency(data.totalRevenue, true),
                activeClasses: formatNumber(data.activeClasses) || '0',
                attendanceTrend: data.attendanceTrend || []
            });
        } catch (error) {
            console.log('Error fetching stats:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const stats = [
        { label: 'Students', value: statsData.students, icon: 'account-school', color: '#fff', screen: 'StudentsList' },
        { label: 'Teachers', value: statsData.teachers, icon: 'account-tie', color: '#fff', screen: 'TeachersList' },
        { label: 'Revenue', value: statsData.totalRevenue, icon: 'cash', color: '#fff', screen: 'FeeManagement' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {/* 1. Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>School Command Center</Text>
                        <Text style={styles.nameText}>{userInfo?.name || 'Administrator'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')} style={styles.profileBtn}>
                        <View style={styles.profileIconCircle}>
                            <MaterialCommunityIcons name="shield-crown" size={24} color={theme.colors.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 2. KPI Banner */}
                <LinearGradient
                    colors={theme.gradients.secondary} // Use Orange/Secondary gradient for Admin
                    style={styles.statsBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={styles.statsRow}>
                        {stats.map((stat, i) => (
                            <TouchableOpacity key={i} style={styles.statItem} onPress={() => navigation.navigate(stat.screen)}>
                                <View style={styles.statIconCircle}>
                                    <MaterialCommunityIcons name={stat.icon} size={22} color={theme.colors.secondary} />
                                </View>
                                <Text style={styles.statValueText}>{stat.value}</Text>
                                <Text style={styles.statLabelText}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.shape, styles.shape1]} />
                    <View style={[styles.shape, styles.shape2]} />
                </LinearGradient>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Administrative Tools</Text>
                </View>

                {/* 3. Live Insights Card */}
                <AppCard style={styles.featuredCard} padding={0}>
                    <LinearGradient
                        colors={['#fff', '#FFF3E0']} // Light orange tint
                        style={styles.featuredContent}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.featuredTextContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={styles.featuredTitle}>Live Insights</Text>
                                    <Text style={styles.featuredSubtitle}>Attendance Trend (7 Days)</Text>
                                </View>
                                <View style={styles.statusWrapper}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>{statsData.activeClasses} Active</Text>
                                </View>
                            </View>

                            <View style={styles.trendContainer}>
                                {statsData.attendanceTrend.length > 0 ? (
                                    statsData.attendanceTrend.map((t, idx) => (
                                        <View key={idx} style={styles.trendBarWrapper}>
                                            <View
                                                style={[
                                                    styles.trendBar,
                                                    { height: `${t.value / 1.5}%`, backgroundColor: t.value > 80 ? theme.colors.success : theme.colors.warning }
                                                ]}
                                            />
                                            <Text style={styles.trendLabel}>{new Date(t.date).getDate()}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noDataText}>No data for trend yet</Text>
                                )}
                            </View>
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
    { title: 'Trends', icon: 'chart-line', screen: 'SchoolAnalytics', color: theme.colors.primary },
    { title: 'Attendance', icon: 'calendar-check-outline', screen: 'AdminAttendance', color: '#00897B' },
    { title: 'Staff', icon: 'account-clock-outline', screen: 'StaffStatus', color: theme.colors.secondary },
    { title: 'Students', icon: 'account-group', screen: 'StudentsList', color: theme.colors.success },
    { title: 'Teachers', icon: 'account-tie', screen: 'TeachersList', color: theme.colors.info },
    { title: 'Leave', icon: 'calendar-check', screen: 'AdminLeave', color: theme.colors.error },
    { title: 'AI Assist', icon: 'robot', screen: 'AIChat', color: theme.colors.pink },
    { title: 'Fees', icon: 'cash-multiple', screen: 'FeeManagement', color: theme.colors.success },
    { title: 'Notices', icon: 'bulletin-board', screen: 'NoticeBoard', color: theme.colors.warning },
    { title: 'Events', icon: 'calendar-star', screen: 'EventCalendar', color: theme.colors.primary },
    { title: 'Inventory', icon: 'archive', screen: 'InventoryList', color: '#FF7675' },
    { title: 'Visitors', icon: 'account-clock', screen: 'VisitorLog', color: '#FD79A8' },
    { title: 'Complaints', icon: 'alert-box', screen: 'AdminComplaint', color: theme.colors.error },
    { title: 'Broadcast', icon: 'bullhorn-variant', screen: 'AdminNoticeBoard', color: theme.colors.accent },
    { title: 'Audit', icon: 'shield-search', screen: 'AdminAuditLog', color: '#00CEC9' },
    { title: 'Alumni', icon: 'school', screen: 'AlumniDirectory', color: '#6C5CE7' },
    { title: 'Transport', icon: 'bus', screen: 'TransportList', color: '#E17055' },
    { title: 'Settings', icon: 'cog', screen: 'Settings', color: '#607D8B' },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 130 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    welcomeText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    nameText: { fontSize: 20, color: theme.colors.text, fontWeight: '900' },
    profileBtn: { position: 'relative' },
    profileIconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },

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
    featuredContent: { padding: 20 },
    featuredTextContent: { flex: 1 },
    featuredTitle: { fontSize: 18, fontWeight: '900', color: theme.colors.secondary },
    featuredSubtitle: { fontSize: 13, color: theme.colors.textLight, marginTop: 4, marginBottom: 5, fontWeight: '600' },

    trendContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 80, marginTop: 15, justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 15, padding: 10 },
    trendBarWrapper: { alignItems: 'center', flex: 1 },
    trendBar: { width: 14, borderRadius: 6, minHeight: 6 },
    trendLabel: { fontSize: 10, color: theme.colors.textLight, marginTop: 6, fontWeight: 'bold' },
    noDataText: { fontSize: 12, color: theme.colors.textLight, fontStyle: 'italic', marginBottom: 10 },

    statusWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success },
    statusText: { fontSize: 10, color: theme.colors.text, marginLeft: 6, fontWeight: '800' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
    menuItem: { width: '33.33%', alignItems: 'center', padding: 10, marginBottom: 10 },
    iconContainer: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, ...theme.shadows.sm },
    menuTitle: { fontSize: 12, color: theme.colors.text, fontWeight: '600', textAlign: 'center' },
});

export default AdminDashboard;
