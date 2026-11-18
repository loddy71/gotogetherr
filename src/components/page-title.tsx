import Head from 'expo-router/head';

/** The browser tab title on web (no-op on native). */
export function PageTitle({ title }: { title?: string }) {
  return (
    <Head>
      <title>{title ? `${title} · GoTogether` : 'GoTogether · Find the fairest place to meet'}</title>
    </Head>
  );
}
