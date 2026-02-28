import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
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
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppHeader from '../components/AppHeader';
import AppInput from '../components/AppInput';
import EmptyState from '../components/EmptyState';
import API_URL from '../config/api';
import { theme } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const NoticeBoardScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // New Notice Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetAudience, setTargetAudience] = useState('All');
    const [submitting, setSubmitting] = useState(false);

    const isAdmin = userInfo?.role === 'Admin';

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/notices`, config);
            setNotices(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNotice = async () => {
        if (!title || !message) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/notices`, { title, message, targetAudience }, config);

            setModalVisible(false);
            setTitle('');
            setMessage('');
            fetchNotices();
            Alert.alert('Success', 'Notice posted successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to post notice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNotice = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this notice?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/notices/${id}`, config);
                        fetchNotices();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete notice');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.noticeCard} padding={20}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                    <MaterialCommunityIcons name="bullhorn-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.titleSection}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>
                {isAdmin && (
                    <TouchableOpacity onPress={() => handleDeleteNotice(item._id)} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.cardMessage}>{item.message}</Text>

            <View style={styles.cardFooter}>
                <View style={[styles.audienceBadge, { backgroundColor: theme.colors.secondary + '15' }]}>
                    <Text style={[styles.audienceText, { color: theme.colors.secondary }]}>{item.targetAudience}</Text>
                </View>
                <View style={styles.authorSection}>
                    <MaterialCommunityIcons name="account-circle-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.authorText}>{item.postedBy?.name}</Text>
                </View>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Digital Bulletin"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon={isAdmin ? "plus-circle-outline" : "bell-outline"}
                onRightPress={isAdmin ? () => setModalVisible(true) : null}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={notices}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="clipboard-text-off-outline"
                                title="Board is clear"
                                description="No announcements have been posted yet."
                            />
                        }
                    />
                )}
            </View>

            {isAdmin && (
                <View style={styles.fabContainer}>
                    <AppButton
                        title="Post Announcement"
                        icon="plus"
                        onPress={() => setModalVisible(true)}
                        style={styles.fab}
                    />
                </View>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Announcement</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                    <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>

                            <AppInput
                                label="Notice Title"
                                placeholder="E.g. Sports Day Update"
                                value={title}
                                onChangeText={setTitle}
                                icon="format-title"
                            />

                            <AppInput
                                label="Message"
                                placeholder="Provide full details here..."
                                value={message}
                                onChangeText={setMessage}
                                multiline={true}
                                style={styles.textArea}
                                icon="card-text-outline"
                            />

                            <View style={styles.audienceRow}>
                                <Text style={styles.audienceLabel}>TARGET AUDIENCE</Text>
                                <View style={styles.chipRow}>
                                    {['All', 'Teachers', 'Students'].map(aud => (
                                        <TouchableOpacity
                                            key={aud}
                                            style={[
                                                styles.audienceChip,
                                                targetAudience === aud && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                            ]}
                                            onPress={() => setTargetAudience(aud)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                targetAudience === aud && { color: '#fff' }
                                            ]}>{aud}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <AppButton
                                title="Publish Announcement"
                                onPress={handleCreateNotice}
                                loading={submitting}
                                icon="bullhorn-variant-outline"
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
    noticeCard: { marginBottom: 20, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    titleSection: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    dateText: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    deleteBtn: { padding: 8 },
    cardMessage: { fontSize: 15, color: theme.colors.text, lineHeight: 24, marginBottom: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
    audienceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    audienceText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    authorSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    authorText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' },
    fabContainer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    fab: { borderRadius: 30, elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    closeBtn: { backgroundColor: '#F5F5F5', padding: 8, borderRadius: 12 },
    textArea: { height: 120 },
    audienceRow: { marginBottom: 30 },
    audienceLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
    chipRow: { flexDirection: 'row', gap: 10 },
    audienceChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#fff' },
    chipText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textLight },
    submitBtn: { marginTop: 10 }
});

export default NoticeBoardScreen;
