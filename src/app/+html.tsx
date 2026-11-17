import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

import { Colors } from '@/constants/theme';

const { light, dark } = Colors;

/**
 * Browser surfaces the components don't draw: page colour before the app
 * hydrates (no white flash in dark mode), text selection, caret, keyboard
 * focus ring, scrollbars and heading wrap. Web only; runs in Node during
 * static rendering.
 */
const css = `
:root { color-scheme: light dark; }
html, body { background: ${light.background}; color: ${light.text}; }
::selection { background: ${light.tint}33; color: ${light.text}; }
input, textarea { caret-color: ${light.tint}; }
:focus-visible { outline: 2px solid ${light.tint}; outline-offset: 2px; border-radius: 12px; }
* { scrollbar-color: ${light.borderStrong} transparent; }
[role="heading"] { text-wrap: balance; }
@media (prefers-color-scheme: dark) {
  html, body { background: ${dark.background}; color: ${dark.text}; }
  ::selection { background: ${dark.tint}4D; color: ${dark.text}; }
  input, textarea { caret-color: ${dark.tint}; }
  :focus-visible { outline-color: ${dark.tint}; }
  * { scrollbar-color: ${dark.borderStrong} transparent; }
}
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="description"
          content="Friends in different countries? GoTogether prices every city per person and ranks where the trip costs least and splits most evenly."
        />
        <meta name="theme-color" content={light.background} media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content={dark.background} media="(prefers-color-scheme: dark)" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
