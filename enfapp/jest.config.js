module.exports = {
  preset: "react-native",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo(-.*)?|react-navigation|@react-navigation.*|react-native-sqlite-storage|react-native-webview|react-native/Libraries)/)',
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
};
