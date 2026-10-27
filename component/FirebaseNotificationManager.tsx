"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getToken, onMessage } from "firebase/messaging";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationSetup from "./NotificationSetup";
import { getWebMessaging } from "../firebase-web-messaging";
import { initPush, setPushUser } from "../lib/push";
import {
  BASE_URL,
  UPDATE_USER_DETAIL_ENDPOINT,
} from "../apiconstant/apiconstant";

const VAPID_KEY =
  "BA2t83CZFyh7Wjrif8RzKo1O4UBuks2MmNegk2RiKLccW5m-Ep9ZHupUc8cG4sYP-VOGF9DGUhOtJFzqV9lyvUVs";

async function syncDeviceTokenWithBackend(token: string) {
  if (typeof window === "undefined" || !token) return;

  localStorage.setItem("fmcToken", token);

  const supplierID = localStorage.getItem("supplierID");
  if (!supplierID || !BASE_URL) return;

  try {
    const endpoint = (UPDATE_USER_DETAIL_ENDPOINT || "").replace(/\/+$/, "");
    const baseURL = BASE_URL.replace(/\/+$/, "");

    const url = endpoint
      ? `${baseURL}/${endpoint.replace(/^\/+/, "")}/${encodeURIComponent(supplierID)}`
      : `${baseURL}/user_update/${encodeURIComponent(supplierID)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_token: token }),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("[FCM] Backend token update failed:", error);
  }
}

export default function FirebaseNotificationManager() {
  useEffect(() => {
    let disposed = false;
    let removeWebMessageListener: (() => void) | undefined;

    const syncExistingToken = () => {
      if (Capacitor.isNativePlatform()) {
        void setPushUser();
      } else {
        const token = localStorage.getItem("fmcToken");
        if (token) void syncDeviceTokenWithBackend(token);
      }
    };

    window.addEventListener("hora-supplier-login", syncExistingToken);

    const initializeNative = async () => {
      try {
        await initPush({
          onNotificationReceived: (notification: any) => {
            if (disposed) return;

            const title = notification?.title || "HORA Notification";
            const body = notification?.body || "";

            toast.info(body ? `${title}: ${body}` : title);
          },
          onNotificationTap: (notification: any) => {
            if (disposed) return;

            const targetUrl = notification?.data?.url;

            if (
              typeof targetUrl === "string" &&
              targetUrl.startsWith("/")
            ) {
              window.location.href = targetUrl;
            }
          },
        });
      } catch (error) {
        console.error("[FCM] Native notification initialization failed:", error);
      }
    };

    const initializeWeb = async () => {
      try {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );

        const messaging = await getWebMessaging();

        if (disposed || !messaging) return;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (disposed) return;

        if (token) {
          await syncDeviceTokenWithBackend(token);
        }

        const unsubscribe = onMessage(messaging, (payload) => {
          if (disposed) return;

          const title = payload.notification?.title || "HORA Notification";
          const body = payload.notification?.body || "";

          toast.info(body ? `${title}: ${body}` : title);
        });

        if (disposed) {
          unsubscribe();
        } else {
          removeWebMessageListener = unsubscribe;
        }
      } catch (error) {
        console.error("[FCM] Web notification initialization failed:", error);
      }
    };

    if (Capacitor.isNativePlatform()) {
      void initializeNative();
    } else {
      void initializeWeb();
    }

    return () => {
      disposed = true;
      window.removeEventListener("hora-supplier-login", syncExistingToken);
      removeWebMessageListener?.();
    };
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
      />
      <NotificationSetup />
    </>
  );
}