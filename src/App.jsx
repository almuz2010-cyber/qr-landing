import { useEffect, useState } from "react";
import { clientConfig } from "./clientConfig.js";
import { getFullUtmParams, initYandexMetrika, sendWebhookEvent } from "./utils/analytics.js";
import { Hero } from "./components/Hero.jsx";
import { WhatsAppButton } from "./components/WhatsAppButton.jsx";

export default function App() {
  // Читаем UTM-параметры и выбираем контент один раз, лениво, при первом рендере.
  // Это чистое вычисление из URL, поэтому оно не требует useEffect и не вызывает
  // каскадных ре-рендеров (useState с функцией-инициализатором выполняется один раз).
  const [utmParams] = useState(() => getFullUtmParams());
  const [content] = useState(() => {
    const zoneKey = utmParams.utm_content;
    const zoneOverride = clientConfig.zones?.[zoneKey];
    return {
      offer: zoneOverride?.offer || clientConfig.offer,
      subtitle: zoneOverride?.subtitle || clientConfig.subtitle,
      whatsappMessage: zoneOverride?.whatsappMessage || clientConfig.whatsappMessage,
    };
  });

  useEffect(() => {
    // Подключаем Яндекс.Метрику один раз при монтировании (если ID задан).
    initYandexMetrika();

    // Отправляем событие page_view с защитой от задвоения.
    // Ключ уникален для кампании: если пользователь обновит страницу (F5)
    // или вернётся из WhatsApp — повторной отправки не будет.
    const storageKey = `qr_pv_sent_${utmParams.utm_campaign || "default"}`;
    const alreadySent = sessionStorage.getItem(storageKey);

    if (!alreadySent) {
      sendWebhookEvent("page_view", utmParams);
      sessionStorage.setItem(storageKey, "true");
    }
  }, [utmParams]);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: clientConfig.backgroundColor, color: clientConfig.textColor }}
    >
      <Hero title={content.offer} subtitle={content.subtitle} />
      <WhatsAppButton
        whatsappNumber={clientConfig.whatsappPhone}
        whatsappMessage={content.whatsappMessage}
        utmParams={utmParams}
        yandexMetrikaId={clientConfig.yandexMetrikaId}
      />
    </div>
  );
}