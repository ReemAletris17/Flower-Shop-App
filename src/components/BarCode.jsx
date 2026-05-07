import React, { Component } from 'react';
import { CameraView } from 'expo-camera';
import { StyleSheet, View, Alert } from 'react-native';

export default class App extends Component {
  state = { scanned: false };
  isHandling = false;

  handleBarCodeScanned = ({ type, data }) => {
    if (this.isHandling) return;
    this.isHandling = true;
    this.setState({ scanned: true });
    Alert.alert('Scanned', `Type: ${type}\nData: ${data}`, [
      { text: 'OK', onPress: () => {
        this.isHandling = false;
        this.setState({ scanned: false });
      }}
    ]);
  };

  render() {
    return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={this.handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'pdf417'] }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', justifyContent: 'center' },
});