import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AddModuleScreen = ({ route, navigation }) => {
    const { courseId, currentModules = [] } = route.params;
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a module title');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const newModule = {
                title,
                lessons: [] // Initialize with empty lessons
            };

            const updatedModules = [...currentModules, newModule];

            await axios.put(`${API_URL}/courses/${courseId}`, {
                modules: updatedModules
            }, config);

            Alert.alert('Success', 'Module added successfully!');
            navigation.goBack();
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to add module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Add New Module"
                onBack={() => navigation.goBack()}
                rightIcon="view-grid-plus-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.content}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="folder-plus-outline" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>New Module</Text>
                        <Text style={styles.formSubtitle}>Organize your course content into logical sections.</Text>
                    </View>

                    <AppCard style={styles.card} padding={20}>
                        <AppInput
                            label="Module Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Chapter 1: Fundamentals"
                            icon="format-title"
                        />

                        <AppButton
                            title="Create Module"
                            onPress={handleCreate}
                            loading={loading}
                            icon="plus"
                            style={styles.submitBtn}
                        />
                    </AppCard>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 20 },
    illustrationWrap: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },
    card: { elevation: 4 },
    submitBtn: { marginTop: 20 }
});

export default AddModuleScreen;
