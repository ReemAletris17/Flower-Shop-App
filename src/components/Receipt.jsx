import { useState } from 'react'
import { View, StyleSheet, Button, Platform, Text } from 'react-native'
import * as Print from 'expo-print'
import { shareAsync } from 'expo-sharing'
import useCartStore from '../Store/useCartStore'


export default function Receipt({ route }) {
      const [selectedPrinter, setSelectedPrinter] = useState()

      const { order } = route.params;
      const items = order.items;
      const getTotalPrice = () => order.total;

  const html = `
    <html>
      <body style="text-align: center;">
        <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
          Your Receipt
        </h1>

        ${items
          .map(
            (item) => `
              <p>
                ${item.name} x${item.quantity} — EGP ${Number(item.price).toFixed(2)}
              </p>
            `
          )
          .join('')}

        <h2>Total: EGP ${getTotalPrice().toFixed(2)}</h2>
      </body>
    </html>
  `

  const print = async () => {
    await Print.printAsync({
      html,
      printerUrl: selectedPrinter?.url,
    })
  }

  const printToFile = async () => {
    const { uri } = await Print.printToFileAsync({ html })
    console.log('File has been saved to:', uri)
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' })
  }

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync()
    setSelectedPrinter(printer)
  }

  return (
    <View style={styles.container}>
      <Button title="Print" onPress={print} />

      <View style={styles.spacer} />

      <Button title="Print to PDF file" onPress={printToFile} />

      {Platform.OS === 'ios' && (
        <>
          <View style={styles.spacer} />
          <Button title="Select printer" onPress={selectPrinter} />

          <View style={styles.spacer} />

          {selectedPrinter ? (
            <Text style={styles.printer}>
              Selected printer: {selectedPrinter.name}
            </Text>
          ) : null}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    flexDirection: 'column',
    padding: 8,
  },
  spacer: {
    height: 8,
  },
  printer: {
    textAlign: 'center',
  },
})