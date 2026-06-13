import { useEffect, useMemo, useState, type ReactNode } from "react";

type TabId = "catalog" | "orders" | "balance" | "profile";
type DurationId = "trial" | "month" | "lifetime";
type CategoryId = "all" | "standoff2" | "cs2" | "valorant" | "brawlstars" | "ios";
type Platform = "iOS" | "Desktop" | "Android" | "iOS/Android";

type Tariff = {
  id: DurationId;
  title: string;
  subtitle: string;
  price: number;
};

type Product = {
  id: string;
  category: Exclude<CategoryId, "all">;
  title: string;
  short: string;
  description: string;
  image: string;
  platform: Platform;
  features: string[];
  tariffs: Tariff[];
};

type CartItem = {
  id: number;
  productId: string;
  title: string;
  category: string;
  tariffTitle: string;
  total: number;
};

type TelegramUser = {
  first_name?: string;
  username?: string;
  photo_url?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void;
          notificationOccurred?: (type: "success" | "warning" | "error") => void;
        };
        initDataUnsafe?: {
          user?: TelegramUser;
        };
      };
    };
  }
}

const money = new Intl.NumberFormat("ru-RU");
const formatPrice = (value: number) => `${money.format(value)} ₽`;

const categories: {
  id: CategoryId;
  title: string;
  short: string;
  icon: string;
}[] = [
  { id: "all", title: "YUKI Soft", short: "Весь софт", icon: "✦" },
  { id: "standoff2", title: "Standoff 2", short: "Игровой софт", icon: "🎯" },
  { id: "cs2", title: "CS2", short: "Игровой софт", icon: "⚡" },
  { id: "valorant", title: "Valorant", short: "Игровой софт", icon: "💎" },
  { id: "brawlstars", title: "Brawl Stars", short: "Мобильный софт", icon: "🌟" },
  { id: "ios", title: "Сертификаты iOS", short: "Подписи приложений", icon: "" },
];

// 📦 КАТАЛОГ ТОВАРОВ — фото в поле image: "https://..."
const products: Product[] = [
  {
    id: "s2-yuki-ipa",
    category: "standoff2",
    title: "YUKI iPA",
    short: "Приватный софт для Standoff 2",
    description:
      "Фирменный YUKI iPA под Standoff 2: стабильная сборка, аккуратная работа и регулярные обновления под актуальные версии игры.",
    image: "",
    platform: "iOS",
    features: ["iPA сборка", "Стабильно", "Обновления", "Поддержка"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 150 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 450 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 1500 },
    ],
  },
  {
    id: "cs2-wh",
    category: "cs2",
    title: "CS2 | Wallhack ESP",
    short: "Показ игроков через стены",
    description:
      "Чистый ESP для CS2 без лишних функций — только то, что нужно для уверенной игры на любом ранге.",
    image: "",
    platform: "Desktop",
    features: ["Player ESP", "Bomb info", "Safe mode", "Auto-update"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 250 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 750 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 2500 },
    ],
  },
  {
    id: "cs2-aim",
    category: "cs2",
    title: "CS2 | Aim Assist",
    short: "Помощь при стрельбе",
    description:
      "Аккуратный Aim Assist без палева. Настройка плавности, активация по клавише, поддержка всех режимов.",
    image: "",
    platform: "Desktop",
    features: ["Smooth Aim", "Hotkey", "Settings", "Stable"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 300 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 900 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 3000 },
    ],
  },
  {
    id: "vlr-cheat",
    category: "valorant",
    title: "Valorant | Private Cheat",
    short: "Премиум приватка",
    description:
      "Приватный софт под Valorant с продуманным интерфейсом, поддержкой 24/7 и регулярными апдейтами под патчи.",
    image: "",
    platform: "Desktop",
    features: ["ESP", "Aim", "Private build", "Поддержка"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 400 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 1200 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 4500 },
    ],
  },
  {
    id: "bs-mod",
    category: "brawlstars",
    title: "Brawl Stars | Mod Menu",
    short: "Мод-меню с возможностями",
    description:
      "Кастомное мод-меню для Brawl Stars с расширенными функциями для приватных серверов. Простая установка.",
    image: "",
    platform: "iOS/Android",
    features: ["Unlock all", "Custom skins", "Private server", "Easy install"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 90 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 290 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 900 },
    ],
  },
  {
    id: "ios-cert-personal",
    category: "ios",
    title: "Сертификат iOS | Personal",
    short: "Личный сертификат подписи",
    description:
      "Персональный сертификат для подписи iOS-приложений. Стабильная работа, быстрая выдача после оплаты.",
    image: "",
    platform: "iOS",
    features: ["Личный", "Быстрая выдача", "Стабильность", "Поддержка"],
    tariffs: [
      { id: "month", title: "30 дней", subtitle: "Базовый", price: 350 },
      { id: "lifetime", title: "365 дней", subtitle: "Годовой", price: 2500 },
    ],
  },
  {
    id: "ios-cert-business",
    category: "ios",
    title: "Сертификат iOS | Business",
    short: "Корпоративная подпись",
    description:
      "Корпоративный сертификат iOS для масштабного распространения приложений. Подходит для команд и студий.",
    image: "",
    platform: "iOS",
    features: ["Enterprise", "Без лимитов", "Поддержка 24/7", "Гарантия"],
    tariffs: [
      { id: "month", title: "30 дней", subtitle: "Базовый", price: 1500 },
      { id: "lifetime", title: "365 дней", subtitle: "Годовой", price: 9900 },
    ],
  },
];

const navItems: { id: TabId; label: string; icon: string }[] = [
  { id: "catalog", label: "Каталог", icon: "◈" },
  { id: "orders", label: "Заказы", icon: "◉" },
  { id: "balance", label: "Баланс", icon: "₽" },
  { id: "profile", label: "Профиль", icon: "◎" },
];

// 💳 МЕТОДЫ ПОПОЛНЕНИЯ
type PayMethodId = "sbp" | "cryptobot" | "stars" | "crypto";

type PayMethod = {
  id: PayMethodId;
  title: string;
  hint: string;
  logo: string;
  maxAmount: number;
  unit: "₽" | "⭐";
  accent: string;
};

const payMethods: PayMethod[] = [
  {
    id: "sbp",
    title: "СБП",
    hint: "Система быстрых платежей",
    logo: "",
    maxAmount: 700,
    unit: "₽",
    accent: "from-emerald-500/20 to-violet-500/15",
  },
  {
    id: "cryptobot",
    title: "Crypto Bot",
    hint: "Оплата через @CryptoBot",
    logo: "",
    maxAmount: 1500,
    unit: "₽",
    accent: "from-sky-500/20 to-violet-500/15",
  },
  {
    id: "stars",
    title: "TG Stars",
    hint: "Telegram Stars ⭐",
    logo: "",
    maxAmount: 900,
    unit: "⭐",
    accent: "from-amber-400/20 to-fuchsia-500/15",
  },
  {
    id: "crypto",
    title: "Крипта",
    hint: "USDT / TON / BTC",
    logo: "",
    maxAmount: 1500,
    unit: "₽",
    accent: "from-indigo-500/20 to-fuchsia-500/15",
  },
];

const STARS_TO_RUB = 1.6;
const DEBUG_USERNAME = "samarskiyyyy";
const DEBUG_BALANCE = 1_000_000;

// 🏷 БЕЙДЖИ ПЛАТФОРМ (PNG)
const PLATFORM_ICONS: Record<Platform, string> = {
  iOS: "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
  Desktop: "https://i.ibb.co/LzKLYc2f/IMG-1137.png",
  Android: "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
  "iOS/Android": "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
};

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function ProductImage({ src, title }: { src: string; title: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 via-fuchsia-500/30 to-indigo-600/40 text-5xl">
      ✦
    </div>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const iconUrl = PLATFORM_ICONS[platform];
  const label = platform;

  return (
    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-black/55 px-3 py-1 shadow-[0_6px_22px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {iconUrl && (
        <img
          src={iconUrl}
          alt={label}
          className="h-4 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        />
      )}
      <span className="text-[11px] font-semibold tracking-wide text-violet-50">
        {label}
      </span>
    </span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("catalog");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [openedProductId, setOpenedProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [noFundsModal, setNoFundsModal] = useState<{
    needed: number;
    title: string;
  } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedPayMethod, setSelectedPayMethod] = useState<PayMethodId>("sbp");

  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem("yuki_balance_rub");
    if (saved !== null) {
      const parsed = Number(saved);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("yuki_cart_history");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<TelegramUser>({
    first_name: "YUKI user",
    username: "",
  });

  useEffect(() => {
    window.localStorage.setItem("yuki_balance_rub", String(balance));
  }, [balance]);

  useEffect(() => {
    window.localStorage.setItem("yuki_cart_history", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#0a0615");
    tg.setBackgroundColor?.("#05010d");
    const telegramUser = tg.initDataUnsafe?.user;
    if (telegramUser) {
      const nextUser: TelegramUser = {
        first_name: telegramUser.first_name || "Пользователь YUKI",
        username: telegramUser.username || "",
        photo_url: telegramUser.photo_url,
      };
      setUser(nextUser);

      if (
        nextUser.username?.toLowerCase() === DEBUG_USERNAME &&
        !window.localStorage.getItem("yuki_debug_applied")
      ) {
        setBalance(DEBUG_BALANCE);
        window.localStorage.setItem("yuki_debug_applied", "1");
      }
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const vibrate = (style: "light" | "medium" | "heavy") => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const openedProduct = useMemo(
    () => products.find((p) => p.id === openedProductId) ?? null,
    [openedProductId],
  );

  const totalOrdersPrice = cart.reduce((sum, item) => sum + item.total, 0);
  const avatarLetter = (user.first_name || "Y").trim().charAt(0).toUpperCase();

  const handleBuyTariff = (product: Product, tariff: Tariff) => {
    if (balance < tariff.price) {
      vibrate("heavy");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      setNoFundsModal({
        needed: tariff.price - balance,
        title: `${product.title} • ${tariff.title}`,
      });
      return;
    }
    const item: CartItem = {
      id: Date.now(),
      productId: product.id,
      title: product.title,
      category: product.category,
      tariffTitle: tariff.title,
      total: tariff.price,
    };
    vibrate("medium");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    setBalance((prev) => prev - tariff.price);
    setCart((prev) => [item, ...prev]);
    setNotice(`Готово: ${item.title} оформлен за ${formatPrice(tariff.price)}.`);
    setOpenedProductId(null);
    setActiveTab("orders");
  };

  return (
    <div className="min-h-screen bg-[#05010d] text-white">
      <style>{`
        @keyframes yukiPulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.05); opacity: 0.75; }
        }
        @keyframes yukiRing {
          0% { transform: scale(0.9); opacity: 0.28; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .yuki-pulse-dot { animation: yukiPulse 2.4s ease-in-out infinite; }
        .yuki-pulse-ring { animation: yukiRing 2.4s ease-out infinite; }
      `}</style>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-[-52px] h-60 w-60 rounded-full bg-fuchsia-600/30 blur-3xl" />
          <div className="absolute right-[-40px] top-48 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute bottom-16 left-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_34%),linear-gradient(180deg,#0b0618_0%,#05010d_40%,#090312_100%)]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 pb-4 pt-4">
            <button
              type="button"
              onClick={() => {
                if (openedProduct) {
                  setOpenedProductId(null);
                  return;
                }
                setActiveTab("catalog");
              }}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xl shadow-[0_0_40px_rgba(168,85,247,0.42)]">
                ✦
              </div>
              <div className="text-left">
                <div className="text-[24px] font-black tracking-[0.22em] text-white">YUKI</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-violet-200/65">
                  soft bot mini app
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                vibrate("light");
                setOpenedProductId(null);
                setActiveTab("balance");
              }}
              className="rounded-full border border-violet-300/15 bg-white/5 px-3 py-2 text-left shadow-[0_8px_30px_rgba(0,0,0,0.32)] transition active:scale-95"
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-violet-200/55">
                Баланс
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-xs">
                  ₽
                </span>
                {formatPrice(balance)}
              </div>
            </button>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 pt-4">
          {/* ───── СТРАНИЦА ТОВАРА ───── */}
          {openedProduct ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  vibrate("light");
                  setOpenedProductId(null);
                }}
                className="flex items-center gap-2 text-sm text-violet-100/65"
              >
                <span className="text-lg">←</span> Назад к каталогу
              </button>

              <SectionCard className="overflow-hidden p-0">
                <div className="relative h-56 w-full overflow-hidden">
                  <PlatformBadge platform={openedProduct.platform} />
                  <ProductImage src={openedProduct.image} title={openedProduct.title} />
                </div>
                <div className="p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-100/70">
                    {categories.find((c) => c.id === openedProduct.category)?.title}
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold text-white">{openedProduct.title}</h1>
                  <p className="mt-1 text-sm text-violet-100/55">{openedProduct.short}</p>

                  <p className="mt-4 text-sm leading-6 text-violet-100/70">
                    {openedProduct.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">import { useEffect, useMemo, useState, type ReactNode } from "react";

type TabId = "catalog" | "orders" | "balance" | "profile";
type DurationId = "trial" | "month" | "lifetime";
type CategoryId = "all" | "standoff2" | "cs2" | "valorant" | "brawlstars" | "ios";
type Platform = "iOS" | "Desktop" | "Android" | "iOS/Android";

type Tariff = {
  id: DurationId;
  title: string;
  subtitle: string;
  price: number;
};

type Product = {
  id: string;
  category: Exclude<CategoryId, "all">;
  title: string;
  short: string;
  description: string;
  image: string;
  platform: Platform;
  features: string[];
  tariffs: Tariff[];
};

type CartItem = {
  id: number;
  productId: string;
  title: string;
  category: string;
  tariffTitle: string;
  total: number;
};

type TelegramUser = {
  first_name?: string;
  username?: string;
  photo_url?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        HapticFeedback?: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void;
          notificationOccurred?: (type: "success" | "warning" | "error") => void;
        };
        initDataUnsafe?: {
          user?: TelegramUser;
        };
      };
    };
  }
}

const money = new Intl.NumberFormat("ru-RU");
const formatPrice = (value: number) => `${money.format(value)} ₽`;

const categories: {
  id: CategoryId;
  title: string;
  short: string;
  icon: string;
}[] = [
  { id: "all", title: "YUKI Soft", short: "Весь софт", icon: "✦" },
  { id: "standoff2", title: "Standoff 2", short: "Игровой софт", icon: "🎯" },
  { id: "cs2", title: "CS2", short: "Игровой софт", icon: "⚡" },
  { id: "valorant", title: "Valorant", short: "Игровой софт", icon: "💎" },
  { id: "brawlstars", title: "Brawl Stars", short: "Мобильный софт", icon: "🌟" },
  { id: "ios", title: "Сертификаты iOS", short: "Подписи приложений", icon: "" },
];

// 📦 КАТАЛОГ ТОВАРОВ — фото в поле image: "https://..."
const products: Product[] = [
  {
    id: "s2-yuki-ipa",
    category: "standoff2",
    title: "YUKI iPA",
    short: "Приватный софт для Standoff 2",
    description:
      "Фирменный YUKI iPA под Standoff 2: стабильная сборка, аккуратная работа и регулярные обновления под актуальные версии игры.",
    image: "",
    platform: "iOS",
    features: ["iPA сборка", "Стабильно", "Обновления", "Поддержка"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 150 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 450 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 1500 },
    ],
  },
  {
    id: "cs2-wh",
    category: "cs2",
    title: "CS2 | Wallhack ESP",
    short: "Показ игроков через стены",
    description:
      "Чистый ESP для CS2 без лишних функций — только то, что нужно для уверенной игры на любом ранге.",
    image: "",
    platform: "Desktop",
    features: ["Player ESP", "Bomb info", "Safe mode", "Auto-update"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 250 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 750 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 2500 },
    ],
  },
  {
    id: "cs2-aim",
    category: "cs2",
    title: "CS2 | Aim Assist",
    short: "Помощь при стрельбе",
    description:
      "Аккуратный Aim Assist без палева. Настройка плавности, активация по клавише, поддержка всех режимов.",
    image: "",
    platform: "Desktop",
    features: ["Smooth Aim", "Hotkey", "Settings", "Stable"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 300 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 900 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 3000 },
    ],
  },
  {
    id: "vlr-cheat",
    category: "valorant",
    title: "Valorant | Private Cheat",
    short: "Премиум приватка",
    description:
      "Приватный софт под Valorant с продуманным интерфейсом, поддержкой 24/7 и регулярными апдейтами под патчи.",
    image: "",
    platform: "Desktop",
    features: ["ESP", "Aim", "Private build", "Поддержка"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 400 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 1200 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 4500 },
    ],
  },
  {
    id: "bs-mod",
    category: "brawlstars",
    title: "Brawl Stars | Mod Menu",
    short: "Мод-меню с возможностями",
    description:
      "Кастомное мод-меню для Brawl Stars с расширенными функциями для приватных серверов. Простая установка.",
    image: "",
    platform: "iOS/Android",
    features: ["Unlock all", "Custom skins", "Private server", "Easy install"],
    tariffs: [
      { id: "trial", title: "7 дней", subtitle: "Тест", price: 90 },
      { id: "month", title: "30 дней", subtitle: "Стандарт", price: 290 },
      { id: "lifetime", title: "Навсегда", subtitle: "Один платёж", price: 900 },
    ],
  },
  {
    id: "ios-cert-personal",
    category: "ios",
    title: "Сертификат iOS | Personal",
    short: "Личный сертификат подписи",
    description:
      "Персональный сертификат для подписи iOS-приложений. Стабильная работа, быстрая выдача после оплаты.",
    image: "",
    platform: "iOS",
    features: ["Личный", "Быстрая выдача", "Стабильность", "Поддержка"],
    tariffs: [
      { id: "month", title: "30 дней", subtitle: "Базовый", price: 350 },
      { id: "lifetime", title: "365 дней", subtitle: "Годовой", price: 2500 },
    ],
  },
  {
    id: "ios-cert-business",
    category: "ios",
    title: "Сертификат iOS | Business",
    short: "Корпоративная подпись",
    description:
      "Корпоративный сертификат iOS для масштабного распространения приложений. Подходит для команд и студий.",
    image: "",
    platform: "iOS",
    features: ["Enterprise", "Без лимитов", "Поддержка 24/7", "Гарантия"],
    tariffs: [
      { id: "month", title: "30 дней", subtitle: "Базовый", price: 1500 },
      { id: "lifetime", title: "365 дней", subtitle: "Годовой", price: 9900 },
    ],
  },
];

const navItems: { id: TabId; label: string; icon: string }[] = [
  { id: "catalog", label: "Каталог", icon: "◈" },
  { id: "orders", label: "Заказы", icon: "◉" },
  { id: "balance", label: "Баланс", icon: "₽" },
  { id: "profile", label: "Профиль", icon: "◎" },
];

// 💳 МЕТОДЫ ПОПОЛНЕНИЯ
type PayMethodId = "sbp" | "cryptobot" | "stars" | "crypto";

type PayMethod = {
  id: PayMethodId;
  title: string;
  hint: string;
  logo: string;
  maxAmount: number;
  unit: "₽" | "⭐";
  accent: string;
};

const payMethods: PayMethod[] = [
  {
    id: "sbp",
    title: "СБП",
    hint: "Система быстрых платежей",
    logo: "",
    maxAmount: 700,
    unit: "₽",
    accent: "from-emerald-500/20 to-violet-500/15",
  },
  {
    id: "cryptobot",
    title: "Crypto Bot",
    hint: "Оплата через @CryptoBot",
    logo: "",
    maxAmount: 1500,
    unit: "₽",
    accent: "from-sky-500/20 to-violet-500/15",
  },
  {
    id: "stars",
    title: "TG Stars",
    hint: "Telegram Stars ⭐",
    logo: "",
    maxAmount: 900,
    unit: "⭐",
    accent: "from-amber-400/20 to-fuchsia-500/15",
  },
  {
    id: "crypto",
    title: "Крипта",
    hint: "USDT / TON / BTC",
    logo: "",
    maxAmount: 1500,
    unit: "₽",
    accent: "from-indigo-500/20 to-fuchsia-500/15",
  },
];

const STARS_TO_RUB = 1.6;
const DEBUG_USERNAME = "samarskiyyyy";
const DEBUG_BALANCE = 1_000_000;

// 🏷 БЕЙДЖИ ПЛАТФОРМ (PNG)
const PLATFORM_ICONS: Record<Platform, string> = {
  iOS: "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
  Desktop: "https://i.ibb.co/LzKLYc2f/IMG-1137.png",
  Android: "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
  "iOS/Android": "https://i.ibb.co/cS7ZS0c5/IMG-1138.png",
};

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function ProductImage({ src, title }: { src: string; title: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={title}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 via-fuchsia-500/30 to-indigo-600/40 text-5xl">
      ✦
    </div>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const iconUrl = PLATFORM_ICONS[platform];
  const label = platform;

  return (
    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-violet-300/30 bg-black/55 px-3 py-1 shadow-[0_6px_22px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {iconUrl && (
        <img
          src={iconUrl}
          alt={label}
          className="h-4 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        />
      )}
      <span className="text-[11px] font-semibold tracking-wide text-violet-50">
        {label}
      </span>
    </span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("catalog");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("all");
  const [openedProductId, setOpenedProductId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [noFundsModal, setNoFundsModal] = useState<{
    needed: number;
    title: string;
  } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedPayMethod, setSelectedPayMethod] = useState<PayMethodId>("sbp");

  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const saved = window.localStorage.getItem("yuki_balance_rub");
    if (saved !== null) {
      const parsed = Number(saved);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("yuki_cart_history");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<TelegramUser>({
    first_name: "YUKI user",
    username: "",
  });

  useEffect(() => {
    window.localStorage.setItem("yuki_balance_rub", String(balance));
  }, [balance]);

  useEffect(() => {
    window.localStorage.setItem("yuki_cart_history", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#0a0615");
    tg.setBackgroundColor?.("#05010d");
    const telegramUser = tg.initDataUnsafe?.user;
    if (telegramUser) {
      const nextUser: TelegramUser = {
        first_name: telegramUser.first_name || "Пользователь YUKI",
        username: telegramUser.username || "",
        photo_url: telegramUser.photo_url,
      };
      setUser(nextUser);

      if (
        nextUser.username?.toLowerCase() === DEBUG_USERNAME &&
        !window.localStorage.getItem("yuki_debug_applied")
      ) {
        setBalance(DEBUG_BALANCE);
        window.localStorage.setItem("yuki_debug_applied", "1");
      }
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const vibrate = (style: "light" | "medium" | "heavy") => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };

  const visibleProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const openedProduct = useMemo(
    () => products.find((p) => p.id === openedProductId) ?? null,
    [openedProductId],
  );

  const totalOrdersPrice = cart.reduce((sum, item) => sum + item.total, 0);
  const avatarLetter = (user.first_name || "Y").trim().charAt(0).toUpperCase();

  const handleBuyTariff = (product: Product, tariff: Tariff) => {
    if (balance < tariff.price) {
      vibrate("heavy");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      setNoFundsModal({
        needed: tariff.price - balance,
        title: `${product.title} • ${tariff.title}`,
      });
      return;
    }
    const item: CartItem = {
      id: Date.now(),
      productId: product.id,
      title: product.title,
      category: product.category,
      tariffTitle: tariff.title,
      total: tariff.price,
    };
    vibrate("medium");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    setBalance((prev) => prev - tariff.price);
    setCart((prev) => [item, ...prev]);
    setNotice(`Готово: ${item.title} оформлен за ${formatPrice(tariff.price)}.`);
    setOpenedProductId(null);
    setActiveTab("orders");
  };

  return (
    <div className="min-h-screen bg-[#05010d] text-white">
      <style>{`
        @keyframes yukiPulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.05); opacity: 0.75; }
        }
        @keyframes yukiRing {
          0% { transform: scale(0.9); opacity: 0.28; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .yuki-pulse-dot { animation: yukiPulse 2.4s ease-in-out infinite; }
        .yuki-pulse-ring { animation: yukiRing 2.4s ease-out infinite; }
      `}</style>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-[-52px] h-60 w-60 rounded-full bg-fuchsia-600/30 blur-3xl" />
          <div className="absolute right-[-40px] top-48 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute bottom-16 left-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_34%),linear-gradient(180deg,#0b0618_0%,#05010d_40%,#090312_100%)]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 pb-4 pt-4">
            <button
              type="button"
              onClick={() => {
                if (openedProduct) {
                  setOpenedProductId(null);
                  return;
                }
                setActiveTab("catalog");
              }}
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xl shadow-[0_0_40px_rgba(168,85,247,0.42)]">
                ✦
              </div>
              <div className="text-left">
                <div className="text-[24px] font-black tracking-[0.22em] text-white">YUKI</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-violet-200/65">
                  soft bot mini app
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                vibrate("light");
                setOpenedProductId(null);
                setActiveTab("balance");
              }}
              className="rounded-full border border-violet-300/15 bg-white/5 px-3 py-2 text-left shadow-[0_8px_30px_rgba(0,0,0,0.32)] transition active:scale-95"
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-violet-200/55">
                Баланс
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-xs">
                  ₽
                </span>
                {formatPrice(balance)}
              </div>
            </button>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 pt-4">
          {/* ───── СТРАНИЦА ТОВАРА ───── */}
          {openedProduct ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  vibrate("light");
                  setOpenedProductId(null);
                }}
                className="flex items-center gap-2 text-sm text-violet-100/65"
              >
                <span className="text-lg">←</span> Назад к каталогу
              </button>

              <SectionCard className="overflow-hidden p-0">
                <div className="relative h-56 w-full overflow-hidden">
                  <PlatformBadge platform={openedProduct.platform} />
                  <ProductImage src={openedProduct.image} title={openedProduct.title} />
                </div>
                <div className="p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-100/70">
                    {categories.find((c) => c.id === openedProduct.category)?.title}
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold text-white">{openedProduct.title}</h1>
                  <p className="mt-1 text-sm text-violet-100/55">{openedProduct.short}</p>

                  <p className="mt-4 text-sm leading-6 text-violet-100/70">
                    {openedProduct.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
