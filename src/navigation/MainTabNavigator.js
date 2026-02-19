import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

// Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import StudentsListScreen from '../screens/admin/StudentsListScreen';
import TeachersListScreen from '../screens/admin/TeachersListScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import QuizListScreen from '../screens/student/QuizListScreen';
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import ViewAttendanceScreen from '../screens/student/ViewAttendanceScreen';
import ScheduleScreen from '../screens/teacher/ScheduleScreen';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';

import { theme } from '../constants/theme';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
    const { userInfo } = useContext(AuthContext);
    const role = userInfo?.role;
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'AI') {
                        iconName = focused ? 'robot' : 'robot-outline';
                    } else if (role === 'Admin') {
                        if (route.name === 'Home') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                        else if (route.name === 'Students') iconName = focused ? 'account-school' : 'account-school-outline';
                        else if (route.name === 'Teachers') iconName = focused ? 'account-tie' : 'account-tie-outline';
                        else if (route.name === 'Messages') iconName = focused ? 'chat-processing' : 'chat-processing-outline';
                    } else if (role === 'Teacher') {
                        if (route.name === 'Home') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                        else if (route.name === 'Schedule') iconName = focused ? 'calendar-clock' : 'calendar-clock-outline';
                        else if (route.name === 'Quizzes') iconName = focused ? 'brain' : 'brain';
                        else if (route.name === 'Messages') iconName = focused ? 'chat-processing' : 'chat-processing-outline';
                    } else if (role === 'Student') {
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Quizzes') iconName = focused ? 'brain' : 'brain';
                        else if (route.name === 'Messages') iconName = focused ? 'chat-processing' : 'chat-processing-outline';
                        else if (route.name === 'Attendance') iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                        else if (route.name === 'Profile') iconName = focused ? 'account-circle' : 'account-circle-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'ios' ? 0 : 5
                },
                tabBarStyle: {
                    backgroundColor: '#fff',
                    height: Platform.OS === 'ios' ? 85 : 60 + (insets.bottom > 0 ? insets.bottom : 10),
                    paddingTop: 8,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    borderTopWidth: 0,
                    elevation: 0,
                }
            })}
        >
            {role === 'Admin' && (
                <>
                    <Tab.Screen name="Home" component={AdminDashboard} />
                    <Tab.Screen name="Students" component={StudentsListScreen} />
                    <Tab.Screen name="AI" component={AIChatScreen} />
                    <Tab.Screen name="Teachers" component={TeachersListScreen} />
                    <Tab.Screen name="Messages" component={ChatListScreen} />
                </>
            )}
            {role === 'Teacher' && (
                <>
                    <Tab.Screen name="Home" component={TeacherDashboard} />
                    <Tab.Screen name="Schedule" component={ScheduleScreen} />
                    <Tab.Screen name="Quizzes" component={QuizListScreen} />
                    <Tab.Screen name="AI" component={AIChatScreen} />
                    <Tab.Screen name="Messages" component={ChatListScreen} />
                </>
            )}
            {role === 'Student' && (
                <>
                    <Tab.Screen name="Home" component={StudentDashboard} />
                    <Tab.Screen name="Quizzes" component={QuizListScreen} />
                    <Tab.Screen name="AI" component={AIChatScreen} />
                    <Tab.Screen name="Messages" component={ChatListScreen} />
                    <Tab.Screen name="Attendance" component={ViewAttendanceScreen} />
                    <Tab.Screen name="Profile" component={StudentProfileScreen} />
                </>
            )}
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
