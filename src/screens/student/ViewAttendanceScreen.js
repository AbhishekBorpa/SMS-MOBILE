import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const ViewAttendanceScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/attendance/student/${userInfo._id}`, config);
            setAttendance(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isPresent = item.status === 'Present';
        const date = new Date(item.date);

        return (
            <AppCard style={styles.card} padding={16}>
                <View style={styles.cardInner}>
                    <View style={[styles.dateBox, { backgroundColor: isPresent ? theme.colors.success + '10' : theme.colors.error + '10' }]}>
                        <Text style={[styles.dateDay, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                            {date.getDate()}
                        </Text>
                        <Text style={[styles.dateMonth, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                            {date.toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.className}>{item.class?.name}</Text>
                        <Text style={styles.subjectName}>{item.class?.subject}</Text>
                        <View style={styles.timeRow}>
                            <MaterialCommunityIcons name="clock-check-outline" size={14} color={theme.colors.textLight} />
                            <Text style={styles.timeText}>Standard Session</Text>
                        </View>
                    </View>

                    <AppBadge
                        label={item.status}
                        type={item.status === 'Present' ? 'success' : 'danger'}
                    />
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="Attendance History"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="calendar-check-outline"
            />

            <View style={styles.content}>
                <AppCard style={styles.summaryCard} padding={0}>
                    <View style={[styles.summaryRow, { backgroundColor: theme.colors.primary }]}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{attendance.filter(a => a.status === 'Present').length}</Text>
                            <Text style={styles.summaryLabel}>PRESENT</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{attendance.filter(a => a.status === 'Absent').length}</Text>
                            <Text style={styles.summaryLabel}>ABSENT</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>
                                {attendance.length > 0
                                    ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
                                    : 0}%
                            </Text>
                            <Text style={styles.summaryLabel}>RATIO</Text>
                        </View>
                    </View>
                </AppCard>

                <FlatList
                    data={attendance}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="calendar-blank-outline"
                            title="No Records"
                            description="Your attendance logs will appear here once updated."
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1, padding: 20 },
    summaryCard: { marginBottom: 25, overflow: 'hidden', elevation: 6 },
    summaryRow: { flexDirection: 'row', padding: 22, justifyContent: 'space-between', alignItems: 'center' },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
    summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '800', letterSpacing: 1 },
    summaryDivider: { width: 1, height: 35, backgroundColor: 'rgba(255,255,255,0.2)' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 130 },
    card: { marginBottom: 15, elevation: 2 },
    cardInner: { flexDirection: 'row', alignItems: 'center' },
    dateBox: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    dateDay: { fontSize: 18, fontWeight: 'bold' },
    dateMonth: { fontSize: 9, fontWeight: '900', marginTop: 1 },
    infoSection: { flex: 1 },
    className: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    subjectName: { fontSize: 13, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
    timeText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '500' }
});

export default ViewAttendanceScreen;
