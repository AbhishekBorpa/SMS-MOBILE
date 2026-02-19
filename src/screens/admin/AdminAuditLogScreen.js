import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AdminAuditLogScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/audit`, config);
            setLogs(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    const renderItem = ({ item }) => {
        const date = new Date(item.createdAt).toLocaleString();
        return (
            <AppCard style={styles.logCard}>
                <View style={styles.headerRow}>
                    <View style={styles.actionBadge}>
                        <MaterialCommunityIcons name="shield-check" size={16} color="white" />
                        <Text style={styles.actionText}>{item.action}</Text>
                    </View>
                    <Text style={styles.dateText}>{date}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.entityText}>
                        <Text style={styles.label}>Entity: </Text>{item.entity} (ID: {item.entityId?.slice(-6)})
                    </Text>
                    <Text style={styles.userText}>
                        <Text style={styles.label}>By: </Text>{item.performedBy?.name || 'Unknown'}
                    </Text>
                </View>

                {item.details && (
                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsText} numberOfLines={2}>
                            {JSON.stringify(item.details)}
                        </Text>
                    </View>
                )}
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="System Audit Logs"
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon="shield-search"
                            title="No Logs Found"
                            description="System activities will appear here."
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    logCard: { marginBottom: 15, padding: 15, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    actionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    actionText: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
    dateText: { fontSize: 12, color: theme.colors.textLight },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    entityText: { fontSize: 13, color: theme.colors.text, flex: 1 },
    userText: { fontSize: 13, color: theme.colors.text, marginLeft: 10 },
    label: { fontWeight: 'bold', color: theme.colors.textLight },
    detailsBox: { backgroundColor: '#F0F0F0', padding: 8, borderRadius: 5, marginTop: 5 },
    detailsText: { fontSize: 11, fontFamily: 'monospace', color: '#555' }
});

export default AdminAuditLogScreen;
