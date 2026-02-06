import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" 
      options={{
        title:"index",
        
      }}/>
      <Stack.Screen name="(tabs)" />
      {/* <Stack.Screen
        name="profileedit"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      /> */}
    </Stack>
  );
}
