import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '../styles/login.css';
import './orders-details/OrderDashboard.css';
import '../component/OrderList/orderlist.css';

import FirebaseNotificationManager from
  '../component/FirebaseNotificationManager';

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <>
      <FirebaseNotificationManager />
      <Component {...pageProps} />
    </>
  );
}