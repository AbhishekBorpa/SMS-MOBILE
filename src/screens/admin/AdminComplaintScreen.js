import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AdminComplaintScreen = ({ navigation }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/complaints`, config);
            setComplaints(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/complaints/${id}`, {}, config);
            fetchComplaints();
            Alert.alert('Success', 'Complaint marked as resolved');
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard padding={20} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerMain}>
                    <View style={[styles.priorityTab, { backgroundColor: item.status === 'Resolved' ? theme.colors.green : theme.colors.primary }]} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.authorBadge}>
                            <MaterialCommunityIcons name={item.isAnonymous ? "incognito" : "account-outline"} size={14} color={theme.colors.textLight} />
                            <Text style={styles.authorText}> {item.isAnonymous ? 'Incognito' : item.user?.name}</Text>
                            <Text style={styles.roleLabel}> • {item.user?.role?.toUpperCase() || 'USER'}</Text>
                        </View>
                    </View>
                </View>
                <AppBadge
                    label={item.status.toUpperCase()}
                    type={item.status === 'Resolved' ? 'success' : 'warning'}
                />
            </View>

            <View style={styles.descContainer}>
                <Text style={styles.desc}>{item.description}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.dateInfo}>
                    <MaterialCommunityIcons name="calendar-clock-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.dateText}> {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>

                {item.status === 'Pending' && (
                    <AppButton
                        title="Resolve"
                        onPress={() => handleResolve(item._id)}
                        size="small"
                        icon="check-decagram-outline"
                        style={{ minWidth: 120 }}
                    />
                )}
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Redressal Center"
                onBack={() => navigation.goBack()}
                rightIcon="shield-alert-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={complaints}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <MaterialCommunityIcons name="shield-check-outline" size={80} color="#E0E0E0" />
                                <Text style={styles.emptyText}>Peace & Quiet</Text>
                                <Text style={styles.emptySubText}>No pending complaints at the moment.</Text>
                            </View>
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
    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    emptySubText: { textAlign: 'center', color: theme.colors.textLight, fontSize: 14, marginTop: 8 },
    card: { marginBottom: 20, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    headerMain: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
    priorityTab: { width: 4, height: 35, borderRadius: 2, marginRight: 12 },
    titleContainer: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    authorBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    authorText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },
    roleLabel: { fontSize: 10, color: theme.colors.textLight, fontWeight: '900', letterSpacing: 0.5 },
    descContainer: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0' },
    desc: { fontSize: 15, color: theme.colors.text, lineHeight: 22, fontWeight: '500' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' }
});

export default AdminComplaintScreen;
