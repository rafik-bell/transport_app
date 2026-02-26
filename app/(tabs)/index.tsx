import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Alert

} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { API } from '../../constants/config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 48;
const CARD_GAP = 16;

/* ---------------- DATA ---------------- */
const trips = [
  { id: 1, name: "Khelifa Boukhalfa", date: "08/02/2026", time: "19:23", icon: "train" },
  { id: 2, name: "Bab El Oued", date: "08/02/2026", time: "18:20", icon: "tram", active: true },
  { id: 3, name: "Bab El Oued", date: "08/02/2026", time: "18:20", icon: "tram", active: true },
];

/* ---------------- STATUS CONFIG ---------------- */
const statusConfig = {
  Actif: {
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
    color: "#4ade80",
    showPulse: true,
  },
  Expiré: {
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
    color: "#f87171",
    showPulse: false,
  },
};

/* ---------------- COMPONENTS ---------------- */
const PulseDot = ({ color = "#4ade80" }) => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.pulseDot, { opacity: anim, backgroundColor: color }]}
    />
  );
};

/* ---------------- DATA FETCH ---------------- */
const getactivetikitData = async () => {
  try {
    const uid = await AsyncStorage.getItem("uid");
    const name = await AsyncStorage.getItem('name');
    if (!uid) return null;

    const response = await fetch(`${API.BASE_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customer: Number(uid) , mode :"A" }),
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      console.log("data", data);
      return { data, name };
    } catch (e) {
      console.log("Server returned HTML or error:", text);
      return null;
    }
  } catch (error) {Alert.alert(
      "Pas de connexion",
      "Vérifiez votre connexion internet puis réessayez."
    );
       
    
  }
};

/* ---------------- MAIN SCREEN ---------------- */
export default function TransportApp() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [name, setName] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;

  const loadTickets = async () => {
    try {
      const res = await getactivetikitData();
  
      // ✅ If API works → use server data + cache it
      if (res && res.data) {
        const { data, name } = res;
        setName(name || "");
        await AsyncStorage.setItem("offline_name", name || "");
  
        const formatted = data.map((ticket: any) => {
          const activatedAt = new Date(ticket.activated_at);
          const expiresAt = ticket.expires_at ? new Date(ticket.expires_at) : null;
  
          const allday = expiresAt
            ? Math.ceil((expiresAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
  
          const daysLeft = expiresAt
            ? Math.max(0, Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : 0;
  
          return {
            id: ticket.id,
            type: "Mensuel",
            name: ticket.product,
            modes: ticket.operators?.map((op: any) => op.toLowerCase()) || ["bus", "tram", "metro"],
            status: ticket.status === "active" ? "Actif" : "Expiré",
            allday,
            daysLeft,
            trips: ticket.remaining_uses || 0,
            maxtrips: ticket.max_uses || 0,
            accent: ticket.status === "active" ? "#60a5fa" : "#c084fc",
            ticketNumber: ticket.ticket_number,
            qr_code: ticket.qr_code,
          };
        });
  
        setSubscriptions(formatted);
  
        // ✅ SAVE OFFLINE COPY
        await AsyncStorage.setItem("offline_tickets", JSON.stringify(formatted));
        return;
      }
  
      // ❌ API failed → load offline copy
      const offline = await AsyncStorage.getItem("offline_tickets");
      if (offline) {
        setSubscriptions(JSON.parse(offline));
      }
  
    } catch (err) {
      console.log("Offline mode activated");
  
      const offline = await AsyncStorage.getItem("offline_tickets");
      const offlineName = await AsyncStorage.getItem("offline_name");
      if (offline) {
        setSubscriptions(JSON.parse(offline));
      }
      if (offlineName) {
        setName(offlineName);
      }
    }
  };

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadTickets();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const onScroll = (e :any ) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIdx(Math.round(x / (CARD_W + CARD_GAP)));
  };

  return (
    <ScrollView
      scrollEnabled={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ flexGrow: 1 }}
    >
    <View style={styles.container}>
      <LinearGradient colors={["#0D47A1", "#1565C0", "#42A5F5"]} style={styles.header}>
        <Text style={styles.hello}>
          Bonjour{"\n"}
          <Text style={styles.username}>{name ? name : "Chargement..."}</Text>
        </Text>

        {/* dots */}
        <View style={styles.dotRow}>
          {subscriptions.map((sub, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIdx
                  ? [styles.dotActive, { backgroundColor: sub.accent }]
                  : null,
              ]}
            />
          ))}
        </View>

        {/* carousel */}
        <ScrollView
          horizontal
          snapToInterval={CARD_W + CARD_GAP}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carouselContent}
        >
          {subscriptions.map((sub :any) => {
            const sc = statusConfig[sub.status] ?? statusConfig["Actif"];
            return (
              <Animated.View
                key={sub.id}
                style={{
                  width: CARD_W,
                  marginRight: CARD_GAP,
                  opacity: cardAnim,
                  transform: [
                    {
                      translateX: cardAnim.interpolate({
                        inputRange: [-1, 0],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    if (sub.qr_code) {
                      setSelectedQR(sub.qr_code);
                      setQrVisible(true);
                    }
                  }}
                >
                <View style={styles.subCard}>
                  <View style={styles.subCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subLabel}>{sub.type.toUpperCase()}</Text>
                      <Text style={styles.subTitle}>{sub.name}</Text>
                      <Text style={styles.subModes}>{sub.modes.join(" · ")}</Text>
                    </View>

                    <View
                      style={[
                        styles.activeBadge,
                        { backgroundColor: sc.bg, borderColor: sc.border },
                      ]}
                    >
                      {sc.showPulse && <PulseDot color={sc.color} />}
                      <Text style={[styles.activeBadgeText, { color: sc.color }]}>
                        {sub.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text
                        style={[
                          styles.statValue,
                          { color: sub.daysLeft <= 2 ? "red" : sub.accent }
                        ]}
                      >
                        {sub.daysLeft}/{sub.allday}
                      </Text>
                      <Text style={styles.statLabel}>JOURS RESTANTS</Text>
                    </View>

                    <View style={styles.statSep} />

                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{sub.trips}/{sub.maxtrips}</Text>
                      <Text style={styles.statLabel}>COURSES</Text>
                    </View>
                  </View>
                </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* trips */}
      <ScrollView
        contentContainerStyle={{ padding: 18 }}
      >
        <Text style={styles.section}>Dernières courses</Text>

        {trips.map((t) => (
          <View key={t.id} style={[styles.tripCard, t.active && styles.tripActive]}>
            <View>
              <Text style={styles.tripTitle}>{t.name}</Text>
              <Text style={styles.tripTime}>
                {t.date} • {t.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
    <Modal
  visible={qrVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setQrVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>QR Ticket</Text>

      {selectedQR && (
        <QRCode value={selectedQR} size={240} />
      )}

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setQrVisible(false)}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF3F9" },

  header: {
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  hello: { color: "white", fontSize: 20, marginBottom: 18 },
  username: { fontSize: 26, fontWeight: "700" },

  dotRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 22,
    marginBottom: 14,
    alignSelf: "flex-end",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 18, height: 6, borderRadius: 3 },

  carouselContent: {
    paddingLeft: 22,
    paddingRight: 6,
    paddingBottom: 6,
  },

  subCard: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(92,165,255,0.15)",
    padding: 24,
  },

  subCardTop: { flexDirection: "row", marginBottom: 20 },
  subLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    color: "#93c5fd",
    marginBottom: 4,
  },
  subTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  subModes: { fontSize: 12, fontWeight: "500", color: "#64748b" },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  activeBadgeText: { fontSize: 11, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.07)", marginBottom: 16 },

  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: "#94a3b8",
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 14,
  },

  section: { fontWeight: "700", fontSize: 16, color: "#0D47A1", marginBottom: 14 },

  tripCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#0D47A1",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  tripActive: { borderColor: "#42A5F5" },
  tripTitle: { fontWeight: "700", fontSize: 15, marginBottom: 3, color: "#0f172a" },
  tripTime: { fontSize: 12, color: "#78909C" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalBox: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    width: "80%",
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
    color: "#0D47A1",
  },
  
  closeBtn: {
    marginTop: 24,
    backgroundColor: "#0D47A1",
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 30,
  },
});