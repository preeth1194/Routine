import { Text, View } from 'react-native';

import { TabScreenContainer } from '@/components/TabScreenContainer';
import { getLabel } from '@/lib/labels';
import { tabScreenStyles as styles } from '@/styles/screens/tab-screen.styles';

export default function InsightsScreen() {
  return (
    <TabScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{getLabel('screens.insights')}</Text>
      </View>
    </TabScreenContainer>
  );
}
