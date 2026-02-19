import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../../../config/api';
import { theme } from '../../../constants/theme';

const LeaderboardScreen = ({ navigation }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const { data } = await axios.get(`${API_URL}/quizzes/leaderboard/global`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaders(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderLeader = ({ item, index }) => {
        let rankColor = '#455A64';
        let trophyColor = null;

        if (index === 0) { trophyColor = '#FFD700'; rankColor = '#FFD700'; } // Gold
        if (index === 1) { trophyColor = '#C0C0C0'; rankColor = '#C0C0C0'; } // Silver
        if (index === 2) { trophyColor = '#CD7F32'; rankColor = '#CD7F32'; } // Bronze

        return (
            <View style={styles.card}>
                <View style={[styles.rankBadge, { borderColor: rankColor }]}>
                    {trophyColor ? (
                        <MaterialCommunityIcons name="trophy" size={20} color={trophyColor} />
                    ) : (
                        <Text style={styles.rankText}>#{index + 1}</Text>
                    )}
                </View>

                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${item.student.name}&background=random` }}
                    style={styles.avatar}
                />

                <View style={styles.info}>
                    <Text style={styles.name}>{item.student.name}</Text>
                    <Text style={styles.quizzesTaken}>{item.quizzesTaken} Quizzes</Text>
                </View>

                <View style={styles.scoreBadge}>
                    <Text style={styles.score}>{Math.round(item.totalScore)}</Text>
                    <Text style={styles.pts}>pts</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={leaders}
                    renderItem={renderLeader}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View style={styles.topHeader}>
                            <MaterialCommunityIcons name="podium-gold" size={48} color="#FFB300" />
                            <Text style={styles.topHeaderText}>Top Students</Text>
                            <Text style={styles.topHeaderSub}>Weekly Ranking</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    topHeader: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    topHeaderText: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginTop: 10 },
    topHeaderSub: { fontSize: 14, color: theme.colors.textLight },

    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 12, ...theme.shadows.sm },
    rankBadge: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 2, marginRight: 15 },
    rankText: { fontWeight: 'bold', fontSize: 16, color: theme.colors.text },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    quizzesTaken: { fontSize: 12, color: theme.colors.textLight },
    scoreBadge: { alignItems: 'flex-end' },
    score: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
    pts: { fontSize: 10, color: theme.colors.textLight, fontWeight: 'bold' }
});

export default LeaderboardScreen;
