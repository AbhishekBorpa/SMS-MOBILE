import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const GradeCalculatorScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('current'); // current, target, gpa

    // Current Grade Calculator
    const [currentScores, setCurrentScores] = useState({ obtained: '', total: '' });
    const [currentResult, setCurrentResult] = useState(null);

    // Target Grade Calculator
    const [targetInputs, setTargetInputs] = useState({
        currentScore: '',
        currentTotal: '',
        targetGrade: '',
        remainingTotal: ''
    });
    const [targetResult, setTargetResult] = useState(null);

    // GPA Calculator
    const [subjects, setSubjects] = useState([
        { name: 'Mathematics', grade: '', credits: '4' },
        { name: 'Physics', grade: '', credits: '4' },
        { name: 'Chemistry', grade: '', credits: '4' },
    ]);
    const [gpaResult, setGpaResult] = useState(null);

    const calculateCurrentGrade = () => {
        const obtained = parseFloat(currentScores.obtained);
        const total = parseFloat(currentScores.total);

        if (isNaN(obtained) || isNaN(total) || total === 0) {
            Alert.alert('Invalid Input', 'Please enter valid numbers');
            return;
        }

        const percentage = (obtained / total) * 100;
        const grade = getLetterGrade(percentage);

        setCurrentResult({ percentage: percentage.toFixed(2), grade });
    };

    const calculateTargetGrade = () => {
        const current = parseFloat(targetInputs.currentScore);
        const currentTotal = parseFloat(targetInputs.currentTotal);
        const target = parseFloat(targetInputs.targetGrade);
        const remaining = parseFloat(targetInputs.remainingTotal);

        if (isNaN(current) || isNaN(currentTotal) || isNaN(target) || isNaN(remaining)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers');
            return;
        }

        const totalPoints = currentTotal + remaining;
        const neededTotal = (target / 100) * totalPoints;
        const neededInRemaining = neededTotal - current;
        const neededPercentage = (neededInRemaining / remaining) * 100;

        setTargetResult({
            needed: neededInRemaining.toFixed(2),
            percentage: neededPercentage.toFixed(2),
            possible: neededPercentage <= 100
        });
    };

    const calculateGPA = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        for (const subject of subjects) {
            const grade = parseFloat(subject.grade);
            const credits = parseFloat(subject.credits);

            if (isNaN(grade) || isNaN(credits)) continue;

            const gradePoint = getGradePoint(grade);
            totalPoints += gradePoint * credits;
            totalCredits += credits;
        }

        if (totalCredits === 0) {
            Alert.alert('Invalid Input', 'Please enter at least one subject');
            return;
        }

        const gpa = totalPoints / totalCredits;
        setGpaResult({ gpa: gpa.toFixed(2), grade: getLetterGrade(gpa * 10) });
    };

    const getLetterGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    const getGradePoint = (percentage) => {
        if (percentage >= 90) return 10;
        if (percentage >= 80) return 9;
        if (percentage >= 70) return 8;
        if (percentage >= 60) return 7;
        if (percentage >= 50) return 6;
        if (percentage >= 40) return 5;
        return 0;
    };

    const addSubject = () => {
        setSubjects([...subjects, { name: `Subject ${subjects.length + 1}`, grade: '', credits: '3' }]);
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Grade Calculator</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'current' && styles.tabActive]}
                        onPress={() => setActiveTab('current')}
                    >
                        <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>
                            Current
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'target' && styles.tabActive]}
                        onPress={() => setActiveTab('target')}
                    >
                        <Text style={[styles.tabText, activeTab === 'target' && styles.tabTextActive]}>
                            Target
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'gpa' && styles.tabActive]}
                        onPress={() => setActiveTab('gpa')}
                    >
                        <Text style={[styles.tabText, activeTab === 'gpa' && styles.tabTextActive]}>
                            GPA
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Current Grade Calculator */}
                {activeTab === 'current' && (
                    <View style={styles.calculatorCard}>
                        <Text style={styles.cardTitle}>Calculate Current Grade</Text>
                        <Text style={styles.cardSubtitle}>Enter your scores to see your grade</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Marks Obtained</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 85"
                                keyboardType="numeric"
                                value={currentScores.obtained}
                                onChangeText={(text) => setCurrentScores({ ...currentScores, obtained: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Total Marks</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 100"
                                keyboardType="numeric"
                                value={currentScores.total}
                                onChangeText={(text) => setCurrentScores({ ...currentScores, total: text })}
                            />
                        </View>

                        <TouchableOpacity style={styles.calculateBtn} onPress={calculateCurrentGrade}>
                            <LinearGradient colors={theme.gradients.primary} style={styles.btnGradient}>
                                <Text style={styles.btnText}>Calculate</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {currentResult && (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultLabel}>Your Grade</Text>
                                <Text style={styles.resultGrade}>{currentResult.grade}</Text>
                                <Text style={styles.resultPercentage}>{currentResult.percentage}%</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Target Grade Calculator */}
                {activeTab === 'target' && (
                    <View style={styles.calculatorCard}>
                        <Text style={styles.cardTitle}>What Do I Need?</Text>
                        <Text style={styles.cardSubtitle}>Calculate required score for target grade</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Score</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 150"
                                keyboardType="numeric"
                                value={targetInputs.currentScore}
                                onChangeText={(text) => setTargetInputs({ ...targetInputs, currentScore: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Total Marks</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 200"
                                keyboardType="numeric"
                                value={targetInputs.currentTotal}
                                onChangeText={(text) => setTargetInputs({ ...targetInputs, currentTotal: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Target Grade (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 85"
                                keyboardType="numeric"
                                value={targetInputs.targetGrade}
                                onChangeText={(text) => setTargetInputs({ ...targetInputs, targetGrade: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Remaining Total Marks</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 100"
                                keyboardType="numeric"
                                value={targetInputs.remainingTotal}
                                onChangeText={(text) => setTargetInputs({ ...targetInputs, remainingTotal: text })}
                            />
                        </View>

                        <TouchableOpacity style={styles.calculateBtn} onPress={calculateTargetGrade}>
                            <LinearGradient colors={theme.gradients.secondary} style={styles.btnGradient}>
                                <Text style={styles.btnText}>Calculate</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {targetResult && (
                            <View style={[styles.resultCard, !targetResult.possible && styles.resultCardWarning]}>
                                <Text style={styles.resultLabel}>You Need</Text>
                                <Text style={styles.resultGrade}>{targetResult.needed}</Text>
                                <Text style={styles.resultPercentage}>
                                    {targetResult.percentage}% in remaining exams
                                </Text>
                                {!targetResult.possible && (
                                    <Text style={styles.warningText}>
                                        ⚠️ This target may not be achievable
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* GPA Calculator */}
                {activeTab === 'gpa' && (
                    <View style={styles.calculatorCard}>
                        <Text style={styles.cardTitle}>GPA Calculator</Text>
                        <Text style={styles.cardSubtitle}>Calculate your semester GPA</Text>

                        {subjects.map((subject, index) => (
                            <View key={index} style={styles.subjectRow}>
                                <TextInput
                                    style={[styles.input, { flex: 2, marginRight: 8 }]}
                                    placeholder="Subject"
                                    value={subject.name}
                                    onChangeText={(text) => updateSubject(index, 'name', text)}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    placeholder="Grade %"
                                    keyboardType="numeric"
                                    value={subject.grade}
                                    onChangeText={(text) => updateSubject(index, 'grade', text)}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Credits"
                                    keyboardType="numeric"
                                    value={subject.credits}
                                    onChangeText={(text) => updateSubject(index, 'credits', text)}
                                />
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
                            <MaterialCommunityIcons name="plus-circle" size={20} color={theme.colors.primary} />
                            <Text style={styles.addBtnText}>Add Subject</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.calculateBtn} onPress={calculateGPA}>
                            <LinearGradient colors={theme.gradients.blue} style={styles.btnGradient}>
                                <Text style={styles.btnText}>Calculate GPA</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {gpaResult && (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultLabel}>Your GPA</Text>
                                <Text style={styles.resultGrade}>{gpaResult.gpa}</Text>
                                <Text style={styles.resultPercentage}>Grade: {gpaResult.grade}</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { paddingBottom: 30 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: theme.colors.text },

    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
    tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', ...theme.shadows.sm },
    tabActive: { backgroundColor: theme.colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    tabTextActive: { color: '#fff' },

    calculatorCard: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 20, ...theme.shadows.md },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 5 },
    cardSubtitle: { fontSize: 14, color: theme.colors.textLight, marginBottom: 20 },

    inputGroup: { marginBottom: 15 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
    input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, fontSize: 16, color: theme.colors.text },

    subjectRow: { flexDirection: 'row', marginBottom: 10 },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginBottom: 15 },
    addBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary, marginLeft: 8 },

    calculateBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
    btnGradient: { paddingVertical: 16, alignItems: 'center' },
    btnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

    resultCard: { marginTop: 20, padding: 25, backgroundColor: theme.colors.primary + '10', borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.primary },
    resultCardWarning: { backgroundColor: '#FFF3E0', borderColor: theme.colors.warning },
    resultLabel: { fontSize: 14, color: theme.colors.textLight, marginBottom: 10 },
    resultGrade: { fontSize: 48, fontWeight: 'bold', color: theme.colors.primary },
    resultPercentage: { fontSize: 16, color: theme.colors.text, marginTop: 5 },
    warningText: { fontSize: 14, color: theme.colors.warning, marginTop: 10, fontWeight: '600' },
});

export default GradeCalculatorScreen;
