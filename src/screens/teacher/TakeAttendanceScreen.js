import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
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

// Animated toggle for each student
const AttendanceToggle = ({ student, onToggle }) => {
    const animVal = useRef(new Animated.Value(student.status === 'Present' ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(animVal, {
            toValue: student.status === 'Present' ? 1 : 0,
            useNativeDriver: false,
            friction: 6,
        }).start();
    }, [student.status]);

    const bgColor = animVal.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.error, theme.colors.success],
    });
    const thumbLeft = animVal.interpolate({ inputRange: [0, 1], outputRange: [3, 23] });

    return (
        <TouchableOpacity onPress={() => onToggle(student._id)} activeOpacity={0.8}>
            <Animated.View style={[styles.toggle, { backgroundColor: bgColor }]}>
                <Animated.View style={[styles.toggleThumb, { left: thumbLeft }]} />
                <Text style={[styles.toggleLabel, student.status === 'Present' ? styles.toggleLabelLeft : styles.toggleLabelRight]}>
                    {student.status === 'Present' ? 'P' : 'A'}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const TakeAttendanceScreen = ({ navigation }) => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => { fetchClasses(); }, []);
    useEffect(() => { filterClasses(); }, [classes, selectedSubjectFilter]);

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
        if (selectedSubjectFilter) result = result.filter(c => c.subject === selectedSubjectFilter);
        setFilteredClasses(result);
    };

    const uniqueSubjects = [...new Set(classes.map(c => c.subject))].sort();

    const fetchStudentsForClass = (classItem) => {
        setSelectedClass(classItem);
        const initialData = classItem.students.map(student => ({
            _id: student._id,
            name: student.name,
            status: 'Present',
        }));
        setStudents(initialData);
        setSearchQuery('');
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
            const records = students.map(s => ({ student: s._id, status: s.status }));
            await axios.post(`${API_URL}/attendance`, {
                classId: selectedClass._id,
                date: attendanceDate,
                records
            }, config);
            Alert.alert('✅ Submitted!', `Attendance for ${selectedClass.name} saved.`, [
                { text: 'Done', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    // Live stats
    const presentCount = students.filter(s => s.status === 'Present').length;
    const absentCount = students.filter(s => s.status === 'Absent').length;
    const pct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderClassItem = ({ item }) => (
        <TouchableOpacity style={styles.classCard} onPress={() => fetchStudentsForClass(item)} activeOpacity={0.85}>
            <View style={[styles.classIconBox, { backgroundColor: theme.colors.primary + '12' }]}>
                <MaterialCommunityIcons name="google-classroom" size={26} color={theme.colors.primary} />
            </View>
            <View style={styles.classInfo}>
                <Text style={styles.classTitle}>{item.name}</Text>
                <Text style={styles.classSub}>{item.subject} • {item.students?.length || 0} students</Text>
            </View>
            <View style={styles.classArrow}>
                <MaterialCommunityIcons name="arrow-right-circle" size={28} color={theme.colors.primary + '60'} />
            </View>
        </TouchableOpacity>
    );

    const renderStudentItem = ({ item }) => {
        const isPresent = item.status === 'Present';
        const name = item?.name || 'Unknown Student';
        const initials = name.split(' ').map(w => w ? w[0] : '').join('').slice(0, 2).toUpperCase() || '?';
        return (
            <TouchableOpacity
                style={[styles.studentRow, isPresent ? styles.presentRow : styles.absentRow]}
                onPress={() => toggleStatus(item._id)}
                activeOpacity={0.85}
            >
                <View style={[styles.avatar, { backgroundColor: isPresent ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.avatarText, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                        {initials}
                    </Text>
                </View>
                <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, !isPresent && styles.absentName]}>{name}</Text>
                    <Text style={[styles.studentStatus, { color: isPresent ? theme.colors.success : theme.colors.error }]}>
                        {isPresent ? 'Marked Present' : 'Marked Absent'}
                    </Text>
                </View>
                <AttendanceToggle student={item} onToggle={toggleStatus} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={selectedClass ? selectedClass.name : 'Take Attendance'}
                subtitle={selectedClass ? selectedClass.subject : 'Select a class to begin'}
                onBack={() => selectedClass ? setSelectedClass(null) : navigation.goBack()}
                rightIcon="calendar-check"
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : !selectedClass ? (
                /* ——— Class Selection ——— */
                <View style={{ flex: 1 }}>
                    {/* Subject Filter */}
                    <View style={styles.filterArea}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                            <TouchableOpacity
                                style={[styles.chip, !selectedSubjectFilter && styles.activeChip]}
                                onPress={() => setSelectedSubjectFilter(null)}
                            >
                                <Text style={[styles.chipText, !selectedSubjectFilter && styles.activeChipText]}>All</Text>
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
                        contentContainerStyle={styles.classList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <MaterialCommunityIcons name="google-classroom" size={54} color={theme.colors.primary + '30'} />
                                <Text style={styles.emptyText}>No classes found</Text>
                            </View>
                        }
                    />
                </View>
            ) : (
                /* ——— Attendance Marking ——— */
                <View style={{ flex: 1 }}>
                    {/* Live Stats Bar */}
                    <LinearGradient
                        colors={theme.gradients.primary}
                        style={styles.statsBanner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{presentCount}</Text>
                            <Text style={styles.statLbl}>Present</Text>
                        </View>
                        <View style={styles.statSep} />
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{absentCount}</Text>
                            <Text style={styles.statLbl}>Absent</Text>
                        </View>
                        <View style={styles.statSep} />
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{pct}%</Text>
                            <Text style={styles.statLbl}>Rate</Text>
                        </View>
                        <View style={styles.statSep} />
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{students.length}</Text>
                            <Text style={styles.statLbl}>Total</Text>
                        </View>
                    </LinearGradient>

                    {/* Progress Track */}
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        {/* Search */}
                        <View style={styles.searchBox}>
                            <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.textLight} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search students..."
                                placeholderTextColor={theme.colors.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        {/* Quick Mark */}
                        <View style={styles.quickMark}>
                            <TouchableOpacity style={styles.markAllBtn} onPress={() => markAll('Present')}>
                                <MaterialCommunityIcons name="check-all" size={16} color={theme.colors.success} />
                                <Text style={[styles.markAllText, { color: theme.colors.success }]}>All P</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.markAllBtn, styles.markAllAbsent]} onPress={() => markAll('Absent')}>
                                <MaterialCommunityIcons name="close-circle-outline" size={16} color={theme.colors.error} />
                                <Text style={[styles.markAllText, { color: theme.colors.error }]}>All A</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Student List */}
                    <FlatList
                        data={filteredStudents}
                        renderItem={renderStudentItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.studentList}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Footer Submit */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={submitAttendance}
                            disabled={submitting}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={theme.gradients.primary}
                                style={styles.submitGrad}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                        <Text style={styles.submitText}>
                                            Save — {presentCount}/{students.length} Present
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Class selection
    filterArea: { paddingVertical: 14, paddingLeft: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    chips: { gap: 8, paddingRight: 20 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F3F4F6', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight },
    activeChipText: { color: '#fff' },
    classList: { padding: 20, paddingBottom: 40 },
    classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 14, borderWidth: 1, borderColor: '#F0F0F0', ...theme.shadows.sm },
    classIconBox: { width: 52, height: 52, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    classInfo: { flex: 1 },
    classTitle: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
    classSub: { fontSize: 13, color: theme.colors.textLight, marginTop: 3, fontWeight: '500' },
    classArrow: { marginLeft: 10 },
    emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { fontSize: 16, color: theme.colors.textLight, fontWeight: '600' },

    // Stats Banner
    statsBanner: { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 20 },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { fontSize: 22, fontWeight: '900', color: '#fff' },
    statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 0.5, marginTop: 2 },
    statSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    // Progress
    progressTrack: { height: 5, backgroundColor: '#E0E0E0' },
    progressFill: { height: '100%', backgroundColor: theme.colors.success },

    // Controls
    controls: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F4F6F8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
    searchInput: { flex: 1, fontSize: 14, color: theme.colors.text, fontWeight: '500' },
    quickMark: { flexDirection: 'row', gap: 6 },
    markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#E8F5E9', borderRadius: 12 },
    markAllAbsent: { backgroundColor: '#FFEBEE' },
    markAllText: { fontSize: 11, fontWeight: '800' },

    // Student List
    studentList: { padding: 16, paddingBottom: 120 },
    studentRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 10, backgroundColor: '#fff', borderWidth: 2, borderColor: '#F0F4F8', ...theme.shadows.sm },
    presentRow: { borderColor: theme.colors.success + '30', backgroundColor: '#FAFFFE' },
    absentRow: { borderColor: theme.colors.error + '30', backgroundColor: '#FFF9F9' },
    avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    avatarText: { fontSize: 16, fontWeight: '900' },
    studentInfo: { flex: 1 },
    studentName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    absentName: { textDecorationLine: 'line-through', opacity: 0.6 },
    studentStatus: { fontSize: 12, fontWeight: '600', marginTop: 3 },

    // Toggle
    toggle: { width: 48, height: 26, borderRadius: 13, justifyContent: 'center' },
    toggleThumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', ...theme.shadows.sm },
    toggleLabel: { position: 'absolute', fontSize: 10, fontWeight: '900', color: '#fff' },
    toggleLabelLeft: { left: 6 },
    toggleLabelRight: { right: 5 },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(244,246,248,0.98)', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
    submitBtn: { borderRadius: 20, overflow: 'hidden', ...theme.shadows.lg },
    submitGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});

export default TakeAttendanceScreen;
