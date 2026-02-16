import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://moncompte.djezzy.dz/fr/guest/recharge' }} // Replace with your payment URL
        style={{ flex: 1 }}
        startInLoadingState={true} // Show loader while loading
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PaymentScreen;
