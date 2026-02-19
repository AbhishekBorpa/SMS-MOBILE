import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const StudyMaterialsScreen = ({ navigation }) => {
    const { userToken } = useContext(AuthContext);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userToken}` } };
            const response = await axios.get(`${API_URL}/materials`, config);
            setStudyMaterials(response.data);
            setError(null);
        } catch (err) {
            console.log('Error fetching materials:', err);
            setError('Failed to load study materials');
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = selectedSubject === 'All'
        ? studyMaterials
        : studyMaterials.filter(m => m.subject === selectedSubject);

    const handleOpenMaterial = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            alert('Cannot open this link');
        }
    };

    const renderMaterial = ({ item }) => (
        <TouchableOpacity
            style={styles.materialCard}
            onPress={() => handleOpenMaterial(item.link)}
        >
            <View style={styles.materialHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
                </View>
                <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{item.title}</Text>
                    <Text style={styles.materialSubject}>{item.subject}</Text>
                    <Text style={styles.materialDescription}>{item.description}</Text>
                </View>
            </View>

            <View style={styles.materialFooter}>
                <View style={styles.materialMeta}>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                    {item.size && (
                        <Text style={styles.metaText}>
                            <MaterialCommunityIcons name="file" size={14} color={theme.colors.textLight} />
                            {' '}{item.size}
                        </Text>
                    )}
                    {item.duration && (
                        <Text style={styles.metaText}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.textLight} />
                            {' '}{item.duration}
                        </Text>
                    )}
                    {item.pages && (
                        <Text style={styles.metaText}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={14} color={theme.colors.textLight} />
                            {' '}{item.pages} pages
                        </Text>
                    )}
                </View>
                <MaterialCommunityIcons name="open-in-new" size={20} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Study Materials"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="book-open-variant"
            />

            {/* Subject Filter */}
            <View style={styles.filterContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ margin: 10 }} />
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {subjects.map((subject) => (
                            <TouchableOpacity
                                key={subject}
                                style={[
                                    styles.filterChip,
                                    selectedSubject === subject && styles.filterChipActive
                                ]}
                                onPress={() => setSelectedSubject(subject)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedSubject === subject && styles.filterTextActive
                                ]}>
                                    {subject}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.statGradient}>
                        <MaterialCommunityIcons name="file-document-multiple" size={24} color="#fff" />
                        <Text style={styles.statValue}>{filteredMaterials.length}</Text>
                        <Text style={styles.statLabel}>Resources</Text>
                    </LinearGradient>
                </View>

                <View style={styles.statCard}>
                    <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.statGradient}>
                        <MaterialCommunityIcons name="book-open" size={24} color="#fff" />
                        <Text style={styles.statValue}>{subjects.length - 1}</Text>
                        <Text style={styles.statLabel}>Subjects</Text>
                    </LinearGradient>
                </View>

                <View style={styles.statCard}>
                    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.statGradient}>
                        <MaterialCommunityIcons name="download" size={24} color="#fff" />
                        <Text style={styles.statValue}>Free</Text>
                        <Text style={styles.statLabel}>Access</Text>
                    </LinearGradient>
                </View>
            </View>

            {/* Materials List */}
            <FlatList
                data={filteredMaterials}
                renderItem={renderMaterial}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="book-off" size={64} color="#E0E0E0" />
                        <Text style={styles.emptyText}>No materials found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },

    filterContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 12 },
    filterScroll: { paddingHorizontal: 20, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
    filterTextActive: { color: '#fff' },

    statsContainer: { flexDirection: 'row', padding: 20, gap: 12 },
    statCard: { flex: 1, borderRadius: 16, overflow: 'hidden', ...theme.shadows.md },
    statGradient: { padding: 14, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 6 },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '600' },

    list: { padding: 20, paddingTop: 0 },

    materialCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, ...theme.shadows.sm },
    materialHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    iconContainer: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    materialInfo: { flex: 1 },
    materialTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    materialSubject: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginBottom: 4 },
    materialDescription: { fontSize: 13, color: theme.colors.textLight, lineHeight: 18 },

    materialFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    materialMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    typeBadge: { backgroundColor: theme.colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary },
    metaText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 12 }
});

export default StudyMaterialsScreen;
