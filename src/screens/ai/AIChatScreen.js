import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

const AIChatScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        {
            _id: '1',
            sender: 'ai',
            content: `Hello ${userInfo?.name}! I'm your AI ${userInfo?.role === 'Teacher' ? 'Teaching Assistant' : 'Tutor'} powered by DeepSeek. How can I help you today?`,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const flatListRef = useRef();

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = {
            _id: Date.now().toString(),
            sender: 'user',
            content: inputText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Prepare conversation history (last 10 messages for context)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));

            const { data } = await axios.post(
                `${API_URL}/ai/chat`,
                {
                    message: userMsg.content,
                    subject: selectedSubject,
                    conversationHistory
                },
                config
            );

            const aiMsg = {
                _id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMsg = {
                _id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (text) => {
        // Remove excessive markdown formatting for better mobile display
        return text
            .replace(/\*\*/g, '') // Remove bold markers
            .replace(/###\s/g, '\n') // Convert headers to line breaks
            .replace(/---/g, '\n') // Convert separators to line breaks
            .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
            .trim();
    };

    const insets = useSafeAreaInsets();

    const renderItem = ({ item }) => {
        const isMe = item.sender === 'user';
        const formattedContent = isMe ? item.content : formatMessage(item.content);

        return (
            <View style={[styles.messageRow, isMe ? styles.myRow : styles.aiRow]}>
                {!isMe && (
                    <View style={[styles.aiAvatar, { backgroundColor: theme.colors.primary }]}>
                        <MaterialCommunityIcons name="robot" size={18} color="#fff" />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myBubble : styles.aiBubble,
                ]}>
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.aiText]}>
                        {formattedContent}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.aiTimeText]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <AppHeader
                title={`AI ${userInfo?.role === 'Teacher' ? 'Assistant' : 'Tutor'}`}
                variant="primary"
                onBack={() => navigation.goBack()}
                rightIcon="delete-sweep-outline"
                onRightPress={() => setMessages([messages[0]])}
                showBack={true}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Subject Selector */}
                {userInfo?.role === 'Student' && (
                    <View style={styles.subjectContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
                            {subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.subjectChip,
                                        selectedSubject === subject && styles.subjectChipActive
                                    ]}
                                    onPress={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
                                >
                                    <Text style={[
                                        styles.subjectText,
                                        selectedSubject === subject && styles.subjectTextActive
                                    ]}>
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    style={{ flex: 1 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

                {loading && (
                    <View style={styles.typingIndicator}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.typingText}>AI is thinking...</Text>
                    </View>
                )}

                <View style={[styles.inputWrapper, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : 15 }]}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your question..."
                            placeholderTextColor="#999"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !inputText.trim() && styles.disabledBtn]}
                            onPress={sendMessage}
                            disabled={loading || !inputText.trim()}
                        >
                            <MaterialCommunityIcons
                                name="arrow-up-circle"
                                size={44}
                                color={inputText.trim() ? theme.colors.primary : '#E0E0E0'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    subjectContainer: { backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10 },
    subjectScroll: { paddingHorizontal: 15, gap: 8 },
    subjectChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB' },
    subjectChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    subjectText: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
    subjectTextActive: { color: '#fff' },
    list: { padding: 20 },
    messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
    myRow: { justifyContent: 'flex-end' },
    aiRow: { justifyContent: 'flex-start' },
    aiAvatar: { width: 34, height: 34, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    messageBubble: { maxWidth: '85%', padding: 16, borderRadius: 20 },
    myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 5 },
    aiBubble: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 5 },
    messageText: { fontSize: 15, lineHeight: 24 },
    myText: { color: '#fff' },
    aiText: { color: theme.colors.text },
    timeText: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
    myTimeText: { color: 'rgba(255,255,255,0.7)' },
    aiTimeText: { color: '#999' },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingLeft: 60 },
    typingText: { marginLeft: 10, color: theme.colors.textLight, fontStyle: 'italic', fontSize: 13 },
    inputWrapper: { padding: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16, color: theme.colors.text, maxHeight: 120 },
    sendBtn: { justifyContent: 'center', alignItems: 'center' },
    disabledBtn: { opacity: 0.5 }
});

export default AIChatScreen;
