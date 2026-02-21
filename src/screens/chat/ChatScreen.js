import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client'; // Import socket.io-client
import AppHeader from '../../components/AppHeader';
import API_URL from '../../config/api';
import { theme } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

// Remove '/api' from the end of the URL to connect to the root Socket.IO namespace
const SOCKET_URL = API_URL.replace('/api', '');

const ChatScreen = ({ route, navigation }) => {
    const { userId, resultName } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef();
    const socket = useRef(null); // Ref to hold the socket instance

    useEffect(() => {
        // Fetch initial messages
        fetchMessages();

        // Setup Socket.IO connection
        const setupSocket = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                if (token) {
                    socket.current = io(SOCKET_URL, {
                        auth: { token },
                        transports: ['websocket'] // Explicitly use websockets
                    });

                    socket.current.on('connect', () => {
                        console.log('Socket.IO connected:', socket.current.id);
                        // No need to explicitly join 'userId' room, backend does it
                    });

                    socket.current.on('disconnect', () => {
                        console.log('Socket.IO disconnected');
                    });

                    socket.current.on('connect_error', (error) => {
                        console.error('Socket.IO connection error:', error.message);
                    });

                    socket.current.on('message', (newMessage) => {
                        // Check if the new message is part of the current conversation
                        if (
                            (newMessage.sender === userInfo._id && newMessage.recipient === userId) ||
                            (newMessage.sender === userId && newMessage.recipient === userInfo._id)
                        ) {
                            setMessages((prevMessages) => [...prevMessages, newMessage]);
                        }
                    });
                }
            } catch (error) {
                console.error('Error setting up socket:', error);
            }
        };

        setupSocket();

        // Cleanup: Disconnect socket when component unmounts
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    const fetchMessages = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_URL}/messages/${userId}`, config);
            setMessages(data);
            if (loading) setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const content = inputText;
        setInputText('');

        if (socket.current) {
            socket.current.emit('sendMessage', {
                recipientId: userId,
                content
            });
        }
        // No need to call fetchMessages() here, as the message will come via socket listener
    };

    const renderItem = ({ item }) => {
        const isMe = item.sender === userInfo._id;
        return (
            <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title={resultName}
                onBack={() => navigation.goBack()}
                rightIcon="phone-outline"
            />

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        style={{ flex: 1 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type reaching message..."
                                placeholderTextColor="#999"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendBtn, !inputText.trim() && styles.disabledBtn]}
                                onPress={sendMessage}
                                disabled={!inputText.trim()}
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
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    messageRow: { marginBottom: 15, flexDirection: 'row' },
    myRow: { justifyContent: 'flex-end' },
    theirRow: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
    myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 5 },
    theirBubble: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 5 },
    messageText: { fontSize: 16, lineHeight: 22 },
    myText: { color: '#fff' },
    theirText: { color: theme.colors.text },
    timeText: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
    myTime: { color: 'rgba(255,255,255,0.7)' },
    theirTime: { color: '#999' },
    inputWrapper: { padding: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#fff' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16, color: theme.colors.text, maxHeight: 120 },
    sendBtn: { justifyContent: 'center', alignItems: 'center' },
    disabledBtn: { opacity: 0.5 }
});

export default ChatScreen;
