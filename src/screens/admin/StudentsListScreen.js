import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const StudentsListScreen = ({ navigation }) => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const BASE_URL = `${API_URL}/users?role=Student`;

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(BASE_URL, config);
            setStudents(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('StudentDetail', { student: item })}
        >
            <AppCard padding={0} style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={theme.gradients.primary}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
                        </LinearGradient>
                        <View style={styles.onlineDot} />
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{item?.name || 'N/A'}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.idText}>#{item._id?.substring(item._id.length - 4)?.toUpperCase()}</Text>
                            <View style={styles.dotSeparator} />
                            <Text style={styles.classText}>Class X-A</Text>
                        </View>
                    </View>

                    <View style={styles.actionIcon}>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textLight} />
                    </View>
                </View>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Directory</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={22} color={theme.colors.primary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor={theme.colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : filteredStudents.length === 0 ? (
                    <View style={styles.center}>
                        <View style={styles.emptyIconCircle}>
                            <MaterialCommunityIcons name="account-search" size={50} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.emptyText}>No students found</Text>
                        <Text style={styles.emptySubText}>Try a different search term.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredStudents}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => navigation.navigate('AddStudent')}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={theme.gradients.secondary}
                    style={styles.fab}
                >
                    <MaterialCommunityIcons name="plus" size={30} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text },

    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, height: 50, ...theme.shadows.sm },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: theme.colors.text, fontWeight: '600' },

    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    list: { paddingHorizontal: 20, paddingBottom: 170 },

    card: { marginBottom: 12, borderRadius: 18, backgroundColor: '#fff', ...theme.shadows.sm },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },

    avatarContainer: { position: 'relative', marginRight: 15 },
    avatarGradient: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    onlineDot: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.success, borderWidth: 2, borderColor: '#fff' },

    infoContainer: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    idText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '700' },
    dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.textLight, marginHorizontal: 6 },
    classText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '600' },

    actionIcon: { padding: 5 },

    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    emptyText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    emptySubText: { fontSize: 13, color: theme.colors.textLight, marginTop: 5 },

    fabContainer: { position: 'absolute', right: 25, bottom: 100, ...theme.shadows.lg },
    fab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});

export default StudentsListScreen;
