import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.screen}>
      <Text>Lymbr</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
});
