import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const AdminProfileScreen = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="My Profile"
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerProfile}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarText}>{userInfo?.name?.charAt(0) || 'A'}</Text>
                        </View>
                        <View style={styles.editIcon}>
                            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.userName}>{userInfo?.name || 'Administrator'}</Text>
                    <Text style={styles.userRole}>System Administrator</Text>
                </View>

                <AppCard style={styles.infoCard} padding={0}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <Text style={styles.value}>{userInfo?.email || 'admin@school.com'}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <Text style={styles.value}>+91 98765 43210</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="shield-account-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Role ID</Text>
                            <Text style={styles.value}>ADM-2024-001</Text>
                        </View>
                    </View>
                </AppCard>

                <Text style={styles.sectionTitle}>Settings</Text>

                <AppCard style={styles.settingsCard} padding={0}>
                    <View style={styles.settingRow}>
                        <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
                        <Text style={styles.settingText}>App Settings</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textLight} />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.settingRow}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color={theme.colors.text} />
                        <Text style={styles.settingText}>Notifications</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textLight} />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.settingRow}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={24} color={theme.colors.text} />
                        <Text style={styles.settingText}>Privacy & Security</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textLight} />
                    </View>
                </AppCard>

                <AppButton
                    title="Logout"
                    onPress={handleLogout}
                    type="outline"
                    textColor={theme.colors.pink}
                    style={styles.logoutBtn}
                    icon="logout"
                />

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20 },
    headerProfile: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    avatarContainer: { position: 'relative', marginBottom: 15 },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10
    },
    avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.text,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    userRole: { fontSize: 16, color: theme.colors.textLight, fontWeight: '500' },

    infoCard: { marginBottom: 30 },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    infoTextContainer: { flex: 1 },
    label: { fontSize: 12, color: theme.colors.textLight, marginBottom: 2 },
    value: { fontSize: 16, color: theme.colors.text, fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 70 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15, marginLeft: 5 },
    settingsCard: { marginBottom: 30 },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 15 },
    settingText: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '500' },

    logoutBtn: { borderColor: theme.colors.pink, marginBottom: 20 },
    versionText: { textAlign: 'center', color: theme.colors.textLight, fontSize: 12 }
});

export default AdminProfileScreen;
