import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function Receipt({ route }) {
  const { order } = route.params;

  const html = `
    <html>
      <body style="text-align: center;">
        <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">Your Receipt</h1>
        ${order.items.map((item) => `<p>${item.name} x${item.quantity} — EGP ${Number(item.price).toFixed(2)}</p>`).join('')}
        <h2>Total: EGP ${Number(order.total).toFixed(2)}</h2>
      </body>
    </html>
  `;

  async function savePDF() {
    const { uri } = await Print.printToFileAsync({ html });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={savePDF}>
        <Text style={styles.btnText}>Save as PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  btn: { backgroundColor: '#111', padding: 14, borderRadius: 10, alignItems: 'center', width: '60%' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});