import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const BehaviorTrackerScreen = ({ navigation, route }) => {
    const { student: preSelectedStudent } = route.params || {};
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(!preSelectedStudent); // Don't load list if student pre-selected
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(preSelectedStudent || null);
    const [refreshing, setRefreshing] = useState(false);

    // Points Configuration
    const behaviors = [
        { id: '1', label: 'Homework Complete', points: 5, icon: 'book-check', color: theme.colors.green },
        { id: '2', label: 'Active Participation', points: 3, icon: 'hand-left', color: theme.colors.primary },
        { id: '3', label: 'Helping Others', points: 4, icon: 'account-heart', color: '#FF9800' },
        { id: '4', label: 'Disruptive Behavior', points: -2, icon: 'alert-circle', color: theme.colors.error },
        { id: '5', label: 'Late to Class', points: -1, icon: 'clock-alert', color: theme.colors.error },
    ];

    useEffect(() => {
        if (preSelectedStudent) {
            setModalVisible(true);
        } else {
            fetchStudents();
        }
    }, [preSelectedStudent]);

    const fetchStudents = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch students from first available class for demo
            const classRes = await axios.get(`${API_URL}/classes/teacher`, config);
            const classes = classRes.data || [];

            // Flatten students from all classes
            let allStudents = [];
            classes.forEach(c => c.students.forEach(s => allStudents.push({ ...s, className: c.className })));

            // Remove duplicates
            allStudents = Array.from(new Set(allStudents.map(a => a._id)))
                .map(id => {
                    return allStudents.find(a => a._id === id);
                });

            setStudents(allStudents);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAwardPoints = async (behavior) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/behavior`, {
                studentId: selectedStudent._id || selectedStudent.id,
                points: behavior.points,
                category: behavior.label,
                reason: behavior.label
            }, config);

            Alert.alert(
                behavior.points > 0 ? 'Points Awarded!' : 'Points Deducted',
                `${Math.abs(behavior.points)} points ${behavior.points > 0 ? 'added to' : 'removed from'} ${selectedStudent.name}.`,
                [{
                    text: 'OK', onPress: () => {
                        setModalVisible(false);
                        if (preSelectedStudent) navigation.goBack(); // Return to profile if pre-selected
                        else setSelectedStudent(null);
                    }
                }]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update points');
        }
    };

    const openPointModal = (student) => {
        setSelectedStudent(student);
        setModalVisible(true);
    };

    const renderStudent = ({ item }) => (
        <AppCard
            style={styles.card}
            padding={15}
            onPress={() => openPointModal(item)}
        >
            <View style={styles.studentRow}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.classText}>{item.className || 'Student'}</Text>
                </View>
                <View style={styles.actionBtn}>
                    <MaterialCommunityIcons name="star-circle" size={24} color={theme.colors.secondary} />
                </View>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Classroom Behavior"
                subtitle="Gamify student performance"
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : !preSelectedStudent ? (
                <FlatList
                    data={students}
                    renderItem={renderStudent}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStudents(); }} />}
                    ListEmptyComponent={<EmptyState icon="account-group" title="No Students Found" description="Assign points to your students." />}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={{ color: theme.colors.textLight }}>Select a behavior below...</Text>
                </View>
            )}

            <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => {
                setModalVisible(false);
                if (preSelectedStudent) navigation.goBack();
            }}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => {
                    setModalVisible(false);
                    if (preSelectedStudent) navigation.goBack();
                }}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Give Points to {selectedStudent?.name}</Text>

                        <View style={styles.behaviorGrid}>
                            {behaviors.map((b) => (
                                <TouchableOpacity
                                    key={b.id}
                                    style={[styles.behaviorBtn, { borderColor: b.color + '40', backgroundColor: b.color + '10' }]}
                                    onPress={() => handleAwardPoints(b)}
                                >
                                    <MaterialCommunityIcons name={b.icon} size={28} color={b.color} />
                                    <Text style={styles.behaviorLabel}>{b.label}</Text>
                                    <View style={[styles.pointBadge, { backgroundColor: b.color }]}>
                                        <Text style={styles.pointText}>{b.points > 0 ? '+' + b.points : b.points}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    card: { marginBottom: 12 },
    studentRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    classText: { fontSize: 13, color: theme.colors.textLight },
    actionBtn: { padding: 5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    behaviorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    behaviorBtn: { width: '47%', aspectRatio: 1.1, borderWidth: 1, borderRadius: 15, justifyContent: 'center', alignItems: 'center', padding: 10, position: 'relative' },
    behaviorLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.text, marginTop: 8, textAlign: 'center' },
    pointBadge: { position: 'absolute', top: 5, right: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    pointText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});

export default BehaviorTrackerScreen;
