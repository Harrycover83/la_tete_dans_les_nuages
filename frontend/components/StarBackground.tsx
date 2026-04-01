import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Champ d'étoiles déterministe — fond nuit étoilé TDLN.
 * Aucune dépendance externe. Positions calculées une seule fois au chargement
 * via une fonction de hash sinusoïdale (pas de Math.random → no re-render jitter).
 *
 * Usage : premier enfant d'un container flex-1 avec backgroundColor défini.
 */

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  color: string;
}

function buildStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    // Seeded hash via sin — déterministe, reproductible
    const h1 = Math.abs(Math.sin(i * 127.1 + 311.7));
    const h2 = Math.abs(Math.sin(i * 269.3 + 74.3));
    const h3 = Math.abs(Math.sin(i * 419.2 + 183.1));
    const h4 = Math.abs(Math.sin(i * 53.1 + 47.9));

    // Taille : 0.5 – 2.2 px (la majorité très petites)
    const size = h3 * 1.7 + 0.5;

    // Palette : majorité blanches froides, quelques bleu-ciel, rares dorées
    let color: string;
    if (i % 9 === 0)      color = '#87CEFF'; // bleu ciel (rappel nuages)
    else if (i % 13 === 0) color = '#C4E8FF'; // bleu glacé
    else if (i % 17 === 0) color = '#FFE8A0'; // étoile dorée rare
    else                   color = '#FFFFFF';  // blanc pur

    return {
      id: i,
      left: `${(h1 * 98.5).toFixed(3)}%`,
      top:  `${(h2 * 98.5).toFixed(3)}%`,
      size,
      opacity: h4 * 0.45 + 0.08, // 0.08 – 0.53
      color,
    };
  });
}

// Calculé une seule fois au niveau module — aucun re-render
const STARS = buildStars(95);

export function StarBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((star) => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.left as any,
            top: star.top as any,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: star.color,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}
