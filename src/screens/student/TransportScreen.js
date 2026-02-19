import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TransportScreen = ({ navigation }) => {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransportDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch all routes and pick the first one for now (MVP)
            const { data } = await axios.get(`${API_URL}/transport`, config);

            if (data && data.length > 0) {
                setRoute(data[0]);
            } else {
                setRoute(null);
            }
        } catch (error) {
            console.log('Error fetching transport:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransportDetails();
    }, []);

    const handleCallDriver = () => {
        if (route?.driverPhone) {
            Linking.openURL(`tel:${route.driverPhone}`);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="Transport Tracking" variant="primary" onBack={() => navigation.goBack()} />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!route) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="Transport Tracking" variant="primary" onBack={() => navigation.goBack()} />
                <ScrollView contentContainerStyle={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransportDetails(); }} />}>
                    <EmptyState
                        icon="bus-alert"
                        title="No Route Assigned"
                        description="Contact administration to assign a bus route."
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Transport Tracking"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="bus-clock"
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransportDetails(); }} />}
            >
                <AppCard padding={25}>
                    <View style={styles.busHeader}>
                        <View style={styles.busIconWrapper}>
                            <MaterialCommunityIcons name="bus-side" size={40} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.busLabel}>Assigned Bus</Text>
                            <Text style={styles.busNumber}>{route.vehicleNumber}</Text>
                            <Text style={styles.routeLabel} numberOfLines={1}>{route.routeName}</Text>
                        </View>
                        <AppBadge label="Active" type="success" />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.driverSection}>
                        <View style={styles.driverInfo}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.avatarText}>{(route.driverName || 'D').charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.driverLabel}>Primary Driver</Text>
                                <Text style={styles.driverName}>{route.driverName}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                            <MaterialCommunityIcons name="phone" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </AppCard>

                <View style={styles.routeHeader}>
                    <Text style={styles.sectionTitle}>Route Stops</Text>
                </View>

                {route.stops && route.stops.length > 0 ? (
                    route.stops.map((stop, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.lineWrapper}>
                                <View style={[styles.dot, styles.dotPending]} />
                                {index !== route.stops.length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.stopCard}>
                                <View style={styles.stopTextContainer}>
                                    <Text style={styles.stopName}>{stop.name || stop.stopName || 'Stop'}</Text>
                                    <Text style={styles.stopTime}>{stop.time || stop.arrivalTime || '--:--'}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>No stops defined for this route.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    busHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    busIconWrapper: { width: 70, height: 70, borderRadius: 20, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
    busLabel: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' },
    busNumber: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
    routeLabel: { fontSize: 13, color: theme.colors.textLight, marginTop: 2 },
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
    timelineItem: { flexDirection: 'row', minHeight: 80 },
    lineWrapper: { alignItems: 'center', width: 30, marginRight: 15 },
    dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: '#fff', zIndex: 1 },
    dotPending: { borderColor: theme.colors.primary },
    line: { width: 2, flex: 1, backgroundColor: '#E0E0E0', position: 'absolute', top: 14, bottom: 0 },
    stopCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 18, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F0F0F0' },
    stopTextContainer: { flex: 1 },
    stopName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    stopTime: { fontSize: 12, color: theme.colors.textLight, marginTop: 4, fontWeight: '500' }
});

export default TransportScreen;
