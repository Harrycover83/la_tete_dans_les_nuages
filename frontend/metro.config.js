const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Packages native-only sans support web.
// On les résout vers des stubs appropriés pour éviter les crashes au bundle.
const WEB_STUBS = {
  '@stripe/stripe-react-native': path.resolve(__dirname, 'stubs/stripe-react-native.web.js'),
  'react-native-maps': path.resolve(__dirname, 'stubs/react-native-maps.web.js'),
};

// Packages dont les modules internes cassent le bundle web.
const WEB_EMPTY_MODULES = [
  'react-native-worklets-core',
];

// Modules React dédupliqués : on force l'utilisation de l'unique instance
// de React du projet (v18) pour éviter les conflits $$typeof avec React 19
// qui est embarqué dans nativewind/node_modules.
const DEDUPLICATED_MODULES = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

const topLevelNodeModules = path.resolve(__dirname, 'node_modules');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Forcer la résolution vers l'unique React du projet
  if (DEDUPLICATED_MODULES.includes(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(topLevelNodeModules, 'react', 'index.js') },
      moduleName,
      platform,
    );
  }

  if (platform === 'web') {
    if (WEB_STUBS[moduleName]) {
      return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] };
    }
    if (WEB_EMPTY_MODULES.includes(moduleName)) {
      return { type: 'empty' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
