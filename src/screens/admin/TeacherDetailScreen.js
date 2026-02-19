import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TeacherDetailScreen = ({ route, navigation }) => {
    const { teacher } = route.params;
    const [stats, setStats] = useState({ quizzes: 0, assignments: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/stats/teacher/${teacher._id}`, config);
            setStats(data);
        } catch (error) {
            console.log('Error fetching stats:', error);
        }
    };

    // Helper to get initials
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Faculty Profile</Text>
                <TouchableOpacity style={styles.editBtn}>
                    <MaterialCommunityIcons name="pencil-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Header Card with Gradient */}
                <LinearGradient
                    colors={theme.gradients.primary}
                    style={styles.profileHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(teacher.name)}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.primary} />
                        </View>
                    </View>

                    <Text style={styles.name}>{teacher.name}</Text>
                    <Text style={styles.email}>{teacher.email}</Text>

                    <View style={styles.roleContainer}>
                        <View style={styles.rolePill}>
                            <MaterialCommunityIcons name="briefcase-variant-outline" size={14} color="#fff" />
                            <Text style={styles.roleText}>FACULTY</Text>
                        </View>
                        <View style={[styles.rolePill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Text style={styles.roleText}>ID: {(teacher._id || '0000').substring((teacher._id?.length || 0) - 6)?.toUpperCase()}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* 2. Stats / Status */}
                <View style={styles.statsRow}>
                    <AppCard style={styles.statCard} padding={15}>
                        <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                            <MaterialCommunityIcons name="check-circle-outline" size={24} color={theme.colors.success} />
                        </View>
                        <Text style={styles.statLabel}>Status</Text>
                        <Text style={[styles.statValue, { color: theme.colors.success }]}>Active</Text>
                    </AppCard>

                    <AppCard style={styles.statCard} padding={15}>
                        <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="notebook-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.statLabel}>Assignments</Text>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.assignments || 0}</Text>
                    </AppCard>

                    <AppCard style={styles.statCard} padding={15}>
                        <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                            <MaterialCommunityIcons name="format-list-checks" size={24} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.statLabel}>Quizzes</Text>
                        <Text style={[styles.statValue, { color: theme.colors.secondary }]}>{stats.quizzes || 0}</Text>
                    </AppCard>
                </View>

                {/* 3. Contact Information */}
                <Text style={styles.sectionTitle}>Contact & Address</Text>
                <AppCard style={styles.infoCard} padding={20}>
                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="phone-outline" size={22} color={theme.colors.primary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <Text style={styles.value}>{teacher.mobileNumber || 'Not provided'}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn}>
                            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.success} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary + '10' }]}>
                            <MaterialCommunityIcons name="map-marker-outline" size={22} color={theme.colors.secondary} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Residential Address</Text>
                            <Text style={styles.value}>{teacher.address || 'Address not registered'}</Text>
                        </View>
                    </View>
                </AppCard>

                {/* 4. Actions */}
                <Text style={styles.sectionTitle}>Administrative Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.adminActionBtn}>
                        <MaterialCommunityIcons name="lock-reset" size={24} color={theme.colors.error} />
                        <Text style={styles.adminActionText}>Reset Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.adminActionBtn}>
                        <MaterialCommunityIcons name="account-off" size={24} color={theme.colors.textLight} />
                        <Text style={styles.adminActionText}>Suspend</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, justifyContent: 'space-between' },
    backButton: { marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    editBtn: { padding: 5 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    profileHeader: {
        alignItems: 'center',
        padding: 30,
        marginBottom: 25,
        borderRadius: 30,
        ...theme.shadows.md,
    },
    avatarContainer: { position: 'relative', marginBottom: 15 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },
    name: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, textAlign: 'center' },
    email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
    roleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rolePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    roleText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },

    statsRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    statCard: { flex: 1, alignItems: 'center' },
    statIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 4, fontWeight: '600' },
    statValue: { fontSize: 16, fontWeight: '900' },

    sectionTitle: { fontSize: 14, fontWeight: '900', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
    infoCard: { marginBottom: 30 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    infoText: { flex: 1 },
    label: { fontSize: 11, color: theme.colors.textLight, marginBottom: 4, fontWeight: 'bold' },
    value: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FFF4', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DCFCE7' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },

    actionGrid: { flexDirection: 'row', gap: 15 },
    adminActionBtn: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 16, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
    adminActionText: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
});

export default TeacherDetailScreen;
