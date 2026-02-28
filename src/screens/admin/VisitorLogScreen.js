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

const VisitorLogScreen = ({ navigation }) => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newVisitor, setNewVisitor] = useState({ name: '', mobileNumber: '', purpose: '', host: '' });

    const fetchVisitors = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/visitors`, config);
            setVisitors(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, []);

    const handleAddVisitor = async () => {
        if (!newVisitor.name || !newVisitor.purpose) {
            Alert.alert('Error', 'Name and Purpose are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/visitors`, newVisitor, config);
            setModalVisible(false);
            setNewVisitor({ name: '', mobileNumber: '', purpose: '', host: '' });
            fetchVisitors();
        } catch (error) {
            Alert.alert('Error', 'Failed to log visitor');
        }
    };

    const handleExit = async (id) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/visitors/${id}/exit`, {}, config);
            fetchVisitors();
        } catch (error) {
            Alert.alert('Error', 'Failed to mark exit');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.visitorName}>{item.name}</Text>
                    <Text style={styles.visitorPurpose}>{item.purpose} • {item.mobileNumber}</Text>
                </View>
                <AppBadge
                    label={item.status}
                    type={item.status === 'In' ? 'success' : 'neutral'}
                />
            </View>
            <View style={styles.timingRow}>
                <Text style={styles.timeText}>In: {new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                {item.exitTime && (
                    <Text style={styles.timeText}>Out: {new Date(item.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                )}
            </View>
            {item.status === 'In' && (
                <AppButton
                    title="Mark Exit"
                    onPress={() => handleExit(item._id)}
                    type="secondary"
                    size="small"
                    style={{ marginTop: 10 }}
                />
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Visitor Log"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={visitors}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisitors(); }} />}
                    ListEmptyComponent={<EmptyState icon="account-clock" title="No Visitors" description="Log entries will appear here." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <Text style={styles.modalTitle}>New Visitor Entry</Text>

                            <AppInput
                                label="Visitor Name"
                                placeholder="Full Name"
                                value={newVisitor.name}
                                onChangeText={t => setNewVisitor({ ...newVisitor, name: t })}
                            />
                            <AppInput
                                label="Mobile Number"
                                placeholder="10-digit number"
                                keyboardType="phone-pad"
                                value={newVisitor.mobileNumber}
                                onChangeText={t => setNewVisitor({ ...newVisitor, mobileNumber: t })}
                            />
                            <AppInput
                                label="Purpose"
                                placeholder="e.g. Admission, Meeting"
                                value={newVisitor.purpose}
                                onChangeText={t => setNewVisitor({ ...newVisitor, purpose: t })}
                            />
                            <AppInput
                                label="Host / Meeting With"
                                placeholder="Optional"
                                value={newVisitor.host}
                                onChangeText={t => setNewVisitor({ ...newVisitor, host: t })}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Log Entry" onPress={handleAddVisitor} style={{ flex: 1 }} />
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
    card: { marginBottom: 15, padding: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    visitorName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    visitorPurpose: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
    timingRow: { marginTop: 10, flexDirection: 'row', gap: 15 },
    timeText: { fontSize: 12, color: theme.colors.textLight, fontFamily: 'monospace' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default VisitorLogScreen;
