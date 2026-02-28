import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TeacherLeaveScreen = ({ navigation }) => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [leaveType, setLeaveType] = useState('Sick');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

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

    const handleApplyLeave = async () => {
        if (!reason) {
            Alert.alert('Error', 'Please provide a reason');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/leaves`, {
                leaveType,
                startDate,
                endDate,
                reason
            }, config);

            setModalVisible(false);
            setReason('');
            fetchLeaves();
            Alert.alert('Success', 'Leave application submitted');
        } catch (error) {
            Alert.alert('Error', 'Failed to apply for leave');
        } finally {
            setSubmitting(false);
        }
    };

    const getLeaveIcon = (type) => {
        switch (type) {
            case 'Sick': return 'medical-bag';
            case 'Casual': return 'beach';
            case 'Emergency': return 'alert-decagram';
            default: return 'calendar-clock';
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.leaveCard} padding={20}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <MaterialCommunityIcons name={getLeaveIcon(item.leaveType)} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.cardTitleSection}>
                    <Text style={styles.leaveType}>{item.leaveType} Leave</Text>
                    <Text style={styles.dateRange}>
                        {new Date(item.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {new Date(item.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
                <AppBadge
                    label={item.status}
                    type={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'danger' : 'warning'}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>REASON</Text>
                <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Leave Planner"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="calendar-clock-outline"
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
                                icon="calendar-blank-outline"
                                title="No leave requests"
                                description="Your application history will be listed here."
                            />
                        }
                    />
                )}
            </View>

            <View style={styles.fabContainer}>
                <AppButton
                    title="Apply For Leave"
                    icon="plus"
                    onPress={() => setModalVisible(true)}
                    style={styles.fab}
                />
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Leave Application</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <View style={styles.typeBlock}>
                                <Text style={styles.sectionLabel}>LEAVE TYPE</Text>
                                <View style={styles.typeRow}>
                                    {['Sick', 'Casual', 'Emergency'].map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeBtn,
                                                leaveType === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                            ]}
                                            onPress={() => setLeaveType(type)}
                                        >
                                            <MaterialCommunityIcons
                                                name={getLeaveIcon(type)}
                                                size={20}
                                                color={leaveType === type ? '#fff' : theme.colors.textLight}
                                            />
                                            <Text style={[styles.typeBtnText, leaveType === type && { color: '#fff' }]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.dateRow}>
                                <AppInput
                                    label="From"
                                    placeholder="YYYY-MM-DD"
                                    icon="calendar-export"
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    containerStyle={{ flex: 1 }}
                                />
                                <AppInput
                                    label="To"
                                    placeholder="YYYY-MM-DD"
                                    icon="calendar-import"
                                    value={endDate}
                                    onChangeText={setEndDate}
                                    containerStyle={{ flex: 1 }}
                                />
                            </View>

                            <AppInput
                                label="Reason"
                                placeholder="Explain the context..."
                                value={reason}
                                onChangeText={setReason}
                                multiline={true}
                                style={styles.textArea}
                                icon="text-box-search-outline"
                            />

                            <AppButton
                                title="Submit Application"
                                onPress={handleApplyLeave}
                                loading={submitting}
                                icon="send-outline"
                                style={styles.submitBtn}
                            />
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20, paddingBottom: 100 },
    leaveCard: { marginBottom: 20, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitleSection: { flex: 1 },
    leaveType: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    dateRange: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    reasonBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
    reasonLabel: { fontSize: 9, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 0.5, marginBottom: 4 },
    reasonText: { fontSize: 13, color: theme.colors.textLight, lineHeight: 18, fontWeight: '500' },
    fabContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    fab: { borderRadius: 30, elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 40, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    closeBtn: { backgroundColor: '#F5F5F5', padding: 8, borderRadius: 12 },
    sectionLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
    typeBlock: { marginBottom: 25 },
    typeRow: { flexDirection: 'row', gap: 10 },
    typeBtn: { flex: 1, height: 70, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', gap: 6 },
    typeBtnText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textLight },
    dateRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
    textArea: { height: 100 },
    submitBtn: { marginTop: 20 }
});

export default TeacherLeaveScreen;
