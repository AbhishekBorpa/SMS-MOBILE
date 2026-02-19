import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const UploadMarksScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedGradeFilter, setSelectedGradeFilter] = useState(null);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(null);

    // Exam Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examType, setExamType] = useState('Quiz');
    const [score, setScore] = useState('');
    const [total, setTotal] = useState('100');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        filterClasses();
    }, [classes, selectedGradeFilter, selectedSubjectFilter]);

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

    const filterClasses = () => {
        let result = classes;
        if (selectedGradeFilter) {
            result = result.filter(c => c.name.includes(selectedGradeFilter.replace(/\D/g, '')));
        }
        if (selectedSubjectFilter) {
            result = result.filter(c => c.subject === selectedSubjectFilter);
        }
        setFilteredClasses(result);
    };

    const handleClassSelect = (classItem) => {
        setSelectedClass(classItem);
        setStudents(classItem.students);
    };

    const uniqueSubjects = [...new Set(classes.map(c => c.subject))].sort();

    const openGradeModal = (student) => {
        setSelectedStudent(student);
        setScore('');
        setModalVisible(true);
    };

    const submitMark = async () => {
        if (!score || !total) {
            Alert.alert('Error', 'Please enter score and total');
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
                score: Number(score),
                total: Number(total)
            }, config);

            setModalVisible(false);
            Alert.alert('Success', `Grade saved for ${selectedStudent.name}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to upload mark');
        } finally {
            setUploading(false);
        }
    };

    const renderClassItem = ({ item }) => (
        <TouchableOpacity style={styles.classCard} onPress={() => handleClassSelect(item)}>
            <View style={[styles.classIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                <MaterialCommunityIcons name="notebook-edit" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.classInfo}>
                <Text style={styles.classTitle}>{item.name}</Text>
                <Text style={styles.classSub}>{item.subject}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    const renderStudentItem = ({ item }) => (
        <TouchableOpacity style={styles.studentCard} onPress={() => openGradeModal(item)}>
            <View style={styles.studentLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentSub}>Student ID: {item._id.slice(-6).toUpperCase()}</Text>
                </View>
            </View>
            <AppButton
                title="Grade"
                size="sm"
                onPress={() => openGradeModal(item)}
                width={80}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={selectedClass ? 'Student Results' : 'Grading Lab'}
                onBack={() => navigation.goBack()}
                rightIcon="chart-box-outline"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : !selectedClass ? (
                    <View style={styles.selectionContainer}>
                        <Text style={styles.sectionTitle}>Select Class to Grade</Text>

                        {/* Filters */}
                        <View style={styles.filterContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                <TouchableOpacity
                                    style={[styles.chip, !selectedGradeFilter && styles.activeChip]}
                                    onPress={() => setSelectedGradeFilter(null)}
                                >
                                    <Text style={[styles.chipText, !selectedGradeFilter && styles.activeChipText]}>All Grades</Text>
                                </TouchableOpacity>
                                {['9th', '10th', '11th', '12th'].map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.chip, selectedGradeFilter === g && styles.activeChip]}
                                        onPress={() => setSelectedGradeFilter(g === selectedGradeFilter ? null : g)}
                                    >
                                        <Text style={[styles.chipText, selectedGradeFilter === g && styles.activeChipText]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                <TouchableOpacity
                                    style={[styles.chip, !selectedSubjectFilter && styles.activeChip]}
                                    onPress={() => setSelectedSubjectFilter(null)}
                                >
                                    <Text style={[styles.chipText, !selectedSubjectFilter && styles.activeChipText]}>All Subjects</Text>
                                </TouchableOpacity>
                                {uniqueSubjects.map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.chip, selectedSubjectFilter === s && styles.activeChip]}
                                        onPress={() => setSelectedSubjectFilter(s === selectedSubjectFilter ? null : s)}
                                    >
                                        <Text style={[styles.chipText, selectedSubjectFilter === s && styles.activeChipText]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <FlatList
                            data={filteredClasses}
                            renderItem={renderClassItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No classes found matching filters.</Text>
                            }
                        />
                    </View>
                ) : (
                    <View style={styles.gradeContainer}>
                        <View style={styles.classHeader}>
                            <TouchableOpacity onPress={() => setSelectedClass(null)} style={styles.backToClassBtn}>
                                <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.selectedClassText}>{selectedClass.name}</Text>
                                <Text style={styles.selectedSubjectText}>{selectedClass.subject}</Text>
                            </View>
                        </View>

                        <FlatList
                            data={students}
                            renderItem={renderStudentItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <View style={styles.modalHandle} />

                        <KeyboardWrapper backgroundColor="transparent">
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalLabel}>GRADING STUDENT</Text>
                                <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
                            </View>

                            <Text style={styles.inputLabel}>EXAM CATEGORY</Text>
                            <View style={styles.typeRow}>
                                {['Midterm', 'Final', 'Quiz'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.typeButton, examType === type && styles.typeButtonSelected]}
                                        onPress={() => setExamType(type)}
                                    >
                                        <Text style={[styles.typeText, examType === type && styles.typeTextSelected]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.scoreRow}>
                                <View style={styles.scoreInputGroup}>
                                    <AppInput
                                        label="Marks Obtained"
                                        placeholder="00"
                                        keyboardType="numeric"
                                        value={score}
                                        onChangeText={setScore}
                                        style={styles.scoreInput}
                                    />
                                </View>
                                <Text style={styles.slash}>/</Text>
                                <View style={styles.scoreInputGroup}>
                                    <AppInput
                                        label="Total Marks"
                                        placeholder="100"
                                        keyboardType="numeric"
                                        value={total}
                                        onChangeText={setTotal}
                                        style={styles.scoreInput}
                                    />
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <AppButton
                                    title="Discard"
                                    variant="outline"
                                    onPress={() => setModalVisible(false)}
                                    style={{ flex: 1 }}
                                />
                                <AppButton
                                    title="Save Result"
                                    onPress={submitMark}
                                    loading={uploading}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </KeyboardWrapper>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    selectionContainer: { flex: 1, padding: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
    filterContainer: {
        marginBottom: 15
    },
    chipScroll: {
        flexDirection: 'row',
        marginBottom: 10
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    activeChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textLight
    },
    activeChipText: {
        color: '#fff'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: theme.colors.textLight,
        fontStyle: 'italic'
    },
    list: { paddingBottom: 20 },
    classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    classIcon: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    classInfo: { flex: 1 },
    classTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    classSub: { color: theme.colors.textLight, fontSize: 14, marginTop: 2 },
    gradeContainer: { flex: 1, padding: 25 },
    classHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, backgroundColor: theme.colors.primary + '08', padding: 15, borderRadius: 20 },
    backToClassBtn: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 12, marginRight: 15, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    selectedClassText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    selectedSubjectText: { color: theme.colors.textLight, fontSize: 13, marginTop: 2 },
    studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F5F6F8', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
    studentLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 },
    studentName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    studentSub: { fontSize: 11, color: theme.colors.textLight, marginTop: 2 },

    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 20, maxHeight: '80%' },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E5E5E5', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalHeader: { alignItems: 'center', marginBottom: 30 },
    modalLabel: { fontSize: 11, color: theme.colors.textLight, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold', marginBottom: 8 },
    modalStudentName: { fontSize: 26, fontWeight: 'bold', color: theme.colors.text },
    inputLabel: { fontSize: 12, fontWeight: '800', marginBottom: 12, color: theme.colors.textLight, letterSpacing: 0.5 },
    typeRow: { flexDirection: 'row', marginBottom: 25, gap: 10 },
    typeButton: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#F5F6F8', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
    typeButtonSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    typeText: { color: theme.colors.text, fontWeight: 'bold', fontSize: 14 },
    typeTextSelected: { color: '#fff' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 35, gap: 15 },
    scoreInputGroup: { flex: 1 },
    scoreInput: { textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    slash: { fontSize: 24, marginTop: 10, color: '#DDD', fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', gap: 15 }
});

export default UploadMarksScreen;
