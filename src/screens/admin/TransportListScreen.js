import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TransportListScreen = ({ navigation }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRoutes();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchRoutes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/transport`, config);
            setRoutes(data);
        } catch (error) {
            console.log('Error fetching transport routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AddTransport', { route: item })}
        >
            <AppCard padding={15} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.busIconCircle}>
                        <MaterialCommunityIcons name="bus" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.routeName}>{item.routeName}</Text>
                        <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.stops?.length || 0} Stops</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="steering" size={16} color={theme.colors.textLight} />
                        <Text style={styles.detailText}>{item.driverName}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="phone" size={16} color={theme.colors.textLight} />
                        <Text style={styles.detailText}>{item.driverPhone}</Text>
                    </View>
                </View>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transport Management</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={routes}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<EmptyState icon="bus-alert" title="No Routes Found" description="Add a new transport route to get started." />}
                />
            )}

            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => navigation.navigate('AddTransport')}
                activeOpacity={0.9}
            >
                <LinearGradient colors={theme.gradients.primary} style={styles.fab}>
                    <MaterialCommunityIcons name="plus" size={30} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    busIconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerInfo: { flex: 1 },
    routeName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    vehicleNumber: { fontSize: 13, color: theme.colors.textLight, marginTop: 2, fontWeight: '600' },
    statusBadge: { backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textLight },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, color: theme.colors.text },
    fabContainer: { position: 'absolute', right: 25, bottom: 30, elevation: 5 },
    fab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});

export default TransportListScreen;
