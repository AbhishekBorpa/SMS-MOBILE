import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import API_URL from './src/config/api';
import { AuthContext, AuthProvider } from './src/context/AuthContext';

import MainTabNavigator from './src/navigation/MainTabNavigator';
import AddTeacherScreen from './src/screens/admin/AddTeacherScreen';
import AddTransportScreen from './src/screens/admin/AddTransportScreen';
import AdminAttendanceScreen from './src/screens/admin/AdminAttendanceScreen';
import AdminAuditLogScreen from './src/screens/admin/AdminAuditLogScreen';
import AdminComplaintScreen from './src/screens/admin/AdminComplaintScreen';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminFinanceInsightsScreen from './src/screens/admin/AdminFinanceInsightsScreen';
import AdminLeaveScreen from './src/screens/admin/AdminLeaveScreen';
import AdminNoticeBoardScreen from './src/screens/admin/AdminNoticeBoardScreen';
import AdminProfileScreen from './src/screens/admin/AdminProfileScreen';
import AlumniDirectoryScreen from './src/screens/admin/AlumniDirectoryScreen';
import DesignSystemPreviewScreen from './src/screens/admin/DesignSystemPreviewScreen';
import FeeManagementScreen from './src/screens/admin/FeeManagementScreen';
import InventoryListScreen from './src/screens/admin/InventoryListScreen';
import SchoolAnalyticsScreen from './src/screens/admin/SchoolAnalyticsScreen';
import SettingsScreen from './src/screens/admin/SettingsScreen';
import StaffStatusScreen from './src/screens/admin/StaffStatusScreen';
import StudentDetailScreen from './src/screens/admin/StudentDetailScreen';
import StudentsListScreen from './src/screens/admin/StudentsListScreen';
import TeacherDetailScreen from './src/screens/admin/TeacherDetailScreen';
import TeachersListScreen from './src/screens/admin/TeachersListScreen';
import TransportListScreen from './src/screens/admin/TransportListScreen';
import VisitorLogScreen from './src/screens/admin/VisitorLogScreen';
import AIChatScreen from './src/screens/ai/AIChatScreen';
import AssignmentDetailScreen from './src/screens/assignment/AssignmentDetailScreen';
import AssignmentsListScreen from './src/screens/assignment/AssignmentsListScreen';
import AssignmentSubmissionsListScreen from './src/screens/assignment/AssignmentSubmissionsListScreen';
import CreateAssignmentScreen from './src/screens/assignment/CreateAssignmentScreen';
import GradingScreen from './src/screens/assignment/GradingScreen';
import ChatListScreen from './src/screens/chat/ChatListScreen';
import ChatScreen from './src/screens/chat/ChatScreen';
import ComplaintBoxScreen from './src/screens/ComplaintBoxScreen';
import EventCalendarScreen from './src/screens/EventCalendarScreen';
import GalleryListScreen from './src/screens/gallery/GalleryListScreen';
import UploadPhotoScreen from './src/screens/gallery/UploadPhotoScreen';
import AIReportCardScreen from './src/screens/student/AIReportCardScreen';
import StudyMaterialListScreen from './src/screens/studyMaterial/StudyMaterialListScreen';
import UploadMaterialScreen from './src/screens/studyMaterial/UploadMaterialScreen';

import CreateQuizScreen from './src/screens/quiz/CreateQuizScreen';

import LoginScreen from './src/screens/LoginScreen';
import NoticeBoardScreen from './src/screens/NoticeBoardScreen';
import PasswordResetScreen from './src/screens/PasswordResetScreen';
import LeaderboardScreen from './src/screens/quiz/LeaderboardScreen';
import QuizAttemptScreen from './src/screens/quiz/QuizAttemptScreen';
import QuizListScreen from './src/screens/quiz/QuizListScreen';
import RemarkInputScreen from './src/screens/remark/RemarkInputScreen';
import StudentRemarksScreen from './src/screens/remark/StudentRemarksScreen';
import AchievementsScreen from './src/screens/student/AchievementsScreen';
import CanteenScreen from './src/screens/student/CanteenScreen';
import ChangePasswordScreen from './src/screens/student/ChangePasswordScreen';
import ClubListScreen from './src/screens/student/ClubListScreen';
import DigitalIDCardScreen from './src/screens/student/DigitalIDCardScreen';
import ExamScheduleScreen from './src/screens/student/ExamScheduleScreen';
import FeeStatusScreen from './src/screens/student/FeeStatusScreen';
import GradeCalculatorScreen from './src/screens/student/GradeCalculatorScreen';
import HealthWellnessScreen from './src/screens/student/HealthWellnessScreen';
import LibraryScreen from './src/screens/student/LibraryScreen';
import LostFoundScreen from './src/screens/student/LostFoundScreen';
import StudentDashboard from './src/screens/student/StudentDashboard';
import StudentLeaveScreen from './src/screens/student/StudentLeaveScreen';
import StudyMaterialsScreen from './src/screens/student/StudyMaterialsScreen';
import StudyTimerScreen from './src/screens/student/StudyTimerScreen';
import TimetableScreen from './src/screens/student/TimetableScreen';
import TransportScreen from './src/screens/student/TransportScreen';
import ViewAttendanceScreen from './src/screens/student/ViewAttendanceScreen';
import ViewMarksScreen from './src/screens/student/ViewMarksScreen';
import AddStudentScreen from './src/screens/teacher/AddStudentScreen';
import BehaviorTrackerScreen from './src/screens/teacher/BehaviorTrackerScreen';
import LessonPlannerScreen from './src/screens/teacher/LessonPlannerScreen';
import PTMSchedulerScreen from './src/screens/teacher/PTMSchedulerScreen';
import RequisitionScreen from './src/screens/teacher/RequisitionScreen';
import ScheduleScreen from './src/screens/teacher/ScheduleScreen';
import StudentAwardsScreen from './src/screens/teacher/StudentAwardsScreen';
import TakeAttendanceScreen from './src/screens/teacher/TakeAttendanceScreen';
import TeacherLeaveScreen from './src/screens/teacher/TeacherLeaveScreen';
import TeacherProfileScreen from './src/screens/teacher/TeacherProfileScreen';
import UploadMarksScreen from './src/screens/teacher/UploadMarksScreen';

const Stack = createNativeStackNavigator();



const AppNav = () => {
    const { isLoading, userToken, userInfo } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {userToken ? (
                    userInfo?.isPasswordResetRequired ? (
                        <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ headerShown: false }} />
                    ) : (
                        <>
                            {/* Role based Main Navigator */}
                            <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />

                            {/* Common Stack Screens (Push on top of Tabs) */}
                            <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="StudentDetail" component={StudentDetailScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="EventCalendar" component={EventCalendarScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="AIReportCard" component={AIReportCardScreen} options={{ headerShown: false }} />


                            <Stack.Screen name="GalleryList" component={GalleryListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ComplaintBox" component={ComplaintBoxScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="AssignmentsList" component={AssignmentsListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="StudyMaterialList" component={StudyMaterialListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="UploadMaterial" component={UploadMaterialScreen} options={{ headerShown: false }} />


                            <Stack.Screen name="StudentsList" component={StudentsListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="TeachersList" component={TeachersListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="TeacherDetail" component={TeacherDetailScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{ headerShown: false }} />

                            <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DesignSystem" component={DesignSystemPreviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="QuizList" component={QuizListScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: false }} />

                            {/* Admin Specific Stack Screens */}
                            {userInfo?.role === 'Admin' && (
                                <>
                                    <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminNoticeBoard" component={AdminNoticeBoardScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminComplaint" component={AdminComplaintScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="LessonPlanner" component={LessonPlannerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="PTMScheduler" component={PTMSchedulerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="BehaviorTracker" component={BehaviorTrackerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Requisition" component={RequisitionScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AddTeacher" component={AddTeacherScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminFinance" component={AdminFinanceInsightsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StaffStatus" component={StaffStatusScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminProfile" component={AdminProfileScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminAuditLog" component={AdminAuditLogScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="InventoryList" component={InventoryListScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="VisitorLog" component={VisitorLogScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AlumniDirectory" component={AlumniDirectoryScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="FeeManagement" component={FeeManagementScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminLeave" component={AdminLeaveScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="SchoolAnalytics" component={SchoolAnalyticsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="TransportList" component={TransportListScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AddTransport" component={AddTransportScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AdminAttendance" component={AdminAttendanceScreen} options={{ headerShown: false }} />
                                </>
                            )}

                            {/* Teacher Specific Stack Screens */}
                            {userInfo?.role === 'Teacher' && (
                                <>
                                    <Stack.Screen name="TakeAttendance" component={TakeAttendanceScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="UploadMarks" component={UploadMarksScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="TeacherLeave" component={TeacherLeaveScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="CreateAssignment" component={CreateAssignmentScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AssignmentSubmissionsList" component={AssignmentSubmissionsListScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Grading" component={GradingScreen} options={{ headerShown: false }} />

                                    <Stack.Screen name="RemarkInput" component={RemarkInputScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="UploadPhoto" component={UploadPhotoScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StudentAwards" component={StudentAwardsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="LessonPlanner" component={LessonPlannerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="PTMScheduler" component={PTMSchedulerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="BehaviorTracker" component={BehaviorTrackerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Requisition" component={RequisitionScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} options={{ headerShown: false }} />
                                </>
                            )}

                            {/* Student Specific Stack Screens */}
                            {userInfo?.role === 'Student' && (
                                <>
                                    <Stack.Screen name="FeeStatus" component={FeeStatusScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StudentRemarks" component={StudentRemarksScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="DigitalIDCard" component={DigitalIDCardScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Library" component={LibraryScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Canteen" component={CanteenScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="LostFound" component={LostFoundScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StudentLeave" component={StudentLeaveScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="ClubList" component={ClubListScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="ViewMarks" component={ViewMarksScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Timetable" component={TimetableScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="ExamSchedule" component={ExamScheduleScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Transport" component={TransportScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="ViewAttendance" component={ViewAttendanceScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="HealthWellness" component={HealthWellnessScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StudyTimer" component={StudyTimerScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="GradeCalculator" component={GradeCalculatorScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="StudyMaterials" component={StudyMaterialsScreen} options={{ headerShown: false }} />
                                    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />

                                    <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} options={{ headerShown: false }} />
                                </>
                            )}
                            {/* Fallback if role is not recognized or generic dashboard */}
                            {!['Admin', 'Teacher', 'Student'].includes(userInfo?.role) && (
                                <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ title: 'Dashboard' }} />
                            )}
                        </>
                    )
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};



function AppContent() {
    const { userToken, isLoading, userInfo } = useContext(AuthContext);
    // const [fontsLoaded] = useFonts({ // Removed as useFonts is not defined in the original code or provided in the instruction
    //     // ... (fonts logic)
    // });

    useEffect(() => {
        // Only set notification handler if NOT on Android Expo Go
        if (!(Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient')) {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });
        }
    }, []);

    useEffect(() => {
        if (userToken) {
            registerForPushNotificationsAsync();
        }
    }, [userToken]);

    const registerForPushNotificationsAsync = async () => {
        // Safe guard for Expo Go on Android where push notifications are removed in SDK 53
        if (Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient') {
            console.log('Skipping remote notification setup in Expo Go (Android)');
            return;
        }

        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    // Alert.alert('Failed to get push token for push notification!');
                    return;
                }

                // Get the token (handle Expo Go vs Standalone)
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

                // Add try-catch specifically for token generation which fails in Expo Go
                try {
                    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
                    const token = tokenData.data;

                    // Send to backend
                    const config = { headers: { Authorization: `Bearer ${userToken}` } };
                    await axios.put(`${API_URL}/users/push-token`, { token }, config);
                    console.log('Push token updated:', token);
                } catch (tokenError) {
                    console.log('Error getting push token (likely Expo Go limitation):', tokenError.message);
                }
            }
        } catch (error) {
            console.log('Error in registerForPushNotificationsAsync:', error);
        }
    };

    // Render AppNav here, as it contains the main navigation logic
    return <AppNav />;
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
