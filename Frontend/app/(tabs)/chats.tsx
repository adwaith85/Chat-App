import {View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Link} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';

export default function HomeScreen() {
    return (    
    <SafeAreaView style={styles.container}>
      {/* App Name */}
      <Text style={styles.logo}>Talkies 💬</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
});