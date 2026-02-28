import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminAttendanceScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [classStats, setClassStats] = useState({}); // { classId: { present, absent, total } }
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState(null); // drill-down
    const [classRecords, setClassRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [summaryFilter, setSummaryFilter] = useState('all'); // 'all' | 'low' | 'high'

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/classes`, config);
            setClasses(data);
            fetchAllStats(data, token);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAllStats = async (classList, token) => {
        if (!token) token = await SecureStore.getItemAsync('userToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const statsMap = {};

        await Promise.all(classList.map(async (cls) => {
            try {
                const { data } = await axios.get(`${API_URL}/attendance/${cls._id}`, config);
                let present = 0, absent = 0, total = 0;
                data.forEach(doc => {
                    doc.records?.forEach(r => {
                        total++;
                        if (r.status === 'Present') present++;
                        else absent++;
                    });
                });
                statsMap[cls._id] = { present, absent, total, records: data.length };
            } catch {
                statsMap[cls._id] = { present: 0, absent: 0, total: 0, records: 0 };
            }
        }));
        setClassStats(statsMap);
    };

    const fetchClassRecords = async (cls) => {
        setSelectedClass(cls);
        setLoadingRecords(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/attendance/${cls._id}?date=${selectedDate}`, config);
            setClassRecords(data);
        } catch {
            Alert.alert('Error', 'Failed to fetch attendance records');
        } finally {
            setLoadingRecords(false);
        }
    };

    // Aggregated school-wide stats
    const schoolTotal = Object.values(classStats).reduce((s, c) => s + c.total, 0);
    const schoolPresent = Object.values(classStats).reduce((s, c) => s + c.present, 0);
    const schoolPct = schoolTotal > 0 ? Math.round((schoolPresent / schoolTotal) * 100) : 0;
    const totalSessions = Object.values(classStats).reduce((s, c) => s + c.records, 0);

    const filteredClasses = classes
        .filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(c => {
            const stat = classStats[c._id];
            if (!stat || stat.total === 0) return summaryFilter === 'all';
            const pct = (stat.present / stat.total) * 100;
            if (summaryFilter === 'low') return pct < 75;
            if (summaryFilter === 'high') return pct >= 75;
            return true;
        });

    const renderClassCard = ({ item }) => {
        const stat = classStats[item._id] || { present: 0, absent: 0, total: 0, records: 0 };
        const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
        const pctColor = pct >= 75 ? theme.colors.success : pct >= 50 ? theme.colors.warning : theme.colors.error;

        return (
            <TouchableOpacity onPress={() => fetchClassRecords(item)} activeOpacity={0.85}>
                <AppCard style={styles.classCard} padding={0}>
                    <View style={styles.classCardInner}>
                        {/* Left accent bar */}
                        <View style={[styles.accentBar, { backgroundColor: pctColor }]} />

                        <View style={styles.classCardBody}>
                            <View style={styles.classCardTop}>
                                <View style={[styles.classIcon, { backgroundColor: pctColor + '15' }]}>
                                    <MaterialCommunityIcons name="google-classroom" size={22} color={pctColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.className}>{item.name}</Text>
                                    <Text style={styles.classSubject}>{item.subject}</Text>
                                </View>
                                <View style={styles.pctBadge}>
                                    <Text style={[styles.pctText, { color: pctColor }]}>{pct}%</Text>
                                </View>
                            </View>

                            {/* Mini progress */}
                            <View style={styles.miniProgressTrack}>
                                <View style={[styles.miniProgressFill, { width: `${pct}%`, backgroundColor: pctColor }]} />
                            </View>

                            <View style={styles.classCardFooter}>
                                <View style={styles.footerStat}>
                                    <MaterialCommunityIcons name="check-circle-outline" size={13} color={theme.colors.success} />
                                    <Text style={styles.footerStatText}>{stat.present} present</Text>
                                </View>
                                <View style={styles.footerStat}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={13} color={theme.colors.error} />
                                    <Text style={styles.footerStatText}>{stat.absent} absent</Text>
                                </View>
                                <View style={styles.footerStat}>
                                    <MaterialCommunityIcons name="calendar-clock" size={13} color={theme.colors.textLight} />
                                    <Text style={styles.footerStatText}>{stat.records} sessions</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </AppCard>
            </TouchableOpacity>
        );
    };

    const renderStudentRecord = ({ item }) => {
        // item is a student from the attendance records
        const isPresent = item.status === 'Present';
        return (
            <View style={[styles.studentRec, isPresent ? styles.studentPresent : styles.studentAbsent]}>
                <View style={[styles.recAvatar, { backgroundColor: isPresent ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.recAvatarText, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                        {item.student?.name?.charAt(0) || '?'}
                    </Text>
                </View>
                <Text style={styles.recName}>{item.student?.name || 'Unknown'}</Text>
                <View style={[styles.recPill, { backgroundColor: isPresent ? theme.colors.success : theme.colors.error }]}>
                    <MaterialCommunityIcons name={isPresent ? 'check' : 'close'} size={12} color="#fff" />
                    <Text style={styles.recPillText}>{item.status}</Text>
                </View>
            </View>
        );
    };

    if (selectedClass) {
        const todayRecords = classRecords[0]; // Most recent date record
        const allStudents = todayRecords?.records || [];
        const presentCount = allStudents.filter(r => r.status === 'Present').length;
        const absentCount = allStudents.filter(r => r.status === 'Absent').length;

        return (
            <SafeAreaView style={styles.container}>
                <AppHeader
                    title={selectedClass.name}
                    subtitle={selectedClass.subject}
                    onBack={() => setSelectedClass(null)}
                    rightIcon="calendar-check-outline"
                />

                {loadingRecords ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={allStudents}
                        keyExtractor={(item, i) => item.student?._id || String(i)}
                        renderItem={renderStudentRecord}
                        contentContainerStyle={styles.recList}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View>
                                <LinearGradient colors={theme.gradients.primary} style={styles.recBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <View style={styles.recBannerStat}>
                                        <Text style={styles.recBannerVal}>{presentCount || 0}</Text>
                                        <Text style={styles.recBannerLbl}>PRESENT</Text>
                                    </View>
                                    <View style={styles.recBannerDivider} />
                                    <View style={styles.recBannerStat}>
                                        <Text style={styles.recBannerVal}>{absentCount || 0}</Text>
                                        <Text style={styles.recBannerLbl}>ABSENT</Text>
                                    </View>
                                    <View style={styles.recBannerDivider} />
                                    <View style={styles.recBannerStat}>
                                        <Text style={styles.recBannerVal}>
                                            {allStudents?.length > 0 ? Math.round((presentCount / allStudents.length) * 100) : 0}%
                                        </Text>
                                        <Text style={styles.recBannerLbl}>RATE</Text>
                                    </View>
                                </LinearGradient>
                                {classRecords.length > 0 && (
                                    <View style={styles.sessionList}>
                                        <Text style={styles.sessionHeader}>Sessions ({classRecords.length})</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {classRecords.map((rec, i) => {
                                                const d = new Date(rec.date);
                                                const p = rec.records?.filter(r => r.status === 'Present').length || 0;
                                                const t = rec.records?.length || 0;
                                                return (
                                                    <View key={i} style={styles.sessionChip}>
                                                        <Text style={styles.sessionDate}>{d.getDate()} {MONTHS[d.getMonth()]}</Text>
                                                        <Text style={styles.sessionCount}>{p}/{t}</Text>
                                                    </View>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                                <Text style={[styles.sessionHeader, { paddingHorizontal: 20, paddingTop: 10 }]}>Students — Latest Session</Text>
                            </View>
                        }
                        ListEmptyComponent={
                            <EmptyState icon="calendar-blank" title="No Records" description="No attendance taken for this class yet." />
                        }
                    />
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Attendance Overview"
                subtitle="School-wide statistics"
                onBack={() => navigation.goBack()}
                rightIcon="chart-bar"
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={filteredClasses}
                    keyExtractor={item => item._id}
                    renderItem={renderClassCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClasses(); }} />}
                    ListHeaderComponent={
                        <View>
                            {/* School Summary Banner */}
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.summaryBanner}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={[styles.deco, styles.deco1]} />
                                <View style={[styles.deco, styles.deco2]} />
                                <Text style={styles.bannerTitle}>School Attendance</Text>
                                <Text style={styles.bannerPct}>{schoolPct}%</Text>
                                <Text style={styles.bannerSub}>Overall attendance rate across all classes</Text>
                                <View style={styles.bannerStats}>
                                    <View style={styles.bannerStatItem}>
                                        <Text style={styles.bannerStatVal}>{classes.length}</Text>
                                        <Text style={styles.bannerStatLbl}>Classes</Text>
                                    </View>
                                    <View style={styles.bannerStatDiv} />
                                    <View style={styles.bannerStatItem}>
                                        <Text style={styles.bannerStatVal}>{schoolPresent}</Text>
                                        <Text style={styles.bannerStatLbl}>Total Present</Text>
                                    </View>
                                    <View style={styles.bannerStatDiv} />
                                    <View style={styles.bannerStatItem}>
                                        <Text style={styles.bannerStatVal}>{totalSessions}</Text>
                                        <Text style={styles.bannerStatLbl}>Sessions</Text>
                                    </View>
                                </View>
                            </LinearGradient>

                            {/* Search + Filter */}
                            <View style={styles.controlsRow}>
                                <View style={styles.searchBox}>
                                    <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textLight} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search classes..."
                                        placeholderTextColor={theme.colors.textLight}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                                {[['all', 'All Classes'], ['high', '≥75% (Good)'], ['low', '<75% (At Risk)']].map(([val, label]) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[styles.filterChip, summaryFilter === val && styles.filterChipActive]}
                                        onPress={() => setSummaryFilter(val)}
                                    >
                                        <Text style={[styles.filterChipText, summaryFilter === val && styles.filterChipTextActive]}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.sectionTitle}>
                                {filteredClasses.length} Classes
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <EmptyState icon="google-classroom" title="No Classes" description="No class data available yet." />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Summary Banner
    summaryBanner: { margin: 20, borderRadius: 28, padding: 28, overflow: 'hidden', position: 'relative', ...theme.shadows.lg },
    deco: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)' },
    deco1: { width: 180, height: 180, top: -70, right: -40 },
    deco2: { width: 120, height: 120, bottom: -50, left: -20 },
    bannerTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
    bannerPct: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 62 },
    bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 20, fontWeight: '500' },
    bannerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, paddingVertical: 14 },
    bannerStatItem: { flex: 1, alignItems: 'center' },
    bannerStatVal: { fontSize: 20, fontWeight: '900', color: '#fff' },
    bannerStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '700', marginTop: 3, letterSpacing: 0.3 },
    bannerStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },

    // Controls
    controlsRow: { paddingHorizontal: 20, marginBottom: 10 },
    searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, ...theme.shadows.sm },
    searchInput: { flex: 1, fontSize: 14, color: theme.colors.text, fontWeight: '500' },
    filterChips: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterChipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight },
    filterChipTextActive: { color: '#fff' },
    sectionTitle: { paddingHorizontal: 20, marginBottom: 10, fontSize: 14, fontWeight: '800', color: theme.colors.textLight, letterSpacing: 0.5, textTransform: 'uppercase' },

    // Class Cards
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    classCard: { marginBottom: 14, overflow: 'hidden' },
    classCardInner: { flexDirection: 'row' },
    accentBar: { width: 5, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
    classCardBody: { flex: 1, padding: 16 },
    classCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    classIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    className: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
    classSubject: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500', marginTop: 2 },
    pctBadge: { backgroundColor: '#F4F6F8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    pctText: { fontSize: 18, fontWeight: '900' },
    miniProgressTrack: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    miniProgressFill: { height: '100%', borderRadius: 3 },
    classCardFooter: { flexDirection: 'row', gap: 16 },
    footerStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerStatText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },

    // Drill-down: record banner
    recBanner: { margin: 20, borderRadius: 24, padding: 24, flexDirection: 'row', ...theme.shadows.md },
    recBannerStat: { flex: 1, alignItems: 'center' },
    recBannerVal: { fontSize: 28, fontWeight: '900', color: '#fff' },
    recBannerLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 0.5 },
    recBannerDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 8 },

    // Sessions strip
    sessionList: { paddingHorizontal: 20, marginBottom: 8 },
    sessionHeader: { fontSize: 13, fontWeight: '800', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    sessionChip: { marginRight: 10, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    sessionDate: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
    sessionCount: { fontSize: 11, color: theme.colors.primary, fontWeight: '800', marginTop: 3 },

    // Student Records
    recList: { paddingBottom: 40 },
    studentRec: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, padding: 14, borderRadius: 18, backgroundColor: '#fff', borderWidth: 2, ...theme.shadows.sm },
    studentPresent: { borderColor: theme.colors.success + '30' },
    studentAbsent: { borderColor: theme.colors.error + '30', backgroundColor: '#FFF9F9' },
    recAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    recAvatarText: { fontSize: 16, fontWeight: '900' },
    recName: { flex: 1, fontSize: 14, fontWeight: '700', color: theme.colors.text },
    recPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
    recPillText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});

export default AdminAttendanceScreen;
