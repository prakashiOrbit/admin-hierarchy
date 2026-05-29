module.exports = {
  preset: '@react-native/jest-preset',
  forceExit: true,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|@react-native-async-storage' +
      '|@react-navigation' +
      '|@testing-library' +
      '|react-native-svg' +
    ')/)',
  ],
};
