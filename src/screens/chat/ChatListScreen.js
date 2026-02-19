import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const ChatListScreen = ({ navigation }) => {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/messages/targets`, config);
            setTargets(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <AppCard
            padding={16}
            style={styles.card}
            onPress={() => navigation.navigate('Chat', { userId: item._id, resultName: item.name })}
        >
            <View style={styles.avatarWrapper}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                        {(item.name?.charAt(0) || '?').toUpperCase()}
                    </Text>
                </View>
                <View style={styles.statusDot} />
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <AppBadge label={item.role} type="primary" />
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>Tap to start conversation</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.border} />
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="Conversations"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="message-plus-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : targets.length === 0 ? (
                    <View style={styles.center}>
                        <MaterialCommunityIcons name="message-off-outline" size={64} color="#E0E0E0" />
                        <Text style={styles.emptyText}>No active conversations yet.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={targets}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { padding: 20 },
    emptyText: { textAlign: 'center', marginTop: 15, color: theme.colors.textLight, fontSize: 16, fontWeight: '500' },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 2 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 22, fontWeight: '900' },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.green,
        borderWidth: 2,
        borderColor: '#fff'
    },
    infoContainer: { flex: 1, marginLeft: 15 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    name: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    lastMsg: { fontSize: 14, color: theme.colors.textLight, fontWeight: '500' }
});

export default ChatListScreen;
