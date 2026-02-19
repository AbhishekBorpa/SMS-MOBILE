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
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const LostFoundScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', locationFound: '', contactInfo: '', category: 'Other' });

    const fetchItems = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/lost-found`, config);
            setItems(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleReport = async () => {
        if (!newItem.name || !newItem.locationFound) {
            Alert.alert('Error', 'Name and Location are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/lost-found`, newItem, config);
            setModalVisible(false);
            setNewItem({ name: '', description: '', locationFound: '', contactInfo: '', category: 'Other' });
            Alert.alert('Success', 'Item reported successfully');
            fetchItems();
        } catch (error) {
            Alert.alert('Error', 'Failed to report item');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.textLight} />
                        <Text style={styles.locationText}>{item.locationFound}</Text>
                    </View>
                </View>
                <AppBadge label={item.category} type="neutral" />
            </View>
            <Text style={styles.description}>{item.description}</Text>
            {item.contactInfo && (
                <View style={styles.contactRow}>
                    <MaterialCommunityIcons name="phone" size={14} color={theme.colors.primary} />
                    <Text style={styles.contactText}>Contact: {item.contactInfo}</Text>
                </View>
            )}
            <View style={styles.footer}>
                <Text style={styles.date}>Reported on {new Date(item.dateFound).toDateString()}</Text>
                <View style={styles.reporter}>
                    <Text style={styles.reporterText}>Found by {item.foundBy?.name || 'Someone'}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Lost & Found"
                subtitle="Community lost items"
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} />}
                    ListEmptyComponent={<EmptyState icon="bag-suitcase-off" title="No Items Reported" description="Hopefully nothing is lost!" />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>Report Found Item</Text>

                            <AppInput
                                label="Item Name"
                                placeholder="e.g. Blue Water Bottle"
                                value={newItem.name}
                                onChangeText={t => setNewItem({ ...newItem, name: t })}
                            />
                            <AppInput
                                label="Location Found"
                                placeholder="e.g. Library"
                                value={newItem.locationFound}
                                onChangeText={t => setNewItem({ ...newItem, locationFound: t })}
                            />
                            <AppInput
                                label="Description"
                                placeholder="Details about the item..."
                                value={newItem.description}
                                onChangeText={t => setNewItem({ ...newItem, description: t })}
                            />
                            <AppInput
                                label="Contact Info (Optional)"
                                placeholder="Email or Phone"
                                value={newItem.contactInfo}
                                onChangeText={t => setNewItem({ ...newItem, contactInfo: t })}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Submit Report" onPress={handleReport} style={{ flex: 1 }} />
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
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: 13, color: theme.colors.textLight, marginLeft: 4 },
    description: { fontSize: 14, color: theme.colors.text, marginTop: 10, lineHeight: 20 },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8, backgroundColor: '#F0F9FF', borderRadius: 6, alignSelf: 'flex-start' },
    contactText: { fontSize: 12, color: theme.colors.primary, marginLeft: 6, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    date: { fontSize: 11, color: theme.colors.textLight },
    reporter: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    reporterText: { fontSize: 10, color: theme.colors.textLight, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default LostFoundScreen;
