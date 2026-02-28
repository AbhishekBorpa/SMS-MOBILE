import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
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

    // Float animation for the card
    const floatAnim = new Animated.Value(0);

    useEffect(() => {
        fetchStudentDetails();
        startFloatAnimation();
    }, []);

    const startFloatAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const fetchStudentDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const userRes = await axios.get(`${API_URL}/auth/me`, config);
            setStudentProfile(userRes.data);

            const classRes = await axios.get(`${API_URL}/classes/student`, config);
            if (classRes.data && classRes.data.length > 0) {
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

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10]
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <Animated.View style={[styles.cardWrapper, { transform: [{ translateY }] }]}>
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.idCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {/* Background Decorative Icon */}
                                <MaterialCommunityIcons name="shield-half-full" size={200} color="rgba(255,255,255,0.03)" style={styles.bgIcon} />

                                <View style={styles.topSection}>
                                    <View style={styles.logoWrapper}>
                                        <MaterialCommunityIcons name="school" size={28} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.schoolInfo}>
                                        <Text style={styles.schoolName}>CAMPUS PASS</Text>
                                        <Text style={styles.schoolSub}>Digital Identity</Text>
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
                                        <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" />
                                        <Text style={styles.roleText}>{studentProfile?.role || 'Student'}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailBox}>
                                        <Text style={styles.detailLabel}>REGISTRATION ID</Text>
                                        <Text style={styles.detailValue}>{studentProfile?._id?.slice(-8)?.toUpperCase() || '---'}</Text>
                                    </View>
                                    <View style={styles.detailBox}>
                                        <Text style={styles.detailLabel}>CLASS / BATCH</Text>
                                        <Text style={styles.detailValue}>{studentClass}</Text>
                                    </View>
                                </View>

                                <View style={styles.barcodeSection}>
                                    <View style={styles.qrBg}>
                                        <QRCode value={qrValue} size={90} color={theme.colors.primary} backgroundColor="transparent" />
                                    </View>
                                    <View style={styles.qrInfo}>
                                        <Text style={styles.statusLabel}>PASS STATUS</Text>
                                        <AppBadge
                                            label={studentProfile?.feeStatus === 'Overdue' ? 'FEES OVERDUE' : 'ACTIVE'}
                                            type={studentProfile?.feeStatus === 'Overdue' ? 'error' : 'success'}
                                            style={{ alignSelf: 'flex-start', marginVertical: 8 }}
                                        />
                                        <Text style={styles.validText}>Valid for {new Date().getFullYear()}-{new Date().getFullYear() + 1} Session</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <View style={styles.instructionCard}>
                            <View style={styles.instructionIconWrapper}>
                                <MaterialCommunityIcons name="line-scan" size={24} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.instructionText}>
                                Scan this digital ID card at campus entry gates, library kiosks, and during official examinations.
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
        backgroundColor: theme.colors.background
    },
    content: {
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 40
    },
    cardWrapper: {
        width: width * 0.88,
        borderRadius: 28,
        elevation: 20,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 12 },
        backgroundColor: '#fff',
        marginBottom: 30
    },
    idCard: {
        borderRadius: 28,
        padding: 24,
        overflow: 'hidden'
    },
    bgIcon: {
        position: 'absolute',
        top: '20%',
        right: -50,
        transform: [{ rotate: '15deg' }]
    },
    topSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 25
    },
    logoWrapper: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    schoolInfo: {
        flex: 1
    },
    schoolName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2
    },
    schoolSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
        textTransform: 'uppercase'
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 4,
        marginBottom: 16
    },
    avatarInner: {
        flex: 1,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        fontSize: 42,
        fontWeight: '900',
        color: theme.colors.primary
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
        textAlign: 'center'
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        gap: 6
    },
    roleText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.15)',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    detailBox: {
        flex: 1
    },
    detailLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 6,
        letterSpacing: 0.5
    },
    detailValue: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold'
    },
    barcodeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        gap: 20,
        marginTop: 25,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    qrBg: {
        padding: 8,
        backgroundColor: theme.colors.primary + '10',
        borderRadius: 16,
    },
    qrInfo: {
        flex: 1,
        justifyContent: 'center'
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.textLight,
        letterSpacing: 0.5
    },
    validText: {
        color: theme.colors.textLight,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4
    },
    instructionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        width: width * 0.88,
        gap: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    instructionIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center'
    },
    instructionText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 20,
        fontWeight: '500'
    }
});

export default DigitalIDCardScreen;
