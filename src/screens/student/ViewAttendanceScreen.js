import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { formatNumber } from '../../utils/formatters';

const { width } = Dimensions.get('window');
const RING_SIZE = 130;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Simple SVG Ring via View trick
const AttendanceRing = ({ percentage }) => {
    const animVal = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animVal, {
            toValue: percentage,
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, [percentage]);

    const color = percentage >= 75 ? theme.colors.success : percentage >= 50 ? theme.colors.warning : theme.colors.error;

    return (
        <View style={styles.ringContainer}>
            <View style={[styles.ringOuter, { borderColor: color + '20' }]}>
                <View style={[styles.ringInner, { borderColor: color }]}>
                    <Text style={[styles.ringPercent, { color }]}>{Math.round(percentage)}%</Text>
                    <Text style={styles.ringLabel}>Attendance</Text>
                </View>
            </View>
            {percentage >= 75 && (
                <View style={styles.ringBadge}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
                </View>
            )}
        </View>
    );
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MiniCalendar = ({ attendance, month, year }) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const statusMap = {};
    attendance.forEach(a => {
        const d = new Date(a.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
            statusMap[d.getDate()] = a.status;
        }
    });

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <View style={styles.calendarWrap}>
            <View style={styles.calendarDayRow}>
                {DAYS.map((d, i) => <Text key={i} style={styles.calendarDayLabel}>{d}</Text>)}
            </View>
            <View style={styles.calendarGrid}>
                {cells.map((day, idx) => {
                    const status = day ? statusMap[day] : null;
                    const isPresent = status === 'Present';
                    const isAbsent = status === 'Absent';
                    return (
                        <View
                            key={idx}
                            style={[
                                styles.calendarCell,
                                isPresent && styles.presentCell,
                                isAbsent && styles.absentCell,
                            ]}
                        >
                            {day && (
                                <Text style={[
                                    styles.calendarCellText,
                                    isPresent && styles.presentText,
                                    isAbsent && styles.absentText,
                                ]}>
                                    {day}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const ViewAttendanceScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('calendar'); // 'calendar' | 'list'
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    useEffect(() => { fetchAttendance(); }, []);

    const fetchAttendance = async () => {
        if (!userInfo?._id) return;
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/attendance/student/${userInfo._id}`, config);
            setAttendance(data);
        } catch (error) {
            console.log('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Stats ---
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    // Streak calculation
    const sorted = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (let a of sorted) {
        if (a.status === 'Present') streak++;
        else break;
    }

    // Per-subject breakdown
    const subjectMap = {};
    attendance.forEach(a => {
        const subj = a.class?.subject || 'General';
        if (!subjectMap[subj]) subjectMap[subj] = { present: 0, total: 0 };
        subjectMap[subj].total++;
        if (a.status === 'Present') subjectMap[subj].present++;
    });
    const subjectStats = Object.entries(subjectMap).map(([subj, v]) => ({
        subject: subj,
        present: v.present,
        total: v.total,
        percent: Math.round((v.present / v.total) * 100),
    }));

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    };

    const renderListItem = ({ item }) => {
        const isPresent = item.status === 'Present';
        const date = new Date(item.date);
        return (
            <View style={[styles.listItem, isPresent ? styles.presentItem : styles.absentItem]}>
                <View style={[styles.listDateBox, { backgroundColor: isPresent ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.listDay, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                        {date.getDate()}
                    </Text>
                    <Text style={[styles.listMon, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                        {MONTHS[date.getMonth()]}
                    </Text>
                </View>
                <View style={styles.listInfo}>
                    <Text style={styles.listClass}>{item.class?.name || '—'}</Text>
                    <Text style={styles.listSubject}>{item.class?.subject || '—'}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: isPresent ? theme.colors.success : theme.colors.error }]}>
                    <MaterialCommunityIcons
                        name={isPresent ? 'check' : 'close'}
                        size={14}
                        color="#fff"
                    />
                    <Text style={styles.statusPillText}>{item.status}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="My Attendance"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="calendar-check-outline"
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Hero Banner */}
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={styles.banner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Decorative circles */}
                    <View style={[styles.deco, styles.deco1]} />
                    <View style={[styles.deco, styles.deco2]} />

                    <AttendanceRing percentage={percentage} />

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{present}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{absent}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatNumber(streak)}🔥</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                    </View>

                    {percentage < 75 && (
                        <View style={styles.warningBanner}>
                            <MaterialCommunityIcons name="alert-outline" size={14} color="#FFF3E0" />
                            <Text style={styles.warningText}>
                                Attendance below 75% — {Math.ceil((0.75 * total - present) / 0.25)} more days needed
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {['calendar', 'list', 'subjects'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                            onPress={() => setTab(t)}
                        >
                            <MaterialCommunityIcons
                                name={t === 'calendar' ? 'calendar-month' : t === 'list' ? 'format-list-bulleted' : 'book-open-outline'}
                                size={16}
                                color={tab === t ? '#fff' : theme.colors.textLight}
                            />
                            <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                {tab === 'calendar' && (
                    <View style={styles.section}>
                        {/* Month Navigator */}
                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                                <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.monthTitle}>{MONTHS[calMonth]} {calYear}</Text>
                            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                                <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <MiniCalendar attendance={attendance} month={calMonth} year={calYear} />
                        {/* Legend */}
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                                <Text style={styles.legendText}>Present</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
                                <Text style={styles.legendText}>Absent</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                                <Text style={styles.legendText}>No Record</Text>
                            </View>
                        </View>
                    </View>
                )}

                {tab === 'list' && (
                    <View style={styles.section}>
                        {attendance.length === 0 ? (
                            <EmptyState
                                icon="calendar-blank-outline"
                                title="No Records"
                                description="Your attendance logs will appear here."
                            />
                        ) : (
                            attendance.map(item => (
                                <View key={item._id}>
                                    {renderListItem({ item })}
                                </View>
                            ))
                        )}
                    </View>
                )}

                {tab === 'subjects' && (
                    <View style={styles.section}>
                        {subjectStats.length === 0 ? (
                            <EmptyState icon="book-outline" title="No Data" description="Subject-wise breakdown will appear here." />
                        ) : (
                            subjectStats.map((s, i) => (
                                <View key={i} style={styles.subjectCard}>
                                    <View style={styles.subjectTop}>
                                        <View style={styles.subjectIconBox}>
                                            <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.subjectName}>{s?.subject || 'Unknown Subject'}</Text>
                                            <Text style={styles.subjectCount}>{s?.present || 0}/{s?.total || 0} classes attended</Text>
                                        </View>
                                        <Text style={[
                                            styles.subjectPct,
                                            { color: (s?.percent || 0) >= 75 ? theme.colors.success : (s?.percent || 0) >= 50 ? theme.colors.warning : theme.colors.error }
                                        ]}>{s?.percent || 0}%</Text>
                                    </View>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, {
                                            width: `${s.percent}%`,
                                            backgroundColor: s.percent >= 75 ? theme.colors.success : s.percent >= 50 ? theme.colors.warning : theme.colors.error
                                        }]} />
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    scroll: { paddingBottom: 40 },

    // Banner
    banner: { padding: 24, paddingBottom: 28, alignItems: 'center', position: 'relative', overflow: 'hidden' },
    deco: { position: 'absolute', borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)' },
    deco1: { width: 160, height: 160, top: -60, right: -40 },
    deco2: { width: 100, height: 100, bottom: -30, left: 10 },

    // Ring
    ringContainer: { position: 'relative', marginBottom: 20 },
    ringOuter: { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
    ringInner: { width: RING_SIZE - 20, height: RING_SIZE - 20, borderRadius: (RING_SIZE - 20) / 2, borderWidth: STROKE, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
    ringPercent: { fontSize: 28, fontWeight: '900', color: '#fff' },
    ringLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5 },
    ringBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2 },

    // Stats Row
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, gap: 0, width: '100%', justifyContent: 'space-between' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '700', letterSpacing: 0.5 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

    // Warning
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: 'rgba(255,152,0,0.25)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    warningText: { fontSize: 11, color: '#FFF3E0', fontWeight: '700', flex: 1 },

    // Tab Bar
    tabBar: { flexDirection: 'row', margin: 20, marginBottom: 0, backgroundColor: '#E8EAF0', borderRadius: 16, padding: 4 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 13 },
    tabBtnActive: { backgroundColor: theme.colors.primary },
    tabBtnText: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight },
    tabBtnTextActive: { color: '#fff' },

    // Section
    section: { padding: 20 },

    // Month Nav
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    navBtn: { padding: 8, backgroundColor: theme.colors.primary + '10', borderRadius: 12 },
    monthTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },

    // Calendar
    calendarWrap: { backgroundColor: '#fff', borderRadius: 20, padding: 16, ...theme.shadows.md },
    calendarDayRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    calendarDayLabel: { width: (width - 72) / 7, textAlign: 'center', fontSize: 11, fontWeight: '800', color: theme.colors.textLight },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarCell: { width: (width - 72) / 7, height: (width - 72) / 7, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginVertical: 2 },
    presentCell: { backgroundColor: '#E8F5E9' },
    absentCell: { backgroundColor: '#FFEBEE' },
    calendarCellText: { fontSize: 12, fontWeight: '600', color: theme.colors.textLight },
    presentText: { color: theme.colors.success, fontWeight: '800' },
    absentText: { color: theme.colors.error, fontWeight: '800' },

    // Legend
    legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },

    // List View
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, ...theme.shadows.sm },
    presentItem: { borderLeftWidth: 4, borderLeftColor: theme.colors.success },
    absentItem: { borderLeftWidth: 4, borderLeftColor: theme.colors.error },
    listDateBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    listDay: { fontSize: 18, fontWeight: '900' },
    listMon: { fontSize: 9, fontWeight: '800', marginTop: 1 },
    listInfo: { flex: 1 },
    listClass: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    listSubject: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusPillText: { color: '#fff', fontSize: 11, fontWeight: '800' },

    // Subject Breakdown
    subjectCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, ...theme.shadows.sm },
    subjectTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    subjectIconBox: { width: 42, height: 42, borderRadius: 13, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    subjectCount: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    subjectPct: { fontSize: 20, fontWeight: '900' },
    progressTrack: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
});

export default ViewAttendanceScreen;
