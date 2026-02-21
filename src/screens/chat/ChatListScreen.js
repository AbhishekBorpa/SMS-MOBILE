import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const ChatListScreen = ({ navigation }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/messages/targets`, config);
            setContacts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = (Array.isArray(contacts) ? contacts : []).filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', { userId: item._id, resultName: item.name })}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=random` }}
                    style={styles.avatar}
                />
                <View style={styles.onlineBadge} />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatTime}>Now</Text>
                </View>
                <Text style={styles.chatPreview} numberOfLines={1}>
                    {item.role} • Tap to start chatting
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Messages"
                variant="primary"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textLight}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={filteredContacts}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="account-search"
                            title="No Contacts Found"
                            description="You don't have any contacts to chat with yet."
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchContainer: { padding: 15, backgroundColor: theme.colors.primary, paddingBottom: 25, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: theme.colors.text },
    listContent: { padding: 15 },
    chatItem: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, ...theme.shadows.sm },
    avatarContainer: { position: 'relative' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: '#fff' },
    chatInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    chatName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    chatTime: { fontSize: 12, color: theme.colors.textLight },
    chatPreview: { fontSize: 13, color: theme.colors.textLight },
});

export default ChatListScreen;
