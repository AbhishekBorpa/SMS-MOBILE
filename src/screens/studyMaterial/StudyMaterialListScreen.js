import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, // Added Alert just in case
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const StudyMaterialListScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState(null);

    const [viewMode, setViewMode] = useState('folders'); // 'folders' | 'list'
    const [folderLevel, setFolderLevel] = useState('root'); // 'root' (Grades) | 'grade' (Subjects) | 'material' (List)

    const isTeacher = userInfo?.role === 'Teacher';

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        filterMaterials();
    }, [searchQuery, selectedSubject, selectedGrade, materials]);

    useEffect(() => {
        // Switch to 'list' mode if search query exists, else revert to folder browse
        if (searchQuery.length > 0) {
            setViewMode('list');
        } else if (viewMode === 'list' && searchQuery.length === 0) {
            // Only auto-switch back if we were searching. 
            // If we were browsing folders (viewMode 'folders'), don't change anything.
            // Actually, simplest is: if search text, force list. If no search text AND current mode was implied by search opacity, revert? 
            // Let's stick to the previous logic but keep it robust
        }
    }, [searchQuery]);

    // Derived state for Folder Navigation
    const uniqueGrades = [...new Set(materials.map(m => m.grade))].filter(Boolean).sort();
    const uniqueSubjects = selectedGrade
        ? [...new Set(materials.filter(m => m.grade === selectedGrade).map(m => m.subject))].filter(Boolean).sort()
        : [];

    const fetchMaterials = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/materials`, config);
            setMaterials(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filterMaterials = () => {
        let result = materials;

        if (searchQuery) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // In 'folders' mode, filtering happens via folderLevel selection, but 'filteredMaterials' is used for list view
        // logic is handled by handleSubjectSelect for folder drilldown, 
        // but for GLOBAL SEARCH (list mode), we need this:

        // Wait, handleSubjectSelect sets filteredMaterials too. 
        // Let's make sure they don't conflict. 
        // Logic: 
        // 1. If searching (searchQuery > 0) -> filter globally based on text.
        // 2. If browsing folders -> handleSubjectSelect sets the 'filteredMaterials' for that specific folder.

        if (searchQuery) {
            setFilteredMaterials(result);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this resource?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/materials/${id}`, config);
                        fetchMaterials();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete material');
                    }
                }
            }
        ]);
    };

    const handleOpenLink = async (url) => {
        try {
            await WebBrowser.openBrowserAsync(url);
        } catch (error) {
            Alert.alert('Error', 'Could not open link. Please check your internet connection.');
        }
    };

    // Reset breadcrumbs when filtering changes in folder mode
    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
        setFolderLevel('grade');
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setFolderLevel('material');

        // Filter materials for this specific grade + subject
        const filtered = materials.filter(m => m.grade === selectedGrade && m.subject === subject);
        setFilteredMaterials(filtered);
    };

    const handleBackNav = () => {
        if (viewMode === 'list') {
            // If searching, clearing search handles state via Effect
            setSearchQuery('');
            return;
        }

        if (folderLevel === 'material') {
            setFolderLevel('grade');
            setSelectedSubject(null);
        } else if (folderLevel === 'grade') {
            setFolderLevel('root');
            setSelectedGrade(null);
        } else {
            navigation.goBack();
        }
    };

    const renderFolderGrid = (items, type) => (
        <ScrollView contentContainerStyle={styles.gridContainer}>
            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item}
                        style={[styles.folderCard, { borderColor: theme.colors.primary + '20' }]}
                        onPress={() => type === 'grade' ? handleGradeSelect(item) : handleSubjectSelect(item)}
                    >
                        <View style={[styles.folderIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons
                                name={type === 'grade' ? "school-outline" : "book-open-page-variant-outline"}
                                size={32}
                                color={theme.colors.primary}
                            />
                        </View>
                        <Text style={styles.folderTitle}>{type === 'grade' ? `Grade ${item}` : item}</Text>
                        <Text style={styles.folderCount}>
                            {materials.filter(m => type === 'grade' ? m.grade === item : (m.grade === selectedGrade && m.subject === item)).length} Files
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderItem = ({ item }) => (
        <View style={{ marginBottom: 15 }}>
            <AppCard padding={15} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary + '15' }]}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color={theme.colors.secondary} />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>{item.subject} • Grade {item.grade}</Text>
                        </View>
                    </View>
                </View>

                {item.description ? <Text style={styles.descText} numberOfLines={2}>{item.description}</Text> : null}

                <View style={styles.divider} />

                <View style={styles.actionRow}>
                    <View style={styles.authorRow}>
                        <MaterialCommunityIcons name="account-circle-outline" size={16} color={theme.colors.textLight} />
                        <Text style={[styles.authorText, { marginLeft: 6 }]}>Teacher</Text>
                    </View>

                    <View style={styles.btnGroup}>
                        {isTeacher && (
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item._id)}>
                                <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.pink} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.viewBtn, { backgroundColor: theme.colors.primary }]} onPress={() => handleOpenLink(item.link)}>
                            <Text style={styles.viewBtnText}>View File</Text>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </AppCard>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={
                    folderLevel === 'root' ? "Study Materials" :
                        folderLevel === 'grade' ? `Grade ${selectedGrade}` :
                            selectedSubject || "Study Materials"
                }
                variant="primary"
                onBack={handleBackNav}
                rightIcon={isTeacher ? "plus-circle" : null}
                onRightPress={isTeacher ? () => navigation.navigate('UploadMaterial') : null}
            />

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={theme.colors.textLight}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Breadcrumbs for Folder Mode */}
                {viewMode === 'folders' && (
                    <View style={styles.breadcrumbs}>
                        <TouchableOpacity onPress={() => { setFolderLevel('root'); setSelectedGrade(null); setSelectedSubject(null); }}>
                            <Text style={[styles.crumbText, folderLevel === 'root' && styles.activeCrumb]}>All Classes</Text>
                        </TouchableOpacity>

                        {selectedGrade && (
                            <>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.textLight} />
                                <TouchableOpacity onPress={() => { setFolderLevel('grade'); setSelectedSubject(null); }}>
                                    <Text style={[styles.crumbText, folderLevel === 'grade' && styles.activeCrumb]}>Grade {selectedGrade}</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {selectedSubject && (
                            <>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.textLight} />
                                <Text style={[styles.crumbText, styles.activeCrumb]}>{selectedSubject}</Text>
                            </>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : (
                    <>
                        {viewMode === 'folders' && folderLevel === 'root' && renderFolderGrid(uniqueGrades, 'grade')}

                        {viewMode === 'folders' && folderLevel === 'grade' && renderFolderGrid(uniqueSubjects, 'subject')}

                        {(viewMode === 'list' || folderLevel === 'material') && (
                            <FlatList
                                data={viewMode === 'list' ? filteredMaterials : filteredMaterials} // Reuse filtered logic or just filteredMaterials
                                renderItem={renderItem}
                                keyExtractor={item => item._id}
                                contentContainerStyle={styles.list}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.center}>
                                        <View style={styles.emptyIconContainer}>
                                            <MaterialCommunityIcons name="folder-open-outline" size={60} color="#E0E0E0" />
                                        </View>
                                        <Text style={styles.emptyText}>No materials found.</Text>
                                    </View>
                                }
                            />
                        )}
                    </>
                )}
            </View>

            {isTeacher && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('UploadMaterial')}
                    activeOpacity={0.9}
                >
                    <View style={[styles.fabCircle, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
                        <View style={styles.fabGlow} />
                    </View>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1 },
    list: { padding: 20, paddingBottom: 100 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 1 },
    emptyText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 10 },
    emptySubText: { fontSize: 13, color: theme.colors.textLight, textAlign: 'center', marginTop: 5 },
    // Search & Breadcrumbs
    searchContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 12 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: theme.colors.text },

    breadcrumbs: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
    crumbText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '500' },
    activeCrumb: { color: theme.colors.primary, fontWeight: 'bold' },

    // Folder Grid
    gridContainer: { padding: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    folderCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, elevation: 2 },
    folderIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    folderTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4, textAlign: 'center' },
    folderCount: { fontSize: 12, color: theme.colors.textLight },

    // Enhanced Card
    card: { marginBottom: 15, elevation: 2, borderRadius: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    titleContainer: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, lineHeight: 22 },
    metaRow: { marginTop: 4 },
    metaText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
    descText: { fontSize: 13, color: theme.colors.text, lineHeight: 20, marginBottom: 15, opacity: 0.8 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    authorRow: { flexDirection: 'row', alignItems: 'center' },
    authorText: { fontSize: 12, color: theme.colors.textLight, fontWeight: '500' },
    btnGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { padding: 5 },
    viewBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    viewBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    fab: { position: 'absolute', right: 25, bottom: 40, elevation: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10 },
    fabCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    fabGlow: { position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, borderRadius: 40, backgroundColor: '#fff', opacity: 0.1, transform: [{ scale: 0.8 }] }
});

export default StudyMaterialListScreen;
