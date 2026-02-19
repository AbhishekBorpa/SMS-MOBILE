import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
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

const CourseListScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/courses`, config);
            setCourses(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
            activeOpacity={0.9}
        >
            <View style={styles.thumbnailContainer}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.thumbnail}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <MaterialCommunityIcons name="lightning-bolt" size={32} color="#fff" style={styles.sparkle} />
                    <MaterialCommunityIcons name="play-circle-outline" size={50} color="#fff" />
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{item.level || 'Foundational'}</Text>
                    </View>
                </LinearGradient>
            </View>
            <View style={styles.info}>
                <View style={styles.topInfo}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category || 'Academic'}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={14} color={theme.colors.yellow} />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                <View style={styles.footer}>
                    <View style={styles.metaBox}>
                        <View style={styles.metaIcon}>
                            <MaterialCommunityIcons name="account-circle-outline" size={16} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.metaText}>{item.teacher?.name || 'Academic Expert'}</Text>
                    </View>
                    <View style={styles.metaBox}>
                        <View style={styles.metaIcon}>
                            <MaterialCommunityIcons name="notebook-outline" size={16} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.metaText}>
                            {item.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} Lessons
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="LMS Library"
                subtitle="Master your subjects"
                onBack={() => navigation.goBack()}
                rightIcon={userInfo?.role === 'Teacher' ? "plus-circle-outline" : "magnify"}
                onRightPress={userInfo?.role === 'Teacher' ? () => navigation.navigate('CreateCourse') : null}
                variant="primary"
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={courses}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <MaterialCommunityIcons name="book-open-blank-variant" size={80} color={theme.colors.textLight} />
                                <Text style={styles.emptyText}>No courses found.</Text>
                                <Text style={styles.emptySubText}>New learning materials will appear here soon.</Text>
                            </View>
                        }
                    />
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionBtn: {
        padding: 5,
        marginLeft: 10
    },
    content: {
        flex: 1
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {
        padding: 20,
        paddingTop: 10
    },
    emptyText: {
        marginTop: 20,
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold'
    },
    emptySubText: {
        marginTop: 8,
        color: theme.colors.textLight,
        fontSize: 14,
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 24,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 6 },
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    thumbnailContainer: {
        height: 180
    },
    thumbnail: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sparkle: {
        position: 'absolute',
        top: 20,
        left: 20,
        opacity: 0.3
    },
    levelBadge: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
    },
    levelText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 11,
        textTransform: 'uppercase'
    },
    info: {
        padding: 20
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    categoryBadge: {
        backgroundColor: theme.colors.primary + '10',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    categoryText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 11,
        textTransform: 'uppercase'
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    ratingText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFB800',
        marginLeft: 4
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 20,
        lineHeight: 24
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 16
    },
    metaBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    metaIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F5F6F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    metaText: {
        fontSize: 12,
        color: theme.colors.textLight,
        fontWeight: '500'
    }
});

export default CourseListScreen;
