import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const StudentAwardsScreen = ({ navigation, route }) => {
    const { student: preSelectedStudent } = route.params || {};
    const [selectedAward, setSelectedAward] = useState(null);
    const [loading, setLoading] = useState(false);

    const awardTypes = [
        { id: '1', title: 'Star Student', icon: 'star-shooting', color: '#FFD700', bg: '#FFF9E1', category: 'General' },
        { id: '2', title: 'Math Genius', icon: 'calculator', color: '#4FACFE', bg: '#E3F2FD', category: 'Academic' },
        { id: '3', title: 'Perfect Attendance', icon: 'calendar-check', color: '#43E97B', bg: '#E8F5E9', category: 'Attendance' },
        { id: '4', title: 'Sportsperson', icon: 'trophy-variant', color: '#F093FB', bg: '#F3E5F5', category: 'Sports' },
        { id: '5', title: 'Good Behavior', icon: 'thumb-up', color: '#FF9F43', bg: '#FFF3E0', category: 'Behavior' },
        { id: '6', title: 'Creative Mind', icon: 'palette', color: '#FF6B6B', bg: '#FFEBEE', category: 'Arts' },
    ];

    const handleGiveAward = async () => {
        if (!selectedAward || !preSelectedStudent) {
            Alert.alert('Error', 'Please select an award type.');
            return;
        }

        const award = awardTypes.find(a => a.id === selectedAward);
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                studentId: preSelectedStudent._id || preSelectedStudent.id,
                title: award.title,
                category: award.category,
                icon: award.icon,
                color: award.color
            };

            await axios.post(`${API_URL}/awards`, payload, config);
            Alert.alert('Success', `Awarded ${award.title} to ${preSelectedStudent.name}!`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to give award.');
        } finally {
            setLoading(false);
        }
    };

    const renderAward = ({ item }) => (
        <TouchableOpacity
            onPress={() => setSelectedAward(item.id)}
            style={[styles.awardTypeCard, selectedAward === item.id && { borderColor: item.color, backgroundColor: item.bg, borderWidth: 2 }]}
        >
            <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
            <Text style={styles.awardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Award Achievement"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="medal"
            />

            <View style={styles.content}>
                {preSelectedStudent && (
                    <View style={styles.studentHeader}>
                        <Text style={styles.awardingToText}>Awarding to:</Text>
                        <Text style={styles.studentName}>{preSelectedStudent.name}</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Select Achievement Type</Text>
                <FlatList
                    data={awardTypes}
                    renderItem={renderAward}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.awardGrid}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                />

                <AppButton
                    title={`Confirm Award`}
                    onPress={handleGiveAward}
                    loading={loading}
                    disabled={!selectedAward}
                    style={{ marginTop: 30 }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, flex: 1 },
    studentHeader: { marginBottom: 25, alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15 },
    awardingToText: { color: theme.colors.textLight, marginBottom: 5, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
    studentName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
    awardGrid: { gap: 15, marginBottom: 15 },
    awardTypeCard: { flex: 1, height: 120, borderRadius: 24, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEE', alignItems: 'center', justifyContent: 'center', gap: 12 },
    awardTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', paddingHorizontal: 10 },
});

export default StudentAwardsScreen;
