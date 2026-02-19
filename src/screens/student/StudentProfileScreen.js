import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const StudentProfileScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleNotificationToggle = () => {
        setNotificationsEnabled(!notificationsEnabled);
        Alert.alert(
            'Notifications',
            `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`,
            [{ text: 'OK' }]
        );
    };

    const handleLanguageChange = () => {
        Alert.alert(
            'Language',
            'Select your preferred language',
            [
                { text: 'English', onPress: () => Alert.alert('Language', 'English selected') },
                { text: 'Hindi', onPress: () => Alert.alert('Language', 'Hindi selected') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleHelpCenter = () => {
        Alert.alert(
            'Help Center',
            'How can we help you today?',
            [
                { text: 'FAQs', onPress: () => Alert.alert('FAQs', 'Frequently asked questions will be displayed here') },
                { text: 'Tutorials', onPress: () => Alert.alert('Tutorials', 'Video tutorials coming soon') },
                { text: 'Close', style: 'cancel' }
            ]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'Choose how you\'d like to contact us',
            [
                {
                    text: 'Email',
                    onPress: () => Linking.openURL('mailto:support@schoolsms.com?subject=Support Request')
                },
                {
                    text: 'Phone',
                    onPress: () => Linking.openURL('tel:+911234567890')
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handlePrivacyPolicy = () => {
        Alert.alert(
            'Privacy Policy',
            'Your privacy is important to us. We collect and use your data to provide better educational services.\n\nFor full privacy policy, visit our website.',
            [
                { text: 'View Online', onPress: () => Linking.openURL('https://abhishekborpa.github.io/school-app-legal/privacy-policy.html') },
                { text: 'Close', style: 'cancel' }
            ]
        );
    };

    const handleTermsOfService = () => {
        Alert.alert(
            'Terms of Service',
            'By using this app, you agree to our terms and conditions.\n\nFor complete terms, visit our website.',
            [
                { text: 'View Online', onPress: () => Linking.openURL('https://abhishekborpa.github.io/school-app-legal/terms-of-service.html') },
                { text: 'Close', style: 'cancel' }
            ]
        );
    };

    const handleDarkMode = () => {
        Alert.alert('Dark Mode', 'Dark mode is coming soon in the next update!');
    };

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
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Student Profile</Text>
                <TouchableOpacity style={styles.settingsBtn}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarText}>{userInfo?.name?.charAt(0) || 'S'}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <MaterialCommunityIcons name="camera-outline" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{userInfo?.name || 'Academic Scholar'}</Text>
                    <View style={styles.roleBadge}>
                        <MaterialCommunityIcons name="school-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.roleText}>{userInfo?.role} ID: {userInfo?._id?.slice(-6)?.toUpperCase()}</Text>
                    </View>
                </View>

                <AppCard style={styles.detailCard} padding={20}>
                    <Text style={styles.cardTitle}>Personal Details</Text>
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
                        value={userInfo?.mobileNumber || '+91 98765 43210'}
                        color={theme.colors.secondary}
                    />
                    <View style={styles.divider} />
                    <ProfileItem
                        icon="map-marker-outline"
                        label="Residential Address"
                        value="123 Academic Lane, Knowledge City"
                        color={theme.colors.pink}
                    />
                </AppCard>

                <AppCard style={styles.securityCard} padding={20}>
                    <Text style={styles.cardTitle}>Account Security</Text>
                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="lock-reset" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Change Password</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                </AppCard>

                <AppCard style={styles.preferencesCard} padding={20}>
                    <Text style={styles.cardTitle}>Preferences</Text>

                    <View style={styles.actionRow}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="bell-outline" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Notifications</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ false: '#E0E0E0', true: theme.colors.primary + '40' }}
                            thumbColor={notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionRow} onPress={handleDarkMode}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="theme-light-dark" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Dark Mode</Text>
                        <View style={[styles.badge, { backgroundColor: '#F0F0F0' }]}>
                            <Text style={[styles.badgeText, { color: '#666' }]}>Soon</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionRow} onPress={handleLanguageChange}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="translate" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Language</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>English</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                </AppCard>

                <AppCard style={styles.helpCard} padding={20}>
                    <Text style={styles.cardTitle}>Help & Support</Text>

                    <TouchableOpacity style={styles.actionRow} onPress={handleHelpCenter}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="help-circle-outline" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Help Center</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionRow} onPress={handleContactSupport}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="message-text-outline" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Contact Support</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionRow} onPress={handlePrivacyPolicy}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Privacy Policy</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.actionRow} onPress={handleTermsOfService}>
                        <View style={styles.actionIcon}>
                            <MaterialCommunityIcons name="shield-check-outline" size={20} color={theme.colors.textLight} />
                        </View>
                        <Text style={styles.actionText}>Terms of Service</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
                    </TouchableOpacity>
                </AppCard>

                <AppCard style={styles.aboutCard} padding={20}>
                    <Text style={styles.cardTitle}>About</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>App Version</Text>
                            <Text style={styles.value}>1.0.0 (Build 100)</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="update" size={20} color={theme.colors.secondary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Last Updated</Text>
                            <Text style={styles.value}>January 2026</Text>
                        </View>
                    </View>
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
    scrollContent: { paddingHorizontal: 20, paddingBottom: 130, paddingTop: 20 },
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
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    actionText: { flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text },
    badge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    preferencesCard: { marginBottom: 20 },
    helpCard: { marginBottom: 20 },
    aboutCard: { marginBottom: 30 },
    logoutBtn: { backgroundColor: '#FFF5F5', borderRadius: 20, borderWidth: 1, borderColor: '#FFEBEB', marginBottom: 40 },
    logoutContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    logoutText: { fontSize: 16, fontWeight: '900', color: theme.colors.error }
});

export default StudentProfileScreen;
