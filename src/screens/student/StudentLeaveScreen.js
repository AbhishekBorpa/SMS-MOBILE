import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const StudentLeaveScreen = ({ navigation }) => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [application, setApplication] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        type: 'Sick'
    });

    const leaveTypes = ['Sick', 'Casual', 'Emergency', 'Other'];

    const fetchLeaves = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/student-leave`, config);
            setLeaves(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleApply = async () => {
        if (!application.reason) {
            Alert.alert('Error', 'Reason is required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/student-leave`, application, config);
            setModalVisible(false);
            setApplication({
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                reason: '',
                type: 'Sick'
            });
            Alert.alert('Success', 'Leave application submitted');
            fetchLeaves();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit application');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.type}>{item.type} Leave</Text>
                    <Text style={styles.date}>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</Text>
                </View>
                <AppBadge label={item.status} type={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'} />
            </View>
            <Text style={styles.reason}>"{item.reason}"</Text>
            {item.adminNotes && (
                <View style={styles.responseBox}>
                    <Text style={styles.responseTitle}>Admin Response:</Text>
                    <Text style={styles.responseText}>{item.adminNotes}</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Leave Application"
                subtitle="Request time off"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={leaves}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaves(); }} />}
                    ListEmptyComponent={<EmptyState icon="calendar-remove" title="No Applications" description="Apply for leave when needed." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <Text style={styles.modalTitle}>Apply for Leave</Text>

                            <Text style={styles.label}>Leave Type</Text>
                            <View style={styles.typeRow}>
                                {leaveTypes.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeChip, application.type === t && styles.activeChip]}
                                        onPress={() => setApplication({ ...application, type: t })}
                                    >
                                        <Text style={[styles.typeText, application.type === t && styles.activeTypeText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <AppInput
                                label="Start Date (YYYY-MM-DD)"
                                placeholder="2023-11-20"
                                value={application.startDate}
                                onChangeText={t => setApplication({ ...application, startDate: t })}
                            />
                            <AppInput
                                label="End Date (YYYY-MM-DD)"
                                placeholder="2023-11-22"
                                value={application.endDate}
                                onChangeText={t => setApplication({ ...application, endDate: t })}
                            />
                            <AppInput
                                label="Reason"
                                placeholder="Why do you need leave?"
                                value={application.reason}
                                onChangeText={t => setApplication({ ...application, reason: t })}
                                multiline
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Apply" onPress={handleApply} style={{ flex: 1 }} />
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    type: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    date: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
    reason: { fontSize: 14, color: theme.colors.text, marginTop: 10, fontStyle: 'italic' },
    responseBox: { marginTop: 15, padding: 10, backgroundColor: '#F0F0F0', borderRadius: 8 },
    responseTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textLight },
    responseText: { fontSize: 13, color: theme.colors.text, marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginLeft: 4 },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#eee' },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    typeText: { fontSize: 12, color: theme.colors.textLight },
    activeTypeText: { color: 'white', fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default StudentLeaveScreen;
