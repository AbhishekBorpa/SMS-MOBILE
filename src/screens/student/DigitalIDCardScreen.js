import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const DigitalIDCardScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const qrValue = userInfo?._id || 'NO_ID';

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Student Pass"
                onBack={() => navigation.goBack()}
                rightIcon="download-outline"
            />

            <View style={styles.content}>
                <View style={styles.cardWrapper}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.idCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialCommunityIcons name="lightning-bolt" size={150} color="rgba(255,255,255,0.05)" style={styles.bgIcon} />

                        <View style={styles.topSection}>
                            <View style={styles.logoWrapper}>
                                <MaterialCommunityIcons name="school-outline" size={30} color={theme.colors.primary} />
                            </View>
                            <View style={styles.schoolInfo}>
                                <Text style={styles.schoolName}>BYJU'S LEARNING</Text>
                                <Text style={styles.schoolSub}>Campus Academy</Text>
                            </View>
                        </View>

                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarText}>{userInfo?.name?.charAt(0) || 'S'}</Text>
                                </View>
                            </View>
                            <Text style={styles.userName}>{userInfo?.name || 'Academic Scholar'}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{userInfo?.role || 'Student'}</Text>
                            </View>
                        </View>

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>REG ID</Text>
                                <Text style={styles.detailValue}>{userInfo?._id?.slice(-8)?.toUpperCase() || 'BJS-2024'}</Text>
                            </View>
                            <View style={styles.detailBox}>
                                <Text style={styles.detailLabel}>BATCH</Text>
                                <Text style={styles.detailValue}>2025-2026</Text>
                            </View>
                        </View>

                        <View style={styles.qrContainer}>
                            <View style={styles.qrBg}>
                                <QRCode value={qrValue} size={90} color={theme.colors.primary} />
                            </View>
                            <View style={styles.qrInfo}>
                                <Text style={styles.statusLabel}>STATUS</Text>
                                <View style={styles.statusIndicator}>
                                    <View style={styles.greenDot} />
                                    <Text style={styles.statusText}>ACTIVE PASS</Text>
                                </View>
                                <Text style={styles.validText}>Expires Aug 2026</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.instructionCard}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.textLight} />
                    <Text style={styles.instructionText}>
                        Present this digital ID for campus entry and library access.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        justifyContent: 'space-between'
    },
    backButton: {
        marginRight: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    shareBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20
    },
    cardWrapper: {
        width: width * 0.85,
        height: 520,
        borderRadius: 32,
        elevation: 15,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    idCard: {
        flex: 1,
        padding: 25,
        justifyContent: 'space-between'
    },
    bgIcon: {
        position: 'absolute',
        top: -30,
        right: -30,
        transform: [{ rotate: '15deg' }]
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    logoWrapper: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    schoolInfo: {
        flex: 1
    },
    schoolName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1
    },
    schoolSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 10
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        marginBottom: 15
    },
    avatarInner: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    userName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6
    },
    roleBadge: {
        backgroundColor: '#FFB800',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 12
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    detailBox: {
        flex: 1
    },
    detailLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    qrContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 24,
        gap: 15
    },
    qrBg: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    qrInfo: {
        flex: 1
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textLight,
        marginBottom: 4
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.green
    },
    statusText: {
        fontSize: 14,
        fontWeight: '900',
        color: theme.colors.text
    },
    validText: {
        color: theme.colors.textLight,
        fontSize: 11,
        fontWeight: '500'
    },
    instructionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        padding: 15,
        borderRadius: 16,
        marginHorizontal: 30,
        marginTop: 30,
        gap: 10
    },
    instructionText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.textLight,
        lineHeight: 18
    }
});

export default DigitalIDCardScreen;
