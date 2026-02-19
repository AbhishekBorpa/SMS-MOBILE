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

const AddLessonScreen = ({ route, navigation }) => {
    const { courseId, moduleIndex, currentModules = [] } = route.params;
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Error', 'Title and Content are required');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const newLesson = {
                title,
                duration: duration || '10 mins',
                videoUrl,
                content,
                isFree: false // Default to locked
            };

            // Deep clone modules to avoid mutation issues
            const updatedModules = JSON.parse(JSON.stringify(currentModules));

            if (!updatedModules[moduleIndex].lessons) {
                updatedModules[moduleIndex].lessons = [];
            }
            updatedModules[moduleIndex].lessons.push(newLesson);

            await axios.put(`${API_URL}/courses/${courseId}`, {
                modules: updatedModules
            }, config);

            Alert.alert('Success', 'Lesson added successfully!');
            navigation.goBack();
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to add lesson');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Add New Lesson"
                onBack={() => navigation.goBack()}
                rightIcon="play-box-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="presentation-play" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>New Lesson</Text>
                        <Text style={styles.formSubtitle}>Add valuable content to your module.</Text>
                    </View>

                    <AppCard style={styles.card} padding={20}>
                        <AppInput
                            label="Lesson Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Understanding Newton's Laws"
                            icon="format-title"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <AppInput
                                    label="Duration"
                                    value={duration}
                                    onChangeText={setDuration}
                                    placeholder="e.g. 15 mins"
                                    icon="clock-outline"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppInput
                                    label="Video URL (Optional)"
                                    value={videoUrl}
                                    onChangeText={setVideoUrl}
                                    placeholder="https://..."
                                    icon="video-outline"
                                />
                            </View>
                        </View>

                        <AppInput
                            label="Lesson Content"
                            value={content}
                            onChangeText={setContent}
                            placeholder="Write the text content, notes, or summary here..."
                            icon="text-box-outline"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Publish Lesson"
                            onPress={handleCreate}
                            loading={loading}
                            icon="check-circle-outline"
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
    scrollContent: { padding: 20 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20 },
    card: { elevation: 4 },
    row: { flexDirection: 'row' },
    textArea: { height: 150 },
    submitBtn: { marginTop: 20 }
});

export default AddLessonScreen;
