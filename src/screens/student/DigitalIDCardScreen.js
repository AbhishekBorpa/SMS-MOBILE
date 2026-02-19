import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const DigitalIDCardScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [studentProfile, setStudentProfile] = useState(userInfo);
    const [studentClass, setStudentClass] = useState('N/A');

    useEffect(() => {
        fetchStudentDetails();
    }, []);

    const fetchStudentDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Refresh User Profile
            const userRes = await axios.get(`${API_URL}/auth/me`, config);
            setStudentProfile(userRes.data);

            // 2. Fetch Class Info
            const classRes = await axios.get(`${API_URL}/classes/student`, config);
            if (classRes.data && classRes.data.length > 0) {
                // If multiple classes, show the first one or combine them
                setStudentClass(classRes.data[0].name);
            } else {
                setStudentClass('Enrolled Student');
            }

        } catch (error) {
            console.log('Error fetching ID card details:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudentDetails();
    };

    const qrValue = JSON.stringify({
        id: studentProfile?._id,
        name: studentProfile?.name,
        role: studentProfile?.role,
        validParams: true
    });

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Student Pass"
                onBack={() => navigation.goBack()}
                rightIcon="refresh"
                onRightPress={onRefresh}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
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
                                            <Text style={styles.avatarText}>{studentProfile?.name?.charAt(0) || 'S'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.userName}>{studentProfile?.name || 'Academic Scholar'}</Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleText}>{studentProfile?.role || 'Student'}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailBox}>
                                        <Text style={styles.detailLabel}>REG ID</Text>
                                        <Text style={styles.detailValue}>{studentProfile?._id?.slice(-8)?.toUpperCase() || '---'}</Text>
                                    </View>
                                    <View style={styles.detailBox}>
                                        <Text style={styles.detailLabel}>CLASS / BATCH</Text>
                                        <Text style={styles.detailValue}>{studentClass}</Text>
                                    </View>
                                </View>

                                <View style={[styles.detailsGrid, { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10 }]}>
                                    <View style={styles.detailBox}>
                                        <Text style={styles.detailLabel}>MOBILE</Text>
                                        <Text style={styles.detailValue}>{studentProfile?.mobileNumber || 'N/A'}</Text>
                                    </View>
                                </View>

                                <View style={styles.qrContainer}>
                                    <View style={styles.qrBg}>
                                        <QRCode value={qrValue} size={80} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.qrInfo}>
                                        <Text style={styles.statusLabel}>STATUS</Text>
                                        <View style={styles.statusIndicator}>
                                            <View style={[styles.greenDot, { backgroundColor: studentProfile?.feeStatus === 'Overdue' ? theme.colors.error : theme.colors.green }]} />
                                            <Text style={styles.statusText}>{studentProfile?.feeStatus === 'Overdue' ? 'FEES OVERDUE' : 'ACTIVE PASS'}</Text>
                                        </View>
                                        <Text style={styles.validText}>Valid for current session</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.instructionCard}>
                            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.textLight} />
                            <Text style={styles.instructionText}>
                                Present this digital ID for campus entry, library access, and during examinations.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40
    },
    cardWrapper: {
        width: width * 0.85,
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
        padding: 25,
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
        gap: 15,
        marginBottom: 20
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
        marginBottom: 25
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
        marginBottom: 6,
        textAlign: 'center'
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
        gap: 15,
        marginTop: 20
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
