import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react'; // Added imports
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';

const HealthWellnessScreen = ({ navigation }) => {
    // In a real app, these would come from an API. 
    // Initializing as empty/null to respect "no mock data" rule until backend is ready.
    const [healthStatus, setHealthStatus] = useState(null);
    const [cafeteriaMenu, setCafeteriaMenu] = useState([]);
    const [medicalLogs, setMedicalLogs] = useState([]);

    // Simulate "No Data" state for now since no API exists
    // Can be easily swapped with useEffect fetching logic later
    useEffect(() => {
        // Placeholder for future API call
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Health & Wellness"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="heart-pulse"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Health Status Section */}
                {healthStatus ? (
                    <AppCard padding={25}>
                        <View style={styles.healthStats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Height</Text>
                                <Text style={styles.statValue}>{healthStatus.height}</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Weight</Text>
                                <Text style={styles.statValue}>{healthStatus.weight}</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Status</Text>
                                <AppBadge label={healthStatus.status} type="success" />
                            </View>
                        </View>
                    </AppCard>
                ) : (
                    <AppCard padding={25}>
                        <View style={{ alignItems: 'center', padding: 10 }}>
                            <MaterialCommunityIcons name="heart-off" size={40} color={theme.colors.textLight} />
                            <Text style={{ marginTop: 10, color: theme.colors.textLight }}>No health records available.</Text>
                        </View>
                    </AppCard>
                )}

                <Text style={styles.sectionTitle}>📅 Cafeteria Menu (Week 1)</Text>
                {cafeteriaMenu.length > 0 ? (
                    cafeteriaMenu.map((item, i) => (
                        <AppCard key={i} padding={15} style={styles.menuCard}>
                            <View style={styles.menuRow}>
                                <View style={styles.dayBox}>
                                    <Text style={styles.dayText}>{item.day.substring(0, 3)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mealText}>{item.meal}</Text>
                                    <Text style={styles.mealType}>{item.type}</Text>
                                </View>
                                <MaterialCommunityIcons name="food-apple-outline" size={20} color={theme.colors.green} />
                            </View>
                        </AppCard>
                    ))
                ) : (
                    <EmptyState
                        icon="food-off-outline"
                        title="Menu Not Available"
                        description="The cafeteria menu has not been uploaded yet."
                        compact={true}
                    />
                )}

                <Text style={styles.sectionTitle}>🏥 Infirmary Visits</Text>
                {medicalLogs.length > 0 ? (
                    medicalLogs.map((log) => (
                        <AppCard key={log.id} padding={15} style={styles.logCard}>
                            <View style={styles.logHeader}>
                                <Text style={styles.logReason}>{log.reason}</Text>
                                <Text style={styles.logDate}>{log.date}</Text>
                            </View>
                            <Text style={styles.logNote}>{log.note}</Text>
                        </AppCard>
                    ))
                ) : (
                    <EmptyState
                        icon="medical-bag"
                        title="No Medical Logs"
                        description="No infirmary visits recorded."
                        compact={true}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    healthStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 8, textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
    verticalDivider: { width: 1, height: 40, backgroundColor: '#f0f0f0' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 30, marginBottom: 15 },
    menuCard: { marginBottom: 12 },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    dayBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
    dayText: { fontWeight: 'bold', color: theme.colors.primary, fontSize: 13 },
    mealText: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    mealType: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
    logCard: { marginBottom: 12, backgroundColor: '#FBFCFD' },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    logReason: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    logDate: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },
    logNote: { fontSize: 13, color: '#666', lineHeight: 18 }
});

export default HealthWellnessScreen;
