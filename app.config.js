// Extends app.json. EXPO_PUBLIC_BASE_URL serves the web export from a subpath
// (e.g. "/gotogetherr" on GitHub Pages); unset for local dev and e2e.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_PUBLIC_BASE_URL || undefined,
  },
});
