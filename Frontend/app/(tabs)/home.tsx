import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="search-outline" size={22} color="#fff" />
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color="#fff"
            style={{ marginLeft: 16 }}
          />
        </View>
      </View>

      {/* Empty Chat Area */}
      <View style={styles.body}>
        <Text style={styles.emptyText}>
          No chats yet 👋{"\n"}Start a random chat now
        </Text>
      </View>

      {/* Start Chat Button */}
      <Link href="/chats" asChild>
        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#0f172a" />
          {/* <Text style={styles.chatBtnText}>New Random Chat</Text> */}
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  /* Header */
  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 6, // little center shift
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* Body */
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  /* Bottom Button */
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#46e573",
    margin: 16,
    width: 70,
    height: 60,
    position: "absolute",
    right: 0,
    bottom: 70,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },

  chatBtnText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
});
