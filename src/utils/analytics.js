import { clientConfig } from "../clientConfig.js";

// ============================================
// УТИЛИТЫ АНАЛИТИКИ
// ============================================

/**
 * Динамически подключает счётчик Яндекс.Метрики и инициализирует его.
 * ID берётся из clientConfig.yandexMetrikaId — если он пустой, скрипт не
 * подключается (чтобы не засорять консоль и не грузить лишний JS впустую).
 */
export function initYandexMetrika() {
    const counterId = clientConfig.yandexMetrikaId;
    if (!counterId) {
        return;
    }

    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
        m[i].l = 1 * new Date();
        for (let j = 0; j < e.scripts.length; j++) {
            if (e.scripts[j].src === r) { return; }
        }
        k = e.createElement(t); a = e.getElementsByTagName(t)[0];
        k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    window.ym(counterId, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
    });
}

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
    // Пока в clientConfig.js webhook не указан (пустая строка) —
    // не делаем запрос, чтобы не засорять консоль 404-ошибками.
    const webhookUrl = clientConfig.n8nWebhookUrl;
    if (!webhookUrl) {
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