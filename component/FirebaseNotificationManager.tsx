
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { getToken, onMessage } from "firebase/messaging";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getWebMessaging } from "../firebase-web-messaging";

import {
  BASE_URL,
  UPDATE_USER_DETAIL_ENDPOINT,
} from "../apiconstant/apiconstant";

const VAPID_KEY =
  "BA2t83CZFyh7Wjrif8RzKo1O4UBuks2MmNegk2RiKLccW5m-Ep9ZHupUc8cG4sYP-VOGD9DUhOtJFzqV9lyvUVs";

const CUSTOM_CHANNEL_ID = "fcm_custom_sound_channel_v2";
const EMERGENCY_CHANNEL_ID = "fcm_emergency_sound_channel";

type ListenerHandle = {
  remove: () => Promise<void>;
};

async function syncDeviceTokenWithBackend(token: string): Promise<void> {
  if (typeof window === "undefined" || !token) {
    return;
  }

  // Keep the existing local token key used by the login flow.
  localStorage.setItem("fmcToken", token);

  const supplierID = localStorage.getItem("supplierID");

  if (!supplierID) {
    console.warn(
      "[FCM] Token saved locally, but supplierID is not available yet."
    );
    return;
  }

  if (!BASE_URL) {
    console.error("[FCM] BASE_URL is missing.");
    return;
  }

  try {
    // Use the existing endpoint constant when it contains the user-update path.
    const endpoint = UPDATE_USER_DETAIL_ENDPOINT.replace(/\/+$/, "");
    const baseURL = BASE_URL.replace(/\/+$/, "");

    // Supports either a complete endpoint path or a route suffix.
    const url = endpoint
      ? `${baseURL}/${endpoint.replace(/^\/+/, "")}/${encodeURIComponent(
          supplierID
        )}`
      : `${baseURL}/user_update/${encodeURIComponent(supplierID)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_token: token,
      }),
    });

    const result = await response.json();

    if (!response.ok || result?.error) {
      throw new Error(
        result?.message || `HTTP ${response.status}`
      );
    }

    console.log("[FCM] Device token successfully updated.");
  } catch (error) {
    console.error("[FCM] Backend token update failed:", error);
  }
}

export default function FirebaseNotificationManager() {
  useEffect(() => {
    let disposed = false;
    let initializationStarted = false;

    const listenerHandles: ListenerHandle[] = [];
    let removeWebMessageListener: (() => void) | undefined;

    const keepListener = async (
      handle: ListenerHandle
    ): Promise<void> => {
      if (disposed) {
        await handle.remove();
      } else {
        listenerHandles.push(handle);
      }
    };

    const initializeNativeNotifications = async (): Promise<void> => {
      if (initializationStarted) return;
      initializationStarted = true;

      try {
        console.log("[FCM] Initializing native notifications.");

        // Foreground push received.
        const receivedListener = await FirebaseMessaging.addListener(
          "notificationReceived",
          (event) => {
            if (disposed) return;

            const notification = event.notification;
            const title = notification?.title || "HORA Notification";
            const body = notification?.body || "";

            console.log(
              "[FCM] Foreground notification received:",
              event
            );

            toast.info(body ? `${title}: ${body}` : title);
          }
        );

        await keepListener(receivedListener);

        // User taps a push notification.
        const actionListener =
          await FirebaseMessaging.addListener(
            "notificationActionPerformed",
            (event) => {
              if (disposed) return;

              console.log("[FCM] Notification tapped:", event);

              const data = event.notification?.data as
  | Record<string, unknown>
  | undefined;
              const targetUrl = data?.url;

              if (
                typeof targetUrl === "string" &&
                targetUrl.startsWith("/")
              ) {
                window.location.href = targetUrl;
              }
            }
          );

        await keepListener(actionListener);

        // Firebase token refresh.
        const tokenListener = await FirebaseMessaging.addListener(
          "tokenReceived",
          async (event) => {
            if (disposed || !event.token) return;

            console.log("[FCM] FCM token refreshed.");
            await syncDeviceTokenWithBackend(event.token);
          }
        );

        await keepListener(tokenListener);

        // Create Android notification channels.
        if (Capacitor.getPlatform() === "android") {
          try {
            await FirebaseMessaging.createChannel({
              id: CUSTOM_CHANNEL_ID,
              name: "HORA Notifications",
              description: "Regular HORA notifications",
              importance: 5,
              sound: "notification",
              vibration: true,
            });

            await FirebaseMessaging.createChannel({
              id: EMERGENCY_CHANNEL_ID,
              name: "HORA Emergency Notifications",
              description: "Urgent HORA notifications",
              importance: 5,
              sound: "emergency_notification",
              vibration: true,
            });

            console.log("[FCM] Android channels ready.");
          } catch (error) {
            console.error(
              "[FCM] Could not create notification channels:",
              error
            );
          }
        }

        const permission =
          await FirebaseMessaging.requestPermissions();

        console.log("[FCM] Notification permission:", permission);

        if (
          permission?.receive &&
          permission.receive !== "granted"
        ) {
          console.warn(
            "[FCM] Notification permission was not granted."
          );
          return;
        }

        const result = await FirebaseMessaging.getToken();

        if (disposed) return;

        if (result?.token) {
          console.log("[FCM] Native FCM token obtained.");
          await syncDeviceTokenWithBackend(result.token);
        } else {
          console.warn("[FCM] Native FCM token was empty.");
        }
      } catch (error) {
        console.error(
          "[FCM] Native notification initialization failed:",
          error
        );
      }
    };

    const initializeWebNotifications = async (): Promise<void> => {
      try {
        if (!("serviceWorker" in navigator)) {
          console.warn("[FCM] Service workers are unavailable.");
          return;
        }

        const registration =
          await navigator.serviceWorker.register(
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
          console.log("[FCM] Web FCM token obtained.");
          await syncDeviceTokenWithBackend(token);
        } else {
          console.warn("[FCM] No web FCM token was returned.");
        }

        const unsubscribe = onMessage(messaging, (payload) => {
          if (disposed) return;

          const title =
            payload.notification?.title || "HORA Notification";
          const body = payload.notification?.body || "";

          console.log(
            "[FCM] Web foreground notification received:",
            payload
          );

          toast.info(body ? `${title}: ${body}` : title);
        });

        if (disposed) {
          unsubscribe();
        } else {
          removeWebMessageListener = unsubscribe;
        }
      } catch (error) {
        console.error(
          "[FCM] Web notification initialization failed:",
          error
        );
      }
    };

    // Re-sync a previously obtained token after login.
    const syncExistingToken = (): void => {
      const existingToken = localStorage.getItem("fmcToken");

      if (existingToken) {
        void syncDeviceTokenWithBackend(existingToken);
      }
    };

    window.addEventListener(
      "hora-supplier-login",
      syncExistingToken
    );

    if (Capacitor.isNativePlatform()) {
      void initializeNativeNotifications();
    } else {
      void initializeWebNotifications();
    }

    return () => {
      disposed = true;

      window.removeEventListener(
        "hora-supplier-login",
        syncExistingToken
      );

      removeWebMessageListener?.();

      listenerHandles.forEach((handle) => {
        void handle.remove().catch((error) => {
          console.warn(
            "[FCM] Listener cleanup failed:",
            error
          );
        });
      });
    };
  }, []);

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
    />
  );
}
