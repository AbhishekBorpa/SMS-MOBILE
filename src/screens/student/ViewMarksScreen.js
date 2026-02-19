import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const ViewMarksScreen = ({ navigation }) => {
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchMarks();
    }, []);

    const fetchMarks = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/marks`, config);
            setMarks(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: report } = await axios.get(`${API_URL}/reports/card`, config);

            const htmlContent = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #813287; padding-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: bold; color: #813287; margin-bottom: 10px; }
                        .title { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
                        .student-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        .info-group h4 { margin: 0 0 5px 0; color: #666; font-size: 12px; text-transform: uppercase; }
                        .info-group p { margin: 0; font-weight: bold; font-size: 16px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
                        th { background-color: #813287; color: white; }
                        .total-row { font-weight: bold; background-color: #f0f0f0; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
                        .signature { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
                        .sign-line { width: 200px; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">SCHOOL MANAGEMENT SYSTEM</div>
                        <div class="title">Official Report Card</div>
                    </div>

                    <div class="student-info">
                        <div class="info-group">
                            <h4>Student Name</h4>
                            <p>${report.student.name}</p>
                        </div>
                        <div class="info-group">
                            <h4>Academic Year</h4>
                            <p>2025 - 2026</p>
                        </div>
                        <div class="info-group">
                            <h4>Attendance</h4>
                            <p>${report.attendance?.percentage}%</p>
                        </div>
                    </div>

                    <h3>Academic Performance</h3>
                    <table>
                        <tr>
                            <th>Subject</th>
                            <th>Total Marks</th>
                            <th>Obtained</th>
                            <th>Grade</th>
                        </tr>
                        ${report.academicPerformance.map(subject => `
                            <tr>
                                <td>${subject.subject}</td>
                                <td>${subject.total}</td>
                                <td>${subject.score}</td>
                                <td><b>${subject.grade}</b></td>
                            </tr>
                        `).join('')}
                    </table>

                    <div class="signature">
                        <div class="sign-line">Class Teacher</div>
                        <div class="sign-line">Principal</div>
                    </div>

                    <div class="footer">
                        <p>Generated on ${new Date().toLocaleDateString()} via SMS Mobile App</p>
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri);

        } catch (error) {
            Alert.alert('Error', 'Failed to generate report card');
            console.log(error);
        } finally {
            setDownloading(false);
        }
    };

    const getGradeInfo = (percentage) => {
        if (percentage >= 80) return { color: theme.colors.success, label: 'Excellent', icon: 'medal-outline', type: 'success' };
        if (percentage >= 60) return { color: theme.colors.warning, label: 'Good Progress', icon: 'star-outline', type: 'warning' };
        return { color: theme.colors.error, label: 'Needs Improvement', icon: 'trending-down', type: 'danger' };
    };

    const renderItem = ({ item }) => {
        const percentage = (item.score / item.total) * 100;
        const gradeInfo = getGradeInfo(percentage);

        return (
            <AppCard style={styles.card} padding={20}>
                <View style={styles.cardHeader}>
                    <View style={styles.subjectBox}>
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.titleSection}>
                            <Text style={styles.subjectTitle}>{item.class?.subject}</Text>
                            <Text style={styles.examType}>{item.examType}</Text>
                        </View>
                    </View>
                    <View style={styles.scoreBox}>
                        <Text style={styles.scoreValue}>{item.score}</Text>
                        <Text style={styles.scoreTotal}>/{item.total}</Text>
                    </View>
                </View>

                <View style={styles.progressBlock}>
                    <View style={styles.progressStats}>
                        <Text style={styles.gradeLabel}>{gradeInfo.label}</Text>
                        <Text style={styles.percentageValue}>{percentage.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.track}>
                        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: gradeInfo.color }]} />
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <AppBadge
                        label="Academic Performance Insight"
                        type={gradeInfo.type}
                    />
                    <MaterialCommunityIcons name={gradeInfo.icon} size={18} color={gradeInfo.color} />
                </View>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Report Card"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon={downloading ? "loading" : "download-outline"} // Custom handling needed for loading icon if not in library
                onRightPress={handleDownloadPDF}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
                ) : marks.length === 0 ? (
                    <View style={styles.center}>
                        <MaterialCommunityIcons name="book-outline" size={80} color={theme.colors.textLight} />
                        <Text style={styles.emptyText}>No academic records yet.</Text>
                        <Text style={styles.emptySubText}>Your examination results will appear here.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={marks}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 40 },
    card: { marginBottom: 20, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    subjectBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    titleSection: { flex: 1 },
    subjectTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.text },
    examType: { fontSize: 11, color: theme.colors.textLight, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    scoreBox: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#F9FAFB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    scoreValue: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
    scoreTotal: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' },
    progressBlock: { marginBottom: 20 },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    gradeLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.text },
    percentageValue: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
    track: { height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, overflow: 'hidden' },
    bar: { height: '100%', borderRadius: 5 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5' }
});

export default ViewMarksScreen;
