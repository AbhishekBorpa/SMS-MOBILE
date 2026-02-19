import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const LeaderboardScreen = ({ navigation }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/quizzes/leaderboard/global`, config);
            setLeaderboard(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderPodium = () => {
        if (leaderboard.length < 3) return null;

        const [first, second, third] = leaderboard;

        return (
            <View style={styles.podiumContainer}>
                <View style={[styles.podiumItem, styles.podiumSecond]}>
                    <View style={styles.avatarCircleSmall}>
                        <Text style={styles.avatarTextSmall}>{second.student.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{second.student.name}</Text>
                    <View style={styles.podiumBarSecond}>
                        <Text style={styles.podiumRank}>2</Text>
                        <Text style={styles.podiumScore}>{second.totalScore}</Text>
                    </View>
                </View>

                <View style={[styles.podiumItem, styles.podiumFirst]}>
                    <MaterialCommunityIcons name="crown" size={24} color="#FFD700" style={styles.crown} />
                    <View style={styles.avatarCircleLarge}>
                        <Text style={styles.avatarTextLarge}>{first.student.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{first.student.name}</Text>
                    <View style={styles.podiumBarFirst}>
                        <Text style={styles.podiumRank}>1</Text>
                        <Text style={styles.podiumScore}>{first.totalScore}</Text>
                    </View>
                </View>

                <View style={[styles.podiumItem, styles.podiumThird]}>
                    <View style={styles.avatarCircleSmall}>
                        <Text style={styles.avatarTextSmall}>{third.student.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.podiumName} numberOfLines={1}>{third.student.name}</Text>
                    <View style={styles.podiumBarThird}>
                        <Text style={styles.podiumRank}>3</Text>
                        <Text style={styles.podiumScore}>{third.totalScore}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderItem = ({ item, index }) => {
        // Skip top 3 if we are showing podium (and we have at least 3)
        if (leaderboard.length >= 3 && index < 3) return null;

        const rank = index + 1;
        return (
            <AppCard style={styles.card} padding={15}>
                <View style={styles.row}>
                    <View style={styles.rankContainer}>
                        <Text style={styles.rankText}>#{rank}</Text>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{item.student.name}</Text>
                        <Text style={styles.quizzesTaken}>{item.quizzesTaken} Quizzes</Text>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreValue}>{item.totalScore}</Text>
                        <Text style={styles.scoreLabel}>PTS</Text>
                    </View>
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Leaderboard"
                subtitle="Hall of Fame"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="trophy-outline"
            />

            <View style={styles.content}>
                {leaderboard.length >= 3 && renderPodium()}

                <FlatList
                    data={leaderboard}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading && (
                            <EmptyState
                                icon="trophy-broken"
                                title="No Champions Yet"
                                description="Be the first to take a quiz!"
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
    content: { flex: 1 },
    list: { padding: 20, paddingBottom: 40 },
    card: { marginBottom: 10, elevation: 1 },
    row: { flexDirection: 'row', alignItems: 'center' },
    rankContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
    rankText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textLight },
    userInfo: { flex: 1, marginLeft: 10 },
    userName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    quizzesTaken: { fontSize: 12, color: theme.colors.textLight },
    scoreContainer: { alignItems: 'center', backgroundColor: theme.colors.primary + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    scoreValue: { fontSize: 16, fontWeight: '900', color: theme.colors.primary },
    scoreLabel: { fontSize: 8, fontWeight: 'bold', color: theme.colors.primary },

    // Podium Styles
    podiumContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', height: 260, marginBottom: -20, paddingTop: 20 },
    podiumItem: { alignItems: 'center', width: 90 },
    podiumFirst: { marginBottom: 20, zIndex: 10 },
    podiumSecond: { marginRight: -10 },
    podiumThird: { marginLeft: -10 },
    crown: { marginBottom: 5 },
    avatarCircleLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 3, borderColor: '#fff' },
    avatarCircleSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#fff' },
    avatarTextLarge: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    avatarTextSmall: { fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
    podiumName: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text, marginBottom: 5, textAlign: 'center' },
    podiumBarFirst: { width: '100%', height: 140, backgroundColor: '#FFD700', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', paddingTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    podiumBarSecond: { width: '100%', height: 100, backgroundColor: '#C0C0C0', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', paddingTop: 10 },
    podiumBarThird: { width: '100%', height: 70, backgroundColor: '#CD7F32', borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', paddingTop: 10 },
    podiumRank: { fontSize: 32, fontWeight: '900', color: 'rgba(255,255,255,0.8)' },
    podiumScore: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginTop: 5 }
});

export default LeaderboardScreen;
