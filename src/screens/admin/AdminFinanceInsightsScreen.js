import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBadge from '../../components/AppBadge';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import { theme } from '../../constants/theme';

const AdminFinanceInsightsScreen = ({ navigation }) => {
    const revenueData = {
        totalCollected: '₹4,25,000',
        pendingAmount: '₹85,000',
        activeStudents: 240,
        recentTransactions: [
            { id: '1', student: 'Rahul Sharma', amount: '₹12,000', type: 'Tuition Fee', date: 'Today' },
            { id: '2', student: 'Priya Verma', amount: '₹5,500', type: 'Transport', date: 'Yesterday' },
            { id: '3', student: 'Amit Gupta', amount: '₹12,000', type: 'Tuition Fee', date: '2 days ago' },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Finance Insights"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="chart-timeline-variant"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.topCards}>
                    <AppCard padding={20} style={[styles.summaryCard, { backgroundColor: '#E1F5FE' }]}>
                        <MaterialCommunityIcons name="cash-multiple" size={32} color={theme.colors.primary} />
                        <Text style={styles.cardValue}>{revenueData.totalCollected}</Text>
                        <Text style={styles.cardLabel}>Total Collected</Text>
                        <AppBadge label="+12% this month" type="success" />
                    </AppCard>

                    <AppCard padding={20} style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#EF6C00" />
                        <Text style={[styles.cardValue, { color: '#EF6C00' }]}>{revenueData.pendingAmount}</Text>
                        <Text style={styles.cardLabel}>Pending Dues</Text>
                        <AppBadge label="18 Students" type="warning" />
                    </AppCard>
                </View>

                <AppCard padding={25}>
                    <Text style={styles.sectionTitle}>Collection Breakdown</Text>
                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />
                            <Text style={styles.breakdownText}>Tuition Fees (75%)</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.indicator, { backgroundColor: theme.colors.secondary }]} />
                            <Text style={styles.breakdownText}>Transport (15%)</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <View style={[styles.indicator, { backgroundColor: theme.colors.accent }]} />
                            <Text style={styles.breakdownText}>Other (10%)</Text>
                        </View>
                    </View>
                </AppCard>

                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitleLarge}>Recent Transactions</Text>
                    {revenueData.recentTransactions.map((item) => (
                        <AppCard key={item.id} padding={15} style={styles.transactionCard}>
                            <View style={styles.transLeft}>
                                <View style={styles.transIcon}>
                                    <MaterialCommunityIcons name="bank-transfer" size={24} color={theme.colors.textLight} />
                                </View>
                                <View>
                                    <Text style={styles.transStudent}>{item.student}</Text>
                                    <Text style={styles.transType}>{item.type}</Text>
                                </View>
                            </View>
                            <View style={styles.transRight}>
                                <Text style={styles.transAmount}>{item.amount}</Text>
                                <Text style={styles.transDate}>{item.date}</Text>
                            </View>
                        </AppCard>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    topCards: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    summaryCard: { flex: 1, alignItems: 'center', gap: 10, borderWidth: 0, elevation: 2 },
    cardValue: { fontSize: 22, fontWeight: '900', color: theme.colors.primary, marginTop: 5 },
    cardLabel: { fontSize: 13, color: theme.colors.textLight, fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
    sectionTitleLarge: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20, marginTop: 10 },
    breakdownRow: { gap: 12 },
    breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    indicator: { width: 12, height: 12, borderRadius: 4 },
    breakdownText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '500' },
    transactionCard: { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    transLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    transIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    transStudent: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
    transType: { fontSize: 12, color: theme.colors.textLight, marginTop: 2 },
    transAmount: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'right' },
    transDate: { fontSize: 11, color: theme.colors.textLight, marginTop: 2, textAlign: 'right' }
});

export default AdminFinanceInsightsScreen;
