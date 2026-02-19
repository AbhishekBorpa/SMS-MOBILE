import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const LibraryScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async (searchTerm = '') => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const query = searchTerm ? `?keyword=${searchTerm}` : '';
            const { data } = await axios.get(`${API_URL}/library${query}`, config);
            setBooks(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchBooks(search);
    };

    const renderItem = ({ item }) => (
        <AppCard padding={15} style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.bookCover, { backgroundColor: theme.colors.primary + '10' }]}>
                    <MaterialCommunityIcons name="book-education-outline" size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.author}>by {item.author}</Text>
                    <View style={styles.metaRow}>
                        <AppBadge label={item.subject} type="primary" />
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: item.availableCopies > 0 ? theme.colors.green : theme.colors.accent }]} />
                            <Text style={[styles.statusText, { color: item.availableCopies > 0 ? theme.colors.green : theme.colors.accent }]}>
                                {item.availableCopies > 0 ? `${item.availableCopies} Left` : 'Borrowed'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Smart Library"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="bookshelf"
            />

            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search books, authors, subjects..."
                        placeholderTextColor={theme.colors.textLight}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => { setSearch(''); fetchBooks(''); }}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={books}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <MaterialCommunityIcons name="book-off-outline" size={64} color="#E0E0E0" />
                                <Text style={styles.emptyText}>No books found matching your criteria.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchSection: { padding: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1 },
    searchInput: { flex: 1, fontSize: 16, color: theme.colors.text, marginLeft: 10, fontWeight: '500' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', marginTop: 15, color: theme.colors.textLight, fontSize: 16, fontWeight: '500' },
    list: { padding: 20, paddingTop: 0 },
    card: { marginBottom: 15, elevation: 2 },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    bookCover: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 },
    author: { fontSize: 13, color: theme.colors.textLight, marginBottom: 8, fontWeight: '500' },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: 'bold' }
});

export default LibraryScreen;
