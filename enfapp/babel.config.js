module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
      "module-resolver",
      {
        "root": ["./src"],
        "alias": {
          "@": "./src",
          '@assets': './src/assets',
        }
      }
    ]
  ],
};
