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
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AlumniDirectoryScreen = ({ navigation }) => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newAlumni, setNewAlumni] = useState({ name: '', graduationYear: '', currentCompany: '', linkedInProfile: '' });

    const fetchAlumni = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/alumni`, config);
            setAlumni(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, []);

    const handleAddAlumni = async () => {
        if (!newAlumni.name || !newAlumni.graduationYear) {
            Alert.alert('Error', 'Name and Graduation Year are required');
            return;
        }
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/alumni`, newAlumni, config);
            setModalVisible(false);
            setNewAlumni({ name: '', graduationYear: '', currentCompany: '', linkedInProfile: '' });
            fetchAlumni();
        } catch (error) {
            Alert.alert('Error', 'Failed to add alumni');
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.batch}>Class of {item.graduationYear}</Text>
                </View>
                {item.linkedInProfile && (
                    <MaterialCommunityIcons
                        name="linkedin"
                        size={24}
                        color="#0077B5"
                        onPress={() => Linking.openURL(item.linkedInProfile)}
                    />
                )}
            </View>
            <View style={styles.details}>
                {item.currentCompany && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="briefcase-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.detailText}>{item.designation ? `${item.designation} at ` : ''}{item.currentCompany}</Text>
                    </View>
                )}
                {item.email && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="email-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.detailText}>{item.email}</Text>
                    </View>
                )}
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Alumni Network"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => setModalVisible(true)}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={alumni}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlumni(); }} />}
                    ListEmptyComponent={<EmptyState icon="school" title="Alumni Directory Empty" description="Add graduated students here." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>Add Alumni</Text>

                            <AppInput
                                label="Name"
                                placeholder="Full Name"
                                value={newAlumni.name}
                                onChangeText={t => setNewAlumni({ ...newAlumni, name: t })}
                            />
                            <AppInput
                                label="Graduation Year"
                                placeholder="YYYY"
                                keyboardType="numeric"
                                value={newAlumni.graduationYear}
                                onChangeText={t => setNewAlumni({ ...newAlumni, graduationYear: t })}
                            />
                            <AppInput
                                label="Current Company"
                                placeholder="Organization Name"
                                value={newAlumni.currentCompany}
                                onChangeText={t => setNewAlumni({ ...newAlumni, currentCompany: t })}
                            />
                            <AppInput
                                label="Designation"
                                placeholder="Job Title"
                                value={newAlumni.designation}
                                onChangeText={t => setNewAlumni({ ...newAlumni, designation: t })}
                            />
                            <AppInput
                                label="LinkedIn Profile"
                                placeholder="https://linkedin.com/in/..."
                                value={newAlumni.linkedInProfile}
                                onChangeText={t => setNewAlumni({ ...newAlumni, linkedInProfile: t })}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title="Save" onPress={handleAddAlumni} style={{ flex: 1 }} />
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
    name: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    batch: { fontSize: 14, color: theme.colors.primary, fontWeight: '500' },
    details: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 14, color: theme.colors.textLight },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 }
});

export default AlumniDirectoryScreen;
