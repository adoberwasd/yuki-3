import { useEffect, useMemo, useState, type ReactNode } from "react";

type TabId = "catalog" | "orders" | "profile";
type PlanId = "lite" | "private" | "ultimate";
type CategoryId = "soft" | "standoff2" | "cs2" | "valorant" | "brawlstars";
type DurationId = "trial" | "month" | "lifetime";

type CartItem = {
  id: number;
  title: string;
  category: string;
  plan: string;
  duration: string;
  quantity: number;
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

const plans = [
  {
    id: "lite" as const,
    title: "Lite",
    subtitle: "Быстрый старт",
    multiplier: 1,
    badge: "Start",
    gradient: "from-violet-500 via-fuchsia-500 to-purple-500",
    ring: "ring-violet-300/40",
  },
  {
    id: "private" as const,
    title: "Private",
    subtitle: "Самый популярный",
    multiplier: 2.15,
    badge: "Top",
    gradient: "from-fuchsia-500 via-violet-500 to-indigo-500",
    ring: "ring-fuchsia-300/50",
  },
  {
    id: "ultimate" as const,
    title: "Ultimate",
    subtitle: "Максимум возможностей",
    multiplier: 3.6,
    badge: "Best",
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    ring: "ring-indigo-300/40",
  },
];

const categories = [
  {
    id: "soft" as const,
    title: "YUKI Soft",
    short: "Основной каталог",
    code: "SOFT",
    icon: "✦",
    basePrice: 149,
    gradient: "from-violet-500/90 to-fuchsia-500/90",
    description:
      "Универсальный раздел с цифровыми товарами YUKI: быстрый доступ, авто-выдача и понятная активация прямо внутри мини-аппа.",
    features: ["Автовыдача", "Telegram access", "Обновления", "Поддержка"],
  },
  {
    id: "standoff2" as const,
    title: "Standoff 2",
    short: "Игровой раздел",
    code: "S2",
    icon: "🎯",
    basePrice: 189,
    gradient: "from-purple-500/90 to-violet-400/90",
    description:
      "Раздел с тематическими игровыми пакетами YUKI для быстрого выбора, оформления и получения доступа без лишних шагов.",
    features: ["Быстрый выбор", "Актуальные версии", "Инструкция", "1 устройство"],
  },
  {
    id: "cs2" as const,
    title: "CS2",
    short: "Популярный раздел",
    code: "CS2",
    icon: "⚡",
    basePrice: 219,
    gradient: "from-fuchsia-500/90 to-violet-500/90",
    description:
      "Темный premium-блок в стиле YUKI с акцентом на лаконичную подачу товара, срок доступа и итоговую цену.",
    features: ["Premium card", "Чистый UI", "30 дней", "Мгновенно"],
  },
  {
    id: "valorant" as const,
    title: "Valorant",
    short: "Отдельный пакет",
    code: "VLR",
    icon: "💎",
    basePrice: 239,
    gradient: "from-violet-500/90 to-indigo-500/90",
    description:
      "Оформление раздела с крупными переключателями, аккуратными стеклянными карточками и фиолетовым свечением, как ты и хотел.",
    features: ["Glass style", "Фиолетовый glow", "Удобный выбор", "YUKI UI"],
  },
  {
    id: "brawlstars" as const,
    title: "Brawl Stars",
    short: "Мобильный блок",
    code: "BS",
    icon: "🌟",
    basePrice: 129,
    gradient: "from-pink-500/90 to-violet-500/90",
    description:
      "Легкий мобильный раздел для Telegram Mini App: крупные кнопки, простая навигация и итоговый заказ в пару тапов.",
    features: ["Mobile first", "Telegram ready", "Простой checkout", "Нежный blur"],
  },
];

const durations = [
  { id: "trial" as const, title: "7 дней", subtitle: "Тестовый", multiplier: 0.6 },
  { id: "month" as const, title: "30 дней", subtitle: "Стандарт", multiplier: 1 },
  { id: "lifetime" as const, title: "Навсегда", subtitle: "Один платеж", multiplier: 3.7 },
];

const navItems = [
  { id: "catalog" as const, label: "Каталог", icon: "◈" },
  { id: "orders" as const, label: "Заказы", icon: "◉" },
  { id: "profile" as const, label: "Профиль", icon: "◎" },
];

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("catalog");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("private");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("soft");
  const [selectedDuration, setSelectedDuration] = useState<DurationId>("month");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === "undefined") return 1200;
    const saved = window.localStorage.getItem("yuki_balance_rub");
    const parsed = saved ? Number(saved) : 1200;
    return Number.isFinite(parsed) ? parsed : 1200;
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
    first_name: "Гость YUKI",
    username: "yuki_soft_user",
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
      setUser({
        first_name: telegramUser.first_name || "Пользователь YUKI",
        username: telegramUser.username || "yuki_member",
        photo_url: telegramUser.photo_url,
      });
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan) ?? plans[0],
    [selectedPlan],
  );
  const currentCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategory) ?? categories[0],
    [selectedCategory],
  );
  const currentDuration = useMemo(
    () => durations.find((duration) => duration.id === selectedDuration) ?? durations[1],
    [selectedDuration],
  );

  const unitPrice = Math.round(
    currentCategory.basePrice * currentPlan.multiplier * currentDuration.multiplier,
  );
  const totalPrice = unitPrice * quantity;
  const totalOrdersPrice = cart.reduce((sum, item) => sum + item.total, 0);
  const avatarLetter = (user.first_name || "Y").trim().charAt(0).toUpperCase();

  const vibrate = (style: "light" | "medium" | "heavy") => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };

  const handlePurchase = () => {
    if (balance < totalPrice) {
      vibrate("heavy");
      setActiveTab("profile");
      setNotice(`Недостаточно средств. Нужно ещё ${formatPrice(totalPrice - balance)}.`);
      return;
    }
    const item: CartItem = {
      id: Date.now(),
      title: `${currentCategory.title} • ${currentPlan.title}`,
      category: currentCategory.title,
      plan: currentPlan.title,
      duration: currentDuration.title,
      quantity,
      total: totalPrice,
    };
    vibrate("medium");
    setBalance((prev) => prev - totalPrice);
    setCart((prev) => [item, ...prev]);
    setActiveTab("orders");
    setNotice(`Готово: ${item.title} оформлен за ${formatPrice(totalPrice)}.`);
  };

  const handleTopUp = () => {
    vibrate("light");
    setBalance((prev) => prev + 1000);
    setNotice("Баланс пополнен на 1 000 ₽ для демо-проверки мини-аппа.");
  };

  const resetDemo = () => {
    vibrate("light");
    setBalance(1200);
    setCart([]);
    setQuantity(1);
    setSelectedPlan("private");
    setSelectedCategory("soft");
    setSelectedDuration("month");
    setNotice("Демо-данные сброшены. Интерфейс готов к новым тестам.");
  };

  return (
    <div className="min-h-screen bg-[#05010d] text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-[-52px] h-60 w-60 rounded-full bg-fuchsia-600/30 blur-3xl" />
          <div className="absolute right-[-40px] top-48 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute bottom-16 left-10 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_34%),linear-gradient(180deg,#0b0618_0%,#05010d_40%,#090312_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(168,85,247,0.12),transparent_30%,rgba(67,56,202,0.1)_68%,transparent)]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 pb-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xl shadow-[0_0_40px_rgba(168,85,247,0.42)]">
                ✦
              </div>
              <div>
                <div className="text-[28px] font-black tracking-[0.22em] text-white">YUKI</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-violet-200/65">
                  soft bot mini app
                </div>
              </div>
            </div>
            <div className="rounded-full border border-violet-300/15 bg-white/5 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.32)]">
              <div className="text-[10px] uppercase tracking-[0.32em] text-violet-200/55">Баланс</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-xs">
                  ₽
                </span>
                {formatPrice(balance)}
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 pt-4">
          {activeTab === "catalog" && (
            <div className="space-y-5">
              <SectionCard className="overflow-hidden bg-white/[0.03]">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                <p className="text-xs uppercase tracking-[0.38em] text-violet-200/60">YUKI soft catalog</p>
                <h1 className="mt-3 text-4xl font-semibold leading-none text-white">
                  Выбери
                  <br />
                  формат YUKI
                </h1>
                <div className="mt-6 flex flex-wrap gap-3">
                  {plans.map((plan) => {
                    const isActive = plan.id === currentPlan.id;
                    const previewPrice = Math.round(currentCategory.basePrice * plan.multiplier);
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          vibrate("light");
                          setSelectedPlan(plan.id);
                        }}
                        className={`relative min-w-[150px] flex-1 overflow-hidden rounded-full border px-4 py-3 text-left transition-all duration-200 ${
                          isActive
                            ? `border-white/30 bg-gradient-to-r ${plan.gradient} text-white shadow-[0_0_40px_rgba(168,85,247,0.3)]`
                            : "border-white/10 bg-white/5 text-white/85"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[13px] font-semibold uppercase tracking-[0.22em]">{plan.title}</div>
                            <div className="mt-1 text-xs text-white/70">{plan.subtitle}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">от {formatPrice(previewPrice)}</div>
                            <div className="mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-white/80">
                              {plan.badge}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>

              <div className="flex items-center gap-3 px-1">
                <h2 className="text-[22px] font-semibold text-white">Выбери раздел</h2>
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-2xl text-violet-200/65">→</span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category) => {
                  const isActive = category.id === currentCategory.id;
                  const pricePreview = Math.round(category.basePrice * currentPlan.multiplier);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        vibrate("light");
                        setSelectedCategory(category.id);
                      }}
                      className={`min-w-[250px] rounded-[28px] border p-4 text-left transition-all duration-200 ${
                        isActive
                          ? "border-violet-300/30 bg-gradient-to-r from-violet-500/25 to-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${category.gradient} text-2xl shadow-lg`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-medium text-white">{category.title}</div>
                          <div className="mt-1 text-sm text-violet-100/55">{category.short}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-violet-100/65">
                          {category.code}
                        </span>
                        <div className="text-right text-2xl font-medium text-white/85">{formatPrice(pricePreview)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <SectionCard className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(10,15,28,0.75),rgba(4,6,16,0.86))]">
                <div className="absolute inset-y-0 right-0 w-32 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_70%)]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-violet-100/80">
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(168,85,247,1)]" />
                        {currentPlan.title}
                        <span className="text-white/25">|</span>
                        {currentCategory.code}
                      </div>
                      <h3 className="mt-5 text-3xl font-semibold text-white">{currentCategory.title}</h3>
                      <p className="mt-3 max-w-[280px] text-sm leading-6 text-violet-100/55">{currentCategory.description}</p>
                    </div>
                    <div className="rounded-[24px] border border-violet-300/20 bg-violet-500/10 px-4 py-3 text-right shadow-[0_0_30px_rgba(168,85,247,0.18)]">
                      <div className="text-[11px] uppercase tracking-[0.32em] text-violet-100/45">Цена</div>
                      <div className="mt-2 text-2xl font-semibold text-white">{formatPrice(unitPrice)}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {currentCategory.features.map((feature) => (
                      <span key={feature} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-violet-50/75">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-violet-100/65">
                      Подходит для Telegram Mini App и оформлен в стиле твоего фиолетового YUKI.
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-violet-100/65">
                      Стоимость показана за <span className="text-white">{currentDuration.title.toLowerCase()}</span>.
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="bg-[linear-gradient(180deg,rgba(5,12,23,0.72),rgba(3,7,18,0.85))]">
                <h3 className="text-2xl font-semibold text-white">Выбери срок</h3>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {durations.map((duration) => {
                    const isActive = duration.id === currentDuration.id;
                    return (
                      <button
                        key={duration.id}
                        type="button"
                        onClick={() => {
                          vibrate("light");
                          setSelectedDuration(duration.id);
                        }}
                        className={`rounded-[24px] border px-3 py-4 text-left transition-all duration-200 ${
                          isActive
                            ? "border-violet-200/35 bg-gradient-to-r from-violet-500/35 to-indigo-500/25 shadow-[0_0_28px_rgba(139,92,246,0.22)]"
                            : "border-white/10 bg-black/15"
                        }`}
                      >
                        <div className="text-lg font-semibold text-white">{duration.title}</div>
                        <div className="mt-1 text-xs text-violet-100/55">{duration.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm leading-6 text-violet-100/50">
                  Перед оформлением можно быстро переключить срок доступа и сразу увидеть, как меняется итоговая цена.
                </p>
              </SectionCard>

              <SectionCard className="bg-[linear-gradient(180deg,rgba(8,14,28,0.82),rgba(2,7,18,0.92))]">
                <h3 className="text-2xl font-semibold text-white">Выбери количество</h3>
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-20 w-24 items-center justify-center rounded-[24px] border border-white/10 bg-black/15 text-3xl font-semibold text-white">
                    {quantity}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Number(event.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-violet-400"
                  />
                </div>
                <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between text-sm text-violet-100/60">
                    <span>{currentPlan.title} • {currentCategory.title}</span>
                    <span>{formatPrice(unitPrice)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-violet-100/60">
                    <span>Количество</span>
                    <span>{quantity} шт.</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-violet-100/60">
                    <span>Срок</span>
                    <span>{currentDuration.title}</span>
                  </div>
                  <div className="mt-4 h-px bg-white/10" />
                  <div className="mt-4 flex items-center justify-between text-xl font-semibold text-white">
                    <span>Итого</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePurchase}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-[24px] bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-4 text-base font-semibold text-white shadow-[0_12px_40px_rgba(139,92,246,0.38)] transition-transform duration-200 active:scale-[0.99]"
                >
                  <span className="text-lg">✦</span>
                  {balance >= totalPrice
                    ? `Купить за ${formatPrice(totalPrice)}`
                    : `Не хватает ${formatPrice(totalPrice - balance)}`}
                </button>
              </SectionCard>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-5">
              <SectionCard>
                <p className="text-xs uppercase tracking-[0.35em] text-violet-200/55">YUKI orders</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Твои заказы</h2>
                <p className="mt-2 text-sm leading-6 text-violet-100/55">
                  Здесь отображаются оформленные позиции из мини-аппа. Вся история сохраняется локально для демо.
                </p>
              </SectionCard>

              {cart.length === 0 ? (
                <SectionCard className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-3xl text-violet-200/70">◉</div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Пока пусто</h3>
                  <p className="mt-2 text-sm leading-6 text-violet-100/55">
                    Выбери раздел, настрой пакет и оформи первую покупку в каталоге.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("catalog")}
                    className="mt-5 rounded-full border border-violet-300/20 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-100"
                  >
                    Перейти в каталог
                  </button>
                </SectionCard>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <SectionCard key={item.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-lg font-semibold text-white">{item.title}</div>
                            <div className="mt-2 text-sm text-violet-100/55">
                              {item.duration} • {item.quantity} шт. • {item.category}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-amber-300">
                            {formatPrice(item.total)}
                          </div>
                        </div>
                      </SectionCard>
                    ))}
                  </div>

                  <SectionCard>
                    <div className="flex items-center justify-between text-sm text-violet-100/60">
                      <span>Оформлено товаров</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xl font-semibold text-white">
                      <span>Общая сумма</span>
                      <span>{formatPrice(totalOrdersPrice)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        vibrate("light");
                        setCart([]);
                        setNotice("История заказов очищена.");
                      }}
                      className="mt-5 w-full rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-violet-100"
                    >
                      Очистить историю
                    </button>
                  </SectionCard>
                </>
              )}
            </div>
          )}

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
                <h2 className="mt-4 text-3xl font-semibold text-white">{user.first_name || "Пользователь YUKI"}</h2>
                <div className="mt-2 text-sm text-violet-100/55">@{user.username || "yuki_soft_user"}</div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/45">Баланс</div>
                    <div className="mt-2 text-xl font-semibold text-amber-300">{formatPrice(balance)}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/45">Заказов</div>
                    <div className="mt-2 text-xl font-semibold text-white">{cart.length}</div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <h3 className="text-2xl font-semibold text-white">Управление демо</h3>
                <p className="mt-3 text-sm leading-6 text-violet-100/55">
                  Чтобы мини-апп было удобно тестировать, я добавил демо-пополнение и быстрый сброс данных.
                </p>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleTopUp}
                    className="w-full rounded-[24px] bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-4 text-base font-semibold text-white shadow-[0_12px_36px_rgba(168,85,247,0.28)]"
                  >
                    Пополнить баланс +1 000 ₽
                  </button>
                  <button
                    type="button"
                    onClick={resetDemo}
                    className="w-full rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-violet-100"
                  >
                    Сбросить демо-данные
                  </button>
                </div>
              </SectionCard>

              <SectionCard>
                <h3 className="text-2xl font-semibold text-white">О мини-аппе</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Фиолетовая тема", "Telegram ready", "Bottom navigation", "Сохранение данных", "Мобильная верстка"].map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-violet-100/70">
                      {chip}
                    </span>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-md border-t border-white/10 bg-black/55 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    vibrate("light");
                    setActiveTab(item.id);
                  }}
                  className={`flex flex-col items-center justify-center rounded-[20px] px-3 py-3 text-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-b from-violet-500/25 to-indigo-500/15 text-amber-300"
                      : "text-violet-100/60"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="mt-1 text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {notice && (
          <div className="pointer-events-none fixed bottom-28 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-violet-300/20 bg-black/70 px-4 py-3 text-sm text-violet-50 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {notice}
          </div>
        )}
      </div>
    </div>
  );
}
