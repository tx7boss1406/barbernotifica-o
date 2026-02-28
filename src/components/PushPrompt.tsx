import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/contexts/AuthContext";

export default function PushPrompt() {
  const { user } = useAuth();
  const { permission, isSubscribed, subscribe, loading, supported } = usePushNotifications(user?.id);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !supported || isSubscribed || permission === "denied") return;
    const wasDismissed = sessionStorage.getItem("push-prompt-dismissed");
    if (wasDismissed) return;

    // Show prompt after a short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [user, supported, isSubscribed, permission]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("push-prompt-dismissed", "true");
  };

  if (!show || dismissed || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-6 left-4 right-4 z-[100] mx-auto max-w-sm"
      >
        <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-card p-5 shadow-[0_0_40px_-10px_hsl(var(--gold)/0.3)]">
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-heading text-base font-bold text-foreground">Ativar Notificações</p>
              <p className="font-body text-xs text-muted-foreground">
                Receba alertas sobre seus agendamentos
              </p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-4 w-full rounded-lg gold-gradient py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_20px_-5px_hsl(var(--gold)/0.4)] disabled:opacity-50"
          >
            {loading ? "Ativando..." : "Ativar Notificações"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
