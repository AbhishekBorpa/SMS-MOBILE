import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const AssignmentsListScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const isTeacher = userInfo?.role === 'Teacher';

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/assignments`, config);
            setAssignments(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Discard Assignment?', 'This action cannot be undone.', [
            { text: 'Keep', style: 'cancel' },
            {
                text: 'Discard',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/assignments/${id}`, config);
                        fetchAssignments();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to remove assignment');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => {
        const dueDate = new Date(item.dueDate);
        const isUrgent = (dueDate - new Date()) / (1000 * 60 * 60 * 24) < 3;

        return (
            <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })} activeOpacity={0.9}>
                <AppCard style={styles.card} padding={20}>
                    <View style={styles.cardHeader}>
                        <View style={styles.badgeRow}>
                            <AppBadge label={item.subject} type="primary" />
                            <AppBadge label={item.grade} type="secondary" />
                        </View>
                        {(isTeacher && item.teacher?._id === userInfo?._id) && (
                            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                                <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.footer}>
                        <View style={styles.authorSection}>
                            <View style={[styles.miniIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                                <MaterialCommunityIcons name="account-tie-outline" size={14} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.authorText}>{item.teacher?.name}</Text>
                        </View>
                        <View style={[styles.dateBadge, isUrgent && { backgroundColor: theme.colors.error + '10' }]}>
                            <MaterialCommunityIcons
                                name="clock-alert-outline"
                                size={14}
                                color={isUrgent ? theme.colors.error : theme.colors.textLight}
                            />
                            <Text style={[styles.dateText, isUrgent && { color: theme.colors.error }]}>
                                Due {dueDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                            </Text>
                        </View>
                    </View>
                </AppCard>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Learning Tasks"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon={isTeacher ? "plus-circle-outline" : "clipboard-text-outline"}
                onRightPress={isTeacher ? () => navigation.navigate('CreateAssignment') : null}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={assignments}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="check-all"
                                title="All Caught Up!"
                                description="You have no pending assignments at the moment."
                            />
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    card: { marginBottom: 20, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deleteBtn: { padding: 4 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    cardDesc: { fontSize: 14, color: theme.colors.textLight, lineHeight: 20, marginBottom: 20 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    authorSection: { flexDirection: 'row', alignItems: 'center' },
    miniIcon: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    authorText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' },
    dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5F6F8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    dateText: { fontSize: 11, color: theme.colors.textLight, fontWeight: 'bold' }
});

export default AssignmentsListScreen;
