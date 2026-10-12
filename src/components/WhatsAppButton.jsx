import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { config } from "../config.js";
import { sendWebhookEvent } from "../utils/analytics.js";

export function WhatsAppButton({ whatsappNumber, whatsappMessage, utmParams, yandexMetrikaId }) {
    const handleClick = () => {
        // 1. Вызов цели Яндекс.Метрики (с защитой, если скрипт не загрузился)
        if (typeof window.ym === "function") {
            window.ym(yandexMetrikaId, "reachGoal", "whatsapp_click");
        }

        // 2. Отправка события в n8n (fire-and-forget, не блокирует переход)
        sendWebhookEvent("whatsapp_click", utmParams);

        // 3. Открытие WhatsApp.
        // Используем window.location.href: на мобильных это надёжнее открывает deep links,
        // чем window.open, который браузеры часто блокируют как popup.
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.location.href = url;
    };

    return (
        <motion.button
            onClick={handleClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, scale: [1, 1.05, 1] }}
            transition={{
                opacity: { duration: 0.6, delay: 0.2, ease: "easeOut" },
                y: { duration: 0.6, delay: 0.2, ease: "easeOut" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
            }}
            className="h-16 w-full max-w-sm flex items-center justify-center gap-2 rounded-full text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: config.theme.buttonColor }}
        >
            <MessageCircle size={24} />
            Написать в WhatsApp
        </motion.button>
    );
}