import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TeachersListScreen = ({ navigation }) => {
    const [teachers, setTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const BASE_URL = `${API_URL}/users?role=Teacher`;

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(BASE_URL, config);
            setTeachers(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <AppCard
            onPress={() => navigation.navigate('TeacherDetail', { teacher: item })}
            padding={16}
            style={styles.card}
        >
            <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{item.name?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <View style={styles.detailRow}>
                            <View style={styles.badge}>
                                <MaterialCommunityIcons name="briefcase-outline" size={12} color={theme.colors.primary} />
                                <Text style={styles.badgeText}>Faculty</Text>
                            </View>
                            {item.mobileNumber && (
                                <>
                                    <View style={styles.metaDivider} />
                                    <MaterialCommunityIcons name="phone-outline" size={12} color={theme.colors.textLight} />
                                    <Text style={styles.detailText}>{item.mobileNumber}</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textLight} />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="Teacher Directory"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="filter-variant"
            />

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search faculty..."
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : filteredTeachers.length === 0 ? (
                    <View style={styles.center}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="account-search-outline" size={60} color="#E0E0E0" />
                        </View>
                        <Text style={styles.emptyText}>No teachers found</Text>
                        <Text style={styles.emptySubText}>Try a different search or add a new faculty member.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredTeachers}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddTeacher')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialCommunityIcons name="plus" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    searchContainer: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 50, ...theme.shadows.sm },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    list: { paddingHorizontal: 20, paddingBottom: 170 },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    emptySubText: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    card: { marginBottom: 12, borderRadius: 16 },
    cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { fontSize: 20, fontWeight: 'bold' },
    infoContainer: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 },
    email: { fontSize: 12, color: theme.colors.textLight, marginBottom: 6 },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '08', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, gap: 4 },
    badgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: '700' },
    detailText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '500', marginLeft: 4 },
    metaDivider: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#BDC3C7', marginHorizontal: 6 },
    fab: { position: 'absolute', right: 20, bottom: 110, borderRadius: 30, ...theme.shadows.md },
    fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});

export default TeachersListScreen;
