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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const InventoryListScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: '', quantity: '', location: '' });

    const fetchInventory = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/inventory`, config);
            setItems(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.quantity) {
            Alert.alert('Error', 'Name and Quantity are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/inventory`, newItem, config);
            setModalVisible(false);
            setNewItem({ name: '', category: '', quantity: '', location: '' });
            fetchInventory();
        } catch (error) {
            Alert.alert('Error', 'Failed to add item');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category} • {item.location || 'No Location'}</Text>
                </View>
                <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
                </View>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Inventory & Assets"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInventory(); }} />}
                    ListEmptyComponent={<EmptyState icon="archive" title="Inventory Empty" description="Tap + to add new assets." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>Add New Item</Text>

                            <AppInput
                                label="Item Name"
                                placeholder="e.g. Microscope, Desk Chair"
                                value={newItem.name}
                                onChangeText={t => setNewItem({ ...newItem, name: t })}
                            />
                            <AppInput
                                label="Category"
                                placeholder="e.g. Lab, Furniture, IT"
                                value={newItem.category}
                                onChangeText={t => setNewItem({ ...newItem, category: t })}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ width: '48%' }}>
                                    <AppInput
                                        label="Quantity"
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={newItem.quantity}
                                        onChangeText={t => setNewItem({ ...newItem, quantity: t })}
                                    />
                                </View>
                                <View style={{ width: '48%' }}>
                                    <AppInput
                                        label="Location"
                                        placeholder="e.g. Room 101"
                                        value={newItem.location}
                                        onChangeText={t => setNewItem({ ...newItem, location: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Save Item" onPress={handleAddItem} style={{ flex: 1 }} />
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    itemCategory: { fontSize: 12, color: theme.colors.textLight, marginTop: 4 },
    qtyBadge: { backgroundColor: theme.colors.primary + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    qtyText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default InventoryListScreen;
