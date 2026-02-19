import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
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

const LessonViewScreen = ({ route, navigation }) => {
    const { courseId, lessonId, lesson, enrollment } = route.params;
    const [completing, setCompleting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(enrollment?.completedLessons.includes(lessonId));

    const handleComplete = async () => {
        setCompleting(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/enrollment/lesson-complete`, { courseId, lessonId }, config);
            setIsCompleted(true);
            Alert.alert('Success', 'Lesson marked as completed!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update progress');
        } finally {
            setCompleting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Lesson Viewer"
                onBack={() => navigation.goBack()}
                rightIcon="share-variant-outline"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.videoPlaceholder}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.videoGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.playCircle}>
                            <MaterialCommunityIcons name="play" size={50} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.videoText}>Study Video Preview</Text>
                        <View style={styles.videoBadge}>
                            <MaterialCommunityIcons name="hd-box" size={16} color="#fff" />
                            <Text style={styles.badgeText}>HD 1080p</Text>
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{lesson.title}</Text>
                        {isCompleted && (
                            <View style={styles.completedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={20} color={theme.colors.green} />
                            </View>
                        )}
                    </View>

                    <View style={styles.meta}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-time-four-outline" size={16} color={theme.colors.textLight} />
                            <Text style={styles.duration}>{lesson.duration || '15 mins'}</Text>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="book-open-variant" size={16} color={theme.colors.textLight} />
                            <Text style={styles.duration}>Lesson Content</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardHeader}>
                        <View style={styles.titleUnderline} />
                        <Text style={styles.sectionTitle}>Key Concepts</Text>
                    </View>

                    <Text style={styles.bodyText}>
                        {lesson.content || "Welcome to this focused study session. In this lesson, we will dive deep into the core concepts, ensuring a thorough understanding through interactive examples and step-by-step breakdowns. \\n\\nFocus on the details provided and attempt the exercises at the end for the best results."}
                    </Text>

                    <View style={styles.resourceCard}>
                        <MaterialCommunityIcons name="file-pdf-box" size={32} color={theme.colors.pink} />
                        <View style={styles.resourceInfo}>
                            <Text style={styles.resourceTitle}>Practice Notes.pdf</Text>
                            <Text style={styles.resourceSize}>2.4 MB</Text>
                        </View>
                        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.colors.pink + '15' }]}>
                            <MaterialCommunityIcons name="download" size={20} color={theme.colors.pink} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleComplete}
                    disabled={completing || isCompleted}
                    style={styles.submitBtn}
                >
                    <LinearGradient
                        colors={isCompleted ? [theme.colors.green, theme.colors.green + 'CC'] : [theme.colors.primary, theme.colors.secondary]}
                        style={styles.submitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {completing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnContent}>
                                <MaterialCommunityIcons
                                    name={isCompleted ? "check-circle" : "check-circle-outline"}
                                    size={22}
                                    color="#fff"
                                />
                                <Text style={styles.completeText}>{isCompleted ? 'Finished Study' : 'Mark as Completed'}</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        justifyContent: 'space-between'
    },
    backButton: { marginRight: 10 },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        flex: 1
    },
    shareBtn: {
        padding: 5
    },

    content: { paddingBottom: 120 },
    videoPlaceholder: {
        width: '100%',
        height: 240,
        backgroundColor: '#000',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden'
    },
    videoGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    playCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10
    },
    videoText: { color: '#fff', marginTop: 15, fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
    videoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 10,
        gap: 5
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold'
    },

    infoSection: { padding: 25 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15
    },
    title: { fontSize: 26, fontWeight: '900', color: theme.colors.text, flex: 1 },
    completedBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.green + '15',
        justifyContent: 'center',
        alignItems: 'center'
    },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 15 },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    duration: { fontSize: 14, color: theme.colors.textLight, fontWeight: '600' },
    metaDivider: {
        width: 1,
        height: 14,
        backgroundColor: '#EEE'
    },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 30 },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleUnderline: {
        width: 4,
        height: 20,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
        marginRight: 10
    },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text },
    bodyText: { fontSize: 16, color: theme.colors.text, lineHeight: 28, fontWeight: '400' },

    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 20,
        marginTop: 30,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    resourceInfo: {
        flex: 1,
        marginLeft: 15
    },
    resourceTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    resourceSize: {
        fontSize: 12,
        color: theme.colors.textLight,
        marginTop: 2
    },
    downloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
    },
    submitBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    submitGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    completeText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});

export default LessonViewScreen;
