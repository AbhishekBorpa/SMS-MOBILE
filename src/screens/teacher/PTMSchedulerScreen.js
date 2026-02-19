import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
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
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const PTMSchedulerScreen = ({ navigation }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newSlot, setNewSlot] = useState({ date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', link: '' });

    const fetchSlots = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/ptm`, config);
            setSlots(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleAddSlot = async () => {
        if (!newSlot.startTime || !newSlot.endTime) {
            Alert.alert('Error', 'Start and End Time are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/ptm`, newSlot, config);
            setModalVisible(false);
            setNewSlot({ date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', link: '' });
            fetchSlots();
        } catch (error) {
            Alert.alert('Error', 'Failed to add slot');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                    <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                </View>
                <AppBadge label={item.status} type={item.status === 'Booked' ? 'warning' : item.status === 'Open' ? 'success' : 'neutral'} />
            </View>

            {item.student ? (
                <View style={styles.studentInfo}>
                    <MaterialCommunityIcons name="account-child" size={16} color={theme.colors.primary} />
                    <Text style={styles.studentName}>Booked by: {item.student.name}</Text>
                </View>
            ) : (
                <Text style={styles.placeholder}>Waiting for booking...</Text>
            )}

            {item.link && (
                <View style={styles.linkRow}>
                    <MaterialCommunityIcons name="video" size={16} color={theme.colors.secondary} />
                    <Text style={styles.linkText} onPress={() => Linking.openURL(item.link)}>Join Meeting</Text>
                </View>
            )}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="PTM Scheduler"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={slots}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSlots(); }} />}
                    ListEmptyComponent={<EmptyState icon="account-clock" title="No Slots Created" description="Open slots for prospective meetings." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>New Meeting Slot</Text>

                            <AppInput
                                label="Date (YYYY-MM-DD)"
                                placeholder="2023-11-20"
                                value={newSlot.date}
                                onChangeText={t => setNewSlot({ ...newSlot, date: t })}
                            />
                            <AppInput
                                label="Start Time"
                                placeholder="e.g. 10:00 AM"
                                value={newSlot.startTime}
                                onChangeText={t => setNewSlot({ ...newSlot, startTime: t })}
                            />
                            <AppInput
                                label="End Time"
                                placeholder="e.g. 10:30 AM"
                                value={newSlot.endTime}
                                onChangeText={t => setNewSlot({ ...newSlot, endTime: t })}
                            />
                            <AppInput
                                label="Video Link (Optional)"
                                placeholder="Zoom/Google Meet URL"
                                value={newSlot.link}
                                onChangeText={t => setNewSlot({ ...newSlot, link: t })}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Create Slot" onPress={handleAddSlot} style={{ flex: 1 }} />
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    time: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    date: { fontSize: 12, color: theme.colors.textLight },
    studentInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#F0F0F0', padding: 8, borderRadius: 5 },
    studentName: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: theme.colors.text },
    placeholder: { marginTop: 10, fontSize: 13, color: theme.colors.textLight, fontStyle: 'italic' },
    linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 },
    linkText: { color: theme.colors.secondary, textDecorationLine: 'underline', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default PTMSchedulerScreen;
