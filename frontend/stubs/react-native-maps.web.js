/**
 * Stub web de react-native-maps.
 * react-native-maps est un SDK natif iOS/Android uniquement.
 * Sur le web, MapView et Marker sont des no-ops.
 */

const React = require('react');
const { View } = require('react-native');

const MapView = React.forwardRef(function MapView({ children, style }, ref) {
  return React.createElement(View, { style, ref }, children);
});
MapView.displayName = 'MapView';

const Marker = function Marker({ children }) { return children ?? null; };
Marker.displayName = 'Marker';

const PROVIDER_DEFAULT = null;
const PROVIDER_GOOGLE = 'google';

module.exports = {
  __esModule: true,
  default: MapView,
  MapView,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
};
