import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const CourseDetailScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollment, setEnrollment] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        fetchQuizzes();
    }, []);

    const handleDownloadCertificate = async () => {
        setDownloading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: cert } = await axios.get(`${API_URL}/certificate/${courseId}`, config);

            const htmlContent = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        @page { size: landscape; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 0; 
                            font-family: 'Georgia', serif; 
                            background: #fdfdfd; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                        }
                        .container {
                            width: 90%;
                            height: 80%;
                            border: 10px solid #813287;
                            padding: 40px;
                            text-align: center;
                            position: relative;
                            background: white;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                        .header { font-size: 40px; font-weight: bold; color: #813287; margin-bottom: 20px; text-transform: uppercase; }
                        .sub-header { font-size: 20px; color: #666; margin-bottom: 40px; font-style: italic; }
                        .student-name { font-size: 50px; font-weight: bold; color: #333; margin: 20px 0; border-bottom: 2px solid #ddd; display: inline-block; padding-bottom: 10px; min-width: 400px; }
                        .course-title { font-size: 30px; color: #555; margin: 20px 0; font-weight: bold; }
                        .content { font-size: 18px; color: #777; line-height: 1.6; }
                        .footer { margin-top: 60px; display: flex; justify-content: space-around; }
                        .signature-line { border-top: 1px solid #333; width: 200px; padding-top: 10px; font-weight: bold; color: #333; }
                        .date { margin-top: 40px; font-size: 16px; color: #999; }
                        .badge { position: absolute; top: 40px; right: 40px; width: 100px; height: 100px; background: #FFD700; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-weight: bold; color: #B8860B; transform: rotate(15deg); }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="badge">Success!</div>
                        <div class="header">Certificate of Completion</div>
                        <div class="sub-header">This is to certify that</div>
                        
                        <div class="student-name">${cert.studentName}</div>
                        
                        <div class="content">
                            has successfully completed the course
                            <div class="course-title">${cert.courseTitle}</div>
                            demonstrating dedication and proficiency in the subject matter.
                        </div>

                        <div class="footer">
                            <div>
                                <div class="signature-line">${cert.instructor}</div>
                                <div style="font-size:12px; color:#999; margin-top:5px;">Instructor</div>
                            </div>
                            <div>
                                <div class="signature-line">Principal</div>
                                <div style="font-size:12px; color:#999; margin-top:5px;">SMS Authority</div>
                            </div>
                        </div>

                        <div class="date">Awarded on ${new Date(cert.completionDate).toLocaleDateString()}</div>
                        <div style="margin-top:20px; font-size:10px; color:#ccc;">ID: ${cert.certificateId}</div>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent, width: 842, height: 595 }); // A4 Landscape roughly
            await Sharing.shareAsync(uri);

        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setDownloading(false);
        }
    };

    const fetchCourseDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/courses/${courseId}`, config);
            setCourse(data.course);
            setIsEnrolled(data.isEnrolled);
            setEnrollment(data.enrollmentData);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/quizzes/course/${courseId}`, config);
            setQuizzes(data);
        } catch (error) {
            console.log('Error fetching quizzes:', error);
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/enrollment/${courseId}`, {}, config);
            Alert.alert('Success', 'You are now enrolled in this course!');
            fetchCourseDetails();
        } catch (error) {
            Alert.alert('Error', 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AppHeader
                title=""
                onBack={() => navigation.goBack()}
                rightIcon="share-variant-outline"
                transparent={true}
                variant="primary"
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.hero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="notebook-multiple" size={40} color={theme.colors.primary} />
                        </View>
                        <View style={styles.badgeRow}>
                            <View style={styles.glassBadge}>
                                <Text style={styles.badgeText}>{course.category || 'Core'}</Text>
                            </View>
                            <View style={styles.glassBadge}>
                                <Text style={styles.badgeText}>{course.level}</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>{course.title}</Text>
                    </View>

                    <View style={styles.heroFooter}>
                        <View style={styles.heroStat}>
                            <MaterialCommunityIcons name="play-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.heroStatText}>{course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} Lessons</Text>
                        </View>
                        <View style={styles.heroStat}>
                            <MaterialCommunityIcons name="account-group-outline" size={18} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.heroStatText}>4.5k Students</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>About this Course</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                    <Text style={styles.description}>{course.description}</Text>

                    {quizzes.length > 0 && (
                        <View style={styles.quizSection}>
                            <Text style={styles.sectionTitle}>Interactive Quizzes</Text>
                            {quizzes.map((quiz, qIdx) => (
                                <TouchableOpacity
                                    key={qIdx}
                                    style={styles.quizRow}
                                    onPress={() => isEnrolled ? navigation.navigate('QuizAttempt', { quizId: quiz._id, title: quiz.title }) : handleEnroll()}
                                >
                                    <View style={[styles.quizIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                                        <MaterialCommunityIcons name="lightning-bolt" size={22} color={theme.colors.accent} />
                                    </View>
                                    <View style={styles.quizInfo}>
                                        <Text style={styles.quizName}>{quiz.title}</Text>
                                        <Text style={styles.quizMeta}>{quiz.questions.length} Questions • 10 Mins</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.syllabusHeader}>
                        <Text style={styles.sectionTitle}>Course Syllabus</Text>
                        {userInfo?.role === 'Teacher' && (
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => navigation.navigate('CreateQuiz', { courseId })}
                                >
                                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.colors.primary} />
                                    <Text style={styles.addBtnText}>Quiz</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addBtn}
                                    onPress={() => navigation.navigate('AddModule', { courseId, currentModules: course.modules })}
                                >
                                    <MaterialCommunityIcons name="folder-plus-outline" size={20} color={theme.colors.primary} />
                                    <Text style={styles.addBtnText}>Module</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {course.modules.length === 0 && (
                        <View style={styles.emptyModuleState}>
                            <MaterialCommunityIcons name="folder-open-outline" size={40} color="#ccc" />
                            <Text style={styles.emptyModuleText}>No modules yet. Start adding content!</Text>
                        </View>
                    )}

                    {course.modules.map((module, idx) => (
                        <View key={idx} style={styles.moduleCard}>
                            <View style={styles.moduleHeader}>
                                <View style={styles.moduleTitleRow}>
                                    <View style={styles.moduleNumber}>
                                        <Text style={styles.moduleNumberText}>{idx + 1}</Text>
                                    </View>
                                    <Text style={styles.moduleTitle}>{module.title}</Text>
                                </View>
                                {userInfo?.role === 'Teacher' && (
                                    <TouchableOpacity
                                        style={styles.addLessonBtn}
                                        onPress={() => navigation.navigate('AddLesson', { courseId, moduleIndex: idx, currentModules: course.modules })}
                                    >
                                        <MaterialCommunityIcons name="plus" size={16} color={theme.colors.primary} />
                                        <Text style={styles.addLessonText}>Add Lesson</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {module.lessons.map((lesson, lIdx) => {
                                const isCompleted = enrollment?.completedLessons.includes(lesson._id);
                                return (
                                    <TouchableOpacity
                                        key={lIdx}
                                        style={styles.lessonRow}
                                        onPress={() => isEnrolled ? navigation.navigate('LessonView', { courseId, lessonId: lesson._id, lesson, enrollment }) : handleEnroll()}
                                    >
                                        <View style={[styles.lessonIcon, isCompleted && styles.completedIcon]}>
                                            <MaterialCommunityIcons
                                                name={isCompleted ? "check-circle" : "play-circle"}
                                                size={24}
                                                color={isCompleted ? '#fff' : theme.colors.primary}
                                            />
                                        </View>
                                        <View style={styles.lessonInfo}>
                                            <Text style={[styles.lessonTitle, isCompleted && styles.completedText]}>{lesson.title}</Text>
                                            <Text style={styles.lessonDuration}>{lesson.duration || '10:00'}</Text>
                                        </View>
                                        {!isEnrolled && !lesson.isFree && (
                                            <MaterialCommunityIcons name="lock-outline" size={18} color="#ccc" />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}

                            {module.lessons.length === 0 && (
                                <Text style={styles.noLessonsText}>No lessons in this module yet.</Text>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {isEnrolled && enrollment && (
                (() => {
                    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                    const completedCount = enrollment.completedLessons.length;
                    const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

                    if (progress >= 100) {
                        return (
                            <View style={styles.bottomBar}>
                                <TouchableOpacity style={styles.certificateBtn} onPress={handleDownloadCertificate} disabled={downloading}>
                                    <LinearGradient
                                        colors={[theme.colors.accent, '#9C27B0']}
                                        style={styles.enrollGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {downloading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <View style={styles.enrollBtnContent}>
                                                <MaterialCommunityIcons name="certificate-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                                                <Text style={styles.enrollBtnText}>Download Certificate</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        );
                    }
                    return null;
                })()
            )}

            {!isEnrolled && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.enrollBtn} onPress={handleEnroll} disabled={enrolling}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            style={styles.enrollGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {enrolling ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.enrollBtnContent}>
                                    <Text style={styles.enrollBtnText}>Start Your Journey</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={22} color="#fff" style={{ marginLeft: 10 }} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    hero: {
        paddingTop: 10,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        alignItems: 'center'
    },
    navbar: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center'
    },
    heroContent: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: 10
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15
    },
    glassBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 34
    },
    heroFooter: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 25
    },
    heroStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    heroStatText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500'
    },
    content: {
        padding: 25
    },
    cardHeader: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    titleUnderline: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
        marginTop: 8
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        marginBottom: 30
    },
    quizSection: {
        marginBottom: 35
    },
    quizRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    quizIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    quizInfo: { flex: 1 },
    quizName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    quizMeta: { fontSize: 12, color: '#999', marginTop: 3 },

    syllabusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    addBtnText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold'
    },
    moduleCard: {
        backgroundColor: '#FAFBFC',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    moduleTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    moduleNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    moduleNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        flex: 1
    },
    lessonCountText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold'
    },
    addLessonBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: theme.colors.primary + '15',
        borderRadius: 8
    },
    addLessonText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginLeft: 4
    },
    emptyModuleState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20
    },
    emptyModuleText: {
        color: '#999',
        marginTop: 10,
        fontSize: 14
    },
    noLessonsText: {
        textAlign: 'center',
        color: '#aaa',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 10,
        marginBottom: 10
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F2F3F5'
    },
    lessonIcon: {
        marginRight: 14
    },
    completedIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.green,
        justifyContent: 'center',
        alignItems: 'center'
    },
    lessonInfo: { flex: 1 },
    lessonTitle: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '600'
    },
    completedText: {
        color: '#999',
        textDecorationLine: 'line-through'
    },
    lessonDuration: {
        fontSize: 11,
        color: theme.colors.textLight,
        marginTop: 2
    },
    bottomBar: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
    },
    enrollBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 }
    },
    certificateBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: theme.colors.accent,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 }
    },
    enrollGradient: {
        paddingVertical: 18,
        alignItems: 'center'
    },
    enrollBtnContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    enrollBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default CourseDetailScreen;
