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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AdminLeaveScreen = ({ navigation }) => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchNotices = async () => {
        // Just for consistency check if needed elsewhere, but fetchLeaves is primary here
    };

    const fetchLeaves = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/leaves`, config);
            setLeaves(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/leaves/${id}`, { status }, config);
            fetchLeaves(); // Refresh
            Alert.alert('Success', `Leave request ${status.toLowerCase()}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.leaveCard} padding={20}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatarBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                        {item.teacher?.name ? item.teacher.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{item.teacher?.name}</Text>
                    <Text style={styles.leaveMeta}>{item.leaveType} Leave Application</Text>
                </View>
                <AppBadge
                    label={item.status}
                    type={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'danger' : 'warning'}
                />
            </View>

            <View style={styles.detailsBox}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-range" size={18} color={theme.colors.primary} />
                    <View>
                        <Text style={styles.detailLabel}>DURATION</Text>
                        <Text style={styles.dateText}>
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>REASON FOR REQUEST</Text>
                <Text style={styles.reasonText}>"{item.reason}"</Text>
            </View>

            {item.status === 'Pending' && (
                <View style={styles.actionRow}>
                    <AppButton
                        title="Approve"
                        icon="check-circle-outline"
                        onPress={() => handleUpdateStatus(item._id, 'Approved')}
                        style={styles.approveBtn}
                        size="small"
                    />
                    <AppButton
                        title="Reject"
                        type="danger"
                        icon="close-circle-outline"
                        onPress={() => handleUpdateStatus(item._id, 'Rejected')}
                        style={styles.rejectBtn}
                        size="small"
                    />
                </View>
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Staff Leave Requests"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="account-check-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={leaves}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="calendar-check-outline"
                                title="No pending requests"
                                description="All staff leave applications have been processed."
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20, paddingBottom: 40 },
    leaveCard: { marginBottom: 20, elevation: 4 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontWeight: '900', fontSize: 20 },
    teacherInfo: { flex: 1 },
    teacherName: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    leaveMeta: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    detailsBox: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 0.5, marginBottom: 2 },
    dateText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
    reasonBox: { paddingHorizontal: 5, marginBottom: 25 },
    reasonLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 8 },
    reasonText: { color: theme.colors.textLight, fontSize: 14, lineHeight: 22, fontStyle: 'italic', fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: 12 },
    approveBtn: { flex: 1 },
    rejectBtn: { flex: 1 }
});

export default AdminLeaveScreen;
