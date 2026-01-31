import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { getLabel } from '@/lib/labels';
import { modalStyles as styles } from '@/styles/screens/modal.styles';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getLabel('screens.modal')}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
