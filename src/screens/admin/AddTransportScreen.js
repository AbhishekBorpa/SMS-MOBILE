import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import KeyboardWrapper from '../../components/KeyboardWrapper';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

const AddTransportScreen = ({ navigation, route }) => {
    const existingRoute = route.params?.route;
    const isEdit = !!existingRoute;

    const [routeName, setRouteName] = useState(existingRoute?.routeName || '');
    const [vehicleNumber, setVehicleNumber] = useState(existingRoute?.vehicleNumber || '');
    const [driverName, setDriverName] = useState(existingRoute?.driverName || '');
    const [driverPhone, setDriverPhone] = useState(existingRoute?.driverPhone || '');
    const [stops, setStops] = useState(existingRoute?.stops || [{ station: '', time: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            navigation.setOptions({ headerTitle: 'Edit Route' });
        }
    }, []);

    const handleAddStop = () => {
        setStops([...stops, { station: '', time: '' }]);
    };

    const handleRemoveStop = (index) => {
        const newStops = stops.filter((_, i) => i !== index);
        setStops(newStops);
    };

    const updateStop = (index, field, value) => {
        const newStops = [...stops];
        newStops[index][field] = value;
        setStops(newStops);
    };

    const handleSave = async () => {
        if (!routeName || !vehicleNumber || !driverName || !driverPhone) {
            Alert.alert('Error', 'Please fill all vehicle and driver details.');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { routeName, vehicleNumber, driverName, driverPhone, stops };

            if (isEdit) {
                await axios.put(`${API_URL}/transport/${existingRoute._id}`, payload, config);
                Alert.alert('Success', 'Route updated successfully');
            } else {
                await axios.post(`${API_URL}/transport`, payload, config);
                Alert.alert('Success', 'Route created successfully');
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save route details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert('Delete Route', 'Are you sure you want to delete this route?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('userToken');
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        await axios.delete(`${API_URL}/transport/${existingRoute._id}`, config);
                        navigation.goBack();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete route');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={isEdit ? "Edit Route" : "Add Transport Route"}
                onBack={() => navigation.goBack()}
                rightIcon={isEdit ? "trash-can-outline" : null}
                onRightPress={isEdit ? handleDelete : null}
            />

            <KeyboardWrapper backgroundColor="#F9FAFB">
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Vehicle & Driver</Text>
                    </View>

                    <AppCard padding={15} style={styles.card}>
                        <AppInput
                            label="Route Name"
                            value={routeName}
                            onChangeText={setRouteName}
                            placeholder="e.g. Route 1 - North City" // updated placeholder
                            icon="map-marker-path"
                        />
                        <AppInput
                            label="Vehicle Number"
                            value={vehicleNumber}
                            onChangeText={setVehicleNumber}
                            placeholder="e.g. MH-12-AB-1234"
                            icon="bus"
                        />
                        <AppInput
                            label="Driver Name"
                            value={driverName}
                            onChangeText={setDriverName}
                            placeholder="Full Name"
                            icon="account"
                        />
                        <AppInput
                            label="Driver Phone"
                            value={driverPhone}
                            onChangeText={setDriverPhone}
                            placeholder="+91 ..."
                            icon="phone"
                            keyboardType="phone-pad"
                        />
                    </AppCard>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Route Stops</Text>
                        <TouchableOpacity onPress={handleAddStop}>
                            <Text style={styles.addText}>+ Add Stop</Text>
                        </TouchableOpacity>
                    </View>

                    {stops.map((stop, index) => (
                        <AppCard key={index} padding={15} style={styles.stopCard}>
                            <View style={styles.stopHeader}>
                                <Text style={styles.stopTitle}>Stop #{index + 1}</Text>
                                {stops.length > 1 && (
                                    <TouchableOpacity onPress={() => handleRemoveStop(index)}>
                                        <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 2, marginRight: 10 }}>
                                    <AppInput
                                        placeholder="Station Name"
                                        value={stop.station}
                                        onChangeText={(t) => updateStop(index, 'station', t)}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppInput
                                        placeholder="Time"
                                        value={stop.time}
                                        onChangeText={(t) => updateStop(index, 'time', t)}
                                    />
                                </View>
                            </View>
                        </AppCard>
                    ))}

                    <AppButton
                        title={isEdit ? "Update Route" : "Create Route"}
                        onPress={handleSave}
                        loading={loading}
                        style={styles.submitBtn}
                    />

                </ScrollView>
            </KeyboardWrapper>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { padding: 20, paddingBottom: 50 },
    sectionHeader: { flexDirection: 'row', justifySelf: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textStrongs },
    addText: { color: theme.colors.primary, fontWeight: 'bold' }, // Added style for Add Stop
    card: { marginBottom: 5 },
    stopCard: { marginBottom: 10, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
    stopHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    stopTitle: { fontWeight: 'bold', color: theme.colors.textLight },
    row: { flexDirection: 'row' },
    submitBtn: { marginTop: 20 }
});

export default AddTransportScreen;
