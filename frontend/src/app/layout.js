"use client";
import { MyContext } from "./MyContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Head from "next/head";
import ToastProvider from "./Toast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ"
          crossorigin="anonymous"
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/font.css" />
      </Head>
      <body>
        <ToastProvider>
          <MyContext>{children}</MyContext>
        </ToastProvider>
      </body>
    </html>
  );
}
