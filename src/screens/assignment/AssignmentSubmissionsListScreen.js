import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AssignmentSubmissionsListScreen = ({ route, navigation }) => {
    const { assignment } = route.params;
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Graded
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    useEffect(() => {
        let result = submissions;

        // Filter by Status
        if (filter !== 'All') {
            result = result.filter(sub => sub.status === filter);
        }

        // Search by Student Name
        if (search) {
            result = result.filter(sub => sub.student?.name.toLowerCase().includes(search.toLowerCase()));
        }

        setFilteredSubmissions(result);
    }, [submissions, filter, search]);

    const fetchSubmissions = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/submissions/assignment/${assignment._id}`, config);
            setSubmissions(data);
            setFilteredSubmissions(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Grading', { submission: item })}
            activeOpacity={0.8}
        >
            <AppCard style={styles.card} padding={15}>
                <View style={styles.row}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.student?.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.student?.name}</Text>
                        <Text style={styles.date}>
                            {new Date(item.submittedAt).toLocaleDateString()} • {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={styles.statusCol}>
                        <AppBadge
                            label={item.status}
                            type={item.status === 'Graded' ? 'success' : 'warning'}
                        />
                        {item.grade && (
                            <Text style={styles.gradeText}>{item.grade} Marks</Text>
                        )}
                    </View>
                </View>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Submissions"
                onBack={() => navigation.goBack()}
                rightIcon="refresh"
                onRightPress={fetchSubmissions}
            />

            <View style={styles.content}>
                <KeyboardWrapper backgroundColor="transparent">
                    {/* Search & Filter */}
                    <View style={styles.controls}>
                        <AppInput
                            placeholder="Search Student..."
                            value={search}
                            onChangeText={setSearch}
                            icon="account-search"
                            style={styles.searchInput}
                        />

                        <View style={styles.filterRow}>
                            {['All', 'Pending', 'Graded'].map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filterChip, filter === f && styles.filterChipActive]}
                                    onPress={() => setFilter(f)}
                                >
                                    <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
                    ) : (
                        <FlatList
                            data={filteredSubmissions}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false} // Let KeyboardWrapper handle scrolling
                            ListEmptyComponent={
                                <EmptyState
                                    icon="folder-outline"
                                    title="No Submissions Found"
                                    description={filter !== 'All' ? `No ${filter.toLowerCase()} submissions match your search.` : "No students have submitted this assignment yet."}
                                />
                            }
                        />
                    )}
                </KeyboardWrapper>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    controls: { padding: 20, paddingBottom: 10, backgroundColor: '#fff', elevation: 2 },
    searchInput: { marginBottom: 15 },
    filterRow: { flexDirection: 'row', gap: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
    filterChipActive: { backgroundColor: theme.colors.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: theme.colors.textLight },
    filterTextActive: { color: '#fff' },

    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    card: { marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    date: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
    statusCol: { alignItems: 'flex-end' },
    gradeText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.success, marginTop: 4 }
});

export default AssignmentSubmissionsListScreen;
