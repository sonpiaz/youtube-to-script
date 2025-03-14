import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>YouTube Transcript Generator</title>
        <meta name="description" content="Trích xuất văn bản từ video YouTube chỉ với một cú nhấp chuột." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 