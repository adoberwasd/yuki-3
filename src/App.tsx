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

// Товар в корзине (ещё не оплаченный)
type CartItem = {
  id: number;
  productId: string;
  title: string;
  category: string;
  tariffId: DurationId;
  tariffTitle: string;
  price: number;
  qty: number;
};

// Оплаченный заказ (история)
type OrderItem = {
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

// ────────────────────────────────────────────────────────────────────────────
// 📦 КАТАЛОГ ТОВАРОВ — фото подставляешь в поле image: "https://..."
// ────────────────────────────────────────────────────────────────────────────
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
    image: "https://i.ibb.co/Y4r3Lrm0/IMG-1160.png",
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
    image: "https://i.ibb.co/Kpd1RNr4/IMG-1159.png",
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
  { id: "orders", label: "Корзина", icon: "🛒" },
  { id: "balance", label: "Баланс", icon: "₽" },
  { id: "profile", label: "Профиль", icon: "◎" },
];

// ────────────────────────────────────────────────────────────────────────────
// 💳 МЕТОДЫ ПОПОЛНЕНИЯ
// ────────────────────────────────────────────────────────────────────────────
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
    logo: "https://i.ibb.co/TM4Bk4Gb/3-DD14-F7-F-9-D57-4426-B5-B4-332-CD9-CBA1-FC.png",
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

  // Корзина — товары, которые юзер положил, но ещё не оплатил
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("yuki_cart_pending");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // История оплаченных заказов
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem("yuki_orders_history");
      return saved ? (JSON.parse(saved) as OrderItem[]) : [];
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
    window.localStorage.setItem("yuki_cart_pending", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("yuki_orders_history", JSON.stringify(orders));
  }, [orders]);

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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const avatarLetter = (user.first_name || "Y").trim().charAt(0).toUpperCase();

  // Добавить тариф в корзину (если уже есть — увеличить количество)
  const handleAddToCart = (product: Product, tariff: Tariff) => {
    vibrate("medium");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === product.id && i.tariffId === tariff.id,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.tariffId === tariff.id
            ? { ...i, qty: i.qty + 1 }
            : i,
        );
      }
      const newItem: CartItem = {
        id: Date.now(),
        productId: product.id,
        title: product.title,
        category: product.category,
        tariffId: tariff.id,
        tariffTitle: tariff.title,
        price: tariff.price,
        qty: 1,
      };
      return [newItem, ...prev];
    });

    setNotice(`${product.title} • ${tariff.title} — добавлено в корзину`);
  };

  // Изменить количество товара в корзине
  const updateQty = (cartItemId: number, delta: number) => {
    vibrate("light");
    setCart((prev) =>
      prev
        .map((i) => (i.id === cartItemId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  // Удалить позицию из корзины
  const removeFromCart = (cartItemId: number) => {
    vibrate("light");
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  // Оплата всей корзины
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (balance < cartTotal) {
      vibrate("heavy");
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("error");
      setNoFundsModal({
        needed: cartTotal - balance,
        title: `Корзина (${cartCount} ${cartCount === 1 ? "товар" : "товаров"})`,
      });
      return;
    }

    vibrate("medium");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");

    // Списываем баланс
    setBalance((prev) => prev - cartTotal);

    // Превращаем корзину в заказы (история)
    const newOrders: OrderItem[] = cart.map((item) => ({
      id: Date.now() + Math.random(),
      productId: item.productId,
      title: item.title,
      category: item.category,
      tariffTitle: `${item.tariffTitle}${item.qty > 1 ? ` × ${item.qty}` : ""}`,
      total: item.price * item.qty,
    }));

    setOrders((prev) => [...newOrders, ...prev]);
    setCart([]);
    setNotice(`Оплачено ${formatPrice(cartTotal)}. Спасибо!`);
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0420_0%,#0a0320_40%,#0c0524_100%)]" />
          <div className="absolute -top-24 left-[-50px] h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="absolute right-[-50px] top-[420px] h-72 w-72 rounded-full bg-violet-600/18 blur-3xl" />
          <div className="absolute bottom-32 left-8 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute right-12 bottom-[-40px] h-44 w-44 rounded-full bg-fuchsia-500/12 blur-3xl" />
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
              className="flex flex-col items-center rounded-full border border-violet-300/15 bg-white/5 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.32)] transition active:scale-95"
            >
              <div className="text-[9px] uppercase tracking-[0.3em] text-violet-200/55">
                Баланс
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/25 text-[11px] text-violet-100">
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
                    {openedProduct.features.map((f) => (
                      <span
                        key={f}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-violet-50/80"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-xl font-semibold text-white">Выбери тариф</h2>
                <p className="mt-1 text-sm text-violet-100/55">
                  Тариф добавится в корзину. Оплатишь всё одним нажатием в разделе «Корзина».
                </p>
                <div className="mt-4 space-y-3">
                  {openedProduct.tariffs.map((tariff) => (
                    <div
                      key={tariff.id}
                      className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/25 p-4"
                    >
                      <div>
                        <div className="text-lg font-semibold text-white">{tariff.title}</div>
                        <div className="text-xs text-violet-100/55">{tariff.subtitle}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(openedProduct, tariff)}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.4)] active:scale-95"
                      >
                        <span className="text-base">🛒</span>
                        {formatPrice(tariff.price)}
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenedProductId(null);
                      setActiveTab("orders");
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/30 bg-violet-500/15 px-4 py-3 text-sm font-semibold text-violet-100"
                  >
                    Перейти в корзину ({cartCount}) →
                  </button>
                )}
              </SectionCard>
            </div>
          ) : (
            <>
              {/* ───── КАТАЛОГ ───── */}
              {activeTab === "catalog" && (
                <div className="space-y-5">
                  <SectionCard className="bg-white/[0.03]">
                    <p className="text-xs uppercase tracking-[0.38em] text-violet-200/60">
                      YUKI soft catalog
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
                      Выбери категорию
                      <br />
                      и открой товар
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-violet-100/55">
                      «YUKI Soft» — фильтр со всеми товарами. Остальные кнопки — фильтрация по
                      разделам.
                    </p>
                  </SectionCard>

                  <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {categories.map((cat) => {
                      const isActive = cat.id === selectedCategory;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            vibrate("light");
                            setSelectedCategory(cat.id);
                          }}
                          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition active:scale-95 ${
                            isActive
                              ? "border-violet-300/50 bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a855f7] text-white"
                              : "border-white/10 bg-white/[0.04] text-violet-100/75"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="font-medium">{cat.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    {visibleProducts.length === 0 ? (
                      <SectionCard className="text-center text-violet-100/60">
                        В этом разделе пока пусто.
                      </SectionCard>
                    ) : (
                      visibleProducts.map((product) => {
                        const minPrice = Math.min(...product.tariffs.map((t) => t.price));
                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              vibrate("light");
                              setOpenedProductId(product.id);
                            }}
                            className="block w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] text-left shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition active:scale-[0.99]"
                          >
                            <div className="relative h-44 w-full overflow-hidden">
                              <PlatformBadge platform={product.platform} />
                              <ProductImage src={product.image} title={product.title} />
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="text-lg font-semibold text-white">
                                    {product.title}
                                  </div>
                                  <div className="mt-1 text-sm text-violet-100/55">
                                    {product.short}
                                  </div>
                                </div>
                                <div className="flex items-baseline gap-1.5 rounded-2xl border border-violet-300/20 bg-violet-500/10 px-3 py-2">
                                  <span className="text-[10px] uppercase tracking-[0.22em] text-violet-100/55">
                                    от
                                  </span>
                                  <span className="text-sm font-semibold text-white">
                                    {formatPrice(minPrice)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 inline-flex items-center gap-2 text-xs text-violet-100/55">
                                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                                  {categories.find((c) => c.id === product.category)?.title}
                                </span>
                                <span className="text-violet-200/60">Открыть →</span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ───── КОРЗИНА + ИСТОРИЯ ───── */}
              {activeTab === "orders" && (
                <div className="space-y-5">
                  <SectionCard>
                    <p className="text-xs uppercase tracking-[0.35em] text-violet-200/55">
                      YUKI cart
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">Корзина</h2>
                    <p className="mt-2 text-sm leading-6 text-violet-100/55">
                      {cart.length === 0
                        ? "Сейчас пусто. Добавь товар в корзину со страницы товара."
                        : `В корзине ${cartCount} ${
                            cartCount === 1 ? "позиция" : "позиций"
                          } на сумму ${formatPrice(cartTotal)}.`}
                    </p>
                  </SectionCard>

                  {cart.length === 0 ? (
                    <SectionCard className="text-center">
                      <div className="relative mx-auto h-24 w-24">
                        <span className="yuki-pulse-ring absolute inset-0 rounded-full border border-violet-300/20 bg-violet-500/10" />
                        <span
                          className="yuki-pulse-ring absolute inset-0 rounded-full border border-violet-300/15 bg-violet-500/5"
                          style={{ animationDelay: "0.8s" }}
                        />
                        <div className="yuki-pulse-dot relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl text-violet-200/70 backdrop-blur-md">
                          🛒
                        </div>
                      </div>

                      <h3 className="mt-6 text-2xl font-semibold text-white">Корзина пуста</h3>
                      <p className="mt-2 text-sm leading-6 text-violet-100/55">
                        Выбери раздел и добавь товар.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("catalog")}
                        className="mt-5 rounded-full border border-violet-300/20 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-100"
                      >
                        В каталог
                      </button>
                    </SectionCard>
                  ) : (
                    <>
                      {/* Список позиций в корзине */}
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <SectionCard key={item.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="text-base font-semibold text-white">
                                  {item.title}
                                </div>
                                <div className="mt-1 text-xs text-violet-100/55">
                                  Тариф: {item.tariffTitle}
                                </div>
                                <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => updateQty(item.id, -1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-base font-semibold text-violet-100 active:scale-95"
                                  >
                                    −
                                  </button>
                                  <span className="min-w-[20px] text-center text-sm font-semibold text-white">
                                    {item.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQty(item.id, +1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-base font-semibold text-violet-100 active:scale-95"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white">
                                  {formatPrice(item.price * item.qty)}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-[11px] text-violet-200/55 underline-offset-2 hover:underline"
                                >
                                  убрать
                                </button>
                              </div>
                            </div>
                          </SectionCard>
                        ))}
                      </div>

                      {/* Итого + кнопка оплаты */}
                      <SectionCard className="bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(99,102,241,0.12))]">
                        <div className="flex items-center justify-between text-sm text-violet-100/60">
                          <span>Позиций</span>
                          <span className="text-white">{cartCount}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-violet-100/60">
                          <span>На балансе</span>
                          <span className="text-white">{formatPrice(balance)}</span>
                        </div>
                        <div className="mt-4 h-px bg-white/10" />
                        <div className="mt-4 flex items-center justify-between text-2xl font-bold text-white">
                          <span>Итого</span>
                          <span>{formatPrice(cartTotal)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleCheckout}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-4 text-base font-semibold text-white shadow-[0_14px_40px_rgba(168,85,247,0.4)] active:scale-[0.99]"
                        >
                          <span className="text-lg">✦</span>
                          Перейти к оплате · {formatPrice(cartTotal)}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            vibrate("light");
                            setCart([]);
                            setNotice("Корзина очищена.");
                          }}
                          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-violet-100/80"
                        >
                          Очистить корзину
                        </button>
                      </SectionCard>
                    </>
                  )}

                  {/* История заказов */}
                  {orders.length > 0 && (
                    <>
                      <div className="flex items-center gap-3 px-1 pt-2">
                        <h3 className="text-lg font-semibold text-white">История заказов</h3>
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-violet-100/45">{orders.length}</span>
                      </div>

                      <div className="space-y-3">
                        {orders.map((item) => (
                          <SectionCard key={item.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-base font-semibold text-white">
                                  {item.title}
                                </div>
                                <div className="mt-1 text-xs text-violet-100/55">
                                  {item.tariffTitle} • {item.category}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white">
                                {formatPrice(item.total)}
                              </div>
                            </div>
                          </SectionCard>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          vibrate("light");
                          setOrders([]);
                          setNotice("История очищена.");
                        }}
                        className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium text-violet-100/55"
                      >
                        Очистить историю
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ───── БАЛАНС ───── */}
              {activeTab === "balance" && (
                <div className="space-y-5">
                  <SectionCard className="overflow-hidden bg-[linear-gradient(135deg,rgba(168,85,247,0.25),rgba(99,102,241,0.18))]">
                    <p className="text-xs uppercase tracking-[0.35em] text-violet-200/65">
                      Твой баланс
                    </p>
                    <div className="mt-3 text-5xl font-black tracking-tight text-white">
                      {formatPrice(balance)}
                    </div>
                    <p className="mt-2 text-sm text-violet-100/55">
                      Используется для оплаты любого товара YUKI.
                    </p>
                  </SectionCard>

                  <SectionCard>
                    <h3 className="text-xl font-semibold text-white">Способ пополнения</h3>
                    <p className="mt-1 text-sm text-violet-100/55">
                      Выбери удобный метод оплаты
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {payMethods.map((method) => {
                        const isActive = method.id === selectedPayMethod;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                              vibrate("light");
                              setSelectedPayMethod(method.id);
                              setTopUpAmount("");
                            }}
                            className={`relative overflow-hidden rounded-[22px] border p-4 text-left transition active:scale-[0.98] ${
                              isActive
                                ? "border-violet-300/50 bg-gradient-to-br " +
                                  method.accent +
                                  " shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                                : "border-white/10 bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex h-16 w-16 items-center justify-start">
                              {method.logo ? (
                                <img
                                  src={method.logo}
                                  alt={method.title}
                                  className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
                                />
                              ) : (
                                <span className="text-[11px] uppercase tracking-wider text-violet-100/35">
                                  logo
                                </span>
                              )}
                            </div>
                            <div className="mt-3 text-base font-semibold text-white">
                              {method.title}
                            </div>
                            <div className="mt-1 text-[11px] text-violet-100/55">
                              {method.hint}
                            </div>
                            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-violet-200/55">
                              макс: {method.maxAmount} {method.unit}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  {(() => {
                    const method = payMethods.find((m) => m.id === selectedPayMethod)!;
                    const parsed = Number(topUpAmount);
                    const isValid =
                      Number.isFinite(parsed) && parsed > 0 && parsed <= method.maxAmount;
                    const rubPreview =
                      method.unit === "⭐" && isValid ? Math.round(parsed * STARS_TO_RUB) : null;

                    return (
                      <SectionCard>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">Сумма</h3>
                          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-violet-100/65">
                            {method.title}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/30 px-4 py-3">
                          <input
                            type="number"
                            inputMode="numeric"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="0"
                            className="flex-1 bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-white/25"
                          />
                          <span className="text-2xl font-semibold text-violet-200/80">
                            {method.unit}
                          </span>
                        </div>

                        <p className="mt-2 text-[12px] text-violet-100/45">
                          Введите сумму для пополнения. Максимум за раз —{" "}
                          <span className="text-white">
                            {method.maxAmount} {method.unit}
                          </span>
                          .
                        </p>

                        {rubPreview !== null && (
                          <p className="mt-1 text-[12px] text-violet-200/80">
                            ≈ {formatPrice(rubPreview)} на баланс
                          </p>
                        )}

                        {!isValid && topUpAmount !== "" && (
                          <p className="mt-2 text-[12px] text-red-300/85">
                            {parsed > method.maxAmount
                              ? `Максимум за раз — ${method.maxAmount} ${method.unit}.`
                              : "Введите корректную сумму."}
                          </p>
                        )}

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {(method.unit === "⭐"
                            ? [100, 300, 500]
                            : method.id === "sbp"
                              ? [200, 400, 700]
                              : [300, 700, 1500]
                          ).map((quick) => (
                            <button
                              key={quick}
                              type="button"
                              onClick={() => setTopUpAmount(String(quick))}
                              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-violet-100/80 transition active:scale-95"
                            >
                              {quick} {method.unit}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={!isValid}
                          onClick={() => {
                            if (!isValid) return;
                            const rub =
                              method.unit === "⭐"
                                ? Math.round(parsed * STARS_TO_RUB)
                                : Math.round(parsed);
                            vibrate("medium");
                            setBalance((prev) => prev + rub);
                            setTopUpAmount("");
                            setNotice(
                              `Баланс пополнен на ${formatPrice(rub)} через ${method.title}.`,
                            );
                          }}
                          className={`mt-5 w-full rounded-2xl px-5 py-4 text-base font-semibold transition ${
                            isValid
                              ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 text-white shadow-[0_12px_36px_rgba(168,85,247,0.4)] active:scale-[0.99]"
                              : "cursor-not-allowed border border-white/10 bg-white/5 text-violet-100/40"
                          }`}
                        >
                          Пополнить через {method.title}
                        </button>
                      </SectionCard>
                    );
                  })()}
                </div>
              )}

              {/* ───── ПРОФИЛЬ ───── */}
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <SectionCard className="text-center">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.first_name || "YUKI user"}
                        className="mx-auto h-24 w-24 rounded-full border-4 border-violet-400/25 object-cover shadow-[0_0_40px_rgba(168,85,247,0.22)]"
                      />
                    ) : (
                      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-3xl font-black shadow-[0_0_40px_rgba(168,85,247,0.25)]">
                        {avatarLetter}
                      </div>
                    )}
                    <h2 className="mt-4 text-3xl font-semibold text-white">
                      {user.first_name || "Пользователь YUKI"}
                    </h2>
                    <div className="mt-2 text-sm text-violet-100/55">
                      @{user.username || "yuki_soft_user"}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                      <button
                        type="button"
                        onClick={() => setActiveTab("balance")}
                        className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition active:scale-95"
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/45">
                          Баланс
                        </div>
                        <div className="mt-2 text-xl font-semibold text-white">
                          {formatPrice(balance)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition active:scale-95"
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/45">
                          В корзине
                        </div>
                        <div className="mt-2 text-xl font-semibold text-white">{cartCount}</div>
                      </button>
                    </div>
                  </SectionCard>

                  <SectionCard>
                    <h3 className="text-xl font-semibold text-white">О мини-аппе</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        "Фиолетовая тема",
                        "Telegram ready",
                        "Категории-фильтры",
                        "Страница товара",
                        "Корзина и оплата",
                      ].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-violet-100/70"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}
            </>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md border-t border-white/10 bg-black/65 px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => {
              const isActive = item.id === activeTab && !openedProduct;
              const showBadge = item.id === "orders" && cartCount > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    vibrate("light");
                    setOpenedProductId(null);
                    setActiveTab(item.id);
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-[18px] px-2 py-2 text-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-b from-violet-500/35 to-indigo-500/15 text-white"
                      : "text-violet-100/60"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="mt-1 text-[11px] font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute right-3 top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(232,121,249,0.7)]">
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {notice && (
          <div className="pointer-events-none fixed bottom-28 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-violet-300/20 bg-black/75 px-4 py-3 text-sm text-violet-50 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {notice}
          </div>
        )}

        {noFundsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-[28px] border border-violet-300/20 bg-[#0d0420] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-2xl">
                ⚠️
              </div>
              <h3 className="mt-4 text-center text-xl font-semibold text-white">
                Недостаточно средств
              </h3>
              <p className="mt-2 text-center text-sm text-violet-100/65">
                Для оплаты <span className="text-white">{noFundsModal.title}</span> не хватает{" "}
                <span className="font-semibold text-violet-200">
                  {formatPrice(noFundsModal.needed)}
                </span>
                .
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setNoFundsModal(null);
                    setOpenedProductId(null);
                    setActiveTab("balance");
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-4 text-base font-semibold text-white shadow-[0_12px_36px_rgba(168,85,247,0.4)]"
                >
                  Пополнить баланс
                </button>
                <button
                  type="button"
                  onClick={() => setNoFundsModal(null)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base font-semibold text-violet-100"
                >
                  Ок
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
