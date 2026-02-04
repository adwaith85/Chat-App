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
    const [number, setNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Number, 2: OTP
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async () => {
        if (!number) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }

        setLoading(true);
        try {
            console.log('Sending OTP request to:', number);
            const response = await authApi.requestOTP(number);
            Alert.alert('OTP Sent', `For testing purposes, your OTP is: ${response.data.otp}`);
            setStep(2);
        } catch (error: any) {
            console.error('Login Error:', error);
            
            Alert.alert('Error', error.response?.data?.message || 'Could not connect to the server.');
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
            const response = await authApi.verifyOTP(number, otp);
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
                        <Text style={styles.title}>{step === 1 ? 'Welcome to Talkies' : 'Verify OTP'}</Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? 'Join thousands of people chatting around the world.'
                                : `Enter the 6-digit code sent to ${number}.`}
                        </Text>
                    </Animated.View>

                    {step === 1 && (
                        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.inputSection}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#64748b" />
                                <TextInput
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="#94a3b8"
                                    style={styles.input}
                                    value={number}
                                    onChangeText={setNumber}
                                    keyboardType="phone-pad"
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
                                        <Text style={styles.primaryBtnText}>Get OTP</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.infoText}>We'll send you a 6-digit verification code.</Text>
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
                                        <Text style={styles.primaryBtnText}>Verify & Continue</Text>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 64,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 18,
        color: '#1e293b',
        fontWeight: '500',
    },
    primaryBtn: {
        backgroundColor: '#6366f1',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 6,
        marginTop: 10,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    infoText: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 20,
    },
    resendBtn: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: '#6366f1',
        fontSize: 15,
        fontWeight: '700',
    },
});
