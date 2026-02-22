import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import Svg, { Rect, Circle, Line, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

/* ---------------- ICONS ---------------- */

const BusIcon = () => (
  <Svg width={46} height={32}>
    <Rect x={2} y={4} width={38} height={20} rx={4} fill="#1565C0" />
    <Circle cx={12} cy={28} r={3} fill="#0D47A1" />
    <Circle cx={30} cy={28} r={3} fill="#0D47A1" />
  </Svg>
);

const TrainIcon = () => (
  <Svg width={46} height={32}>
    <Rect x={4} y={2} width={34} height={22} rx={5} fill="#1565C0" />
    <Circle cx={12} cy={28} r={3} fill="#0D47A1" />
    <Circle cx={28} cy={28} r={3} fill="#0D47A1" />
  </Svg>
);

const TramIcon = () => (
  <Svg width={46} height={32}>
    <Rect x={4} y={6} width={34} height={18} rx={4} fill="#1976D2" />
  </Svg>
);

const MetroIcon = () => (
  <Svg width={46} height={32}>
    <Rect x={4} y={4} width={36} height={20} rx={6} fill="#0D47A1" />
  </Svg>
);

const CableCarIcon = () => (
  <Svg width={46} height={40}>
    <Line x1="0" y1="6" x2="46" y2="6" stroke="#1E88E5" strokeWidth="2"/>
    <Rect x={10} y={12} width={26} height={18} rx={4} fill="#1565C0"/>
  </Svg>
);

const iconMap: any = {
  bus: BusIcon,
  train: TrainIcon,
  tram: TramIcon,
  metro: MetroIcon,
  cablecar: CableCarIcon,
};

/* --------------- DATA --------------- */

const trips = [
  { id: 1, name: "Khelifa boukhalfa", date: "08/02/2026", time: "19:23", icon: "train" },
  { id: 2, name: "Alger centre", date: "08/02/2026", time: "10:25", icon: "bus" },
  { id: 3, name: "Bab el oued", date: "08/02/2026", time: "18:20", icon: "tram", active: true },
  { id: 4, name: "Bab ezzouar", date: "08/02/2026", time: "08:20", icon: "metro" },
  { id: 5, name: "Agha", date: "08/02/2026", time: "18:58", icon: "metro" },
];

/* --------------- SCREEN --------------- */

export default function TransportApp() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <LinearGradient
        colors={["#1565C0", "#1976D2", "#1E88E5"]}
        style={styles.header}
      >
        <Text style={styles.hello}>Bonjour,{"\n"}Mohamed Lyes</Text>

        {/* SUBSCRIPTION CARD */}
        <View style={styles.subCard}>
          <View>
            <Text style={styles.subSmall}>Abonnement actuel :</Text>
            <Text style={styles.subMain}>Bus, Téléphérique, Train</Text>

            <Text style={styles.subSmall}>
              Formule : <Text style={{ color: "#69F0AE", fontWeight: "700" }}>Actif</Text>
            </Text>

            <Text style={styles.subMain}>26 jours restant</Text>

            <Text style={styles.subSmall}>Totale courses :</Text>
            <Text style={styles.subCount}>12</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <TrainIcon />
            <CableCarIcon />
            <BusIcon />
          </View>
        </View>
      </LinearGradient>

      {/* TRIPS */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.section}>Dernières courses :</Text>

        {trips.map((trip) => {
          const Icon = iconMap[trip.icon];
          return (
            <View
              key={trip.id}
              style={[
                styles.tripCard,
                trip.active && styles.tripActive,
              ]}
            >
              <View>
                <Text style={styles.tripTitle}>{trip.name}</Text>
                <Text style={styles.tripTime}>
                  {trip.date}   {trip.time}
                </Text>
              </View>
              <Icon />
            </View>
          );
        })}
      </ScrollView>

      

    </View>
  );
}

/* --------------- STYLES --------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  hello: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  subCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  subSmall: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },

  subMain: {
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
  },

  subCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    fontWeight: "700",
    color: "#1565C0",
    marginBottom: 10,
  },

  tripCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tripActive: {
    borderWidth: 2,
    borderColor: "#7986CB",
  },

  tripTitle: {
    fontWeight: "600",
  },

  tripTime: {
    fontSize: 11,
    color: "#90a4ae",
  },

  nav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e3f2fd",
    paddingVertical: 10,
  },

  navBtn: {
    flex: 1,
    alignItems: "center",
  },

  navText: {
    color: "#90a4ae",
    fontWeight: "500",
  },

  navActive: {
    color: "#1565C0",
    fontWeight: "700",
  },
});
