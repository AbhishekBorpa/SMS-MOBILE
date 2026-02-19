import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const StudentDetailScreen = ({ route, navigation }) => {
    const { student } = route.params;
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks] = useState([]);
    const [awards, setAwards] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [attendanceRes, marksRes, awardsRes, behaviorRes] = await Promise.all([
                axios.get(`${API_URL}/attendance/student/${student._id}`, config),
                axios.get(`${API_URL}/marks?studentId=${student._id}`, config),
                axios.get(`${API_URL}/awards/student/${student._id}`, config).catch(() => ({ data: [] })),
                axios.get(`${API_URL}/behavior/student/${student._id}`, config).catch(() => ({ data: { history: [] } }))
            ]);
            setAttendance(attendanceRes.data);
            setMarks(marksRes.data);
            setAwards(awardsRes.data);
            setBehaviors(behaviorRes.data.history || []);
        } catch (error) {
            console.log('Error fetching student details:', error);
        } finally {
            if (loading) setLoading(false);
        }
    };

    const TabButton = ({ title }) => {
        const isActive = activeTab === title;
        return (
            <TouchableOpacity
                onPress={() => setActiveTab(title)}
                activeOpacity={0.7}
                style={[styles.tabBtn, !isActive && styles.tabBtnInactive]}
            >
                {isActive ? (
                    <LinearGradient
                        colors={theme.gradients.primary}
                        style={styles.tabGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.tabTextActive}>{title}</Text>
                    </LinearGradient>
                ) : (
                    <Text style={styles.tabTextInactive}>{title}</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderOverview = () => (
        <View style={styles.section}>
            {/* Profile Card */}
            <AppCard padding={0} style={styles.profileCard}>
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={styles.profileGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarLarge}>
                            <Text style={styles.avatarTextLarge}>{student.name?.charAt(0)?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.studentNameLarge}>{student.name}</Text>
                            <Text style={styles.classTextLarge}>Class X-A • Roll No. {student.rollNumber || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.profileMeta}>
                        <View style={styles.metaBadge}>
                            <Text style={styles.metaText}>ID: #{student._id?.substring(student._id.length - 4)?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.metaBadge}>
                            <Text style={styles.metaText}>{student.mobileNumber || 'No Phone'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.aiBtn}
                        onPress={() => navigation.navigate('PerformanceAnalysis', { studentId: student._id, studentName: student.name })}
                    >
                        <MaterialCommunityIcons name="robot" size={18} color={theme.colors.primary} />
                        <Text style={styles.aiBtnText}>AI Performance Insight</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </AppCard>

            <View style={styles.statsRow}>
                <AppCard style={styles.statCard} padding={15}>
                    <View style={[styles.statIcon, { backgroundColor: theme.colors.green + '15' }]}>
                        <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.green} />
                    </View>
                    <Text style={styles.statValue}>{attendance.length}</Text>
                    <Text style={styles.statLabel}>Days Present</Text>
                </AppCard>
                <AppCard style={styles.statCard} padding={15}>
                    <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="medal-outline" size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.statValue}>{marks.length}</Text>
                    <Text style={styles.statLabel}>Exams Taken</Text>
                </AppCard>
            </View>

            <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <AppCard style={styles.contactCard} padding={20}>
                    <View style={styles.contactItem}>
                        <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.textLight} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Mobile Number</Text>
                            <Text style={styles.contactValue}>{student.mobileNumber || 'Not provided'}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.contactItem}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color={theme.colors.textLight} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Address</Text>
                            <Text style={styles.contactValue}>{student.address || 'Not provided'}</Text>
                        </View>
                    </View>
                </AppCard>
            </View>
        </View>
    );

    const renderAttendance = () => (
        <View style={styles.section}>
            {attendance.length === 0 ? (
                <EmptyState icon="calendar-blank" title="No attendance records" />
            ) : (
                attendance.slice(0, 20).map((record) => (
                    <AppCard key={record._id} style={styles.row}>
                        <View style={[styles.dateBubble, { backgroundColor: record.status === 'Present' ? theme.colors.green + '15' : theme.colors.error + '15' }]}>
                            <Text style={[styles.dateText, { color: record.status === 'Present' ? theme.colors.green : theme.colors.error }]}>
                                {new Date(record.date).getDate()}
                            </Text>
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowDate}>{new Date(record.date).toDateString()}</Text>
                            <Text style={styles.rowSub}>{record.class?.name || 'Standard Class'}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: record.status === 'Present' ? theme.colors.green + '15' : theme.colors.error + '15' }]}>
                            <Text style={[styles.badgeText, { color: record.status === 'Present' ? theme.colors.green : theme.colors.error }]}>{record.status}</Text>
                        </View>
                    </AppCard>
                ))
            )}
        </View>
    );

    const renderMarks = () => (
        <View style={styles.section}>
            {marks.length === 0 ? (
                <EmptyState icon="trophy-outline" title="No academic records" />
            ) : (
                marks.map((mark) => {
                    const percentage = (mark.score / mark.total) * 100;
                    const color = percentage > 80 ? theme.colors.green : percentage > 50 ? theme.colors.primary : theme.colors.error;
                    return (
                        <AppCard key={mark._id} style={styles.row}>
                            <View style={[styles.examIcon, { backgroundColor: color + '15' }]}>
                                <MaterialCommunityIcons name="notebook-outline" size={24} color={color} />
                            </View>
                            <View style={styles.rowContent}>
                                <Text style={styles.rowTitle}>{mark.examType}</Text>
                                <Text style={styles.rowSub}>{mark.class?.name}</Text>
                            </View>
                            <View style={styles.scoreContainer}>
                                <Text style={[styles.scoreText, { color: color }]}>{mark.score}/{mark.total}</Text>
                                <View style={styles.scoreBarOuter}>
                                    <View style={[styles.scoreBarInner, { backgroundColor: color, width: `${percentage}%` }]} />
                                </View>
                            </View>
                        </AppCard>
                    );
                })
            )}
        </View>
    );

    const renderAwards = () => (
        <View style={styles.section}>
            <AppButton
                title="Give Award"
                icon="medal"
                type="primary"
                onPress={() => navigation.navigate('StudentAwards', { student: student, preSelectedStudentId: student._id })}
                style={{ marginBottom: 20 }}
            />
            {awards.length === 0 ? (
                <EmptyState icon="medal-outline" title="No awards yet" />
            ) : (
                <View style={styles.grid}>
                    {awards.map((award) => (
                        <View key={award._id} style={[styles.awardCard, { backgroundColor: award.color + '08', borderColor: award.color + '40' }]}>
                            <View style={[styles.awardIconCircle, { backgroundColor: award.color + '20' }]}>
                                <MaterialCommunityIcons name={award.icon || 'star'} size={28} color={award.color} />
                            </View>
                            <Text style={styles.awardTitle}>{award.title}</Text>
                            <Text style={styles.awardDate}>{new Date(award.date).toDateString()}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderBehavior = () => (
        <View style={styles.section}>
            <AppButton
                title="Log Behavior"
                icon="notebook-plus"
                type="primary"
                color={theme.colors.secondary}
                onPress={() => navigation.navigate('BehaviorTracker', { student: student })}
                style={{ marginBottom: 20 }}
            />
            {behaviors.length === 0 ? (
                <EmptyState icon="star-circle-outline" title="No behavior records" />
            ) : (
                behaviors.map((record) => (
                    <AppCard key={record._id} style={styles.row}>
                        <View style={[styles.avatarCircle, { backgroundColor: record.points > 0 ? theme.colors.green + '15' : theme.colors.error + '15' }]}>
                            <MaterialCommunityIcons name={record.points > 0 ? "thumb-up" : "thumb-down"} size={22} color={record.points > 0 ? theme.colors.green : theme.colors.error} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowTitle}>{record.category}</Text>
                            <Text style={styles.rowSub}>{new Date(record.date).toDateString()}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: record.points > 0 ? theme.colors.green + '15' : theme.colors.error + '15' }]}>
                            <Text style={[styles.badgeText, { color: record.points > 0 ? theme.colors.green : theme.colors.error }]}>
                                {record.points > 0 ? '+' : ''}{record.points} pts
                            </Text>
                        </View>
                    </AppCard>
                ))
            )}
        </View>
    );

    const EmptyState = ({ icon, title }) => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name={icon} size={50} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>{title}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                    {['Overview', 'Attendance', 'Marks', 'Awards', 'Behavior'].map(tab => (
                        <TabButton key={tab} title={tab} />
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {activeTab === 'Overview' && renderOverview()}
                    {activeTab === 'Attendance' && renderAttendance()}
                    {activeTab === 'Marks' && renderMarks()}
                    {activeTab === 'Awards' && renderAwards()}
                    {activeTab === 'Behavior' && renderBehavior()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text },

    tabsContainer: { marginBottom: 15 },
    tabsContent: { paddingHorizontal: 20, gap: 10 },
    tabBtn: { borderRadius: 20, overflow: 'hidden' },
    tabBtnInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 8 },
    tabGradient: { paddingHorizontal: 16, paddingVertical: 8 },
    tabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    tabTextInactive: { color: theme.colors.textLight, fontWeight: '600', fontSize: 13 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    section: { marginBottom: 20 },

    // Profile
    profileCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
    profileGradient: { padding: 25 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarLarge: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarTextLarge: { fontSize: 28, fontWeight: '900', color: '#fff' },
    headerInfo: { flex: 1 },
    studentNameLarge: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
    classTextLarge: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    profileMeta: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    metaBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    metaText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12, borderRadius: 16, gap: 8 },
    aiBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },

    statsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    statCard: { flex: 1, alignItems: 'center' },
    statIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: '900', color: theme.colors.text },
    statLabel: { fontSize: 11, color: theme.colors.textLight, fontWeight: 'bold', marginTop: 2 },

    contactSection: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: theme.colors.text, marginBottom: 12 },
    contactCard: {},
    contactItem: { flexDirection: 'row', alignItems: 'center' },
    contactInfo: { marginLeft: 15 },
    contactLabel: { fontSize: 11, color: theme.colors.textLight, fontWeight: '700', textTransform: 'uppercase' },
    contactValue: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 15 },

    // Lists
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 15 },
    dateBubble: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    dateText: { fontSize: 16, fontWeight: '900' },
    examIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowContent: { flex: 1 },
    rowDate: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    rowTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    rowSub: { color: theme.colors.textLight, fontSize: 12, marginTop: 2, fontWeight: '500' },
    badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '800' },

    scoreContainer: { alignItems: 'flex-end', width: 80 },
    scoreText: { fontSize: 14, fontWeight: '900', marginBottom: 5 },
    scoreBarOuter: { height: 4, backgroundColor: theme.colors.border, width: '100%', borderRadius: 2, overflow: 'hidden' },
    scoreBarInner: { height: '100%', borderRadius: 2 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    awardCard: { width: '48%', aspectRatio: 0.9, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, marginBottom: 5 },
    awardIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    awardTitle: { marginTop: 5, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', fontSize: 13, paddingHorizontal: 5 },
    awardDate: { fontSize: 10, color: theme.colors.textLight, marginTop: 4 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { marginTop: 15, color: theme.colors.textLight, fontWeight: '600' }
});

export default StudentDetailScreen;
