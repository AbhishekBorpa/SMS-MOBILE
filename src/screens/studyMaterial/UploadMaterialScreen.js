import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
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

const UploadMaterialScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !subject || !grade || !link || !description) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(`${API_URL}/materials`, {
                title,
                subject,
                grade,
                link,
                description
            }, config);

            Alert.alert('Success', 'Study material uploaded successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to upload material');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Upload Material"
                onBack={() => navigation.goBack()}
                rightIcon="file-upload-outline"
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="file-document-edit-outline" size={60} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.formTitle}>Resource Sharing</Text>
                        <Text style={styles.formSubtitle}>Share study notes, PDFs, or external links with your students.</Text>
                    </View>

                    <AppCard style={styles.formCard} padding={20}>
                        <AppInput
                            label="Resource Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Quantum Physics Notes"
                            icon="file-document-edit"
                        />

                        <View style={styles.section}>
                            <Text style={styles.label}>Subject</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Geography', 'Computer Science'].map((sub) => (
                                    <TouchableOpacity
                                        key={sub}
                                        style={[styles.chip, subject === sub && styles.activeChip]}
                                        onPress={() => setSubject(sub)}
                                    >
                                        <Text style={[styles.chipText, subject === sub && styles.activeChipText]}>{sub}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Class/Grade</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {['9th', '10th', '11th', '12th'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.chip, grade === g && styles.activeChip]}
                                        onPress={() => setGrade(g)}
                                    >
                                        <Text style={[styles.chipText, grade === g && styles.activeChipText]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <AppInput
                            label="External Link (Drive/Cloud/PDF)"
                            value={link}
                            onChangeText={setLink}
                            placeholder="https://drive.google.com/..."
                            icon="link-variant"
                            autoCapitalize="none"
                        />

                        <AppInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Topic overview and learning goals..."
                            icon="text-box-search-outline"
                            multiline={true}
                            style={styles.textArea}
                        />

                        <AppButton
                            title="Share Resource"
                            onPress={handleSubmit}
                            loading={loading}
                            icon="cloud-upload"
                            style={styles.submitBtn}
                        />
                    </AppCard>

                    <Text style={styles.infoText}>
                        Students in the selected grade will be able to access this resource immediately.
                    </Text>
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
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    col: { flex: 0.48 },
    textArea: { height: 120 },
    submitBtn: { marginTop: 15 },
    infoText: { textAlign: 'center', color: theme.colors.textLight, fontSize: 12, marginTop: 30, fontStyle: 'italic', fontWeight: '600' },

    // Chip Picker
    section: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8, marginLeft: 2 },
    chipScroll: { flexDirection: 'row', height: 45 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#eee', justifyContent: 'center' },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 13, color: theme.colors.textLight, fontWeight: '500' },
    activeChipText: { color: '#fff', fontWeight: 'bold' }
});

export default UploadMaterialScreen;
