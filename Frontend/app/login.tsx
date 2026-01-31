import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
    const [contact, setContact] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Contact, 2: OTP
    const [loading, setLoading] = useState(false);
    const [channel, setChannel] = useState<'email' | 'mobile'>('email');

    const handleRequestOTP = async () => {
        if (!contact) {
            Alert.alert('Error', 'Please enter your contact information');
            return;
        }

        setLoading(true);
        try {
            console.log('Sending OTP request to:', channel, contact);
            const response = await authApi.requestOTP(channel, contact);
            Alert.alert('OTP Sent', `For testing purposes, your OTP is: ${response.data.otp}`);
            setStep(2);
        } catch (error: any) {
            console.error('Login Error:', error);
            if (error.response) {
                console.error('Error Data:', error.response.data);
                console.error('Error Status:', error.response.status);
            } else if (error.request) {
                console.error('No response received from server. Check if your machine IP is correct.');
            }
            Alert.alert('Network Error', 'Could not connect to the server. Please ensure the backend is running and the IP address in api/index.ts is correct.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.verifyOTP(channel, contact, otp);
            const { token, user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            router.replace('/(tabs)/home');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => step === 2 ? setStep(1) : router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <Text style={styles.title}>{step === 1 ? 'Welcome Back!' : 'Verify OTP'}</Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'Enter your details to continue your journey.'
                                : `Enter the code we sent to your ${channel}.`}
                        </Text>
                    </Animated.View>

                    {step === 1 && (
                        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.inputSection}>
                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tab, channel === 'email' && styles.activeTab]}
                                    onPress={() => setChannel('email')}
                                >
                                    <Text style={[styles.tabText, channel === 'email' && styles.activeTabText]}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, channel === 'mobile' && styles.activeTab]}
                                    onPress={() => setChannel('mobile')}
                                >
                                    <Text style={[styles.tabText, channel === 'mobile' && styles.activeTabText]}>Mobile</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name={channel === 'email' ? "mail-outline" : "call-outline"}
                                    size={20}
                                    color="#64748b"
                                />
                                <TextInput
                                    placeholder={channel === 'email' ? "Enter your email" : "Enter your mobile number"}
                                    placeholderTextColor="#94a3b8"
                                    style={styles.input}
                                    value={contact}
                                    onChangeText={setContact}
                                    keyboardType={channel === 'email' ? 'email-address' : 'phone-pad'}
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={handleRequestOTP}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Text style={styles.primaryBtnText}>Send OTP</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {step === 2 && (
                        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.inputSection}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                                <TextInput
                                    placeholder="Enter 6-digit OTP"
                                    placeholderTextColor="#94a3b8"
                                    style={styles.input}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={handleVerifyOTP}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Text style={styles.primaryBtnText}>Verify & Login</Text>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendBtn} onPress={handleRequestOTP}>
                                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 24,
        marginTop: 12,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 8,
        lineHeight: 24,
    },
    inputSection: {
        marginTop: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeTabText: {
        color: '#6366f1',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 60,
        marginBottom: 24,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    primaryBtn: {
        backgroundColor: '#6366f1',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    resendBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
});
