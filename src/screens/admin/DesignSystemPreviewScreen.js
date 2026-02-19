import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import { theme } from '../../constants/theme';

const DesignSystemPreviewScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Design System"
                subtitle="UI Architecture & Components"
                onBack={() => navigation.goBack()}
                rightIcon="palette-outline"
            />

            <KeyboardWrapper backgroundColor="#fff">
                <View style={styles.scrollContent}>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Buttons (AppButton)</Text>
                        <AppButton
                            title="Primary Action"
                            onPress={() => { }}
                            style={styles.mb}
                        />
                        <AppButton
                            title="Danger Action"
                            type="danger"
                            icon="delete-outline"
                            onPress={() => { }}
                            style={styles.mb}
                        />
                        <AppButton
                            title="Secondary Outline"
                            type="secondary"
                            onPress={() => { }}
                            style={styles.mb}
                        />
                        <AppButton
                            title="Loading State"
                            loading={true}
                            onPress={() => { }}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cards (AppCard)</Text>
                        <AppCard padding={20}>
                            <Text style={styles.cardHeading}>Standard Information Card</Text>
                            <Text style={styles.cardBody}>
                                This is a reusable card component with consistent shadowing,
                                border-radius, and internal padding.
                            </Text>
                        </AppCard>

                        <AppCard
                            onPress={() => { }}
                            style={{ backgroundColor: theme.colors.primary + '05' }}
                        >
                            <Text style={[styles.cardHeading, { color: theme.colors.primary }]}>
                                Interactive Card (Press Me)
                            </Text>
                            <Text style={styles.cardBody}>
                                Cards support onPress actions with a gentle touch-down opacity.
                            </Text>
                        </AppCard>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Badges & Status (AppBadge)</Text>
                        <View style={styles.row}>
                            <AppBadge label="Success" type="success" style={styles.mr} />
                            <AppBadge label="Warning" type="warning" style={styles.mr} />
                            <AppBadge label="Danger" type="danger" style={styles.mr} />
                            <AppBadge label="Info" type="info" />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Inputs (AppInput)</Text>
                        <AppInput
                            label="Full Name"
                            placeholder="Enter your name..."
                            icon="account-outline"
                            value={name}
                            onChangeText={setName}
                        />
                        <AppInput
                            label="Message"
                            placeholder="Type something here..."
                            icon="message-outline"
                            value={msg}
                            onChangeText={setMsg}
                            multiline={true}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Empty States (EmptyState)</Text>
                        <AppCard padding={0} radius={32} style={{ height: 350, overflow: 'hidden' }}>
                            <EmptyState
                                icon="folder-open-outline"
                                title="No Documents"
                                description="You haven't uploaded any study materials yet."
                                actionLabel="UPLOAD NOW"
                                onAction={() => { }}
                            />
                        </AppCard>
                    </View>

                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 35 },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.textLight,
        letterSpacing: 2,
        marginBottom: 20,
        marginLeft: 5
    },
    mb: { marginBottom: 15 },
    mr: { marginRight: 10, marginBottom: 10 },
    row: { flexDirection: 'row', flexWrap: 'wrap' },
    cardHeading: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    cardBody: { fontSize: 14, color: theme.colors.textLight, lineHeight: 22 },
});

export default DesignSystemPreviewScreen;
