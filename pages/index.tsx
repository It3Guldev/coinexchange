import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Coin Exchange</title>
        <meta name="description" content="Cryptocurrency exchange platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Coin Exchange</h1>
        <p>Your next-generation cryptocurrency trading platform</p>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        h1 {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
