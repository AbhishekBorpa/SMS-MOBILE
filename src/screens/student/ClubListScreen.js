import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const ClubListScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchClubs = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/clubs`, config);
            setClubs(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const handleJoin = async (clubId) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/clubs/${clubId}/join`, {}, config);
            Alert.alert('Success', 'You have joined the club!');
            fetchClubs();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to join club');
        }
    };

    const handleLeave = async (clubId) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/clubs/${clubId}/leave`, {}, config);
            Alert.alert('Success', 'You have left the club.');
            fetchClubs();
        } catch (error) {
            Alert.alert('Error', 'Failed to leave club');
        }
    };

    const renderItem = ({ item }) => {
        const isMember = item.members.includes(userInfo._id);

        return (
            <AppCard style={styles.card}>
                <View style={[styles.iconPlaceholder, { backgroundColor: getRandomColor(item.name) }]}>
                    <Text style={styles.iconText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{item.name}</Text>
                        {isMember && <AppBadge label="Member" type="success" size="small" />}
                    </View>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.colors.textLight} />
                        <Text style={styles.infoText}>{item.meetingDay || 'TBA'} • {item.meetingTime || 'TBA'}</Text>
                    </View>

                    <AppButton
                        title={isMember ? "Leave Club" : "Join Club"}
                        onPress={() => isMember ? handleLeave(item._id) : handleJoin(item._id)}
                        type={isMember ? "secondary" : "primary"}
                        size="small"
                        style={{ marginTop: 12, alignSelf: 'flex-start' }}
                    />
                </View>
            </AppCard>
        );
    };

    // Helper for random pastel colors based on name
    const getRandomColor = (name) => {
        const colors = ['#FFD1DC', '#E0F7FA', '#F3E5F5', '#FFF9C4', '#E8F5E9'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="School Clubs"
                subtitle="Join a community"
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={clubs}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchClubs(); }} />}
                    ListEmptyComponent={<EmptyState icon="account-group" title="No Clubs Active" description="Check back later for new clubs." />}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    card: { flexDirection: 'row', padding: 15, marginBottom: 15, alignItems: 'center' },
    iconPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
    content: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    description: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
    infoText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '600' }
});

export default ClubListScreen;
