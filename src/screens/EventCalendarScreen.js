import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import KeyboardWrapper from '../components/KeyboardWrapper';
import API_URL from '../config/api';
import { theme } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const EventCalendarScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [submitting, setSubmitting] = useState(false);

    const isAdmin = userInfo?.role === 'Admin';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/events`, config);
            setEvents(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!title || !date) {
            Alert.alert('Error', 'Please provide title and date');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/events`, { title, description, date }, config);

            setModalVisible(false);
            setTitle('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);
            fetchEvents();
            Alert.alert('Success', 'Event scheduled successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to schedule event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvent = (id) => {
        Alert.alert('Confirm Delete', 'Remove this event?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/events/${id}`, config);
                        fetchEvents();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete event');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => {
        const eventDate = new Date(item.date);
        return (
            <AppCard padding={0} style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={[styles.dateBox, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Text style={[styles.dateMonth, { color: theme.colors.primary }]}>
                            {eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </Text>
                        <Text style={[styles.dateDay, { color: theme.colors.primary }]}>{eventDate.getDate()}</Text>
                    </View>
                    <View style={styles.cardRight}>
                        <View style={styles.headerRow}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            {isAdmin && (
                                <TouchableOpacity onPress={() => handleDeleteEvent(item._id)} style={styles.deleteBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.accent} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.metaRow}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.textLight} />
                            <Text style={styles.metaText}>All Day Event</Text>
                        </View>
                    </View>
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="School Events"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon={isAdmin ? "calendar-plus" : "calendar-check-outline"}
                onRightPress={isAdmin ? () => setModalVisible(true) : null}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={events}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <MaterialCommunityIcons name="calendar-blank-outline" size={64} color="#E0E0E0" />
                                <Text style={styles.emptyText}>No upcoming events scheduled.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Schedule Event</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            </View>

                            <AppInput
                                label="Event Title"
                                placeholder="e.g. Annual Sports Meet"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <AppInput
                                label="Event Date (YYYY-MM-DD)"
                                placeholder="2025-12-25"
                                value={date}
                                onChangeText={setDate}
                            />

                            <AppInput
                                label="Description"
                                placeholder="Add some details about the event..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />

                            <AppButton
                                title="Schedule Event"
                                onPress={handleCreateEvent}
                                loading={submitting}
                                style={{ marginTop: 10 }}
                            />
                        </KeyboardWrapper>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 15, color: theme.colors.textLight, fontSize: 16, fontWeight: '500' },
    list: { padding: 20 },
    card: { marginBottom: 15, elevation: 2 },
    cardContent: { flexDirection: 'row' },
    dateBox: { width: 80, justifyContent: 'center', alignItems: 'center', padding: 15 },
    dateMonth: { fontWeight: '900', fontSize: 14, letterSpacing: 1 },
    dateDay: { fontWeight: '900', fontSize: 30, marginTop: -4 },
    cardRight: { flex: 1, padding: 15 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6, flex: 1 },
    deleteBtn: { padding: 5, marginRight: -5 },
    cardDesc: { fontSize: 13, color: theme.colors.textLight, marginBottom: 12, lineHeight: 18, fontWeight: '500' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 11, color: theme.colors.textLight, fontWeight: 'bold', textTransform: 'uppercase' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modalContent: { width: '100%', elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text }
});

export default EventCalendarScreen;
