import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';


export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          {/* <Text style={styles.greetingText}>Hello,</Text> */}
          <Text style={styles.userNameText}>Talkies</Text>
        </View>
        <Ionicons name="search-outline" size={26} color="#000000ff" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <View style={styles.illustrationWrap}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <Ionicons name="chatbubbles-outline" size={80} color="#e2e8f0" />
          </View>
          <Text style={styles.emptyTitle}>Your inbox is empty</Text>
          <Text style={styles.emptySubtitle}>
            Connect with someone new and start a conversation.
          </Text>

          <Link href="/chats" asChild>
            <TouchableOpacity style={styles.inlineActionBtn}>
              <Text style={styles.inlineActionText}>Find Match</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Link href="/chats" asChild>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  greetingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  profileIcon: {
    padding: 2,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  storiesContainer: {
    paddingVertical: 12,
  },
  storiesScroll: {
    paddingHorizontal: 24,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  storyImageBorder: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#6366f1',
    marginBottom: 8,
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  addStoryBtn: {
    alignItems: 'center',
    marginRight: 20,
  },
  addStoryOutline: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addStoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  illustrationWrap: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EEF2FF",
    opacity: 0.6,
  },
  circle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E0E7FF",
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  inlineActionBtn: {
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  inlineActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
