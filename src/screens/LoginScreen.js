import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios'; // Import axios
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import KeyboardWrapper from '../components/KeyboardWrapper';
import API_URL from '../config/api'; // Import API_URL
import { theme } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('Student');
    const { login, isLoading } = useContext(AuthContext);

    const roles = [
        { name: 'Student', icon: 'school', color: '#4A90E2' },
        { name: 'Teacher', icon: 'account-tie', color: '#9C27B0' },
        { name: 'Admin', icon: 'shield-account', color: '#F44336' }
    ];

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        login(email, password, selectedRole);
    };

    const handleForgotPassword = () => {
        Alert.alert(
            'Reset Password',
            'Enter your email address to receive password reset instructions',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Send Reset Link',
                    onPress: async () => {
                        if (!email) {
                            Alert.alert('Error', 'Please enter your email first');
                            return;
                        }

                        // Basic email format validation
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(email)) {
                            Alert.alert('Error', 'Please enter a valid email address');
                            return;
                        }

                        try {
                            // Call the backend endpoint to request a password reset link
                            await axios.post(`${API_URL}/auth/forgot-password`, { email });
                            // Always show a generic success message to prevent email enumeration
                            Alert.alert('Success', 'If an account with that email exists, a password reset link has been sent to your email address.');
                        } catch (error) {
                            console.log('Forgot password error:', error.response?.data || error.message);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to send password reset link. Please try again later.');
                        }
                    }
                }
            ]
        );
    };

    const handleSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to reach us?',
            [
                {
                    text: 'Email',
                    onPress: () => Linking.openURL('mailto:support@schoolsms.com')
                },
                {
                    text: 'Phone',
                    onPress: () => Linking.openURL('tel:+911234567890')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };



    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardWrapper backgroundColor="transparent">
                        <View style={styles.content}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.logoContainer}>
                                    <MaterialCommunityIcons name="school" size={60} color="#fff" />
                                </View>
                                <Text style={styles.title}>School SMS</Text>
                                <Text style={styles.subtitle}>Student Management System</Text>
                            </View>

                            {/* Login Card */}
                            <View style={styles.loginCard}>
                                <Text style={styles.welcomeText}>Welcome Back!</Text>
                                <Text style={styles.welcomeSubtext}>Sign in to continue</Text>

                                {/* Role Selector */}
                                <View style={styles.roleSelector}>
                                    {roles.map((role) => (
                                        <TouchableOpacity
                                            key={role.name}
                                            style={[
                                                styles.roleButton,
                                                selectedRole === role.name && {
                                                    backgroundColor: role.color + '15',
                                                    borderColor: role.color
                                                }
                                            ]}
                                            onPress={() => setSelectedRole(role.name)}
                                        >
                                            <MaterialCommunityIcons
                                                name={role.icon}
                                                size={24}
                                                color={selectedRole === role.name ? role.color : '#999'}
                                            />
                                            <Text style={[
                                                styles.roleText,
                                                selectedRole === role.name && {
                                                    color: role.color,
                                                    fontWeight: 'bold'
                                                }
                                            ]}>
                                                {role.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Form */}
                                <View style={styles.form}>
                                    <AppInput
                                        label="Email Address"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        icon="email-outline"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <AppInput
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChangeText={setPassword}
                                        icon="lock-outline"
                                        secureTextEntry
                                    />

                                    <TouchableOpacity
                                        style={styles.forgotPassword}
                                        onPress={handleForgotPassword}
                                    >
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    <AppButton
                                        title="Login to Account"
                                        onPress={handleLogin}
                                        loading={isLoading}
                                        type="primary"
                                    />



                                    <View style={styles.footer}>
                                        <Text style={styles.footerText}>Need help with login? </Text>
                                        <TouchableOpacity onPress={handleSupport}>
                                            <Text style={styles.linkText}>Contact Support</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Version Info */}
                            <Text style={styles.versionText}>Version 1.0.0</Text>
                        </View>
                    </KeyboardWrapper>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textAlign: 'center',
    },
    loginCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
    },
    welcomeSubtext: {
        fontSize: 14,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 20,
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    roleText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontWeight: '600',
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: -10,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: theme.colors.textLight,
        fontSize: 14,
    },
    linkText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    versionText: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 20,
    },
});

export default LoginScreen;
