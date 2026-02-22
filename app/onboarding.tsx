import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    {
      text: "Tous vos transports en commun unifiés !",
      colors: ["#00c6ff", "#0072ff"],
      image: "https://media.istockphoto.com/id/2054348784/fr/vectoriel/personnes-dans-les-transports-en-commun.jpg?s=612x612&w=0&k=20&c=X2jJungFCfP_85541OwcPxLAB0NWTmsO7UdtshiSxdY=", // local image
    },
    {
      text: "Avec des nouvelles fonctionnalités plus innovantes et plus pratiques !",
      colors: ["#8e2de2", "#4a00e0"],
      image: "https://media.istockphoto.com/id/2054348784/fr/vectoriel/personnes-dans-les-transports-en-commun.jpg?s=612x612&w=0&k=20&c=X2jJungFCfP_85541OwcPxLAB0NWTmsO7UdtshiSxdY=",
    },
    {
      text: "Simplifiez votre quotidien. Avec des déplacements faciles !",
      colors: ["#ff4b7d", "#2b4eff"],
      image: "https://media.istockphoto.com/id/2054348784/fr/vectoriel/personnes-dans-les-transports-en-commun.jpg?s=612x612&w=0&k=20&c=X2jJungFCfP_85541OwcPxLAB0NWTmsO7UdtshiSxdY=",
    },
    {
      text: "L’application qui révolutionnera le transport en Algérie !",
      colors: ["#4facfe", "#00f2fe"],
      image: require("../assets/images/logo.png")
    },
  ];

  const finish = async () => {
    await AsyncStorage.setItem("alreadyLaunched", "true");
    router.replace("/login");
  };

  const next = () => {
    if (page === slides.length - 1) finish();
    else pagerRef.current?.setPage(page + 1);
  };

  return (
    <LinearGradient colors={slides[page].colors} style={{ flex: 1 }}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={{ color: "white" }}>Passer</Text>
      </TouchableOpacity>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {slides.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        ))}
      </PagerView>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, page === i && styles.activeDot]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={next}>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {page === slides.length - 1 ? "Créer un compte" : "Suivant"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, justifyContent: "flex-end", padding: 30, alignItems: "center" },
  image: { width: width * 0.7, height: width * 0.7, marginBottom: 20 },
  text: { color: "white", fontSize: 22, marginBottom: 40, fontWeight: "600", textAlign: "center" },
  button: {
    backgroundColor: "#2bb3ff",
    marginBottom: 60,
    marginTop: 30,
    marginRight: 60,
    marginLeft: 60,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  dots: { flexDirection: "row", justifyContent: "center" },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 4,
    margin: 4,
  },
  activeDot: { backgroundColor: "white", width: 16 },
  skip: { position: "absolute", right: 20, top: 60, zIndex: 10 },
});
