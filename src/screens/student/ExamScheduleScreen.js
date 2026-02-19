import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../constants/theme';

const ExamScheduleScreen = ({ navigation }) => {
    // Mock Data for Exams
    const exams = [
        { id: '1', subject: 'Mathematics', date: 'Jan 15, 2026', time: '09:00 AM - 12:00 PM', type: 'Final Term', venue: 'Hall A', marks: 100 },
        { id: '2', subject: 'Science', date: 'Jan 17, 2026', time: '10:00 AM - 01:00 PM', type: 'Final Term', venue: 'Hall B', marks: 100 },
        { id: '3', subject: 'English', date: 'Jan 19, 2026', time: '09:00 AM - 12:00 PM', type: 'Final Term', venue: 'Lab 1', marks: 80 },
        { id: '4', subject: 'History', date: 'Jan 21, 2026', time: '02:00 PM - 05:00 PM', type: 'Mid Term', venue: 'Hall C', marks: 100 },
    ];

    const renderItem = ({ item }) => (
        <AppCard padding={20} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.error + '10' }]}>
                        <MaterialCommunityIcons name="file-document-edit-outline" size={26} color={theme.colors.error} />
                    </View>
                    <View>
                        <Text style={styles.subjectText}>{item.subject}</Text>
                        <Text style={styles.examType}>{item.type}</Text>
                    </View>
                </View>
                <AppBadge label={`${item.marks} Marks`} type="warning" />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="calendar-range" size={18} color={theme.colors.primary} />
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>
                <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.infoText}>{item.time}</Text>
                </View>
            </View>

            <View style={styles.venueRow}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={18} color={theme.colors.textLight} />
                <Text style={styles.venueText}>Venue: {item.venue}</Text>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Exam Schedule"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="alert-circle-outline"
            />

            <FlatList
                data={exams}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    list: { padding: 20 },
    card: { marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    subjectText: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    examType: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 18 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    infoText: { fontSize: 14, color: theme.colors.text, fontWeight: '600' },
    venueRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: '#F0F0F0' },
    venueText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '500' }
});

export default ExamScheduleScreen;
