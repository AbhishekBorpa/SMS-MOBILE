import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const SyllabusTrackerScreen = ({ navigation }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch courses created by this teacher or all courses
            // Assuming the courses endpoint returns courses with populated modules
            const { data } = await axios.get(`${API_URL}/courses`, config);

            setCourses(data);
            if (data.length > 0) {
                setSelectedCourseId(data[0]._id);
            }
        } catch (error) {
            console.log('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedCourseModules = () => {
        const course = courses.find(c => c._id === selectedCourseId);
        return course ? course.modules : [];
    };

    const calculateOverallProgress = () => {
        // Since we don't have real progress tracking per student-module yet,
        // we will show a placeholder or calculate based on 'completed' status if available in future
        return 0;
    };

    const renderItem = ({ item }) => (
        <AppCard padding={20} style={styles.moduleCard}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconBox, { backgroundColor: '#F9FAFB' }]}>
                        <MaterialCommunityIcons
                            name="book-open-outline"
                            size={24}
                            color={theme.colors.textLight}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.moduleTitle}>{item.title}</Text>
                        <Text style={styles.lessonCount}>{item.lessons?.length || 0} Lessons</Text>
                    </View>
                </View>
                <AppBadge
                    label="Pending"
                    type="secondary"
                />
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Course Progress"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="chart-line"
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : courses.length === 0 ? (
                <EmptyState
                    icon="notebook-remove-outline"
                    title="No Courses Found"
                    description="You haven't been assigned any courses yet."
                />
            ) : (
                <>
                    <View style={styles.selectorContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
                            {courses.map((course) => (
                                <TouchableOpacity
                                    key={course._id}
                                    onPress={() => setSelectedCourseId(course._id)}
                                    style={[styles.classChip, selectedCourseId === course._id && styles.activeChip]}
                                >
                                    <Text style={[styles.chipText, selectedCourseId === course._id && styles.activeChipText]}>
                                        {course.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <FlatList
                        data={getSelectedCourseModules()}
                        renderItem={renderItem}
                        keyExtractor={item => item._id || Math.random().toString()}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>Course Content</Text>
                                {/* <Text style={styles.overallProgress}>Overall Progress: --</Text> */}
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyModuleContainer}>
                                <Text style={styles.emptyModuleText}>No modules defined for this course.</Text>
                            </View>
                        }
                    />
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    selectorContainer: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    selectorScroll: { paddingHorizontal: 20, gap: 10 },
    classChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F0F0F0' },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 13, fontWeight: '700', color: theme.colors.textLight },
    activeChipText: { color: '#fff' },
    list: { padding: 20 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    overallProgress: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
    moduleCard: { marginBottom: 15 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    moduleTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    lessonCount: { fontSize: 12, color: theme.colors.textLight },
    emptyModuleContainer: { padding: 20, alignItems: 'center' },
    emptyModuleText: { color: theme.colors.textLight, fontStyle: 'italic' }
});

export default SyllabusTrackerScreen;
