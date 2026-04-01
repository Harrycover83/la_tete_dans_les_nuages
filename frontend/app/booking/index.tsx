import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  EVENT_TYPES,
  FORMULAS,
  CAKES,
  TIME_SLOTS,
  BOOKING_STEPS,
  BookingStep,
  EventType,
  Formula,
  Cake,
} from '../../constants/booking';
import { venueService, sessionBookingService } from '../../services';
import { StarBackground } from '../../components/StarBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Venue {
  id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
}

interface BookingState {
  venue: Venue | null;
  eventType: EventType | null;
  participants: number;
  selectedDate: Date | null;
  timeSlot: string | null;
  formula: Formula | null;
  cake: Cake | null;
  cakeTermsAccepted: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function computeTotal(formula: Formula | null, participants: number): number {
  if (!formula) return 0;
  return Math.round(formula.pricePerPerson * participants * 100) / 100;
}

// ─── Sidebar recap ────────────────────────────────────────────────────────────

function SidebarRecap({ state }: { state: BookingState }) {
  const total = computeTotal(state.formula, state.participants);
  const rows: { label: string; value: string }[] = [
    ...(state.eventType ? [{ label: 'Votre réservation', value: state.eventType.label + (state.eventType.id === 'birthday_kids' ? ', de 3 à 15 ans' : '') }] : []),
    ...(state.participants ? [{ label: 'Nombre de participants', value: String(state.participants) }] : []),
    ...(state.selectedDate && state.timeSlot ? [{ label: 'Date et heure', value: `Le ${formatDateShort(state.selectedDate)} à ${state.timeSlot}` }] : []),
    ...(state.formula ? [{ label: 'Formule', value: state.formula.name + (state.formula.bonusUnits ? ` - ${state.formula.bonusUnits} unités` : '') }] : []),
    ...(state.cake ? [{ label: 'Gâteau', value: state.cake.name }] : [{ label: 'Gâteau', value: '' }]),
    { label: 'Options', value: 'Aucune option' },
  ];

  return (
    <View style={{ gap: 0 }}>
      {state.venue && (
        <View style={{
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}>
          <LinearGradient colors={['#1A2A4A', '#0B1A35']} style={{ padding: 14 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginBottom: 2 }}>
              La Tête dans les Nuages
            </Text>
            <Text style={{ color: '#00D3FF', fontSize: 12, fontWeight: '700' }}>
              {state.venue.name}
            </Text>
            {state.venue.address && (
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, lineHeight: 16 }}>
                {state.venue.address}
              </Text>
            )}
            {state.venue.phone && (
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
                {state.venue.phone}
              </Text>
            )}
          </LinearGradient>
        </View>
      )}
      {rows.map((row) => (
        <View key={row.label} style={{
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.05)',
          gap: 2,
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' }}>
            {row.label}
          </Text>
          {row.value ? (
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>{row.value}</Text>
          ) : null}
        </View>
      ))}
      {total > 0 && (
        <View style={{
          paddingTop: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' }}>Total à régler</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>{total.toFixed(2)} €</Text>
        </View>
      )}
    </View>
  );
}

// ─── Valider button ───────────────────────────────────────────────────────────

function ValidateButton({ onPress, label = 'Valider', disabled = false, loading = false }: {
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <LinearGradient
        colors={disabled ? ['#333', '#222'] : ['#E040A0', '#6822D0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 16,
          paddingHorizontal: 28,
          borderRadius: 50,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>{label}</Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' }} />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <View style={{
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      padding: 16,
      flex: 1,
    }}>
      {/* Nav mois */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TouchableOpacity onPress={prevMonth} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
          {MONTHS_FR[viewMonth]}  {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={{ padding: 6 }}>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Header jours */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {DAYS_FR.map(d => (
          <Text key={d} style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600' }}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grille */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isSelected = selectedDate
            ? date.toDateString() === selectedDate.toDateString()
            : false;
          const isToday = date.toDateString() === today.toDateString();

          return (
            <TouchableOpacity
              key={day}
              onPress={() => !isPast && onSelect(date)}
              disabled={isPast}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? '#FFFFFF' : isToday ? 'rgba(254,83,187,0.3)' : 'transparent',
                borderWidth: isToday && !isSelected ? 1.5 : 0,
                borderColor: '#FE53BB',
              }}>
                <Text style={{
                  color: isPast ? 'rgba(255,255,255,0.15)' : isSelected ? '#040D21' : '#FFFFFF',
                  fontSize: 13,
                  fontWeight: isSelected || isToday ? '700' : '400',
                }}>
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingScreen() {
  const [step, setStep] = useState<BookingStep>(BOOKING_STEPS.VENUE);
  const [state, setState] = useState<BookingState>({
    venue: null,
    eventType: null,
    participants: 1,
    selectedDate: null,
    timeSlot: null,
    formula: null,
    cake: null,
    cakeTermsAccepted: false,
  });
  const [showRecapSidebar, setShowRecapSidebar] = useState(false);

  const { data: venues = [], isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: () => venueService.getVenues(),
  });

  const bookMutation = useMutation({
    mutationFn: () => sessionBookingService.create({
      venueId: state.venue!.id,
      eventTypeId: state.eventType!.id,
      participants: state.participants,
      bookingDate: state.selectedDate!.toISOString(),
      timeSlot: state.timeSlot!,
      formulaId: state.formula?.id,
      cakeId: state.cake?.id,
      totalPrice: computeTotal(state.formula, state.participants),
    }),
    onSuccess: () => {
      Alert.alert(
        '🎉 Réservation confirmée !',
        `Votre réservation chez ${state.venue?.name} le ${formatDateShort(state.selectedDate!)} à ${state.timeSlot} est confirmée.`,
        [{ text: 'Super !', onPress: () => router.replace('/(tabs)/home') }],
      );
    },
    onError: () => {
      Alert.alert('Erreur', 'Impossible de finaliser la réservation. Réessayez.');
    },
  });

  const update = useCallback((patch: Partial<BookingState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  function goBack() {
    const order: BookingStep[] = [
      BOOKING_STEPS.VENUE,
      BOOKING_STEPS.EVENT_TYPE,
      BOOKING_STEPS.PARTICIPANTS_DATE,
      BOOKING_STEPS.TIME_SLOT,
      BOOKING_STEPS.FORMULA,
      BOOKING_STEPS.CAKE,
      BOOKING_STEPS.RECAP,
    ];
    const idx = order.indexOf(step);
    if (idx <= 0) router.back();
    else setStep(order[idx - 1]);
  }

  function getStepTitle(): string {
    switch (step) {
      case BOOKING_STEPS.VENUE: return 'Choisir une salle';
      case BOOKING_STEPS.EVENT_TYPE: return 'Type de réservation';
      case BOOKING_STEPS.PARTICIPANTS_DATE: return 'Choisir le nombre de participants et la date';
      case BOOKING_STEPS.TIME_SLOT: return 'Choisir le créneau horaire';
      case BOOKING_STEPS.FORMULA: return 'Sélectionner une formule';
      case BOOKING_STEPS.CAKE: return 'Choisir un gâteau';
      case BOOKING_STEPS.RECAP: return 'Récapitulatif';
    }
  }

  const total = computeTotal(state.formula, state.participants);

  // ── Step: VENUE ──────────────────────────────────────────────────────────────
  function renderVenueStep() {
    if (venuesLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#00D3FF" />
        </View>
      );
    }
    return (
      <View style={{ gap: 12 }}>
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            onPress={() => { update({ venue }); setStep(BOOKING_STEPS.EVENT_TYPE); }}
            style={{
              borderRadius: 16,
              borderWidth: 2,
              borderColor: state.venue?.id === venue.id ? '#00D3FF' : 'rgba(255,255,255,0.08)',
              backgroundColor: state.venue?.id === venue.id ? 'rgba(0,211,255,0.08)' : '#071333',
              padding: 18,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{venue.name}</Text>
                {venue.city && (
                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{venue.city}</Text>
                )}
                {venue.address && (
                  <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 2, lineHeight: 17 }}>
                    {venue.address}
                  </Text>
                )}
              </View>
              {state.venue?.id === venue.id && (
                <Ionicons name="checkmark-circle" size={22} color="#00D3FF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ── Step: EVENT_TYPE ─────────────────────────────────────────────────────────
  function renderEventTypeStep() {
    return (
      <View style={{ gap: 12 }}>
        {EVENT_TYPES.map((et) => (
          <TouchableOpacity
            key={et.id}
            onPress={() => { update({ eventType: et, formula: null, cake: null }); setStep(BOOKING_STEPS.PARTICIPANTS_DATE); }}
            style={{
              borderRadius: 16,
              borderWidth: 2,
              borderColor: state.eventType?.id === et.id ? '#FE53BB' : 'rgba(255,255,255,0.08)',
              backgroundColor: state.eventType?.id === et.id ? 'rgba(254,83,187,0.08)' : '#071333',
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 28 }}>{et.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{et.label}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{et.description}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 3 }}>
                {et.minParticipants}–{et.maxParticipants} participants
              </Text>
            </View>
            {state.eventType?.id === et.id && (
              <Ionicons name="checkmark-circle" size={22} color="#FE53BB" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // ── Step: PARTICIPANTS_DATE ──────────────────────────────────────────────────
  function renderParticipantsDateStep() {
    const et = state.eventType;
    const min = et?.minParticipants ?? 1;
    const max = et?.maxParticipants ?? 50;

    return (
      <View style={{ gap: 20 }}>
        {/* Compteur participants — rainbow border */}
        <View style={{ alignItems: 'center' }}>
          <LinearGradient
            colors={['#FF0080', '#FF8000', '#FFFF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 50, padding: 2 }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              backgroundColor: '#040D21',
              borderRadius: 48,
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}>
              <TouchableOpacity
                onPress={() => update({ participants: Math.max(min, state.participants - 1) })}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '800', lineHeight: 36 }}>
                  {state.participants}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>participants</Text>
              </View>
              <TouchableOpacity
                onPress={() => update({ participants: Math.min(max, state.participants + 1) })}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
          Sélectionner une date
        </Text>
        <Calendar selectedDate={state.selectedDate} onSelect={(d) => update({ selectedDate: d, timeSlot: null })} />

        {state.selectedDate && (
          <ValidateButton
            label="Valider"
            onPress={() => setStep(BOOKING_STEPS.TIME_SLOT)}
            disabled={!state.selectedDate}
          />
        )}
      </View>
    );
  }

  // ── Step: TIME_SLOT ──────────────────────────────────────────────────────────
  function renderTimeSlotStep() {
    return (
      <View style={{ gap: 20 }}>
        {/* Participants recap */}
        <View style={{ alignItems: 'center' }}>
          <LinearGradient
            colors={['#FF0080', '#FF8000', '#FFFF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 50, padding: 2 }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              backgroundColor: '#040D21',
              borderRadius: 48,
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}>
              <TouchableOpacity onPress={() => update({ participants: Math.max(1, state.participants - 1) })}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '800', lineHeight: 36 }}>{state.participants}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>participants</Text>
              </View>
              <TouchableOpacity onPress={() => update({ participants: Math.min(50, state.participants + 1) })}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Calendrier en compact */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
              Sélectionner une date
            </Text>
            <Calendar selectedDate={state.selectedDate} onSelect={(d) => update({ selectedDate: d, timeSlot: null })} />
          </View>

          {/* Créneaux horaires */}
          <View style={{
            flex: 1,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            padding: 14,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
              Sélectionner un horaire
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => update({ timeSlot: slot })}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 24,
                      borderWidth: 1.5,
                      borderColor: state.timeSlot === slot ? '#FE53BB' : 'rgba(255,255,255,0.15)',
                      backgroundColor: state.timeSlot === slot ? 'rgba(254,83,187,0.15)' : '#071333',
                    }}
                  >
                    <Text style={{
                      color: state.timeSlot === slot ? '#FE53BB' : '#FFFFFF',
                      fontSize: 13,
                      fontWeight: state.timeSlot === slot ? '700' : '400',
                    }}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <ValidateButton
            label="Valider"
            onPress={() => {
              const next = state.eventType?.hasFormula ? BOOKING_STEPS.FORMULA : BOOKING_STEPS.RECAP;
              setStep(next);
            }}
            disabled={!state.selectedDate || !state.timeSlot}
          />
        </View>
      </View>
    );
  }

  // ── Step: FORMULA ─────────────────────────────────────────────────────────────
  function renderFormulaStep() {
    return (
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {FORMULAS.map((formula, idx) => {
            const isSelected = state.formula?.id === formula.id;
            const isDeluxe = idx === 1;
            const total = computeTotal(formula, state.participants);

            return (
              <View key={formula.id} style={{ flex: 1 }}>
                {isDeluxe ? (
                  <LinearGradient
                    colors={['#FF0080', '#FF8000', '#FFFF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 18, padding: 2 }}
                  >
                    <TouchableOpacity
                      onPress={() => update({ formula })}
                      style={{
                        backgroundColor: '#040D21',
                        borderRadius: 16,
                        padding: 16,
                        minHeight: 200,
                      }}
                    >
                      {formula.badge && (
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginBottom: 8 }}>
                          {formula.badge}
                        </Text>
                      )}
                      <FormulaCardContent formula={formula} total={total} isSelected={isSelected} />
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity
                    onPress={() => update({ formula })}
                    style={{
                      backgroundColor: isSelected ? 'rgba(254,83,187,0.08)' : '#071333',
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#FE53BB' : 'rgba(255,255,255,0.08)',
                      minHeight: 180,
                    }}
                  >
                    <FormulaCardContent formula={formula} total={total} isSelected={isSelected} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Champs prénom hôte + date naissance (formule Deluxe uniquement) */}
        {state.formula?.id === 'deluxe' && (
          <View style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 4,
          }}>
            <View style={{
              flex: 1,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Prénom de l'hôte</Text>
            </View>
            <View style={{
              flex: 1,
              borderRadius: 50,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Date de naissance</Text>
            </View>
          </View>
        )}

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <ValidateButton
            label="Valider cette formule"
            onPress={() => {
              const next = state.eventType?.hasCake ? BOOKING_STEPS.CAKE : BOOKING_STEPS.RECAP;
              setStep(next);
            }}
            disabled={!state.formula}
          />
        </View>
      </View>
    );
  }

  // ── Step: CAKE ────────────────────────────────────────────────────────────────
  function renderCakeStep() {
    return (
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {CAKES.map((cake, idx) => {
            const isSelected = state.cake?.id === cake.id;
            const isFirst = idx === 0;

            return (
              <View key={cake.id} style={{ flex: 1 }}>
                {isFirst ? (
                  <LinearGradient
                    colors={['#FF0080', '#FF8000', '#FFFF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 18, padding: 2 }}
                  >
                    <TouchableOpacity
                      onPress={() => update({ cake, cakeTermsAccepted: false })}
                      style={{ backgroundColor: '#040D21', borderRadius: 16, padding: 16 }}
                    >
                      <CakeCardContent cake={cake} isSelected={isSelected} />
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity
                    onPress={() => update({ cake, cakeTermsAccepted: false })}
                    style={{
                      backgroundColor: isSelected ? 'rgba(254,83,187,0.08)' : '#071333',
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#FE53BB' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <CakeCardContent cake={cake} isSelected={isSelected} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Termes allergènes */}
        {state.cake && (
          <View style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: '#071333',
            padding: 16,
            gap: 12,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 18, textAlign: 'center' }}>
              Attention, nous remercions notre aimable clientèle de bien vouloir vérifier que les personnes susceptibles de manger toute nourriture proposée dans nos formules anniversaires ne soient pas allergiques à un des composants de celle-ci.{'\n'}
              En aucun cas nous ne pourrons être tenus responsables des conséquences pouvant découler d'un problème de santé. À toutes fins utiles, nous vous rappelons que les mineurs dans notre établissement sont sous la responsabilité exclusive de leurs parents ou de leurs accompagnants majeurs.
            </Text>
            <TouchableOpacity
              onPress={() => update({ cakeTermsAccepted: !state.cakeTermsAccepted })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: state.cakeTermsAccepted ? '#00D3FF' : 'rgba(255,255,255,0.2)',
                backgroundColor: state.cakeTermsAccepted ? '#00D3FF' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {state.cakeTermsAccepted && <Ionicons name="checkmark" size={14} color="#040D21" />}
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, flex: 1 }}>
                J'approuve les termes de ce paragraphe en cochant cette case
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <ValidateButton
            label="Choisir ce gâteau"
            onPress={() => setStep(BOOKING_STEPS.RECAP)}
            disabled={!state.cake || !state.cakeTermsAccepted}
          />
        </View>
      </View>
    );
  }

  // ── Step: RECAP ───────────────────────────────────────────────────────────────
  function renderRecapStep() {
    return (
      <View style={{ gap: 16 }}>
        <SidebarRecap state={state} />
        {total > 0 && (
          <View style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(0,211,255,0.15)',
            backgroundColor: 'rgba(0,211,255,0.05)',
            padding: 16,
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 }}>
              Total à régler
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}>
              {total.toFixed(2)} €
            </Text>
          </View>
        )}
        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <ValidateButton
            label="Confirmer la réservation"
            onPress={() => bookMutation.mutate()}
            loading={bookMutation.isPending}
            disabled={bookMutation.isPending}
          />
        </View>
      </View>
    );
  }

  function renderStep() {
    switch (step) {
      case BOOKING_STEPS.VENUE: return renderVenueStep();
      case BOOKING_STEPS.EVENT_TYPE: return renderEventTypeStep();
      case BOOKING_STEPS.PARTICIPANTS_DATE: return renderParticipantsDateStep();
      case BOOKING_STEPS.TIME_SLOT: return renderTimeSlotStep();
      case BOOKING_STEPS.FORMULA: return renderFormulaStep();
      case BOOKING_STEPS.CAKE: return renderCakeStep();
      case BOOKING_STEPS.RECAP: return renderRecapStep();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }} edges={['top']}>
      <StarBackground />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        gap: 12,
      }}>
        <TouchableOpacity onPress={goBack} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1 }}>
          Réserver
        </Text>
        {/* Bouton récap sidebar */}
        <TouchableOpacity
          onPress={() => setShowRecapSidebar(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        >
          <Ionicons name="receipt-outline" size={14} color="rgba(255,255,255,0.5)" />
          {total > 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' }}>
              {total.toFixed(2)} €
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 28 }}>
          {getStepTitle()}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Modal récap sidebar */}
      <Modal
        visible={showRecapSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecapSidebar(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setShowRecapSidebar(false)}
          activeOpacity={1}
        >
          <View style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            backgroundColor: '#071333',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 }} />
            <SidebarRecap state={state} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormulaCardContent({ formula, total, isSelected }: { formula: Formula; total: number; isSelected: boolean }) {
  return (
    <View>
      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', lineHeight: 18, marginBottom: 8, textAlign: 'center' }}>
        {formula.name}
      </Text>
      <View style={{ gap: 4, marginBottom: 12 }}>
        {formula.highlights.map((h, i) => (
          <Text key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 16 }}>
            • {h}
          </Text>
        ))}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' }}>
        {formula.pricePerPerson.toFixed(2)} €/participant
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 2 }}>
        Soit un total de {total.toFixed(2)} €
      </Text>
      {isSelected && (
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Ionicons name="checkmark-circle" size={18} color="#00D3FF" />
        </View>
      )}
    </View>
  );
}

function CakeCardContent({ cake, isSelected }: { cake: Cake; isSelected: boolean }) {
  return (
    <View>
      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' }}>
        {cake.name}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 17, marginBottom: 10, textAlign: 'center' }}>
        {cake.description}
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center' }}>
        <Text style={{ fontWeight: '600' }}>Allergènes : </Text>
        {cake.allergens.join(', ')}.
      </Text>
      {isSelected && (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Ionicons name="checkmark-circle" size={18} color="#00D3FF" />
        </View>
      )}
    </View>
  );
}
