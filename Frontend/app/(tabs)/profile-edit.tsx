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
import { userApi } from '../../api';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ProfileEditScreen = () => {
    const [formData, setFormData] = useState({
        email: '',
        profile_image: '',
        number: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                setFormData({
                    email: parsed.email || '',
                    profile_image: parsed.profile_image || '',
                    number: parsed.number || '',
                });
            }
        };
        loadUserData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await userApi.updateProfile({
                email: formData.email,
                profile_image: formData.profile_image,
            });

            // Update local storage
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                const updated = { ...parsed, ...formData };
                await AsyncStorage.setItem('user', JSON.stringify(updated));
            }

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', editable = true }: any) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
                <Ionicons name={icon} size={20} color={editable ? "#6366F1" : "#94A3B8"} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, !editable && { color: '#94A3B8' }]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholderTextColor="#9CA3AF"
                    editable={editable}
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
                    {/* Profile Image Section */}
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        style={styles.avatarSection}
                    >
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={formData.profile_image || 'https://ui-avatars.com/api/?name=' + formData.number}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                            <TouchableOpacity style={styles.editBadge}>
                                <Ionicons name="camera" size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.imageUrlInput}
                            placeholder="Paste Profile Image URL"
                            value={formData.profile_image}
                            onChangeText={(text) => setFormData({ ...formData, profile_image: text })}
                        />
                    </Animated.View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <InputField
                                label="Phone Number (Verified)"
                                value={formData.number}
                                icon="call-outline"
                                editable={false}
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
                    </View>

                    <Animated.View
                        entering={FadeInDown.delay(400).springify()}
                        style={styles.infoBox}
                    >
                        <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
                        <Text style={styles.infoBoxText}>
                            Your phone number is verified and cannot be changed. You can update your email and profile picture.
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
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '700',
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
        marginBottom: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 44,
        borderWidth: 4,
        borderColor: '#F3F4F6',
    },
    editBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#4F46E5',
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    imageUrlInput: {
        width: '80%',
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    formSection: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 15,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        height: 56,
    },
    disabledInput: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        marginHorizontal: 20,
        marginTop: 10,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    infoBoxText: {
        flex: 1,
        fontSize: 13,
        color: '#4F46E5',
        marginLeft: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
});

export default ProfileEditScreen;
