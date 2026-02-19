import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const CanteenScreen = ({ navigation }) => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState({}); // { itemId: quantity }
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [orderHistoryVisible, setOrderHistoryVisible] = useState(false);
    const [orders, setOrders] = useState([]);

    const fetchMenu = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/canteen/menu`, config);
            setMenu(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/canteen/orders`, config);
            setOrders(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const addToCart = (item) => {
        setCart(prev => ({ ...prev, [item._id]: (prev[item._id] || 0) + 1 }));
    };

    const removeFromCart = (item) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[item._id] > 1) {
                newCart[item._id] -= 1;
            } else {
                delete newCart[item._id];
            }
            return newCart;
        });
    };

    const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
        const item = menu.find(i => i._id === id);
        return total + (item ? item.price * qty : 0);
    }, 0);

    const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

    const placeOrder = async () => {
        if (cartItemCount === 0) return;
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const items = Object.entries(cart).map(([itemId, quantity]) => ({ itemId, quantity }));

            await axios.post(`${API_URL}/canteen/order`, { items, pickupTime: 'Next Break' }, config);

            Alert.alert('Success', 'Order placed successfully! Pickup at next break.');
            setCart({});
            setOrderHistoryVisible(true);
            fetchOrders();
        } catch (error) {
            Alert.alert('Error', 'Order failed');
        }
    };

    const filteredMenu = activeCategory === 'All' ? menu : menu.filter(m => m.category === activeCategory);
    const categories = ['All', ...new Set(menu.map(m => m.category))];

    const renderItem = ({ item }) => (
        <View style={styles.menuItem}>
            <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.primary + '10' }]}>
                <MaterialCommunityIcons name="food" size={30} color={theme.colors.primary} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <Text style={styles.itemCat}>{item.category}</Text>
            </View>
            <View style={styles.quantityControl}>
                {cart[item._id] ? (
                    <>
                        <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.qBtn}>
                            <MaterialCommunityIcons name="minus" size={16} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.qText}>{cart[item._id]}</Text>
                        <TouchableOpacity onPress={() => addToCart(item)} style={styles.qBtn}>
                            <MaterialCommunityIcons name="plus" size={16} color="white" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity onPress={() => addToCart(item)} style={styles.addBtn}>
                        <Text style={styles.addBtnText}>ADD</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="School Canteen"
                subtitle="Pre-order your snacks"
                onBack={() => navigation.goBack()}
                rightIcon="history"
                onRightPress={() => { setOrderHistoryVisible(true); fetchOrders(); }}
            />

            <View style={styles.categoryRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.categoryChip, activeCategory === c && styles.activeChip]}
                            onPress={() => setActiveCategory(c)}
                        >
                            <Text style={[styles.categoryText, activeCategory === c && styles.activeCategoryText]}>{c}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={filteredMenu}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMenu(); }} />}
                    ListEmptyComponent={<EmptyState icon="food-off" title="Menu Empty" description="No items available right now." />}
                />
            )}

            {cartItemCount > 0 && (
                <View style={styles.cartBar}>
                    <View>
                        <Text style={styles.cartTotal}>₹{cartTotal}</Text>
                        <Text style={styles.cartDetails}>{cartItemCount} items</Text>
                    </View>
                    <AppButton title="Place Order" onPress={placeOrder} size="small" style={{ width: 120 }} />
                </View>
            )}

            <Modal visible={orderHistoryVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>My Orders</Text>
                        <TouchableOpacity onPress={() => setOrderHistoryVisible(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={orders}
                        keyExtractor={o => o._id}
                        contentContainerStyle={{ padding: 20 }}
                        renderItem={({ item }) => (
                            <View style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
                                    <Text style={[styles.orderStatus, { color: item.status === 'Ready' ? theme.colors.green : theme.colors.primary }]}>{item.status}</Text>
                                </View>
                                {item.items.map((i, idx) => (
                                    <Text key={idx} style={styles.orderItem}>
                                        {i.quantity}x {i.item?.name || 'Item'}
                                    </Text>
                                ))}
                                <View style={styles.orderFooter}>
                                    <Text style={styles.orderTotal}>Total: ₹{item.totalAmount}</Text>
                                    <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<EmptyState icon="receipt" title="No Past Orders" description="Your pickup history will appear here." />}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    categoryRow: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: 'white' },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 },
    activeChip: { backgroundColor: theme.colors.primary },
    categoryText: { color: theme.colors.textLight, fontWeight: '600' },
    activeCategoryText: { color: 'white' },
    listContent: { padding: 15, paddingBottom: 100 },
    menuItem: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
    itemImagePlaceholder: { width: 60, height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    itemPrice: { fontSize: 15, color: theme.colors.primary, fontWeight: 'bold', marginTop: 2 },
    itemCat: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },
    quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, padding: 4 },
    qBtn: { width: 24, height: 24, backgroundColor: theme.colors.primary, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    qText: { marginHorizontal: 10, fontWeight: 'bold' },
    addBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'white', borderRadius: 6, borderWidth: 1, borderColor: theme.colors.primary },
    addBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 },
    cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 20 },
    cartTotal: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
    cartDetails: { fontSize: 12, color: theme.colors.textLight },
    historyContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', alignItems: 'center' },
    historyTitle: { fontSize: 20, fontWeight: 'bold' },
    orderCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderId: { fontWeight: 'bold', color: theme.colors.textLight },
    orderStatus: { fontWeight: 'bold' },
    orderItem: { fontSize: 14, color: theme.colors.text, marginBottom: 2 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    orderTotal: { fontWeight: 'bold' },
    orderDate: { fontSize: 11, color: theme.colors.textLight }
});

export default CanteenScreen;
