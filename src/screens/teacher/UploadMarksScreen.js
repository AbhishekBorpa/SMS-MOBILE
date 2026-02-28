import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const EXAM_TYPES = ['Quiz', 'Midterm', 'Final', 'Assessment', 'Assignment'];

const GRADE_COLOR = (pct) => {
    if (pct >= 90) return { bg: '#E8F5E9', text: '#2E7D32', label: 'A+' };
    if (pct >= 80) return { bg: '#E3F2FD', text: '#1565C0', label: 'A' };
    if (pct >= 70) return { bg: '#FFF8E1', text: '#E65100', label: 'B' };
    if (pct >= 60) return { bg: '#FFF3E0', text: '#BF360C', label: 'C' };
    return { bg: '#FFEBEE', text: '#B71C1C', label: 'F' };
};

const UploadMarksScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({}); // { studentId: { score, total, examType } }
    const [loading, setLoading] = useState(false);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(null);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examType, setExamType] = useState('Quiz');
    const [score, setScore] = useState('');
    const [total, setTotal] = useState('100');
    const [uploading, setUploading] = useState(false);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/classes/teacher`, config);
            setClasses(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setStudents(classItem.students || []);
        setGrades({});
        setSelectedSubjectFilter(null);
    };

    const openGradeModal = (student) => {
        setSelectedStudent(student);
        const existing = grades[student._id];
        setExamType(existing?.examType || 'Quiz');
        setScore(existing?.score?.toString() || '');
        setTotal(existing?.total?.toString() || '100');
        setModalVisible(true);
    };

    const submitMark = async () => {
        const s = Number(score);
        const t = Number(total);
        if (!score || !total) {
            Alert.alert('Missing Fields', 'Please enter both score and total marks.');
            return;
        }
        if (isNaN(s) || isNaN(t) || t <= 0) {
            Alert.alert('Invalid Input', 'Score and total must be valid numbers.');
            return;
        }
        if (s > t) {
            Alert.alert('Invalid Score', 'Score cannot exceed total marks.');
            return;
        }

        setUploading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/marks`, {
                classId: selectedClass._id,
                studentId: selectedStudent._id,
                examType,
                score: s,
                total: t,
            }, config);

            // Update local grade cache
            setGrades(prev => ({
                ...prev,
                [selectedStudent._id]: { score: s, total: t, examType }
            }));
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to upload mark');
        } finally {
            setUploading(false);
        }
    };

    const uniqueSubjects = [...new Set(classes.map(c => c.subject))].sort();
    const filteredClasses = selectedSubjectFilter
        ? classes.filter(c => c.subject === selectedSubjectFilter)
        : classes;

    const gradedCount = Object.keys(grades).length;
    const pct = students.length > 0 ? Math.round((gradedCount / students.length) * 100) : 0;

    // ——— Render class card ———
    const renderClassItem = ({ item }) => (
        <TouchableOpacity style={styles.classCard} onPress={() => handleClassSelect(item)} activeOpacity={0.85}>
            <View style={[styles.classIconBox, { backgroundColor: theme.colors.primary + '12' }]}>
                <MaterialCommunityIcons name="notebook-edit-outline" size={26} color={theme.colors.primary} />
            </View>
            <View style={styles.classInfo}>
                <Text style={styles.classTitle}>{item.name}</Text>
                <Text style={styles.classSub}>{item.subject} · {item.students?.length || 0} students</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right-circle" size={28} color={theme.colors.primary + '55'} />
        </TouchableOpacity>
    );

    // ——— Render student row ———
    const renderStudentItem = ({ item, index }) => {
        const grade = grades[item._id];
        const pctValue = grade ? Math.round((grade.score / grade.total) * 100) : null;
        const gradeInfo = pctValue !== null ? GRADE_COLOR(pctValue) : null;
        const initials = item.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        return (
            <TouchableOpacity
                style={[styles.studentCard, grade && styles.studentCardGraded]}
                onPress={() => openGradeModal(item)}
                activeOpacity={0.85}
            >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: grade ? gradeInfo.bg : theme.colors.primary + '12' }]}>
                    <Text style={[styles.avatarText, { color: grade ? gradeInfo.text : theme.colors.primary }]}>
                        {initials}
                    </Text>
                </View>

                {/* Info */}
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    {grade ? (
                        <Text style={[styles.studentGrade, { color: gradeInfo.text }]}>
                            {grade.examType} · {grade.score}/{grade.total} ({pctValue}%)
                        </Text>
                    ) : (
                        <Text style={styles.studentPending}>Tap to enter grade</Text>
                    )}
                </View>

                {/* Grade Badge or Add Button */}
                {grade ? (
                    <View style={[styles.gradeBadge, { backgroundColor: gradeInfo.bg }]}>
                        <Text style={[styles.gradeBadgeText, { color: gradeInfo.text }]}>{gradeInfo.label}</Text>
                    </View>
                ) : (
                    <View style={styles.addGradeBtn}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={22} color={theme.colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={selectedClass ? `${selectedClass.name} — Results` : 'Upload Results'}
                onBack={() => selectedClass ? setSelectedClass(null) : navigation.goBack()}
                rightIcon="chart-box-outline"
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : !selectedClass ? (
                /* ——— Class Selection ——— */
                <View style={{ flex: 1 }}>
                    <View style={styles.filterBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                            <TouchableOpacity
                                style={[styles.chip, !selectedSubjectFilter && styles.chipActive]}
                                onPress={() => setSelectedSubjectFilter(null)}
                            >
                                <Text style={[styles.chipText, !selectedSubjectFilter && styles.chipTextActive]}>All</Text>
                            </TouchableOpacity>
                            {uniqueSubjects.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.chip, selectedSubjectFilter === s && styles.chipActive]}
                                    onPress={() => setSelectedSubjectFilter(s === selectedSubjectFilter ? null : s)}
                                >
                                    <Text style={[styles.chipText, selectedSubjectFilter === s && styles.chipTextActive]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <FlatList
                        data={filteredClasses}
                        renderItem={renderClassItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.classList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <MaterialCommunityIcons name="notebook-outline" size={50} color={theme.colors.primary + '30'} />
                                <Text style={styles.emptyText}>No classes found</Text>
                            </View>
                        }
                    />
                </View>
            ) : (
                /* ——— Student List with Progress ——— */
                <View style={{ flex: 1 }}>
                    {/* Progress Banner */}
                    <LinearGradient colors={theme.gradients.primary} style={styles.progressBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.progressLabel}>Grading Progress</Text>
                            <Text style={styles.progressCount}>{gradedCount}/{students.length} students graded</Text>
                        </View>
                        <View style={styles.progressCircle}>
                            <Text style={styles.progressPct}>{pct}%</Text>
                        </View>
                    </LinearGradient>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>

                    <FlatList
                        data={students}
                        renderItem={renderStudentItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.studentList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <MaterialCommunityIcons name="account-off-outline" size={50} color={theme.colors.primary + '30'} />
                                <Text style={styles.emptyText}>No students in this class</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* ——— Grade Input Modal ——— */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.kavWrapper}
                    >
                        <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
                            <View style={styles.modalHandle} />

                            {/* Student Header */}
                            <View style={styles.modalHeaderRow}>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarText}>
                                        {selectedStudent?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalStudentLabel}>GRADING</Text>
                                    <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.textLight} />
                                </TouchableOpacity>
                            </View>

                            {/* Exam Type */}
                            <Text style={styles.sectionLabel}>EXAM TYPE</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examTypeScroll}>
                                {EXAM_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.examChip, examType === type && styles.examChipActive]}
                                        onPress={() => setExamType(type)}
                                    >
                                        <Text style={[styles.examChipText, examType === type && styles.examChipTextActive]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Score Row */}
                            <Text style={styles.sectionLabel}>MARKS</Text>
                            <View style={styles.scoreRow}>
                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreBoxLabel}>Obtained</Text>
                                    <TextInput
                                        style={styles.scoreInput}
                                        placeholder="00"
                                        placeholderTextColor="#CCC"
                                        keyboardType="numeric"
                                        value={score}
                                        onChangeText={setScore}
                                        maxLength={5}
                                        returnKeyType="next"
                                    />
                                </View>
                                <View style={styles.slashBox}>
                                    <Text style={styles.slash}>/</Text>
                                </View>
                                <View style={styles.scoreBox}>
                                    <Text style={styles.scoreBoxLabel}>Total</Text>
                                    <TextInput
                                        style={styles.scoreInput}
                                        placeholder="100"
                                        placeholderTextColor="#CCC"
                                        keyboardType="numeric"
                                        value={total}
                                        onChangeText={setTotal}
                                        maxLength={5}
                                        returnKeyType="done"
                                    />
                                </View>
                            </View>

                            {/* Preview Grade */}
                            {score && total && Number(total) > 0 && (
                                <View style={styles.previewRow}>
                                    {(() => {
                                        const p = Math.round((Number(score) / Number(total)) * 100);
                                        const g = GRADE_COLOR(p);
                                        return (
                                            <View style={[styles.previewBadge, { backgroundColor: g.bg }]}>
                                                <Text style={[styles.previewGrade, { color: g.text }]}>{g.label}</Text>
                                                <Text style={[styles.previewPct, { color: g.text }]}>{p}%</Text>
                                            </View>
                                        );
                                    })()}
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setModalVisible(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveBtn, uploading && styles.saveBtnDisabled]}
                                    onPress={submitMark}
                                    disabled={uploading}
                                    activeOpacity={0.85}
                                >
                                    {uploading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                                            <Text style={styles.saveBtnText}>Save Result</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Filter Bar
    filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 14, paddingLeft: 20 },
    chips: { gap: 8, paddingRight: 20 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F3F4F6', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight },
    chipTextActive: { color: '#fff' },

    // Class list
    classList: { padding: 20, paddingBottom: 40 },
    classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0', ...theme.shadows.sm },
    classIconBox: { width: 52, height: 52, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    classInfo: { flex: 1 },
    classTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
    classSub: { fontSize: 13, color: theme.colors.textLight, marginTop: 3, fontWeight: '500' },
    emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 16, color: theme.colors.textLight, fontWeight: '600' },

    // Progress Banner
    progressBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18 },
    progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
    progressCount: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 3 },
    progressCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
    progressPct: { fontSize: 18, fontWeight: '900', color: '#fff' },
    progressTrack: { height: 4, backgroundColor: '#E0E0E0' },
    progressFill: { height: '100%', backgroundColor: theme.colors.success },

    // Student List
    studentList: { padding: 16, paddingBottom: 40 },
    studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: '#F0F0F0', ...theme.shadows.sm },
    studentCardGraded: { borderColor: theme.colors.success + '30' },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    avatarText: { fontSize: 16, fontWeight: '900' },
    studentInfo: { flex: 1 },
    studentName: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
    studentGrade: { fontSize: 12, fontWeight: '600', marginTop: 3 },
    studentPending: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500', marginTop: 3 },
    gradeBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    gradeBadgeText: { fontSize: 16, fontWeight: '900' },
    addGradeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    kavWrapper: { justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },

    modalHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 14 },
    modalAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
    modalAvatarText: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
    modalStudentLabel: { fontSize: 10, color: theme.colors.textLight, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    modalStudentName: { fontSize: 20, fontWeight: '900', color: theme.colors.text, marginTop: 2 },
    modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F6F8', justifyContent: 'center', alignItems: 'center' },

    sectionLabel: { fontSize: 11, color: theme.colors.textLight, fontWeight: '800', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },

    examTypeScroll: { marginBottom: 24 },
    examChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F4F6F8', borderRadius: 14, marginRight: 8, borderWidth: 1.5, borderColor: '#E5E7EB' },
    examChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    examChipText: { fontSize: 13, fontWeight: '700', color: theme.colors.textLight },
    examChipTextActive: { color: '#fff' },

    scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    scoreBox: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
    scoreBoxLabel: { fontSize: 10, color: theme.colors.textLight, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
    scoreInput: { fontSize: 36, fontWeight: '900', color: theme.colors.text, textAlign: 'center', width: '100%' },
    slashBox: { paddingHorizontal: 16, alignItems: 'center' },
    slash: { fontSize: 30, color: '#DDD', fontWeight: '900' },

    previewRow: { alignItems: 'center', marginBottom: 20 },
    previewBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
    previewGrade: { fontSize: 24, fontWeight: '900' },
    previewPct: { fontSize: 18, fontWeight: '700' },

    actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 18, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
    cancelBtnText: { fontSize: 15, fontWeight: '800', color: theme.colors.textLight },
    saveBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...theme.shadows.md },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
});

export default UploadMarksScreen;
