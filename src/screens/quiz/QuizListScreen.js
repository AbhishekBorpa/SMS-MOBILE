import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../../../config/api';
import { theme } from '../../../constants/theme';

const QuizListScreen = ({ navigation }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const { data } = await axios.get(`${API_URL}/quizzes/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderQuizItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('QuizAttempt', { quizId: item._id })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: item.type === 'Competition' ? '#FFEBEE' : '#E3F2FD' }]}>
                    <Text style={[styles.badgeText, { color: item.type === 'Competition' ? '#D32F2F' : '#1976D2' }]}>
                        {item.type}
                    </Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{item.description || 'No description provided.'}</Text>

            <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{item.duration} mins</Text>
                </View>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="help-circle-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{item.questions?.length || 0} Questions</Text>
                </View>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="trophy-outline" size={16} color={theme.colors.textLight} />
                    <Text style={styles.metaText}>{item.passingScore}% to pass</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.startBtn}
                onPress={() => navigation.navigate('QuizAttempt', { quizId: item._id })}
            >
                <Text style={styles.startBtnText}>Start Quiz</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quizzes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
                    <MaterialCommunityIcons name="trophy" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={quizzes}
                    renderItem={renderQuizItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQuizzes(); }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="brain" size={64} color={theme.colors.textLight} />
                            <Text style={styles.emptyText}>No quizzes available right now.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, ...theme.shadows.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, flex: 1, marginRight: 10 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    description: { fontSize: 14, color: theme.colors.textLight, marginBottom: 16, lineHeight: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: theme.colors.textLight },
    startBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 15, color: theme.colors.textLight, fontSize: 16 }
});

export default QuizListScreen;
