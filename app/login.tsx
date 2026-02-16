import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API } from "../constants/config";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Redirect automatically if already logged in
  useEffect(() => {
    const checkLogin = async () => {
      const session = await AsyncStorage.getItem("session_id");
      if (session) {
        router.replace("/"); // go directly to home
      }
    };
    checkLogin();
  }, []);

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API.BASE_URL_AUTH}/web/session/authenticate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            params: {
              db: API.DB_NAME,
              login: email,
              password: password,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.result?.uid) {
        const uid = data.result.uid;

        // Save UID
        await AsyncStorage.setItem("uid", uid.toString());

        // Extract session cookie
        const cookies = response.headers.get("set-cookie");

        if (cookies) {
          const match = cookies.match(/session_id=([^;]+)/);
          const sessionId = match ? match[1] : null;

          if (sessionId) {
            await AsyncStorage.setItem("session_id", sessionId);
          }
        }

        // ✅ Go to home after login
        router.replace("/");
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate("register")}
      >
        <Text style={styles.buttonText}>Register New User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
