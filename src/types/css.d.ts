// Allows side-effect imports of plain CSS (used on web via react-native-web).
// Expo generates the same declaration into expo-env.d.ts on `expo start`, but
// that file is gitignored — this keeps `tsc --noEmit` green on a fresh clone.
declare module '*.css';
