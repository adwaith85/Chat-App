import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { chatApi, userApi } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.20.3:3000'; // Match your backend IP

export default function ChatScreen() {
    const { id, name, image } = useLocalSearchParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [myId, setMyId] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const socket = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const init = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setMyId(user.user_id);
                setupSocket(await AsyncStorage.getItem('token'));
            }
            fetchMessages();
        };

        const setupSocket = (token: string | null) => {
            if (!token) return;
            socket.current = io(SOCKET_URL);

            socket.current.on('connect', () => {
                socket.current?.emit('authenticate', token);
            });

            socket.current.on('receive_message', (message: any) => {
                if (message.sender_id === Number(id)) {
                    setMessages(prev => [...prev, message]);
                    // Mark as read
                    chatApi.updateMessageStatus(message.message_id, 'read');
                }
            });

            socket.current.on('user_status', (data: any) => {
                if (data.user_id === Number(id)) {
                    setIsOnline(data.is_online === 1);
                }
            });
        };

        init();

        return () => {
            socket.current?.disconnect();
        };
    }, [id]);

    const fetchMessages = async () => {
        try {
            const response = await chatApi.getMessages(Number(id));
            setMessages(response.data);

            // Also fetch user details to check online status
            const userResponse = await userApi.getUserById(id as string);
            setIsOnline(userResponse.data.user.is_online === 1);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !myId) return;

        const messageData = {
            receiver_id: Number(id),
            message: input.trim(),
            message_type: 'text'
        };

        try {
            const response = await chatApi.sendMessage(messageData);
            const newMessage = response.data;
            setMessages(prev => [...prev, newMessage]);
            setInput('');

            // Send via socket for real-time (not strictly necessary if receiver also listens)
            socket.current?.emit('send_message', messageData);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender_id === myId;
        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                        {new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>

                <View style={styles.userInfo}>
                    <Image
                        source={image || 'https://ui-avatars.com/api/?name=' + name}
                        style={styles.avatar}
                    />
                    <View style={styles.userTextInfo}>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={[styles.statusText, isOnline && styles.onlineText]}>
                            {isOnline ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
                </TouchableOpacity>
            </View>

            {/* Chat Content */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.message_id.toString()}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add" size={28} color="#64748b" />
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim()}
                    >
                        <Ionicons name="send" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backBtn: {
        padding: 4,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    userTextInfo: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusText: {
        fontSize: 12,
        color: '#64748b',
    },
    onlineText: {
        color: '#22C55E',
        fontWeight: '600',
    },
    moreBtn: {
        padding: 4,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 24,
    },
    messageWrapper: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    myMessageWrapper: {
        justifyContent: 'flex-end',
    },
    theirMessageWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: '#6366f1',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#1e293b',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirTimeText: {
        color: '#94a3b8',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    attachBtn: {
        padding: 8,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        maxHeight: 100,
    },
    input: {
        fontSize: 15,
        color: '#1e293b',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    sendBtnDisabled: {
        backgroundColor: '#E2E8F0',
        elevation: 0,
        shadowOpacity: 0,
    },
});
