import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const CreateCourseScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title || !description || !category) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const courseData = {
                title,
                description,
                category,
                level,
                modules: []
            };

            await axios.post(`${API_URL}/courses`, courseData, config);
            Alert.alert('Success', 'Course created successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Create New Course"
                onBack={() => navigation.goBack()}
                rightIcon="book-plus-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.formContainer}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="school-outline" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>Course Builder</Text>
                        <Text style={styles.formSubtitle}>Design a premium learning experience for your students.</Text>
                    </View>

                    <AppCard style={styles.card} padding={20}>
                        <AppInput
                            label="Course Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Introduction to Physics"
                            icon="format-title"
                        />

                        <AppInput
                            label="Category"
                            value={category}
                            onChangeText={setCategory}
                            placeholder="e.g. Science"
                            icon="tag-outline"
                        />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Difficulty Level</Text>
                            <View style={styles.levelRow}>
                                {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                                    <TouchableOpacity
                                        key={l}
                                        style={[
                                            styles.levelBtn,
                                            level === l && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => setLevel(l)}
                                    >
                                        <Text style={[
                                            styles.levelBtnText,
                                            level === l && { color: '#fff' }
                                        ]}>{l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <AppInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell students what they will learn..."
                            icon="text-box-outline"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Launch Course"
                            onPress={handleCreate}
                            loading={loading}
                            icon="rocket-launch-outline"
                            style={styles.submitBtn}
                        />
                    </AppCard>

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            You can add modules and lessons once the course is created.
                        </Text>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    formContainer: { padding: 20, paddingBottom: 40 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    card: { elevation: 4 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10, marginLeft: 4 },
    levelRow: { flexDirection: 'row', gap: 10 },
    levelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff' },
    levelBtnText: { color: theme.colors.textLight, fontWeight: '600', fontSize: 12 },
    textArea: { height: 120 },
    submitBtn: { marginTop: 15 },
    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    note: { color: theme.colors.textLight, fontSize: 13, fontWeight: '600' }
});

export default CreateCourseScreen;
