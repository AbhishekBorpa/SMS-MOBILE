import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const TeacherProfileScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);

    const ProfileItem = ({ icon, label, value, color }) => (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Teacher Profile</Text>
                <TouchableOpacity style={styles.settingsBtn}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarText}>{userInfo?.name?.charAt(0) || 'T'}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <MaterialCommunityIcons name="camera-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{userInfo?.name || 'Faculty Member'}</Text>
                    <View style={styles.roleBadge}>
                        <MaterialCommunityIcons name="teach" size={14} color={theme.colors.primary} />
                        <Text style={styles.roleText}>Faculty ID: {userInfo?._id?.slice(-6)?.toUpperCase()}</Text>
                    </View>
                </View>

                <AppCard style={styles.detailCard} padding={20}>
                    <Text style={styles.cardTitle}>Professional Details</Text>
                    <ProfileItem
                        icon="email-outline"
                        label="Email Address"
                        value={userInfo?.email}
                        color={theme.colors.primary}
                    />
                    <View style={styles.divider} />
                    <ProfileItem
                        icon="phone-outline"
                        label="Mobile Number"
                        value={userInfo?.mobileNumber || 'Not provided'}
                        color={theme.colors.secondary}
                    />
                    <View style={styles.divider} />
                    <ProfileItem
                        icon="book-education-outline"
                        label="Subject Specialization"
                        value={userInfo?.subject || 'General'}
                        color={theme.colors.accent}
                    />
                </AppCard>

                <AppCard style={styles.detailCard} padding={20}>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    <ProfileItem
                        icon="map-marker-outline"
                        label="Residential Address"
                        value={userInfo?.address || 'Not provided'}
                        color={theme.colors.pink}
                    />
                </AppCard>

                <AppCard style={styles.securityCard} padding={20}>
                    <Text style={styles.cardTitle}>Account Security</Text>
                    <TouchableOpacity style={styles.actionRow}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="lock-reset" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Change Password</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                </AppCard>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <View style={styles.logoutContent}>
                        <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
                        <Text style={styles.logoutText}>Log Out from Campus</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, justifyContent: 'space-between' },
    backButton: { marginRight: 10 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
    settingsBtn: { padding: 5 },
    scrollContent: { padding: 20 },
    profileSection: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatarCircle: { width: 100, height: 100, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: theme.colors.primary, shadowOpacity: 0.2, shadowRadius: 15 },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
    editBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: theme.colors.secondary, width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 2 },
    name: { fontSize: 24, fontWeight: '900', color: theme.colors.text, marginBottom: 8 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '10', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, gap: 8 },
    roleText: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
    detailCard: { marginBottom: 20 },
    securityCard: { marginBottom: 30 },
    cardTitle: { fontSize: 13, fontWeight: '900', color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    textContainer: { flex: 1 },
    label: { fontSize: 12, color: theme.colors.textLight, marginBottom: 4, fontWeight: '500' },
    value: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    divider: { height: 1, backgroundColor: '#F5F6F8', marginVertical: 4 },
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    actionText: { flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text },
    logoutBtn: { backgroundColor: '#FFF5F5', borderRadius: 20, borderWidth: 1, borderColor: '#FFEBEB', marginBottom: 40 },
    logoutContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    logoutText: { fontSize: 16, fontWeight: '900', color: theme.colors.error }
});

export default TeacherProfileScreen;
