import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ProfileEditScreen = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                setFormData(prev => ({
                    ...prev,
                    name: parsed.name || '',
                    email: parsed.email || '',
                    mobile: parsed.mobile || '',
                }));
            }
        };
        loadUserData();
    }, []);

    const handleSave = async () => {
        if (!formData.name) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            await authApi.updateProfile({
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
            });
            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default' }: any) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#4F46E5" />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Change Avatar Section */}
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        style={styles.avatarSection}
                    >
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: formData.profileImage }}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                            <TouchableOpacity style={styles.editBadge}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.changeAvatarText}>Change Profile Picture</Text>
                    </Animated.View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <InputField
                                label="Full Name"
                                value={formData.name}
                                onChangeText={(text: string) => setFormData({ ...formData, name: text })}
                                icon="person-outline"
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(300).springify()}>
                            <InputField
                                label="Email Address"
                                value={formData.email}
                                onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                                icon="mail-outline"
                                keyboardType="email-address"
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).springify()}>
                            <InputField
                                label="Phone Number"
                                value={formData.mobile}
                                onChangeText={(text: string) => setFormData({ ...formData, mobile: text })}
                                icon="call-outline"
                                keyboardType="phone-pad"
                            />
                        </Animated.View>
                    </View>

                    {/* Info Box */}
                    <Animated.View
                        entering={FadeInDown.delay(500).springify()}
                        style={styles.infoBox}
                    >
                        <Ionicons name="information-circle-outline" size={20} color="#4B5563" />
                        <Text style={styles.infoBoxText}>
                            Your email and phone number are used for authentication and connecting you with others.
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4F46E5',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 30,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#EEF2FF',
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#4F46E5',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    changeAvatarText: {
        marginTop: 12,
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
    },
    formSection: {
        paddingHorizontal: 20,
        marginTop: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#111827',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoBoxText: {
        flex: 1,
        fontSize: 13,
        color: '#4B5563',
        marginLeft: 10,
        lineHeight: 18,
    },
});

export default ProfileEditScreen;
