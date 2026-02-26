import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from "react-native-qrcode-svg";


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: number;
  ticket_number: string;
  max_uses: number;
  product: string | false;
  customer: string | false;
  status: string;
  ticket_medium: string;
  remaining_uses: number;
  activated_at: string | null;
  expires_at: string | null;
  operators: string[];
  qr_code: string | false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function usesPercent(remaining: number, max: number): number {
  if (!max) return 0;
  return Math.max(0, Math.min(1, remaining / max));
}

function usesColor(remaining: number, max: number): string {
  const pct = usesPercent(remaining, max);
  if (pct > 0.5) return '#5ecb74';
  if (pct > 0.2) return '#f59e0b';
  return '#f87171';
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({
  ticket,
  visible,
  onClose,
}: {
  ticket: Ticket | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!ticket) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={modalStyles.sheet}>
          {/* Handle */}
          <View style={modalStyles.handle} />

          {/* Header */}
          <View style={modalStyles.modalHeader}>
            <View>
              <Text style={modalStyles.modalTitle}>{ticket.product || 'Ticket'}</Text>
              <Text style={modalStyles.modalSub}>#{ticket.ticket_number}</Text>
            </View>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={modalStyles.qrContainer}>
            {ticket.qr_code ? (
              <QRCode value={ticket.qr_code} size={220} />
            ) : (
              <View style={modalStyles.qrPlaceholder}>
                <Ionicons name="qr-code-outline" size={80} color="#c5d0e0" />
                <Text style={modalStyles.qrPlaceholderText}>QR Code non disponible</Text>
              </View>
            )}
          </View>
          {/* Info rows */}
          <View style={modalStyles.infoGrid}>
            <InfoRow icon="layers-outline" label="Trajets restants" value={`${ticket.remaining_uses} / ${ticket.max_uses}`} />
            <InfoRow icon="business-outline" label="Opérateurs" value={ticket.operators.join(', ') || '—'} />
          </View>

          {/* Uses bar */}
          <View style={modalStyles.barSection}>
            <Text style={modalStyles.barLabel}>Utilisation</Text>
            <View style={modalStyles.barTrack}>
              <View
                style={[
                  modalStyles.barFill,
                  {
                    width: `${usesPercent(ticket.remaining_uses, ticket.max_uses) * 100}%`,
                    backgroundColor: usesColor(ticket.remaining_uses, ticket.max_uses),
                  },
                ]}
              />
            </View>
            <Text style={modalStyles.barText}>
              {ticket.remaining_uses} trajet{ticket.remaining_uses !== 1 ? 's' : ''} restant{ticket.remaining_uses !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={modalStyles.infoRow}>
      <View style={modalStyles.infoIconBox}>
        <Ionicons name={icon} size={16} color="#2C5FA8" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={modalStyles.infoLabel}>{label}</Text>
        <Text style={modalStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ item, onPress }: { item: Ticket; onPress: (t: Ticket) => void }) {
  const pct = usesPercent(item.remaining_uses, item.max_uses);
  const barColor = usesColor(item.remaining_uses, item.max_uses);
  const isLow = pct <= 0.2;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.88}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: barColor }]} />

      <View style={styles.cardInner}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <View style={styles.ticketIconBox}>
              <Ionicons name="ticket-outline" size={22} color="#2C5FA8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.product || 'Ticket'}
              </Text>
              <Text style={styles.ticketNumber}>#{item.ticket_number}</Text>
            </View>
          </View>

          {/* QR button */}
          <TouchableOpacity style={styles.qrBtn} onPress={() => onPress(item)}>
            <Ionicons name="qr-code-outline" size={20} color="#2C5FA8" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Uses progress */}
        <View style={styles.usesRow}>
          <Text style={styles.usesLabel}>Trajets restants</Text>
          <Text style={[styles.usesCount, { color: barColor }]}>
            {item.remaining_uses}
            <Text style={styles.usesMax}> / {item.max_uses}</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
        </View>

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          {/* Operators */}
          <View style={styles.tagsRow}>
            {item.operators.slice(0, 2).map((op) => (
              <View key={op} style={styles.opTag}>
                <Text style={styles.opTagText}>{op}</Text>
              </View>
            ))}
            {item.operators.length > 2 && (
              <View style={styles.opTag}>
                <Text style={styles.opTagText}>+{item.operators.length - 2}</Text>
              </View>
            )}
          </View>

          {/* Expire */}
          <View style={styles.expireRow}>
            <Ionicons name="time-outline" size={12} color={isLow ? '#f87171' : '#8899bb'} />
            <Text style={[styles.expireText, isLow && { color: '#f87171' }]}>
              {formatDate(item.expires_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="ticket-outline" size={52} color="#c5d0e0" />
      </View>
      <Text style={styles.emptyTitle}>Aucun ticket actif</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez pas de tickets actifs pour le moment.
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
  customerId: number;
}

export default function MyTicketsScreen({ customerId }: Props) {
  const navigation = useNavigation<any>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [offline, setOffline] = useState(false);

  const fetchTickets = async () => {
    const uid = await AsyncStorage.getItem('uid');

    setLoading(true);
    setError(false);
    setOffline(false);

    try {
      const res = await fetch(`${API.BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: Number(uid), mode: "T" }),
      });

      if (!res.ok) throw new Error('Network error');

      const text = await res.text();
      const ticketsData: Ticket[] = JSON.parse(text);

      setTickets(ticketsData);
      await AsyncStorage.setItem(`tickets_${uid}`, JSON.stringify(ticketsData));
    } catch (err) {
      setOffline(true);
      const cached = await AsyncStorage.getItem(`tickets_${uid}`);
      if (cached) {
        setTickets(JSON.parse(cached));
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [customerId]);

  // ── Loading ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2C5FA8" />
          <Text style={styles.loadingText}>Chargement de vos tickets…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />
        <View style={styles.centered}>
          <View style={styles.errorIconBox}>
            <Ionicons name="cloud-offline-outline" size={40} color="#f87171" />
          </View>
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorSub}>Impossible de charger vos tickets.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTickets}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main UI ──
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mes Tickets</Text>
          <Text style={styles.headerSub}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} actif{tickets.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTickets}>
          <Ionicons name="refresh-outline" size={18} color="#2C5FA8" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TicketCard item={item} onPress={setSelectedTicket} />
        )}
        contentContainerStyle={[
          styles.listContent,
          tickets.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
      />

      {/* QR Modal */}
      <QRModal
        ticket={selectedTicket}
        visible={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
      {offline && (
  <Text style={{ textAlign: 'center', color: '#f87171', marginBottom: 8 }}>
Vérifiez votre connexion internet  </Text>
)}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2f8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#2C5FA8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', letterSpacing: 0.2 },
  headerSub: { fontSize: 12, color: '#8899bb', marginTop: 1, fontWeight: '500' },
  refreshBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#2C5FA8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  listContentEmpty: { flexGrow: 1 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 14, flexDirection: 'row', overflow: 'hidden', shadowColor: '#2C5FA8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 10, elevation: 4 },
  accentBar: { width: 5, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  cardInner: { flex: 1, padding: 16, gap: 10 },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  ticketIconBox: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#eef2f8', justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  ticketNumber: { fontSize: 11, color: '#8899bb', marginTop: 1, fontWeight: '500' },
  qrBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#eef2f8', justifyContent: 'center', alignItems: 'center' },

  divider: { height: 1, backgroundColor: '#f0f4fa' },

  usesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  usesLabel: { fontSize: 12, color: '#8899bb', fontWeight: '500' },
  usesCount: { fontSize: 16, fontWeight: '800' },
  usesMax: { fontSize: 12, color: '#8899bb', fontWeight: '500' },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#eef2f8', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  opTag: { backgroundColor: '#eef2f8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  opTagText: { fontSize: 11, color: '#2C5FA8', fontWeight: '600' },
  expireRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  expireText: { fontSize: 11, color: '#8899bb', fontWeight: '500' },

  // States
  loadingText: { fontSize: 14, color: '#8899bb', fontWeight: '500' },
  errorIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#fff1f1', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  errorSub: { fontSize: 13, color: '#8899bb', textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2C5FA8', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, marginTop: 4, shadowColor: '#2C5FA8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 60, paddingHorizontal: 40 },
  emptyIconBox: { width: 96, height: 96, borderRadius: 28, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#2C5FA8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  emptySubtitle: { fontSize: 13, color: '#8899bb', textAlign: 'center', lineHeight: 20 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#e0e7ef', alignSelf: 'center', marginBottom: 8 },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e' },
  modalSub: { fontSize: 12, color: '#8899bb', marginTop: 2, fontWeight: '500' },
  closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#eef2f8', justifyContent: 'center', alignItems: 'center' },

  qrContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff', borderRadius: 20, padding: 20, minHeight: 200 },
  qrImage: { width: SCREEN_WIDTH - 120, height: SCREEN_WIDTH - 120 },
  qrPlaceholder: { alignItems: 'center', gap: 10 },
  qrPlaceholderText: { fontSize: 13, color: '#8899bb' },

  infoGrid: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2f8', justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#8899bb', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1a1a2e', fontWeight: '600', marginTop: 1 },

  barSection: { gap: 6 },
  barLabel: { fontSize: 12, color: '#8899bb', fontWeight: '500' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#eef2f8', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barText: { fontSize: 12, color: '#1a1a2e', fontWeight: '600', textAlign: 'right' },
});