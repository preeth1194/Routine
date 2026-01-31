import { Link, Stack } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { getLabels } from '@/lib/labels';
import { notFoundStyles as styles } from '@/styles/screens/not-found.styles';

const notFoundLabels = getLabels<{ title: string; message: string; goHome: string }>('screens.notFound');

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: notFoundLabels.title }} />
      <View style={styles.container}>
        <Text style={styles.title}>{notFoundLabels.message}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{notFoundLabels.goHome}</Text>
        </Link>
      </View>
    </>
  );
}
