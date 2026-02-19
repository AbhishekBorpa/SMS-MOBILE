import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const TakeAttendanceScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [selectedGradeFilter, setSelectedGradeFilter] = useState(null);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(null);

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
            result = result.filter(c => c.name.includes(selectedGradeFilter.replace(/\D/g, ''))); // Simple digit match
        }
        if (selectedSubjectFilter) {
            result = result.filter(c => c.subject === selectedSubjectFilter);
        }
        setFilteredClasses(result);
    };

    const uniqueSubjects = [...new Set(classes.map(c => c.subject))].sort();

    const fetchStudentsForClass = async (classItem) => {
        setSelectedClass(classItem);
        setLoading(true);
        try {
            const initialData = classItem.students.map(student => ({
                _id: student._id,
                name: student.name,
                status: 'Present'
            }));
            setStudents(initialData);
        } catch (error) {
            Alert.alert('Error', 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId) => {
        setStudents(prev => prev.map(s =>
            s._id === studentId
                ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' }
                : s
        ));
    };

    const markAll = (status) => {
        setStudents(prev => prev.map(s => ({ ...s, status })));
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const records = students.map(s => ({
                student: s._id,
                status: s.status
            }));

            await axios.post(`${API_URL}/attendance`, {
                classId: selectedClass._id,
                date: new Date(),
                records
            }, config);

            Alert.alert('Success', 'Attendance recorded!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const renderClassItem = ({ item }) => (
        <TouchableOpacity style={styles.classCard} onPress={() => fetchStudentsForClass(item)}>
            <LinearGradient
                colors={['#fff', '#fafafa']}
                style={styles.classCardContent}
            >
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '10' }]}>
                    <MaterialCommunityIcons name="google-classroom" size={26} color={theme.colors.primary} />
                </View>
                <View style={styles.classInfo}>
                    <Text style={styles.classTitle}>{item.name}</Text>
                    <Text style={styles.classSub}>{item.subject}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderStudentItem = ({ item }) => {
        const isPresent = item.status === 'Present';
        return (
            <TouchableOpacity
                style={[styles.studentRow, isPresent ? styles.presentRow : styles.absentRow]}
                onPress={() => toggleStatus(item._id)}
                activeOpacity={0.8}
            >
                <View style={styles.studentInfo}>
                    <View style={[styles.avatar, { backgroundColor: isPresent ? theme.colors.green + '15' : theme.colors.pink + '15' }]}>
                        <Text style={[styles.avatarText, { color: isPresent ? theme.colors.green : theme.colors.pink }]}>
                            {item.name.charAt(0)}
                        </Text>
                    </View>
                    <Text style={[styles.studentName, { color: theme.colors.text }]}>
                        {item.name}
                    </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: isPresent ? theme.colors.green : theme.colors.pink }]}>
                    <MaterialCommunityIcons
                        name={isPresent ? "check-circle-outline" : "close-circle-outline"}
                        size={18}
                        color="#fff"
                    />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={selectedClass ? 'Mark Attendance' : 'Attendance'}
                onBack={() => navigation.goBack()}
                rightIcon="calendar-check"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : !selectedClass ? (
                    <View style={styles.selectionContainer}>
                        <Text style={styles.subtitle}>Select Your Class</Text>

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
                            data={classes}
                            renderItem={renderClassItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                ) : (
                    <View style={styles.attendanceContainer}>
                        <View style={styles.stickyHeader}>
                            <View style={styles.classHeader}>
                                <View>
                                    <Text style={styles.selectedClassText}>{selectedClass.name}</Text>
                                    <Text style={styles.selectedSubjectText}>{selectedClass.subject}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedClass(null)} style={styles.changeButton}>
                                    <Text style={styles.changeButtonText}>Change</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.quickActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => markAll('Present')}>
                                    <MaterialCommunityIcons name="check-all" size={20} color={theme.colors.green} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.green }]}>All Present</Text>
                                </TouchableOpacity>
                                <View style={styles.dividerVertical} />
                                <TouchableOpacity style={styles.actionBtn} onPress={() => markAll('Absent')}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={20} color={theme.colors.pink} />
                                    <Text style={[styles.actionBtnText, { color: theme.colors.pink }]}>All Absent</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FlatList
                            data={students}
                            renderItem={renderStudentItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.studentList}
                            showsVerticalScrollIndicator={false}
                        />

                        <View style={styles.footerContainer}>
                            <TouchableOpacity style={styles.submitButton} onPress={submitAttendance} disabled={submitting}>
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    style={styles.submitGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>
                                            Save Attendance ({students.filter(s => s.status === 'Present').length}/{students.length})
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        justifyContent: 'space-between'
    },
    backButton: {
        marginRight: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    settingsBtn: {
        padding: 5
    },
    content: {
        flex: 1
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectionContainer: {
        flex: 1,
        padding: 25
    },
    attendanceContainer: {
        flex: 1
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15
    },
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
    list: {
        paddingBottom: 20
    },
    classCard: {
        marginBottom: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    classCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20
    },
    iconCircle: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    classInfo: {
        flex: 1
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    classSub: {
        color: theme.colors.textLight,
        fontSize: 14,
        marginTop: 2
    },
    stickyHeader: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        zIndex: 10
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F6F8'
    },
    selectedClassText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    selectedSubjectText: {
        color: theme.colors.textLight,
        fontSize: 14,
        marginTop: 2
    },
    changeButton: {
        backgroundColor: theme.colors.primary + '10',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12
    },
    changeButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 12
    },
    quickActions: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 4
    },
    actionBtnText: {
        fontWeight: 'bold',
        fontSize: 14
    },
    dividerVertical: {
        width: 1,
        backgroundColor: '#F0F0F0',
        height: '100%'
    },
    studentList: {
        padding: 20,
        paddingTop: 10
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F5F6F8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 5
    },
    presentRow: {
        borderColor: theme.colors.green + '30'
    },
    absentRow: {
        borderColor: theme.colors.pink + '30',
        backgroundColor: '#FFF9F9'
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 18
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        gap: 6
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },
    footerContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F5F6F8'
    },
    submitButton: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    submitGradient: {
        paddingVertical: 18,
        alignItems: 'center'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
});

export default TakeAttendanceScreen;
