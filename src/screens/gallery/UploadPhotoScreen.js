import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
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

const UploadPhotoScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [className, setClassName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !imageUrl) {
            Alert.alert('Error', 'Title and Image URL are required');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_URL}/gallery`, {
                title,
                imageUrl,
                className,
                description
            }, config);

            Alert.alert('Success', 'Photo uploaded successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Upload Photo"
                onBack={() => navigation.goBack()}
                rightIcon="camera-plus-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.secondary + '10' }]}>
                            <MaterialCommunityIcons name="image-plus-outline" size={60} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.formTitle}>Memories & Events</Text>
                        <Text style={styles.formSubtitle}>Share moments from the classroom with parents and students.</Text>
                    </View>

                    <AppCard style={styles.formCard} padding={20}>
                        <AppInput
                            label="Photo Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Science Fair 2024"
                            icon="format-title"
                        />
                        <AppInput
                            label="Image URL (Public HTTPS)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            placeholder="https://images.unsplash.com/..."
                            icon="link-variant"
                            autoCapitalize="none"
                        />
                        <AppInput
                            label="Class / Event Name (Optional)"
                            value={className}
                            onChangeText={setClassName}
                            placeholder="e.g. 10th-B Physics Lab"
                            icon="school-outline"
                        />
                        <AppInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell a story about this photo..."
                            icon="text-box-outline"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Upload to Gallery"
                            onPress={handleSubmit}
                            loading={loading}
                            icon="cloud-upload"
                            style={styles.submitBtn}
                            type="secondary"
                        />
                    </AppCard>

                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons name="shield-check-outline" size={16} color={theme.colors.textLight} />
                        <Text style={styles.note}>
                            Photos will be visible to everyone in the school gallery.
                        </Text>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    keyboardView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    illustrationWrap: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
    iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    formCard: { elevation: 4 },
    textArea: { height: 120 },
    submitBtn: { marginTop: 15 },
    noteBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    note: { color: theme.colors.textLight, fontSize: 13, fontWeight: '600' }
});

export default UploadPhotoScreen;
