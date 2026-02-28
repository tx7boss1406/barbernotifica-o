import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  // Fetch VAPID public key from edge function
  useEffect(() => {
    const fetchVapidKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-vapid-key");
        if (!error && data?.publicKey) {
          setVapidKey(data.publicKey);
        }
      } catch {
        console.warn("Could not fetch VAPID key");
      }
    };
    fetchVapidKey();
  }, []);

  // Check existing subscription
  useEffect(() => {
    if (!userId || !("serviceWorker" in navigator)) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch {
        // SW not ready yet
      }
    };
    checkSubscription();
  }, [userId]);

  const subscribe = useCallback(async () => {
    if (!userId || !vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Unsubscribe existing if any
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const subscriptionJSON = subscription.toJSON();

      // Remove existing subscriptions for this user
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId);

      // Save new subscription
      const { error } = await supabase.from("push_subscriptions").insert([{
        user_id: userId,
        subscription: subscriptionJSON as any,
      }]);

      if (error) throw error;

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Push subscription error:", error);
      setLoading(false);
      return false;
    }
  }, [userId, vapidKey]);

  return { permission, isSubscribed, subscribe, loading, supported: "PushManager" in window };
}
