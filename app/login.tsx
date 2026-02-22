import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { API } from "../constants/config";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      Alert.alert("Erreur", "Veuillez entrer votre email et mot de passe");
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
        Alert.alert("Échec de connexion", "Identifiants invalides");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        {/* Header with Icon */}
        <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../assets/images/logo.png")} // path to your logo
            style={styles.logo} // custom style for sizing
            resizeMode="contain"
          />
        </View>
          <Text style={styles.title}>Le transport unifié</Text>
          <Text style={styles.subtitle}>
            Veuillez remplir les informations{"\n"}suivantes afin de vous connecter
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email ..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={login}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Connecter</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Vous ne possédez pas de compte?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("register")}>
              <Text style={styles.registerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    color: "#000",
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#0A84FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4, // spacing to next line
  },
  registerLink: {
    fontSize: 14,
    color: "#0A84FF",
    fontWeight: "500",
  },
  logo: {
    width: 80, 
    height: 80,
  },
  
  
});