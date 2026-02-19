import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const ScheduleScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(`${API_URL}/classes/teacher`, config);
            setClasses(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <AppCard padding={20}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                        <MaterialCommunityIcons name="google-classroom" size={26} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.className}>{item.name}</Text>
                        <View style={styles.subjectBadge}>
                            <MaterialCommunityIcons name="book-open-variant" size={14} color={theme.colors.primary} />
                            <Text style={styles.subject}>{item.subject}</Text>
                        </View>
                    </View>
                </View>
                <AppBadge label={`${item.students.length} Students`} type="info" />
            </View>

            <View style={styles.divider} />

            <Text style={styles.scheduleLabel}>Weekly Timetable</Text>
            <View style={styles.scheduleList}>
                {item.schedule.map((slot, index) => (
                    <View key={index} style={styles.slot}>
                        <View style={[styles.dayBubble, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Text style={[styles.day, { color: theme.colors.primary }]}>{slot.day.substring(0, 3).toUpperCase()}</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <MaterialCommunityIcons name="clock-time-four-outline" size={18} color={theme.colors.textLight} />
                            <Text style={styles.time}>{slot.startTime} - {slot.endTime}</Text>
                        </View>
                        <MaterialCommunityIcons name="circle" size={8} color={theme.colors.green} style={styles.statusDot} />
                    </View>
                ))}
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="My Schedule"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="calendar-month-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="calendar-blank"
                                title="No classes scheduled yet."
                                description="Please check back later or contact admin."
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { padding: 20, paddingBottom: 130 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    className: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    subjectBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    subject: { fontSize: 13, fontWeight: '600', color: theme.colors.textLight },
    divider: { height: 1, backgroundColor: '#F5F6F8', marginVertical: 18 },
    scheduleLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.textLight, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5 },
    scheduleList: { gap: 12 },
    slot: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    dayBubble: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    day: { fontWeight: 'bold', fontSize: 11 },
    timeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
    time: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },
    statusDot: { marginLeft: 10 }
});

export default ScheduleScreen;
