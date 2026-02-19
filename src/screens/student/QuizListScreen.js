import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const QuizListScreen = ({ navigation }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Use new endpoint for available quizzes
            const { data } = await axios.get(`${API_URL}/quizzes/available`, config);
            setQuizzes(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card} padding={16}>
            <View style={styles.cardContent}>
                <View style={[
                    styles.iconBox,
                    { backgroundColor: item.type === 'Competition' ? '#FFF5E5' : theme.colors.secondary + '15' }
                ]}>
                    <MaterialCommunityIcons
                        name={item.type === 'Competition' ? 'trophy' : 'brain'}
                        size={24}
                        color={item.type === 'Competition' ? '#FF9800' : theme.colors.secondary}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>
                        {item.questions?.length || 0} Questions • {item.duration || 30} mins
                    </Text>
                </View>
                {item.type === 'Competition' && (
                    <View style={styles.compBadge}>
                        <Text style={styles.compBadgeText}>LIVE</Text>
                    </View>
                )}
            </View>
            <View style={styles.footer}>
                <View style={styles.badge}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.textLight} />
                    <Text style={styles.badgeText}>{item.duration} mins</Text>
                </View>
                <AppButton
                    title={item.type === 'Competition' ? "Join Comp" : "Start Quiz"}
                    size="sm"
                    width={100}
                    color={item.type === 'Competition' ? '#FF9800' : theme.colors.primary}
                    onPress={() => navigation.navigate('QuizAttempt', { quizId: item._id, title: item.title, duration: item.duration })}
                />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <AppHeader
                title="Quizzes & Events"
                subtitle="Join competitions"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="trophy-outline"
                onRightPress={() => navigation.navigate('Leaderboard')}
            />

            <View style={styles.content}>
                <FlatList
                    data={quizzes}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading && (
                            <EmptyState
                                icon="brain"
                                title="No Quizzes Available"
                                description="Check back later for new quizzes."
                            />
                        )
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1, padding: 20 },
    list: { paddingBottom: 130 },
    card: { marginBottom: 15, elevation: 3 },
    cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1 },
    title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    subtitle: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '600', color: theme.colors.textLight },
    compBadge: { backgroundColor: '#FF9800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    compBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default QuizListScreen;
