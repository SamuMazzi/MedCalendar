import { Html, Head, Main, NextScript } from 'next/document'

//* Forse non ci sarebbe neanche bisogno di questi tag per i font Google
export default function Document() {
    return (
        <Html>
            <Head>
                <meta name="description" content="Programmazione turni medici" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='anonymous' />
                <link
                    href="https://fonts.googleapis.com/css2?family=Public+Sans&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}