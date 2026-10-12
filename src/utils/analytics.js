import { config } from "../config.js";

// ============================================
// УТИЛИТЫ АНАЛИТИКИ
// ============================================

/**
 * Читает все UTM-параметры из URL.
 * Если параметра нет — возвращает "unknown" (чтобы в таблицах не было пустых ячеек).
 */
export function getFullUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get("utm_source") || "unknown",
        utm_medium: params.get("utm_medium") || "unknown",
        utm_campaign: params.get("utm_campaign") || "unknown",
        utm_content: params.get("utm_content") || "unknown",
    };
}

/**
 * Определяет ОС пользователя (iOS / Android / Other).
 * Учитывает iPadOS 13+, который маскируется под macOS.
 */
export function getDeviceOS() {
    const ua = navigator.userAgent;

    // iPadOS 13+ маскируется под macOS, но имеет touch
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) {
        return "iOS";
    }
    // Обычные iOS-устройства
    if (/iPhone|iPad|iPod/i.test(ua)) {
        return "iOS";
    }
    // Android
    if (/Android/i.test(ua)) {
        return "Android";
    }
    // Всё остальное (desktop, другие ОС)
    return "Other";
}

/**
 * Отправляет событие в n8n (fire-and-forget, не блокирует основной сценарий).
 *
 * ВАЖНО: Убедитесь, что в настройках ноды Webhook в n8n включена опция
 * "Respond to Webhook" и разрешены CORS-запросы, иначе браузер заблокирует fetch.
 */
export function sendWebhookEvent(eventName, utmParams) {
    // Пока в config.js стоит плейсхолдер (URL ещё не настроен в n8n) —
    // не делаем запрос, чтобы не засорять консоль 404-ошибками.
    const webhookUrl = config.n8nWebhookUrl;
    if (!webhookUrl || webhookUrl.includes("YOUR_N8N")) {
        return;
    }

    const payload = {
        event: eventName,
        utm: utmParams,
        device_os: getDeviceOS(),
        timestamp: new Date().toISOString(),
    };

    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    }).catch((err) => {
        console.error("Webhook error:", err);
    });
}