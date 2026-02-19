import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
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
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const RequisitionScreen = ({ navigation }) => {
    const [requisitions, setRequisitions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newRequest, setNewRequest] = useState({ itemId: '', quantity: '', reason: '' });
    const [selectedItemName, setSelectedItemName] = useState('Select Item');

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [reqRes, invRes] = await Promise.all([
                axios.get(`${API_URL}/requisition`, config),
                axios.get(`${API_URL}/inventory`, config)
            ]);

            setRequisitions(reqRes.data);
            setInventory(invRes.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequest = async () => {
        if (!newRequest.itemId || !newRequest.quantity) {
            Alert.alert('Error', 'Item and Quantity are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/requisition`, newRequest, config);
            setModalVisible(false);
            setNewRequest({ itemId: '', quantity: '', reason: '' });
            setSelectedItemName('Select Item');
            fetchData();
        } catch (error) {
            Alert.alert('Error', 'Failed to submit request');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.itemName}>{item.item?.name || 'Unknown Item'}</Text>
                    <Text style={styles.reqDetails}>{item.quantity} required • {item.item?.category}</Text>
                </View>
                <AppBadge label={item.status} type={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'} />
            </View>
            {item.reason && (
                <Text style={styles.reason}>"{item.reason}"</Text>
            )}
            <Text style={styles.date}>{new Date(item.createdAt).toDateString()}</Text>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Resource Requisition"
                subtitle="Request supplies from admin"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={requisitions}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                    ListEmptyComponent={<EmptyState icon="basket-plus" title="No Requests" description="Request items from inventory." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>New Request</Text>

                            <Text style={styles.label}>Select Item</Text>
                            <View style={styles.inventoryList}>
                                <FlatList
                                    data={inventory}
                                    keyExtractor={item => item._id}
                                    nestedScrollEnabled
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.invItem, newRequest.itemId === item._id && styles.selectedInvItem]}
                                            onPress={() => {
                                                setNewRequest({ ...newRequest, itemId: item._id });
                                                setSelectedItemName(item.name);
                                            }}
                                        >
                                            <Text style={[styles.invText, newRequest.itemId === item._id && styles.selectedInvText]}>{item.name}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>

                            <AppInput
                                label="Quantity"
                                placeholder="e.g. 5"
                                keyboardType="numeric"
                                value={newRequest.quantity}
                                onChangeText={t => setNewRequest({ ...newRequest, quantity: t })}
                            />
                            <AppInput
                                label="Reason (Optional)"
                                placeholder="e.g. For Grade 10 Experiment"
                                value={newRequest.reason}
                                onChangeText={t => setNewRequest({ ...newRequest, reason: t })}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Submit" onPress={handleRequest} style={{ flex: 1 }} />
                            </View>
                        </KeyboardWrapper>
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    reqDetails: { fontSize: 13, color: theme.colors.textLight },
    reason: { fontSize: 13, color: theme.colors.text, fontStyle: 'italic', marginTop: 5 },
    date: { fontSize: 11, color: theme.colors.textLight, marginTop: 10, textAlign: 'right' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 },
    label: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginLeft: 4 },
    inventoryList: { maxHeight: 150, marginBottom: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 10 },
    invItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    selectedInvItem: { backgroundColor: theme.colors.primary + '10' },
    invText: { fontSize: 14, color: theme.colors.text },
    selectedInvText: { color: theme.colors.primary, fontWeight: 'bold' }
});

export default RequisitionScreen;
