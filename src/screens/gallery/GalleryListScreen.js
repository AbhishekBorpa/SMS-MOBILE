import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const GalleryListScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    const isTeacher = userInfo?.role === 'Teacher';

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/gallery`, config);
            setPhotos(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/gallery/${id}`, config);
                        fetchPhotos();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete photo');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card} padding={0}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <View style={styles.overlayTop}>
                        {item.class && (
                            <AppBadge
                                label={item.class}
                                type="secondary"
                                size="small"
                                style={styles.classBadge}
                            />
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.description ? (
                    <Text style={styles.descText} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                <View style={styles.footer}>
                    <View style={styles.authorRow}>
                        <View style={[styles.authorIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                            <MaterialCommunityIcons name="camera-account" size={16} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.authorText}>{item.teacher?.name}</Text>
                    </View>
                    {(isTeacher && item.teacher?._id === userInfo?._id) && (
                        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Classroom Gallery"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon={isTeacher ? "camera-plus" : "image-multiple-outline"}
                onRightPress={isTeacher ? () => navigation.navigate('UploadPhoto') : null}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <FlatList
                        data={photos}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="image-off-outline" size={60} color="#E0E0E0" />
                                </View>
                                <Text style={styles.emptyText}>No photos shared yet.</Text>
                                <Text style={styles.emptySubText}>Moments from the classroom will appear here.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {isTeacher && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('UploadPhoto')}
                    activeOpacity={0.9}
                >
                    <View style={[styles.fabCircle, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="camera-plus" size={28} color="#fff" />
                        <View style={styles.fabGlow} />
                    </View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    list: { padding: 20, paddingBottom: 100 },
    card: { marginBottom: 25, elevation: 4, overflow: 'hidden' },
    imageContainer: { width: '100%', height: 240, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 15 },
    overlayTop: { flexDirection: 'row', justifyContent: 'flex-end' },
    classBadge: { elevation: 2 },
    cardContent: { padding: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    descText: { fontSize: 14, color: theme.colors.textLight, lineHeight: 20, marginBottom: 15 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    authorIconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    authorText: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' },
    deleteBtn: { padding: 5 },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    emptySubText: { fontSize: 14, color: theme.colors.textLight, textAlign: 'center', marginTop: 8 },
    fab: { position: 'absolute', right: 25, bottom: 40, elevation: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10 },
    fabCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    fabGlow: { position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, borderRadius: 40, backgroundColor: '#fff', opacity: 0.1, transform: [{ scale: 0.8 }] }
});

export default GalleryListScreen;
