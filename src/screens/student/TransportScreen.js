import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../constants/theme';

const TransportScreen = ({ navigation }) => {
    const busDetails = {
        busNumber: 'B-104',
        route: 'Green Valley - School Route',
        driver: 'John Smith',
        status: 'On the Way',
        arrivalTime: '08:15 AM',
        stops: [
            { name: 'Home Pick-up', time: '07:30 AM', completed: true },
            { name: 'City Center', time: '07:45 AM', completed: true },
            { name: 'Metro Station', time: '08:00 AM', completed: false },
            { name: 'School Main Gate', time: '08:15 AM', completed: false },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Transport Tracking"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="bus-clock"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <AppCard padding={25}>
                    <View style={styles.busHeader}>
                        <View style={styles.busIconWrapper}>
                            <MaterialCommunityIcons name="bus-side" size={40} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.busLabel}>Assigned Bus</Text>
                            <Text style={styles.busNumber}>{busDetails.busNumber}</Text>
                        </View>
                        <AppBadge label={busDetails.status} type="success" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.driverSection}>
                        <View style={styles.driverInfo}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.avatarText}>JS</Text>
                            </View>
                            <View>
                                <Text style={styles.driverLabel}>Primary Driver</Text>
                                <Text style={styles.driverName}>{busDetails.driver}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <MaterialCommunityIcons name="phone" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </AppCard>

                <View style={styles.routeHeader}>
                    <Text style={styles.sectionTitle}>Route Timeline</Text>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>Est. Arrival: {busDetails.arrivalTime}</Text>
                    </View>
                </View>

                {busDetails.stops.map((stop, index) => (
                    <View key={index} style={styles.timelineItem}>
                        <View style={styles.lineWrapper}>
                            <View style={[styles.dot, stop.completed ? styles.dotCompleted : styles.dotPending]} />
                            {index !== busDetails.stops.length - 1 && <View style={styles.line} />}
                        </View>
                        <View style={[styles.stopCard, stop.completed ? styles.completedStop : null]}>
                            <View style={styles.stopTextContainer}>
                                <Text style={[styles.stopName, stop.completed ? styles.completedText : null]}>{stop.name}</Text>
                                <Text style={styles.stopTime}>{stop.time}</Text>
                            </View>
                            {stop.completed && (
                                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.green} />
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    busHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    busIconWrapper: { width: 70, height: 70, borderRadius: 20, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
    busLabel: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' },
    busNumber: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
    driverSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    driverAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.secondary + '15', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: theme.colors.primary, fontWeight: '900', fontSize: 16 },
    driverLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
    driverName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    callButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.green, justifyContent: 'center', alignItems: 'center' },
    routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    timeBadge: { backgroundColor: theme.colors.primary + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    timeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
    timelineItem: { flexDirection: 'row', minHeight: 80 },
    lineWrapper: { alignItems: 'center', width: 30, marginRight: 15 },
    dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: '#fff', zIndex: 1 },
    dotCompleted: { borderColor: theme.colors.green },
    dotPending: { borderColor: '#E0E0E0' },
    line: { width: 2, flex: 1, backgroundColor: '#E0E0E0', position: 'absolute', top: 14, bottom: 0 },
    stopCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 18, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F0F0F0' },
    completedStop: { backgroundColor: '#fff', borderColor: theme.colors.green + '20' },
    stopTextContainer: { flex: 1 },
    stopName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    completedText: { color: theme.colors.textLight, textDecorationLine: 'none' },
    stopTime: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, fontWeight: '500' }
});

export default TransportScreen;
