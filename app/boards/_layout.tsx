import { Stack } from 'expo-router';

export default function BoardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wizard" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="grid-editor" />
      <Stack.Screen name="freeform-editor" />
      <Stack.Screen name="goal-viewer" />
    </Stack>
  );
}
