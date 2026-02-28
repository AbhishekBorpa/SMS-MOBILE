import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const STATUS_CONFIG = {
    Pending: { color: '#F59E0B', bg: '#FFFBEB', icon: 'clock-outline' },
    Approved: { color: '#10B981', bg: '#ECFDF5', icon: 'check-circle-outline' },
    Rejected: { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline' },
};

const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent'];

const RequisitionScreen = ({ navigation }) => {
    const [requisitions, setRequisitions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedItem, setSelectedItem] = useState(null);
    const [manualItemName, setManualItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [useManual, setUseManual] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [reqRes, invRes] = await Promise.all([
                axios.get(`${API_URL}/requisition`, config),
                axios.get(`${API_URL}/inventory`, config),
            ]);
            setRequisitions(reqRes.data);
            setInventory(invRes.data);
        } catch (error) {
            console.log('Requisition fetch error:', error?.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openModal = () => {
        setSelectedItem(null);
        setManualItemName('');
        setQuantity('');
        setReason('');
        setPriority('Medium');
        setItemSearchQuery('');
        setUseManual(inventory.length === 0);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        const itemName = useManual ? manualItemName.trim() : selectedItem?.name;
        const itemId = useManual ? null : selectedItem?._id;

        if (!itemName && !itemId) {
            Alert.alert('Missing Item', 'Please select or enter an item name.');
            return;
        }
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/requisition`, {
                itemId: itemId || undefined,
                itemName: itemName || undefined,
                quantity: Number(quantity),
                reason,
                priority,
            }, config);

            setModalVisible(false);
            fetchData();
            Alert.alert('✅ Submitted', 'Your resource request has been sent to admin.');
        } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

    const renderRequisition = ({ item }) => {
        const status = item.status || 'Pending';
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
        const priority = item.priority || 'Medium';

        return (
            <View style={styles.reqCard}>
                <View style={styles.reqCardLeft}>
                    <View style={[styles.reqIcon, { backgroundColor: cfg.bg }]}>
                        <MaterialCommunityIcons name="basket-outline" size={22} color={cfg.color} />
                    </View>
                </View>
                <View style={styles.reqBody}>
                    <View style={styles.reqTopRow}>
                        <Text style={styles.reqItemName}>{item.item?.name || item.itemName || 'Unknown Item'}</Text>
                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <MaterialCommunityIcons name={cfg.icon} size={12} color={cfg.color} />
                            <Text style={[styles.statusPillText, { color: cfg.color }]}>{status}</Text>
                        </View>
                    </View>
                    <Text style={styles.reqMeta}>
                        Qty: {item.quantity}
                        {item.priority ? ` · ${item.priority}` : ''}
                        {item.item?.category ? ` · ${item.item.category}` : ''}
                    </Text>
                    {item.reason ? <Text style={styles.reqReason}>"{item.reason}"</Text> : null}
                    <Text style={styles.reqDate}>{new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
            </View>
        );
    };

    // Stats
    const pendingCount = requisitions.filter(r => r.status === 'Pending').length;
    const approvedCount = requisitions.filter(r => r.status === 'Approved').length;
    const rejectedCount = requisitions.filter(r => r.status === 'Rejected').length;

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Resource Requisition"
                subtitle="Request supplies from admin"
                onBack={() => navigation.goBack()}
                rightIcon="plus-circle"
                onRightPress={openModal}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={requisitions}
                    renderItem={renderRequisition}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                    ListHeaderComponent={
                        requisitions.length > 0 ? (
                            <View style={styles.statsRow}>
                                <View style={[styles.statChip, { backgroundColor: '#FFFBEB' }]}>
                                    <Text style={[styles.statNum, { color: '#F59E0B' }]}>{pendingCount}</Text>
                                    <Text style={styles.statLbl}>Pending</Text>
                                </View>
                                <View style={[styles.statChip, { backgroundColor: '#ECFDF5' }]}>
                                    <Text style={[styles.statNum, { color: '#10B981' }]}>{approvedCount}</Text>
                                    <Text style={styles.statLbl}>Approved</Text>
                                </View>
                                <View style={[styles.statChip, { backgroundColor: '#FEF2F2' }]}>
                                    <Text style={[styles.statNum, { color: '#EF4444' }]}>{rejectedCount}</Text>
                                    <Text style={styles.statLbl}>Rejected</Text>
                                </View>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <MaterialCommunityIcons name="basket-plus-outline" size={58} color={theme.colors.primary + '30'} />
                            <Text style={styles.emptyTitle}>No Requests Yet</Text>
                            <Text style={styles.emptyDesc}>Tap the + button to request resources from admin.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.9}>
                <LinearGradient colors={theme.gradients.primary} style={styles.fabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ——— Request Modal ——— */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kavWrapper}>
                        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
                            <View style={styles.modalHandle} />

                            {/* Header */}
                            <View style={styles.modalHeaderRow}>
                                <View style={[styles.modalIconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <MaterialCommunityIcons name="basket-plus" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>New Resource Request</Text>
                                    <Text style={styles.modalSub}>Request supplies from administration</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                                {/* Item Selection */}
                                <Text style={styles.sectionLabel}>SELECT ITEM</Text>

                                {/* Toggle: inventory vs manual */}
                                {inventory.length > 0 && (
                                    <View style={styles.modeToggleRow}>
                                        <TouchableOpacity
                                            style={[styles.modeBtn, !useManual && styles.modeBtnActive]}
                                            onPress={() => setUseManual(false)}
                                        >
                                            <Text style={[styles.modeBtnText, !useManual && styles.modeBtnTextActive]}>From Inventory</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modeBtn, useManual && styles.modeBtnActive]}
                                            onPress={() => setUseManual(true)}
                                        >
                                            <Text style={[styles.modeBtnText, useManual && styles.modeBtnTextActive]}>Type Manually</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {useManual || inventory.length === 0 ? (
                                    <View style={styles.inputBox}>
                                        <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.colors.textLight} />
                                        <TextInput
                                            style={styles.inputText}
                                            placeholder="Enter item name..."
                                            placeholderTextColor={theme.colors.textLight}
                                            value={manualItemName}
                                            onChangeText={setManualItemName}
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        <View style={styles.inputBox}>
                                            <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textLight} />
                                            <TextInput
                                                style={styles.inputText}
                                                placeholder="Search inventory..."
                                                placeholderTextColor={theme.colors.textLight}
                                                value={itemSearchQuery}
                                                onChangeText={setItemSearchQuery}
                                            />
                                        </View>
                                        <View style={styles.inventoryList}>
                                            {filteredInventory.map(item => (
                                                <TouchableOpacity
                                                    key={item._id}
                                                    style={[styles.inventoryItem, selectedItem?._id === item._id && styles.inventoryItemSelected]}
                                                    onPress={() => setSelectedItem(item)}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={selectedItem?._id === item._id ? 'checkbox-marked-circle' : 'circle-outline'}
                                                        size={18}
                                                        color={selectedItem?._id === item._id ? theme.colors.primary : theme.colors.textLight}
                                                    />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.inventoryItemName, selectedItem?._id === item._id && { color: theme.colors.primary }]}>
                                                            {item.name}
                                                        </Text>
                                                        <Text style={styles.inventoryItemMeta}>{item.category} · Stock: {item.quantity}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                            {filteredInventory.length === 0 && (
                                                <Text style={styles.noInventoryText}>No matching items found</Text>
                                            )}
                                        </View>
                                    </View>
                                )}

                                {/* Quantity */}
                                <Text style={[styles.sectionLabel, { marginTop: 18 }]}>QUANTITY</Text>
                                <View style={styles.inputBox}>
                                    <MaterialCommunityIcons name="numeric" size={18} color={theme.colors.textLight} />
                                    <TextInput
                                        style={styles.inputText}
                                        placeholder="How many do you need?"
                                        placeholderTextColor={theme.colors.textLight}
                                        keyboardType="numeric"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                    />
                                </View>

                                {/* Priority */}
                                <Text style={[styles.sectionLabel, { marginTop: 18 }]}>PRIORITY</Text>
                                <View style={styles.priorityRow}>
                                    {PRIORITY_LEVELS.map(p => {
                                        const colors = { Low: '#6B7280', Medium: '#3B82F6', High: '#F59E0B', Urgent: '#EF4444' };
                                        const isActive = priority === p;
                                        return (
                                            <TouchableOpacity
                                                key={p}
                                                style={[styles.priorityBtn, isActive && { backgroundColor: colors[p], borderColor: colors[p] }]}
                                                onPress={() => setPriority(p)}
                                            >
                                                <Text style={[styles.priorityBtnText, isActive && { color: '#fff' }]}>{p}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Reason */}
                                <Text style={[styles.sectionLabel, { marginTop: 18 }]}>REASON (Optional)</Text>
                                <View style={[styles.inputBox, styles.textAreaBox]}>
                                    <TextInput
                                        style={[styles.inputText, styles.textArea]}
                                        placeholder="Why do you need this? (e.g. Grade 10 experiment)"
                                        placeholderTextColor={theme.colors.textLight}
                                        multiline
                                        numberOfLines={3}
                                        value={reason}
                                        onChangeText={setReason}
                                    />
                                </View>

                                {/* Submit */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setModalVisible(false)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                        onPress={handleSubmit}
                                        disabled={submitting}
                                        activeOpacity={0.85}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                                                <Text style={styles.submitBtnText}>Submit Request</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 20 }} />
                            </ScrollView>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 100 },

    // Stats row
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statChip: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16 },
    statNum: { fontSize: 22, fontWeight: '900' },
    statLbl: { fontSize: 11, color: '#6B7280', fontWeight: '700', marginTop: 2 },

    // Requisition card
    reqCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0', ...theme.shadows.sm },
    reqCardLeft: { width: 56, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 18, gap: 4, backgroundColor: '#FAFAFA' },
    reqIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    reqBody: { flex: 1, padding: 16 },
    reqTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    reqItemName: { fontSize: 15, fontWeight: '800', color: theme.colors.text, flex: 1, marginRight: 8 },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusPillText: { fontSize: 11, fontWeight: '800' },
    reqMeta: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500', marginBottom: 4 },
    reqReason: { fontSize: 12, color: theme.colors.text, fontStyle: 'italic', marginTop: 4 },
    reqDate: { fontSize: 11, color: theme.colors.textLight, marginTop: 8 },

    // Empty state
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
    emptyDesc: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },

    // FAB
    fab: { position: 'absolute', bottom: 28, right: 24, borderRadius: 30, ...theme.shadows.lg },
    fabGrad: { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    kavWrapper: { justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
    modalIconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 17, fontWeight: '900', color: theme.colors.text },
    modalSub: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500', marginTop: 2 },
    modalCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F4F6F8', justifyContent: 'center', alignItems: 'center' },
    sectionLabel: { fontSize: 11, color: theme.colors.textLight, fontWeight: '800', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },

    // Mode toggle
    modeToggleRow: { flexDirection: 'row', backgroundColor: '#F4F6F8', borderRadius: 14, padding: 4, marginBottom: 12 },
    modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
    modeBtnActive: { backgroundColor: '#fff', ...theme.shadows.sm },
    modeBtnText: { fontSize: 13, fontWeight: '700', color: theme.colors.textLight },
    modeBtnTextActive: { color: theme.colors.primary },

    // Input
    inputBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F9FA', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 4 },
    inputText: { flex: 1, fontSize: 14, color: theme.colors.text, fontWeight: '500' },
    textAreaBox: { alignItems: 'flex-start', minHeight: 80 },
    textArea: { minHeight: 60, textAlignVertical: 'top' },

    // Inventory list
    inventoryList: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 16, marginBottom: 4, maxHeight: 180, overflow: 'hidden' },
    inventoryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    inventoryItemSelected: { backgroundColor: theme.colors.primary + '08' },
    inventoryItemName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
    inventoryItemMeta: { fontSize: 11, color: theme.colors.textLight, fontWeight: '500', marginTop: 2 },
    noInventoryText: { textAlign: 'center', padding: 20, color: theme.colors.textLight, fontSize: 13 },

    // Priority
    priorityRow: { flexDirection: 'row', gap: 8 },
    priorityBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 14, backgroundColor: '#F4F6F8', borderWidth: 1.5, borderColor: '#E5E7EB' },
    priorityBtnText: { fontSize: 12, fontWeight: '800', color: theme.colors.textLight },

    // Action buttons
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 18, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
    cancelBtnText: { fontSize: 14, fontWeight: '800', color: theme.colors.textLight },
    submitBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...theme.shadows.md },
    submitBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

export default RequisitionScreen;
