module.exports = function (api) {
  // Sur web, React DOM gère nativement className via react-native-web.
  // Le transform jsxImportSource de NativeWind n'est nécessaire que sur native.
  // L'activer sur web cause un conflit React 18/19 (nativewind embarque React 19)
  // qui produit l'erreur « Objects are not valid as a React child ».
  // NOTE: ne pas appeler api.cache() séparément — api.caller() gère lui-même
  // l'invalidation via api.cache.using() en interne. Double appel = conflit Babel.
  const isWeb = api.caller((caller) => caller?.targetPlatform === 'web');

  return {
    presets: [
      [
        'babel-preset-expo',
        isWeb ? {} : { jsxImportSource: 'nativewind' },
      ],
    ],
  };
};
