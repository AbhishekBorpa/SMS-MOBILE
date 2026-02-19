import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const MyCoursesScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/enrollment/my-courses`, config);
            setEnrollments(data);
        } catch (error) {
            console.log('Error fetching my courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyCourses();
    };

    const renderItem = ({ item }) => {
        const progress = item.progress || 0;
        const course = item.course;

        return (
            <AppCard
                onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                style={styles.card}
                padding={0}
            >
                <View style={styles.cardContent}>
                    <View style={styles.thumbnailContainer}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.thumbnail}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name="school" size={30} color="#fff" />
                        </LinearGradient>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.headerRow}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{course.category || 'Course'}</Text>
                            </View>
                            {progress >= 100 && (
                                <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.green} />
                            )}
                        </View>
                        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
                        <Text style={styles.teacher}>By {course.teacher?.name || 'Instructor'}</Text>

                        <View style={styles.progressSection}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                    >
                        <Text style={styles.continueText}>{progress > 0 ? 'Continue Learning' : 'Start Course'}</Text>
                        <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="My Learning"
                subtitle="Track your progress"
                onBack={() => navigation.goBack()}
                variant="primary"
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={enrollments}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon="book-open-page-variant-outline"
                            title="No Enrolled Courses"
                            message="Browse the library to start learning new subjects."
                            actionLabel="Browse Courses"
                            onAction={() => navigation.navigate('CourseList')}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { overflow: 'hidden', marginBottom: 20 },
    cardContent: { flexDirection: 'row', padding: 15 },
    thumbnailContainer: { marginRight: 15 },
    thumbnail: { width: 80, height: 80, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    badge: { backgroundColor: theme.colors.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: '700', textTransform: 'uppercase' },
    title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4, lineHeight: 22 },
    teacher: { fontSize: 12, color: theme.colors.textLight, marginBottom: 12 },
    progressSection: { marginTop: 'auto' },
    progressBar: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, width: '100%', marginBottom: 6 },
    progressFill: { height: '100%', backgroundColor: theme.colors.secondary, borderRadius: 3 },
    progressText: { fontSize: 11, color: theme.colors.textLight, fontWeight: '600' },
    footer: { borderTopWidth: 1, borderTopColor: '#F5F6F8', paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'flex-end' },
    continueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    continueText: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' }
});

export default MyCoursesScreen;
