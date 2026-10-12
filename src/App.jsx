import { useEffect, useState } from "react";
import { config } from "./config.js";
import { getFullUtmParams, sendWebhookEvent } from "./utils/analytics.js";
import { Hero } from "./components/Hero.jsx";
import { WhatsAppButton } from "./components/WhatsAppButton.jsx";

export default function App() {
  // Читаем UTM-параметры и выбираем контент один раз, лениво, при первом рендере.
  // Это чистое вычисление из URL, поэтому оно не требует useEffect и не вызывает
  // каскадных ре-рендеров (useState с функцией-инициализатором выполняется один раз).
  const [utmParams] = useState(() => getFullUtmParams());
  const [content] = useState(() => {
    const zoneKey = utmParams.utm_content;
    return config.zones[zoneKey] || config.defaultContent;
  });

  useEffect(() => {
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
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-white flex flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]">
      <Hero title={content.title} subtitle={content.subtitle} />
      <WhatsAppButton
        whatsappNumber={config.whatsappNumber}
        whatsappMessage={content.whatsappMessage}
        utmParams={utmParams}
        yandexMetrikaId={config.yandexMetrikaId}
      />
    </div>
  );
}