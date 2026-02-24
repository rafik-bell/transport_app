import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { API } from '../constants/config';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const PaymentScreen = () => {
  const route = useRoute();
  const { product, category, selected } = route.params as any;
  
  const parsedProduct = product ? JSON.parse(product) : null;
  const parsedCategory = category ? JSON.parse(category) : null;
  const parsedSelected = selected ? JSON.parse(selected) : [];
  
  console.log("Product ID:",parsedSelected);

  const createTicket = async () => {
    try {
      const uid = await AsyncStorage.getItem('uid')
      const response = await fetch(`${API.BASE_URL}/create_app_ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0,19).replace('T',' '),
          certif_id: 1,
          product_id: parsedProduct.id,
          price_paid: parsedProduct.price,
          currency_id: 1,
          category_id: parsedCategory.id,
          customer_id: uid,
          operator_ids: parsedSelected.map(op => op.id),
          sale_channel : "mobile"
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Ticket Created", `Number: ${data.ticket_number}`);
      } else {
        Alert.alert("Error", data.error || "Ticket failed");
      }

    } catch (error) {
      Alert.alert("Error", "Server unreachable");
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `${API.BASE_URL_PAY}?price=${parsedProduct?.price}` }}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes("status=success")) {
            console.log("Payment successful!");
            createTicket(); 
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default PaymentScreen;