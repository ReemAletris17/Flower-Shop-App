import React, { Component } from 'react';
import { CameraView } from 'expo-camera'; 
import { Button, StyleSheet, Text, View } from 'react-native';

export default class App extends Component {
  state = {
    scanned: false,
  };

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  render() {
    return (
      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={StyleSheet.absoluteFillObject}
        />
        {this.state.scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', justifyContent: 'center' },
});
