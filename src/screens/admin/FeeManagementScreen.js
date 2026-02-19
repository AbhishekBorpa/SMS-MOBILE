import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const FeeManagementScreen = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [feeStatus, setFeeStatus] = useState('Pending');
    const [feeAmount, setFeeAmount] = useState('');
    const [feeDueDate, setFeeDueDate] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/fees/students`, config);
            setStudents(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setFeeStatus(student.feeStatus || 'Pending');
        setFeeAmount(student.feeAmount?.toString() || '0');
        setFeeDueDate(student.feeDueDate ? new Date(student.feeDueDate).toISOString().split('T')[0] : '');
        setModalVisible(true);
    };

    const handleUpdateFee = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${API_URL}/fees/${selectedStudent._id}`, {
                feeStatus,
                feeAmount: Number(feeAmount),
                feeDueDate: feeDueDate || null
            }, config);

            setModalVisible(false);
            fetchStudents();
            Alert.alert('Success', 'Fee details updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update fee details');
        }
    };

    // Derived Stats
    const totalCollected = students
        .filter(s => s.feeStatus === 'Paid')
        .reduce((sum, s) => sum + (s.feeAmount || 0), 0);

    const totalPending = students
        .filter(s => s.feeStatus !== 'Paid')
        .reduce((sum, s) => sum + (s.feeAmount || 0), 0);

    const renderItem = ({ item }) => (
        <AppCard padding={15} style={styles.card} onPress={() => openEditModal(item)}>
            <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                    <View style={[styles.statusIndicator, { backgroundColor: item.feeStatus === 'Paid' ? theme.colors.success : theme.colors.warning }]} />
                    <View style={styles.info}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.subText}>{item._id?.slice(-6)?.toUpperCase()} • Grade 10</Text>
                    </View>
                </View>

                <View style={styles.cardRight}>
                    <Text style={[styles.amount, { color: item.feeStatus === 'Paid' ? theme.colors.success : theme.colors.text }]}>
                        ₹{item.feeAmount || 0}
                    </Text>
                    <Text style={styles.statusLabel}>{item.feeStatus?.toUpperCase()}</Text>
                </View>
            </View>
            {item.feeDueDate && item.feeStatus !== 'Paid' && (
                <View style={styles.dueAlert}>
                    <MaterialCommunityIcons name="clock-alert-outline" size={14} color={theme.colors.error} />
                    <Text style={styles.dueText}>Due by {new Date(item.feeDueDate).toLocaleDateString()}</Text>
                </View>
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Finance Ledger"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="plus-circle-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <>
                        <View style={styles.summaryContainer}>
                            <AppCard style={styles.summaryCard} padding={20}>
                                <Text style={styles.summaryTitle}>Financial Overview</Text>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>PENDING</Text>
                                        <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>₹{(totalPending / 1000).toFixed(1)}k</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryLabel}>COLLECTED</Text>
                                        <Text style={[styles.summaryValue, { color: theme.colors.success }]}>₹{(totalCollected / 1000).toFixed(1)}k</Text>
                                    </View>
                                </View>
                            </AppCard>
                        </View>

                        <Text style={styles.listHeader}>Student Ledger Accounts</Text>

                        <FlatList
                            data={students}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.center}>
                                    <Text style={styles.emptyText}>Empty Ledger</Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <KeyboardWrapper backgroundColor="#fff" style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Payment Record</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.studentSummary}>
                            <Text style={styles.summaryName}>{selectedStudent?.name}</Text>
                            <Text style={styles.summaryId}>Updating financial record</Text>
                        </View>

                        <Text style={styles.label}>TRANSACTION STATUS</Text>
                        <View style={styles.row}>
                            {['Pending', 'Paid', 'Overdue'].map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[styles.typeBtn, feeStatus === status && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                    onPress={() => setFeeStatus(status)}
                                >
                                    <Text style={[styles.typeText, feeStatus === status && { color: '#fff', fontWeight: '900' }]}>{status?.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>AMOUNT (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={feeAmount}
                            onChangeText={setFeeAmount}
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>DUE DATE (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={feeDueDate}
                            onChangeText={setFeeDueDate}
                        />

                        <AppButton
                            title="Save Changes"
                            onPress={handleUpdateFee}
                            style={{ marginTop: 10, marginBottom: 20 }}
                        />
                    </KeyboardWrapper>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    list: { padding: 20, paddingTop: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    summaryContainer: { padding: 20, paddingBottom: 10 },
    summaryCard: { backgroundColor: '#fff', borderRadius: 20 },
    summaryTitle: { fontSize: 13, fontWeight: '900', color: theme.colors.textLight, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryItem: { flex: 1 },
    summaryLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textLight, marginBottom: 4 },
    summaryValue: { fontSize: 24, fontWeight: '900' },
    divider: { width: 1, height: 40, backgroundColor: '#F0F0F0', marginHorizontal: 20 },

    listHeader: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginLeft: 20, marginBottom: 10 },

    card: { marginBottom: 12, borderRadius: 16 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusIndicator: { width: 4, height: 40, borderRadius: 2 },
    info: { justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    subText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },
    cardRight: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '900' },
    statusLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textLight, marginTop: 2 },

    dueAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 8, borderRadius: 8, marginTop: 12, gap: 6 },
    dueText: { fontSize: 12, color: theme.colors.error, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, elevation: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    studentSummary: { marginBottom: 25 },
    summaryName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    summaryId: { fontSize: 14, color: theme.colors.textLight },

    label: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 8, letterSpacing: 0.5 },
    row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
    typeText: { fontSize: 12, fontWeight: '600', color: theme.colors.textLight },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20, fontWeight: '600', color: theme.colors.text },
    emptyText: { color: theme.colors.textLight }
});

export default FeeManagementScreen;
