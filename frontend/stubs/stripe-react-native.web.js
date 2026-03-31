/**
 * Stub web de @stripe/stripe-react-native.
 * Stripe React Native est un SDK natif iOS/Android uniquement.
 * Sur le web, les composants sont des no-ops et les hooks retournent des fonctions vides.
 */

const React = require('react');

const StripeProvider = ({ children }) => children ?? null;

const useStripe = () => ({
  confirmPayment: async () => ({ error: { message: 'Non disponible sur web' } }),
  createPaymentMethod: async () => ({ error: { message: 'Non disponible sur web' } }),
  handleNextAction: async () => ({ error: { message: 'Non disponible sur web' } }),
  retrievePaymentIntent: async () => ({ error: { message: 'Non disponible sur web' } }),
  confirmSetupIntent: async () => ({ error: { message: 'Non disponible sur web' } }),
  initPaymentSheet: async () => ({ error: { message: 'Non disponible sur web' } }),
  presentPaymentSheet: async () => ({ error: { message: 'Non disponible sur web' } }),
  confirmPaymentSheetPayment: async () => ({ error: { message: 'Non disponible sur web' } }),
});

module.exports = {
  StripeProvider,
  useStripe,
};
