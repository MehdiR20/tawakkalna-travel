/** Agency details that are the same in every language. Translated text is in src/i18n. */
export const SITE = {
  nameAr: "توكلنا للسياحة و الأسفار",
  contact: {
    phone: "0561 54 91 93",
    phoneHref: "tel:+213561549193",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=9+Bd+Colonel+Lotfi+Blida+Algeria",
  },
  social: [
    { label: "Facebook", href: "https://www.facebook.com/share/1dGf3ereLZ/" },
    { label: "Instagram", href: "https://www.instagram.com/traveltwakkalna/" },
    { label: "TikTok", href: "https://www.tiktok.com/@traveltawakkalna" },
  ],
} as const;

export const CATEGORIES = ["UMRAH", "INTERNATIONAL", "DOMESTIC", "LUXURY"] as const;
export type CategoryKey = (typeof CATEGORIES)[number];

export const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
export type BookingStatusKey = (typeof BOOKING_STATUSES)[number];

export const MAX_TRAVELERS_PER_BOOKING = 20;
