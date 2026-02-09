import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Picker } from "@react-native-picker/picker";

export default function Ticket() {
  const [transport, setTransport] = useState("Bus");
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);

  const generateTicket = async () => {
    try {
      setLoading(true);

      // 🔽 Replace with your real API
      const response = await fetch(
        `https://api.example.com/ticket?transport=${transport}`
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      // Convert JSON object to string for QR
      const qrData = JSON.stringify(data);

      setQrValue(qrData);
    } catch (error) {
      setQrValue("rafik"+transport);
      //console.error(error);
      //Alert.alert("Error", "Failed to generate ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>VENETARE TRANSPORT</Text>

      <View style={styles.ticketCard}>
        <Text style={styles.ticketTitle}>Digital Ticket</Text>
        <Text style={styles.subText}>
          Bus • Métro • Tramway • Train • Téléphérique
        </Text>

        {/* SELECT */}
        <View style={styles.selectBox}>
          <Picker
            selectedValue={transport}
            onValueChange={(value) => setTransport(value)}
          >
            <Picker.Item label="🚌 Bus" value="Bus" />
            <Picker.Item label="🚇 Métro" value="Métro" />
            <Picker.Item label="🚊 Tramway" value="Tramway" />
            <Picker.Item label="🚆 Train" value="Train" />
            <Picker.Item label="🚡 Téléphérique" value="Téléphérique" />
          </Picker>
        </View>

        {/* QR */}
        <View style={styles.qrBox}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : qrValue ? (
            <QRCode value={qrValue} size={200} />
          ) : (
            <Text style={styles.placeholder}>No ticket generated</Text>
          )}
        </View>

        <View style={styles.button}>
          <Button title="Generate Ticket" onPress={generateTicket} />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  selectBox: {
    width: "100%",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1e3a8a",
  },
  ticketCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#666",
    marginBottom: 20,
  },
  qrBox: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 16,
    marginVertical: 10,
  },
  placeholder: {
    color: "#999",
  },
  button: {
    marginTop: 15,
    width: "100%",
  },
});
