// /app/layout.tsx
import ".//styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Staking DApp</title>
        <meta name="description" content="A simple staking DApp" />
      </head>
      <body>
        <header>
          <h1>Staking DApp</h1>
        </header>
        <main>{children}</main>
        {/* <footer>
          <p>Staking DApp</p>
        </footer> */}
      </body>
    </html>
  );
}
