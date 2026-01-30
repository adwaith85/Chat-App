import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
    FadeInDown,
    FadeInRight,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    // Mock user data - in a real app, this would come from a global state or API
    const user = {
        name: 'Adwaith',
        email: 'adwaith@example.com',
        mobile: '+91 9876543210',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
        isOnline: true,
    };

    const menuItems = [
        {
            id: 'edit',
            title: 'Edit Profile',
            icon: 'person-outline',
            onPress: () => router.push('/profile-edit'),
            color: '#4F46E5',
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: 'settings-outline',
            onPress: () => { },
            color: '#6B7280',
        },
        {
            id: 'help',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            onPress: () => { },
            color: '#6B7280',
        },
        {
            id: 'logout',
            title: 'Logout',
            icon: 'log-out-outline',
            onPress: () => { },
            color: '#EF4444',
            isDestructive: true,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Background */}
                <View style={styles.headerBackground} />

                {/* Profile Info Section */}
                <View style={styles.profileSection}>
                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        style={styles.imageContainer}
                    >
                        <Image
                            source={{ uri: user.profileImage }}
                            style={styles.profileImage}
                            contentFit="cover"
                            transition={1000}
                        />
                        {user.isOnline && (
                            <View style={styles.onlineBadge}>
                                <View style={styles.onlineDot} />
                            </View>
                        )}
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(300).springify()}
                        style={styles.infoContainer}
                    >
                        <Text style={styles.name}>{user.name}</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: user.isOnline ? '#22C55E' : '#94A3B8' }]} />
                            <Text style={styles.statusText}>{user.isOnline ? 'Active Now' : 'Offline'}</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Details Card */}
                <Animated.View
                    entering={FadeInDown.delay(400).springify()}
                    style={styles.detailsCard}
                >
                    <View style={styles.detailItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="mail-outline" size={20} color="#6366F1" />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{user.email}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call-outline" size={20} color="#6366F1" />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Phone Number</Text>
                            <Text style={styles.detailValue}>{user.mobile}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInRight.delay(500 + index * 100).springify()}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.menuIconBox, { backgroundColor: item.isDestructive ? '#FEE2E2' : '#F3F4F6' }]}>
                                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                                </View>
                                <Text style={[styles.menuItemText, item.isDestructive && { color: '#EF4444' }]}>
                                    {item.title}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerBackground: {
        height: 180,
        backgroundColor: '#4F46E5',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    imageContainer: {
        position: 'relative',
        padding: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FFFFFF',
        padding: 3,
        borderRadius: 12,
    },
    onlineDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 30,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 15,
    },
    menuSection: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 15,
        marginLeft: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
});

export default ProfileScreen;
