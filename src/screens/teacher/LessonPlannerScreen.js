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
import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const LessonPlannerScreen = ({ navigation }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [newPlan, setNewPlan] = useState({ date: new Date().toISOString().split('T')[0], subject: '', className: '', topic: '', objectives: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchPlans = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/planner`, config);
            setPlans(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const openModal = (plan = null) => {
        if (plan) {
            setNewPlan({
                date: plan.date.split('T')[0],
                subject: plan.subject,
                className: plan.className,
                topic: plan.topic,
                objectives: plan.objectives || '',
                materialsNeeded: plan.materialsNeeded || ''
            });
            setEditingId(plan._id);
        } else {
            setNewPlan({ date: new Date().toISOString().split('T')[0], subject: '', className: '', topic: '', objectives: '' });
            setEditingId(null);
        }
        setModalVisible(true);
    };

    const handleSavePlan = async () => {
        if (!newPlan.subject || !newPlan.topic || !newPlan.className) {
            Alert.alert('Error', 'Subject, Class, and Topic are required');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                await axios.put(`${API_URL}/planner/${editingId}`, newPlan, config);
                Alert.alert('Success', 'Lesson plan updated');
            } else {
                await axios.post(`${API_URL}/planner`, newPlan, config);
                Alert.alert('Success', 'Lesson plan created');
            }

            setModalVisible(false);
            fetchPlans();
        } catch (error) {
            console.log('Save Error:', error);
            Alert.alert('Error', 'Failed to save lesson plan');
        }
    };

    const handleDeletePlan = (id) => {
        Alert.alert('Delete Plan', 'Are you sure you want to delete this lesson plan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/planner/${id}`, config);
                        fetchPlans();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete plan');
                    }
                }
            }
        ]);
    };

    const handleGenerateAI = async () => {
        if (!newPlan.topic || !newPlan.subject) {
            Alert.alert('Tip', 'Please enter a Subject and Topic first, then AI will help you!');
            return;
        }
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`${API_URL}/ai/lesson-plan`, {
                topic: newPlan.topic,
                subject: newPlan.subject,
                className: newPlan.className
            }, config);

            setNewPlan({
                ...newPlan,
                objectives: data.objectives,
                materialsNeeded: data.materialsNeeded
            });
            Alert.alert('AI Draft Ready', 'I have generated objectives and materials for you based on the topic.');
        } catch (error) {
            Alert.alert('Error', 'AI generation failed');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.subject}>{item.subject} • {item.className}</Text>
                    <Text style={styles.topic}>{item.topic}</Text>
                </View>
                <AppBadge label={item.status} type={item.status === 'Completed' ? 'success' : 'neutral'} />
            </View>
            <View style={styles.dateRow}>
                <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textLight} />
                <Text style={styles.dateText}>{new Date(item.date).toDateString()}</Text>
            </View>
            {item.objectives && (
                <Text style={styles.objectives} numberOfLines={2}>🎯 {item.objectives}</Text>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePlan(item._id)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Lesson Planner"
                onBack={() => navigation.goBack()}
                rightIcon="plus"
                onRightPress={() => openModal()}
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <FlatList
                    data={plans}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPlans(); }} />}
                    ListEmptyComponent={<EmptyState icon="notebook-edit" title="No Lesson Plans" description="Plan your classes here." />}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <KeyboardWrapper backgroundColor="transparent">
                            <Text style={styles.modalTitle}>{editingId ? 'Edit Lesson Plan' : 'New Lesson Plan'}</Text>

                            <AppInput
                                label="Date (YYYY-MM-DD)"
                                placeholder="2023-10-25"
                                value={newPlan.date}
                                onChangeText={t => setNewPlan({ ...newPlan, date: t })}
                            />
                            <AppInput
                                label="Subject"
                                placeholder="e.g. Mathematics"
                                value={newPlan.subject}
                                onChangeText={t => setNewPlan({ ...newPlan, subject: t })}
                            />
                            <AppInput
                                label="Class Name"
                                placeholder="e.g. 10-A"
                                value={newPlan.className}
                                onChangeText={t => setNewPlan({ ...newPlan, className: t })}
                            />
                            <AppInput
                                label="Topic"
                                placeholder="Topic to cover"
                                value={newPlan.topic}
                                onChangeText={t => setNewPlan({ ...newPlan, topic: t })}
                            />
                            <AppInput
                                label="Objectives"
                                placeholder="Learning outcomes"
                                value={newPlan.objectives}
                                onChangeText={t => setNewPlan({ ...newPlan, objectives: t })}
                                multiline
                            />

                            <AppButton
                                title="Generate with AI ✨"
                                onPress={handleGenerateAI}
                                type="secondary"
                                style={{ marginBottom: 15 }}
                                disabled={loading}
                            />

                            <View style={styles.modalButtons}>
                                <AppButton title="Cancel" onPress={() => setModalVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                                <AppButton title={editingId ? "Update Plan" : "Save Plan"} onPress={handleSavePlan} style={{ flex: 1 }} />
                            </View>
                        </KeyboardWrapper>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 15 },
    card: { marginBottom: 15, padding: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
    subject: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold', textTransform: 'uppercase' },
    topic: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text, marginTop: 2 },
    dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
    dateText: { fontSize: 13, color: theme.colors.textLight },
    objectives: { fontSize: 13, color: theme.colors.text, marginTop: 10, fontStyle: 'italic' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, gap: 15 },
    actionBtn: { padding: 5 }
});

export default LessonPlannerScreen;
