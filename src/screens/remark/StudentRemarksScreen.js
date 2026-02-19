import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const StudentRemarksScreen = ({ navigation }) => {
    const [remarks, setRemarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRemarks();
    }, []);

    const fetchRemarks = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/remarks/my`, config);
            setRemarks(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <AppCard padding={20} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleInfo}>
                    <View style={[styles.titleCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                        <MaterialCommunityIcons name="comment-text-outline" size={22} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.descContainer}>
                <Text style={styles.desc}>"{item.description}"</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.teacherBadge}>
                    <View style={styles.avatarTiny}>
                        <Text style={styles.avatarTinyText}>{item.teacher?.name ? item.teacher.name.charAt(0).toUpperCase() : '?'}</Text>
                    </View>
                    <Text style={styles.author}> {item.teacher?.name}</Text>
                </View>
                <Text style={styles.roleLabel}>Academics</Text>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Performance Remarks"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="star-face"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={remarks}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <MaterialCommunityIcons name="comment-off-outline" size={80} color="#E0E0E0" />
                                <Text style={styles.emptyText}>No Remarks Yet</Text>
                                <Text style={styles.emptySubText}>You haven't received any performance remarks yet.</Text>
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
    content: { flex: 1 },
    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    emptySubText: { textAlign: 'center', color: theme.colors.textLight, fontSize: 14, marginTop: 8 },
    card: { marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    titleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    titleCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    dateText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '600', marginTop: 2 },
    descContainer: { backgroundColor: '#F9FAFB', padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
    desc: { fontSize: 15, color: theme.colors.text, lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 },
    teacherBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatarTiny: { width: 24, height: 24, borderRadius: 8, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    avatarTinyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    author: { fontSize: 13, color: theme.colors.text, fontWeight: '700' },
    roleLabel: { fontSize: 9, color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '900' }
});

export default StudentRemarksScreen;
