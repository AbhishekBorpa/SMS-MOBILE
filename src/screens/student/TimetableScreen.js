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

const TimetableScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/classes/student`, config);
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
                        <MaterialCommunityIcons name="school-outline" size={26} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.className}>{item.name}</Text>
                        <Text style={styles.teacherName}>By {item.teacher?.name}</Text>
                    </View>
                </View>
                <AppBadge label={item.subject} type="primary" />
            </View>

            <View style={styles.divider} />

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
                        <MaterialCommunityIcons name="circle" size={8} color={theme.colors.green} />
                    </View>
                ))}
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Weekly Timetable"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="calendar-clock"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={classes}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="calendar-blank"
                                title="No classes found."
                                description="You are not enrolled in any classes yet."
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
    list: { padding: 20, paddingBottom: 30 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    className: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    teacherName: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F5F6F8', marginVertical: 18 },
    scheduleList: { gap: 12 },
    slot: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    dayBubble: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    day: { fontWeight: 'bold', fontSize: 11 },
    timeContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
    time: { fontSize: 14, color: theme.colors.text, fontWeight: '600' }
});

export default TimetableScreen;
