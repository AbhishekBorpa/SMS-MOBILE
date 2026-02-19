import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const CreateQuizScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Practice'); // 'Practice' or 'Competition'
    const [duration, setDuration] = useState('30'); // in minutes
    const [isPublic, setIsPublic] = useState(false);

    const [questions, setQuestions] = useState([
        { questionText: '', image: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 1 }
    ]);
    const [loading, setLoading] = useState(false);

    // New state for Linked Material
    const [materials, setMaterials] = useState([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [showMaterialPicker, setShowMaterialPicker] = useState(false);

    // Placeholder for fetchClasses (needed for logic consistency)
    const [classes, setClasses] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const quizType = type;

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/materials`, config);
            setMaterials(data);
        } catch (error) {
            console.log('Error fetching materials:', error);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', image: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 1 }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIdx, oIdx, value) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    const handleCreate = async () => {
        if (!title || questions.length === 0) {
            Alert.alert('Error', 'Please verify title and add at least one question');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const quizData = {
                title,
                description,
                type: quizType,
                startTime: startTime || new Date(),
                endTime: endTime || new Date(Date.now() + 86400000), // Default 24h
                duration: parseInt(duration) || 30,
                classIds: selectedClasses,
                questions,
                linkedMaterial: selectedMaterialId
            };

            await axios.post(`${API_URL}/quizzes`, quizData, config);
            Alert.alert('Success', 'Quiz created successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to create quiz');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Create Assessment"
                onBack={() => navigation.goBack()}
                rightIcon="help-circle-outline"
            />

            <KeyboardWrapper backgroundColor="#F4F6F9">
                <View style={styles.scrollContent}>
                    <View style={styles.illustrationWrap}>
                        <LinearGradient
                            colors={theme.gradients.primary}
                            style={styles.iconCircle}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name={type === 'Competition' ? "trophy" : "comment-question-outline"} size={48} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.formTitle}>{type === 'Competition' ? 'New Competition' : 'New Practice Quiz'}</Text>
                        <Text style={styles.formSubtitle}>Create engaging challenges for your students.</Text>
                    </View>

                    <AppCard style={styles.sectionCard} padding={20}>
                        <Text style={styles.sectionTitle}>Quiz Details</Text>

                        <AppInput
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Math Olympics 2024"
                            icon="format-title"
                        />
                        <AppInput
                            label="Description (Optional)"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Brief overview..."
                            icon="text-short"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Quiz Type</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={styles.typeBtnWrapper}
                                        onPress={() => setType('Practice')}
                                    >
                                        {type === 'Practice' ? (
                                            <LinearGradient colors={theme.gradients.primary} style={styles.typeBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                                <Text style={styles.typeTextActive}>Practice</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.typeBtnInactive}>
                                                <Text style={styles.typeTextInactive}>Practice</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.typeBtnWrapper}
                                        onPress={() => setType('Competition')}
                                    >
                                        {type === 'Competition' ? (
                                            <LinearGradient colors={theme.gradients.secondary} style={styles.typeBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                                <Text style={styles.typeTextActive}>Competition</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.typeBtnInactive}>
                                                <Text style={styles.typeTextInactive}>Competition</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <AppInput
                                label="Duration (mins)"
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                placeholder="30"
                                containerStyle={{ flex: 1 }}
                            />
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
                                <Text style={styles.label}>Public Access</Text>
                                <Switch
                                    value={isPublic}
                                    onValueChange={setIsPublic}
                                    trackColor={{ false: "#E0E0E0", true: theme.colors.primary }}
                                    thumbColor={"#fff"}
                                />
                            </View>
                        </View>
                    </AppCard>

                    {questions.map((q, qIdx) => (
                        <AppCard key={qIdx} style={styles.questionCard} padding={0}>
                            <LinearGradient
                                colors={['#F5F7FA', '#fff']}
                                style={styles.questionHeaderGradient}
                            >
                                <View style={styles.questionHeaderLeft}>
                                    <View style={styles.qBadge}>
                                        <Text style={styles.qBadgeText}>Q{qIdx + 1}</Text>
                                    </View>
                                    <Text style={styles.questionHeaderText}>Question</Text>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    const newQ = [...questions];
                                    newQ.splice(qIdx, 1);
                                    setQuestions(newQ);
                                }} style={styles.deleteBtn}>
                                    <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.questionBody}>
                                <AppInput
                                    placeholder="Enter question text..."
                                    value={q.questionText}
                                    onChangeText={(val) => updateQuestion(qIdx, 'questionText', val)}
                                    multiline={true}
                                    style={styles.questionInput}
                                />

                                <AppInput
                                    placeholder="Image URL (Optional)"
                                    value={q.image}
                                    onChangeText={(val) => updateQuestion(qIdx, 'image', val)}
                                    icon="image"
                                    autoCapitalize="none"
                                />

                                <View style={styles.optionsDivider}>
                                    <Text style={styles.subLabel}>Answer Options</Text>
                                    <Text style={styles.subLabelHint}>Tap circle to mark correct answer</Text>
                                </View>

                                {q.options.map((opt, oIdx) => (
                                    <View key={oIdx} style={styles.optionRow}>
                                        <TouchableOpacity
                                            onPress={() => updateQuestion(qIdx, 'correctAnswerIndex', oIdx)}
                                            style={[
                                                styles.radio,
                                                q.correctAnswerIndex === oIdx && { borderColor: theme.colors.success }
                                            ]}
                                        >
                                            {q.correctAnswerIndex === oIdx ? (
                                                <View style={[styles.radioInner, { backgroundColor: theme.colors.success }]} />
                                            ) : null}
                                        </TouchableOpacity>
                                        <View style={styles.optionInputWrapper}>
                                            <AppInput
                                                style={styles.optionInput}
                                                placeholder={`Option ${oIdx + 1}`}
                                                value={opt}
                                                onChangeText={(val) => updateOption(qIdx, oIdx, val)}
                                                containerStyle={{ marginBottom: 0 }}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </AppCard>
                    ))}

                    <TouchableOpacity onPress={addQuestion} activeOpacity={0.8} style={styles.addQuestionWrapper}>
                        <View style={styles.addQuestionBtn}>
                            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                            <Text style={styles.addQuestionText}>Add New Question</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Linked Study Material</Text>
                    <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() => setShowMaterialPicker(!showMaterialPicker)}
                    >
                        <View style={[styles.pickerIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="file-link-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.pickerBtnText}>
                            {selectedMaterialId
                                ? materials.find(m => m._id === selectedMaterialId)?.title
                                : "Select a resource (Optional)"}
                        </Text>
                        <MaterialCommunityIcons name={showMaterialPicker ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>

                    {showMaterialPicker && (
                        <AppCard style={styles.pickerListCard} padding={0}>
                            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                {materials.length === 0 ? (
                                    <Text style={styles.noDataText}>No study materials found.</Text>
                                ) : (
                                    materials.map(item => (
                                        <TouchableOpacity
                                            key={item._id}
                                            style={[styles.pickerItem, selectedMaterialId === item._id && styles.activePickerItem]}
                                            onPress={() => {
                                                setSelectedMaterialId(item._id);
                                                setShowMaterialPicker(false);
                                            }}
                                        >
                                            <Text style={[styles.pickerItemText, selectedMaterialId === item._id && styles.activePickerItemText]}>
                                                {item.title}
                                            </Text>
                                            {selectedMaterialId === item._id && (
                                                <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </AppCard>
                    )}

                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={styles.createBtnContainer}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.createBtn}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="check-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.createBtnText}>Create Assessment</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F9' },
    scrollContent: { padding: 20, paddingBottom: 60 },

    illustrationWrap: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    iconCircle: { width: 80, height: 80, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 10 },
    formTitle: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 5 },
    formSubtitle: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center' },

    sectionCard: { marginBottom: 20, borderRadius: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },

    // Type Selector
    typeSelector: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 14, padding: 5, height: 45 },
    typeBtnWrapper: { flex: 1 },
    typeBtnActive: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    typeBtnInactive: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    typeTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    typeTextInactive: { color: theme.colors.textLight, fontWeight: '600', fontSize: 12 },

    // Question Cards
    questionCard: { marginBottom: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    questionHeaderGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    questionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    qBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 10 },
    qBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    questionHeaderText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
    deleteBtn: { padding: 5 },

    questionBody: { padding: 20 },
    questionInput: { minHeight: 60 },

    optionsDivider: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 5 },
    subLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
    subLabelHint: { fontSize: 11, color: theme.colors.textLight },

    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 14, height: 14, borderRadius: 7 },
    optionInputWrapper: { flex: 1 },
    optionInput: { height: 45, fontSize: 14 },

    addQuestionWrapper: { marginBottom: 20 },
    addQuestionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: theme.colors.primary + '50', borderRadius: 15, backgroundColor: theme.colors.primary + '05' },
    addQuestionText: { color: theme.colors.primary, fontWeight: 'bold', marginLeft: 8 },

    row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },

    // Picker
    pickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', padding: 12, borderRadius: 16 },
    pickerIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    pickerBtnText: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '500' },
    pickerListCard: { marginTop: 10, maxHeight: 250, overflow: 'hidden' },
    pickerItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F6F8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    activePickerItem: { backgroundColor: theme.colors.primary + '05' },
    pickerItemText: { fontSize: 13, color: theme.colors.text },
    activePickerItemText: { color: theme.colors.primary, fontWeight: 'bold' },
    noDataText: { padding: 20, textAlign: 'center', color: theme.colors.textLight },

    footerActions: { marginTop: 30 },
    createBtnContainer: { borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
    createBtn: { paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CreateQuizScreen;
