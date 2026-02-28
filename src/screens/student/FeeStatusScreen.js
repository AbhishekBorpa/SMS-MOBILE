import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppBadge from '../../components/AppBadge';
import AppButton from '../../components/AppButton';
import AppCard from '../../components/AppCard';
import AppHeader from '../../components/AppHeader';
import EmptyState from '../../components/EmptyState';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

const FeeStatusScreen = ({ navigation }) => {
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [paying, setPaying] = useState(false); // New state for UPI payment loading

    useEffect(() => {
        fetchFeeStatus();
    }, []);

    const fetchFeeStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/fees/me`, config);
            setFeeData(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        setDownloading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data: invoice } = await axios.get(`${API_URL}/fees/invoice`, config);

            const htmlContent = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #555; }
                        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); }
                        .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
                        table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                        td { padding: 5px; vertical-align: top; }
                        tr.top table td { padding-bottom: 20px; }
                        tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
                        tr.information table td { padding-bottom: 40px; }
                        tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
                        tr.details td { padding-bottom: 20px; }
                        tr.item td { border-bottom: 1px solid #eee; }
                        tr.item.last td { border-bottom: none; }
                        tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
                        .status { font-weight: bold; color: ${invoice.status === 'Paid' ? 'green' : 'red'}; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="invoice-box">
                        <table cellpadding="0" cellspacing="0">
                            <tr class="top">
                                <td colspan="2">
                                    <table>
                                        <tr>
                                            <td class="title">INVOICE</td>
                                            <td>
                                                Invoice #: ${invoice.invoiceNumber}<br />
                                                Created: ${new Date(invoice.date).toLocaleDateString()}<br />
                                                Due: ${new Date(invoice.dueDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr class="information">
                                <td colspan="2">
                                    <table>
                                        <tr>
                                            <td>
                                                School Management System<br />
                                                123 Education Lane<br />
                                                Knowledge City, 560001
                                            </td>
                                            <td>
                                                ${invoice.student.name}<br />
                                                ${invoice.student.id}<br />
                                                ${invoice.student.email}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr class="heading">
                                <td>Payment Method</td>
                                <td>Status</td>
                            </tr>
                            <tr class="details">
                                <td>${invoice.transactionId ? 'Online Transfer' : 'Pending'}</td>
                                <td class="status">${invoice.status}</td>
                            </tr>
                            <tr class="heading">
                                <td>Item</td>
                                <td>Price</td>
                            </tr>
                            ${invoice.items.map(item => `
                                <tr class="item">
                                    <td>${item.description}</td>
                                    <td>₹${item.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            <tr class="total">
                                <td></td>
                                <td>Total: ₹${invoice.totalAmount.toLocaleString()}</td>
                            </tr>
                        </table>
                        ${invoice.transactionId ? `<p style="margin-top:20px; font-size:12px; color:#999;">Transaction ID: ${invoice.transactionId}</p>` : ''}
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri);

        } catch (error) {
            Alert.alert('Error', 'Failed to generate invoice');
        } finally {
            setDownloading(false);
        }
    };

    const handleUpiPayment = async () => {
        if (!feeData || !feeData.feeAmount || feeData.feeAmount <= 0) {
            Alert.alert('Error', 'Invalid fee amount for payment.');
            return;
        }

        Alert.alert(
            'Pay via UPI',
            `To pay ₹${feeData.feeAmount}, please scan the school QR code or use the VPA: neuralv@upi.\n\nAfter payment, please contact the admin with your Transaction ID.`,
            [
                { text: 'Okay', style: 'cancel' },
                {
                    text: 'Open UPI App',
                    onPress: async () => {
                        const upiUrl = `upi://pay?pa=neuralv@upi&pn=NeuralV&am=${feeData.feeAmount}&cu=INR`;
                        try {
                            await Linking.openURL(upiUrl);
                        } catch (err) {
                            Alert.alert('Error', 'Could not open UPI app');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <AppHeader title="Fee Records" onBack={() => navigation.goBack()} />
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            </SafeAreaView>
        );
    }

    const isPaid = feeData?.feeStatus === 'Paid';

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Finance & Fees"
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="shield-check-outline"
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {feeData ? (
                    <>
                        <AppCard padding={25} style={styles.mainCard}>
                            <View style={styles.cardTop}>
                                <AppBadge
                                    label={isPaid ? 'Payment Confirmed' : 'Payment Pending'}
                                    type={isPaid ? 'success' : 'warning'}
                                />
                                <Text style={styles.refId}>#FEE-{feeData._id?.slice(-6)?.toUpperCase()}</Text>
                            </View>

                            <Text style={styles.summaryLabel}>Total Payable Amount</Text>
                            <Text style={styles.amountText}>{formatCurrency(feeData.feeAmount)}</Text>

                            <View style={styles.divider} />

                            <View style={styles.detailsGrid}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>DUE DATE</Text>
                                    <Text style={styles.gridValue}>
                                        {feeData.feeDueDate ? new Date(feeData.feeDueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>BILLING CYCLE</Text>
                                    <Text style={styles.gridValue}>Academic 2025-26</Text>
                                </View>
                            </View>
                        </AppCard>

                        <Text style={styles.sectionTitle}>Breakdown Details</Text>
                        <AppCard padding={20} style={styles.detailCard}>
                            <View style={styles.detailItem}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                                    <MaterialCommunityIcons name="book-open-outline" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.detailInfo}>
                                    <Text style={styles.detailTitle}>Academic Tuition Fees</Text>
                                    <Text style={styles.detailSub}>Includes Lab & Library Access</Text>
                                </View>
                                <Text style={styles.detailPrice}>{formatCurrency(feeData.feeAmount)}</Text>
                            </View>
                        </AppCard>

                        <View style={styles.actionContainer}>
                            {!isPaid ? (
                                <View>
                                    <AppButton
                                        title="Download Invoice"
                                        onPress={handleDownloadInvoice}
                                        loading={downloading}
                                        icon="download-outline"
                                        type="secondary"
                                        style={[styles.actionBtn, { marginBottom: 10 }]}
                                    />
                                    <AppButton
                                        title="Pay with UPI"
                                        onPress={handleUpiPayment}
                                        loading={paying}
                                        icon="currency-rupee"
                                        style={styles.actionBtn}
                                    />
                                </View>
                            ) : (
                                <AppButton
                                    title="Download Payment Receipt"
                                    onPress={handleDownloadInvoice}
                                    loading={downloading}
                                    icon="download-outline"
                                    type="secondary"
                                    style={styles.actionBtn}
                                />
                            )}
                        </View>
                    </>
                ) : (
                    <EmptyState
                        icon="receipt"
                        title="No Records Found"
                        description="Your fee ledger is currently empty. Contact admin if this is an error."
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    mainCard: { marginBottom: 30, elevation: 4 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    refId: { fontSize: 12, color: theme.colors.textLight, fontWeight: '700' },
    summaryLabel: { fontSize: 14, color: theme.colors.textLight, marginBottom: 8, fontWeight: '500' },
    amountText: { fontSize: 38, fontWeight: '900', color: theme.colors.text, marginBottom: 25 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },
    detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    gridItem: { flex: 1 },
    gridLabel: { fontSize: 10, fontWeight: '900', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 6 },
    gridValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15, marginLeft: 5 },
    detailCard: { marginBottom: 30, elevation: 2 },
    detailItem: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    detailInfo: { flex: 1 },
    detailTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    detailSub: { fontSize: 12, color: theme.colors.textLight, marginTop: 2, fontWeight: '500' },
    detailPrice: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    actionContainer: { marginTop: 10 },
    actionBtn: { borderRadius: 18 }
});

export default FeeStatusScreen;
