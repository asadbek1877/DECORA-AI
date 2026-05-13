import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type Language = 'uz' | 'ru' | 'en' | 'jp';

export const LANGUAGE_FLAGS: Record<Language, string> = {
  uz: '🇺🇿',
  ru: '🇷🇺',
  en: '🇬🇧',
  jp: '🇯🇵',
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  uz: "O'zbek",
  ru: 'Русский',
  en: 'English',
  jp: '日本語',
};

export interface Translations {
  // Nav
  home: string;
  create: string;
  gallery: string;
  profile: string;
  back: string;
  menu: string;
  settings: string;

  // Home screen
  featured: string;
  newLabel: string;
  selectStyle: string;
  viewAll: string;
  rooms: string;
  designPrompts: string;
  addDetails: string;
  generateDesign: string;

  // Style Picker
  chooseAtmosphere: string;
  stylesCount: string;
  customInstructions: string;
  selectStyles: string;
  generating: string;
  generate: string;
  creditsLeft: string;
  selectStylesFirst: string;
  notEnoughCredits: string;

  // Upload / Create
  createDesign: string;
  originalSpace: string;
  yourPhoto: string;
  selectAesthetic: string;
  stylePreview: string;
  customDirectives: string;
  addSpecificDetails: string;
  generateVariations: string;
  highResRender: string;
  chooseRoom: string;

  // Gallery
  myGallery: string;
  searchCreations: string;
  all: string;
  original: string;
  styled: string;

  // Result
  yourNewSpace: string;
  style: string;
  downloadImage: string;
  regenerate: string;
  share: string;
  happyWithResult: string;
  registerDescription: string;
  registerNow: string;

  // Settings / Profile
  accountInfo: string;
  manageProfile: string;
  appSettings: string;
  preferences: string;
  helpSupport: string;
  faqsContact: string;
  highResolution: string;
  notifications: string;
  signOut: string;
  creditBalance: string;
  upgrade: string;
  currentUsage: string;
  used: string;
  credits: string;

  // Account Info Page
  personalInfo: string;
  fullName: string;
  email: string;
  phone: string;
  membership: string;
  joinDate: string;
  memberSince: string;
  premiumMember: string;
  freeMember: string;
  accountStats: string;
  designsGenerated: string;
  favorites: string;
  downloads: string;
  editProfile: string;

  // App Settings Page
  appearance: string;
  darkMode: string;
  language: string;
  general: string;
  autoSave: string;
  autoSaveDesc: string;
  notificationsDesc: string;
  highResDesc: string;
  dataAndStorage: string;
  clearCache: string;
  clearCacheDesc: string;
  cacheCleared: string;
  appVersion: string;

  // AI Modal
  aiAssistant: string;
  analyze: string;
  prompt: string;
  styles: string;
  chat: string;
  model: string;

  // Common
  copy: string;
  copied: string;
  cancel: string;
  confirm: string;
  save: string;
  delete: string;
  takePhoto: string;
  admin: string;
  nameOptional: string;
  yourGenerations: string;
  filter: string;
  filterByStyle: string;

  // Home Screen
  transformYourSpace: string;
  heroSubtitle: string;
  howItWorks: string;
  howItWorksDesc1: string;
  howItWorksDesc2: string;

  // Camera Screen
  uploadPhoto: string;
  useDeviceCamera: string;
  chooseFromGallery: string;

  // Browse Samples Screen
  browseSamples: string;
  browseDemoRooms: string;
  selectRoom: string;
  chooseRoomToDesign: string;
  preview: string;
  beforeDesign: string;
  viewDesignVariations: string;
  useThisRoom: string;
  useThisStyle: string;
  backToRooms: string;
  copyPrompt: string;
}

export const translations: Record<Language, Translations> = {
  uz: {
    home: "Asosiy",
    create: "Yaratish",
    gallery: "Galereya",
    profile: "Profil",
    back: "Orqaga",
    menu: "Menyu",
    settings: "Sozlamalar",
    featured: "TANLANGAN",
    newLabel: "YANGI",
    selectStyle: "Stilni tanlang",
    viewAll: "Hammasini ko'rish",
    rooms: "Xonalar",
    designPrompts: "Dizayn ko'rsatmalari",
    addDetails: "Tafsilotlarni qo'shing... (masalan, baxmal divan va iliq yoritish)",
    generateDesign: "Dizayn yaratish",
    chooseAtmosphere: "Atmosferangizni\ntanlang",
    stylesCount: "Tanlov uchun 10 ta stil",
    customInstructions: "Ko'rsatmalar kiriting...",
    selectStyles: "Stillarni tanlang (4 tagacha)",
    generating: "Generatsiya...",
    generate: "Generatsiya qilish",
    creditsLeft: "kredit qoldi",
    selectStylesFirst: "Kamida 1 ta stil tanlang",
    notEnoughCredits: "Kredit yetarli emas",
    createDesign: "Dizayn yaratish",
    originalSpace: "Original makon",
    yourPhoto: "Sizning rasmingiz",
    selectAesthetic: "Estetikani tanlang",
    stylePreview: "STIL KO'RINISHI",
    customDirectives: "Maxsus ko'rsatmalar",
    addSpecificDetails: "Aniq tafsilotlarni qo'shing (masalan, ko'k baxmal divan)...",
    generateVariations: "4 ta variant yaratish",
    highResRender: "Yuqori sifatli render",
    chooseRoom: "Xonani tanlang",
    myGallery: "Galereya",
    searchCreations: "Ishlaringizni qidiring...",
    all: "Hammasi",
    original: "Original",
    styled: "Stilizatsiya",
    yourNewSpace: "Yangi makoningiz",
    style: "STIL",
    downloadImage: "⬇ Rasmni yuklash",
    regenerate: "🔄 Qaytadan",
    share: "📤 Ulashish",
    happyWithResult: "Natija yoqdimi?",
    registerDescription: "Ro'yxatdan o'ting va cheksiz dizaynlar yarating.",
    registerNow: "Ro'yxatdan o'tish",
    accountInfo: "Hisob ma'lumotlari",
    manageProfile: "Profilingizni boshqaring",
    appSettings: "Ilova sozlamalari",
    preferences: "Afzalliklar",
    helpSupport: "Yordam va qo'llab-quvvatlash",
    faqsContact: "Savol-javoblar va aloqa",
    highResolution: "Yuqori sifat",
    notifications: "Bildirishnomalar",
    signOut: "Chiqish",
    creditBalance: "KREDIT BALANSI",
    upgrade: "Yangilash",
    currentUsage: "Joriy foydalanish",
    used: "Ishlatilgan",
    credits: "Kreditlar",
    personalInfo: "Shaxsiy ma'lumotlar",
    fullName: "To'liq ism",
    email: "Elektron pochta",
    phone: "Telefon",
    membership: "A'zolik",
    joinDate: "Qo'shilgan sana",
    memberSince: "A'zolik boshlanishi",
    premiumMember: "Premium a'zo",
    freeMember: "Bepul a'zo",
    accountStats: "Hisob statistikasi",
    designsGenerated: "Yaratilgan dizaynlar",
    favorites: "Sevimlilar",
    downloads: "Yuklanmalar",
    editProfile: "Profilni tahrirlash",
    appearance: "Ko'rinish",
    darkMode: "Qorong'u rejim",
    language: "Til",
    general: "Umumiy",
    autoSave: "Avtomatik saqlash",
    autoSaveDesc: "Dizaynlarni avtomatik saqlash",
    notificationsDesc: "Push-bildirishnomalar",
    highResDesc: "Yuqori sifatli tasvirlar",
    dataAndStorage: "Ma'lumotlar va xotira",
    clearCache: "Keshni tozalash",
    clearCacheDesc: "Vaqtinchalik fayllarni o'chirish",
    cacheCleared: "Kesh tozalandi!",
    appVersion: "Ilova versiyasi",
    aiAssistant: "AI Yordamchi",
    analyze: "Tahlil",
    prompt: "Prompt",
    styles: "Stillar",
    chat: "Suhbat",
    model: "Model",
    copy: "Nusxa",
    copied: "Nusxalandi!",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    save: "Saqlash",
    delete: "O'chirish",
    takePhoto: "Suratga olish",
    admin: "Admin",    
    nameOptional: "Ism (Ixtiyoriy)",
    yourGenerations: "Sizning generatsiyalaringiz",
    filter: "Filtr",
    filterByStyle: "Stil bo'yicha filtr",
    transformYourSpace: "Sizning makoningizni o'zgartiring",
    heroSubtitle: "AI mexanizmini ko'ring. Pastga suring va oldin-keyin solishtiring.",
    howItWorks: "Qanday ishlaydi?",
    howItWorksDesc1: "Decora AI ilg'or suni intellektdan foydalanib sizning ichki makonlarini qayta dizayni qiladi. Shunchaki bo'sh yoki eski xonangizning rasmini yuklang, o'zingiz yoqtiradigan me'moriy stilni tanlang, va bizning AI siz xoxlagan yangi dizayni qilgan xonaning fotorealistik renderini bir necha soniya ichida yaratadi.",
    howItWorksDesc2: "Har bir generatsiya maxsus va sizning xonangiz uchun optimallashtirilgan.",
    uploadPhoto: "Rasmni yuklang",
    useDeviceCamera: "Qurilmaning kamerasidan foydalaning",
    chooseFromGallery: "Kutubxonadan tanlang",
    browseSamples: "Namuna ko'ring",
    browseDemoRooms: "Tayyor xonalarni ko'ring",
    selectRoom: "Xonani tanlang",
    chooseRoomToDesign: "Dizayn qilish uchun xonani tanlang",
    preview: "Ko'rib chiqish",
    beforeDesign: "Oldin",
    viewDesignVariations: "Dizayn variantlarini ko'ring",
    useThisRoom: "Bu xonani ishlatish",
    useThisStyle: "Bu stilni ishlatish",
    backToRooms: "Xonalarga qaytarish",
    copyPrompt: "Dizayn promptini nusxalash",
  },
  ru: {
    home: "Главная",
    create: "Создать",
    gallery: "Галерея",
    profile: "Профиль",
    back: "Назад",
    menu: "Меню",
    settings: "Настройки",
    featured: "ИЗБРАННОЕ",
    newLabel: "НОВОЕ",
    selectStyle: "Выберите стиль",
    viewAll: "Смотреть все",
    rooms: "Комнаты",
    designPrompts: "Описание дизайна",
    addDetails: "Добавьте детали... (например, бархатный диван и тёплое освещение)",
    generateDesign: "Создать дизайн",
    chooseAtmosphere: "Выберите\nатмосферу",
    stylesCount: "10 стилей на выбор",
    customInstructions: "Введите инструкции...",
    selectStyles: "Выберите стили (до 4)",
    generating: "Генерация...",
    generate: "Генерировать",
    creditsLeft: "кредитов",
    selectStylesFirst: "Выберите хотя бы 1 стиль",
    notEnoughCredits: "Недостаточно кредитов",
    createDesign: "Создать дизайн",
    originalSpace: "Оригинальное пространство",
    yourPhoto: "Ваше фото",
    selectAesthetic: "Выберите эстетику",
    stylePreview: "ПРЕДПРОСМОТР СТИЛЯ",
    customDirectives: "Пользовательские указания",
    addSpecificDetails: "Добавьте детали (например, тёмно-синий бархатный диван)...",
    generateVariations: "Создать 4 варианта",
    highResRender: "Рендер в высоком разрешении",
    chooseRoom: "Выберите комнату",
    myGallery: "Моя галерея",
    searchCreations: "Поиск ваших работ...",
    all: "Все",
    original: "Оригинал",
    styled: "Стилизация",
    yourNewSpace: "Ваше новое пространство",
    style: "СТИЛЬ",
    downloadImage: "⬇ Скачать",
    regenerate: "🔄 Заново",
    share: "📤 Поделиться",
    happyWithResult: "Довольны результатом?",
    registerDescription: "Зарегистрируйтесь и создавайте неограниченные дизайны.",
    registerNow: "Зарегистрироваться",
    accountInfo: "Информация об аккаунте",
    manageProfile: "Управление профилем",
    appSettings: "Настройки приложения",
    preferences: "Предпочтения",
    helpSupport: "Помощь и поддержка",
    faqsContact: "FAQ и контакты",
    highResolution: "Высокое разрешение",
    notifications: "Уведомления",
    signOut: "Выйти",
    creditBalance: "БАЛАНС КРЕДИТОВ",
    upgrade: "Улучшить",
    currentUsage: "Текущее использование",
    used: "Использовано",
    credits: "Кредиты",
    personalInfo: "Личная информация",
    fullName: "Полное имя",
    email: "Электронная почта",
    phone: "Телефон",
    membership: "Подписка",
    joinDate: "Дата регистрации",
    memberSince: "Участник с",
    premiumMember: "Премиум подписка",
    freeMember: "Бесплатная подписка",
    accountStats: "Статистика аккаунта",
    designsGenerated: "Создано дизайнов",
    favorites: "Избранные",
    downloads: "Загрузки",
    editProfile: "Редактировать профиль",
    appearance: "Внешний вид",
    darkMode: "Тёмная тема",
    language: "Язык",
    general: "Общие",
    autoSave: "Автосохранение",
    autoSaveDesc: "Автоматически сохранять дизайны",
    notificationsDesc: "Push-уведомления",
    highResDesc: "Изображения высокого качества",
    dataAndStorage: "Данные и хранилище",
    clearCache: "Очистить кеш",
    clearCacheDesc: "Удалить временные файлы",
    cacheCleared: "Кеш очищен!",
    appVersion: "Версия приложения",
    aiAssistant: "ИИ Помощник",
    analyze: "Анализ",
    prompt: "Промпт",
    styles: "Стили",
    chat: "Чат",
    model: "Модель",
    copy: "Копировать",
    copied: "Скопировано!",
    cancel: "Отмена",
    confirm: "Подтвердить",
    save: "Сохранить",
    delete: "Удалить",
    takePhoto: "Сфотографировать",
    admin: "Админ",
    nameOptional: "Имя (Необязательно)",
    yourGenerations: "Ваши генерации",
    filter: "Фильтр",
    filterByStyle: "Фильтр по стилю",
    transformYourSpace: "Трансформируйте ваше пространство",
    heroSubtitle: "Увидьте магию ИИ. Проведите пальцем, чтобы сравнить до и после.",
    howItWorks: "Как это работает?",
    howItWorksDesc1: "Decora AI использует передовой искусственный интеллект для переделки ваших внутренних пространств. Просто загрузите фото своей пустой или старой комнаты, выберите предпочитаемый архитектурный стиль, и наш ИИ создаст фотореалистичный рендер вашего новоразработанного пространства за несколько секунд.",
    howItWorksDesc2: "Каждая генерация уникальна и оптимизирована для вашей комнаты.",
    uploadPhoto: "Загрузить фото",
    useDeviceCamera: "Использовать камеру устройства",
    chooseFromGallery: "Выбрать из галереи",
    browseSamples: "Просмотр примеров",
    browseDemoRooms: "Просмотр готовых комнат",
    selectRoom: "Выберите комнату",
    chooseRoomToDesign: "Выберите комнату для дизайна",
    preview: "Предпросмотр",
    beforeDesign: "До",
    viewDesignVariations: "Просмотр вариантов дизайна",
    useThisRoom: "Использовать эту комнату",
    useThisStyle: "Использовать этот стиль",
    backToRooms: "Вернуться к комнатам",
    copyPrompt: "Скопировать промпт дизайна",
  },
  en: {
    home: "Home",
    create: "Create",
    gallery: "Gallery",
    profile: "Profile",
    back: "Back",
    menu: "Menu",
    settings: "Settings",
    featured: "FEATURED",
    newLabel: "NEW",
    selectStyle: "Select Style",
    viewAll: "View all",
    rooms: "Rooms",
    designPrompts: "Design Prompts",
    addDetails: "Add details... (e.g., Add a velvet sofa and warm ambient lighting)",
    generateDesign: "Generate Design",
    chooseAtmosphere: "Choose your\nAtmosphere",
    stylesCount: "10 curated styles",
    customInstructions: "Enter instructions...",
    selectStyles: "Select styles (up to 4)",
    generating: "Generating...",
    generate: "Generate",
    creditsLeft: "credits left",
    selectStylesFirst: "Select at least 1 style",
    notEnoughCredits: "Not enough credits",
    createDesign: "Create Design",
    originalSpace: "Original Space",
    yourPhoto: "Your Photo",
    selectAesthetic: "Select Aesthetic",
    stylePreview: "STYLE PREVIEW",
    customDirectives: "Custom Directives",
    addSpecificDetails: "Add specific details (e.g., Add a velvet navy sofa)...",
    generateVariations: "Generate 4 Variations",
    highResRender: "High resolution render",
    chooseRoom: "Choose Room",
    myGallery: "My Gallery",
    searchCreations: "Search your creations...",
    all: "All",
    original: "Original",
    styled: "Styled",
    yourNewSpace: "Your New Space",
    style: "STYLE",
    downloadImage: "⬇ Download Image",
    regenerate: "🔄 Re-generate",
    share: "📤 Share",
    happyWithResult: "Happy with the result?",
    registerDescription: "Register and upload your own photos to generate unlimited designs.",
    registerNow: "Register Now",
    accountInfo: "Account Info",
    manageProfile: "Manage your profile",
    appSettings: "App Settings",
    preferences: "Preferences",
    helpSupport: "Help & Support",
    faqsContact: "FAQs and contact",
    highResolution: "High Resolution",
    notifications: "Notifications",
    signOut: "Sign Out",
    creditBalance: "CREDIT BALANCE",
    upgrade: "Upgrade",
    currentUsage: "Current Usage",
    used: "Used",
    credits: "Credits",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    membership: "Membership",
    joinDate: "Join Date",
    memberSince: "Member Since",
    premiumMember: "Premium Member",
    freeMember: "Free Member",
    accountStats: "Account Statistics",
    designsGenerated: "Designs Generated",
    favorites: "Favorites",
    downloads: "Downloads",
    editProfile: "Edit Profile",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    general: "General",
    autoSave: "Auto-Save",
    autoSaveDesc: "Automatically save designs",
    notificationsDesc: "Push notifications",
    highResDesc: "High quality images",
    dataAndStorage: "Data & Storage",
    clearCache: "Clear Cache",
    clearCacheDesc: "Remove temporary files",
    cacheCleared: "Cache cleared!",
    appVersion: "App Version",
    aiAssistant: "AI Assistant",
    analyze: "Analyze",
    prompt: "Prompt",
    styles: "Styles",
    chat: "Chat",
    model: "Model",
    copy: "Copy",
    copied: "Copied!",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    takePhoto: "Take Photo",
    admin: "Admin",
    nameOptional: "Name (Optional)",
    yourGenerations: "Your Generations",
    filter: "Filter",
    filterByStyle: "Filter by Style",
    transformYourSpace: "Transform Your Space",
    heroSubtitle: "See the magic of AI. Swipe to compare before and after.",
    howItWorks: "How it works?",
    howItWorksDesc1: "Decora AI uses advanced artificial intelligence to redesign your interior spaces. Simply upload a photo of your empty or old room, select your preferred architectural style, and our AI will generate a photorealistic render of your newly designed space within seconds.",
    howItWorksDesc2: "Each generation is unique and optimized for your room.",
    uploadPhoto: "Upload Photo",
    useDeviceCamera: "Use device camera",
    chooseFromGallery: "Choose from gallery",
    browseSamples: "Browse Samples",
    browseDemoRooms: "View ready-made rooms",
    selectRoom: "Select a Room",
    chooseRoomToDesign: "Choose a room to start designing",
    preview: "Preview",
    beforeDesign: "Before",
    viewDesignVariations: "View Design Variations",
    useThisRoom: "Use This Room",
    useThisStyle: "Use This Style",
    backToRooms: "Back to Rooms",
    copyPrompt: "Copy Design Prompt",
  },
  jp: {
    home: "ホーム",
    create: "作成",
    gallery: "ギャラリー",
    profile: "プロフィール",
    back: "戻る",
    menu: "メニュー",
    settings: "設定",
    featured: "注目",
    newLabel: "新着",
    selectStyle: "スタイルを選択",
    viewAll: "すべて見る",
    rooms: "部屋",
    designPrompts: "デザインプロンプト",
    addDetails: "詳細を追加... (例: ベルベットソファと暖かい照明)",
    generateDesign: "デザイン生成",
    chooseAtmosphere: "雰囲気を\n選んでください",
    stylesCount: "10種類のスタイル",
    customInstructions: "指示を入力...",
    selectStyles: "スタイルを選択（最大4つ）",
    generating: "生成中...",
    generate: "生成する",
    creditsLeft: "クレジット残り",
    selectStylesFirst: "スタイルを1つ以上選択",
    notEnoughCredits: "クレジット不足",
    createDesign: "デザイン作成",
    originalSpace: "オリジナル空間",
    yourPhoto: "あなたの写真",
    selectAesthetic: "美学を選択",
    stylePreview: "スタイルプレビュー",
    customDirectives: "カスタム指示",
    addSpecificDetails: "詳細を追加（例：ネイビーベルベットソファ）...",
    generateVariations: "4つのバリエーション生成",
    highResRender: "高解像度レンダリング",
    chooseRoom: "部屋を選択",
    myGallery: "マイギャラリー",
    searchCreations: "作品を検索...",
    all: "すべて",
    original: "オリジナル",
    styled: "スタイル済み",
    yourNewSpace: "新しい空間",
    style: "スタイル",
    downloadImage: "⬇ 画像をダウンロード",
    regenerate: "🔄 再生成",
    share: "📤 共有",
    happyWithResult: "結果にご満足ですか？",
    registerDescription: "登録して、無制限にデザインを作成しましょう。",
    registerNow: "今すぐ登録",
    accountInfo: "アカウント情報",
    manageProfile: "プロフィール管理",
    appSettings: "アプリ設定",
    preferences: "環境設定",
    helpSupport: "ヘルプ＆サポート",
    faqsContact: "FAQ・お問い合わせ",
    highResolution: "高解像度",
    notifications: "通知",
    signOut: "ログアウト",
    creditBalance: "クレジット残高",
    upgrade: "アップグレード",
    currentUsage: "現在の使用量",
    used: "使用済み",
    credits: "クレジット",
    personalInfo: "個人情報",
    fullName: "フルネーム",
    email: "メールアドレス",
    phone: "電話番号",
    membership: "メンバーシップ",
    joinDate: "登録日",
    memberSince: "会員登録",
    premiumMember: "プレミアム会員",
    freeMember: "無料会員",
    accountStats: "アカウント統計",
    designsGenerated: "生成されたデザイン",
    favorites: "お気に入り",
    downloads: "ダウンロード",
    editProfile: "プロフィール編集",
    appearance: "外観",
    darkMode: "ダークモード",
    language: "言語",
    general: "一般",
    autoSave: "自動保存",
    autoSaveDesc: "デザインを自動保存",
    notificationsDesc: "プッシュ通知",
    highResDesc: "高品質画像",
    dataAndStorage: "データとストレージ",
    clearCache: "キャッシュを削除",
    clearCacheDesc: "一時ファイルを削除",
    cacheCleared: "キャッシュを削除しました！",
    appVersion: "アプリバージョン",
    aiAssistant: "AIアシスタント",
    analyze: "分析",
    prompt: "プロンプト",
    styles: "スタイル",
    chat: "チャット",
    model: "モデル",
    copy: "コピー",
    copied: "コピー済み!",
    cancel: "キャンセル",
    confirm: "確認",
    save: "保存",
    delete: "削除",
    takePhoto: "写真を撮る",
    admin: "管理者",
    nameOptional: "名前（オプション）",
    yourGenerations: "あなたの生成",
    filter: "フィルター",
    filterByStyle: "スタイル別フィルター",
    transformYourSpace: "あなたのスペースを変換する",
    heroSubtitle: "AIの魔法を見てください。スワイプして前後を比較してください。",
    howItWorks: "どのように機能しますか？",
    howItWorksDesc1: "Decora AIは高度な人工知能を使用して、インテリアスペースを再設計します。空いている、または古い部屋の写真をアップロードし、好みの建築スタイルを選択すると、AIが数秒以内に新しく設計されたスペースの光写実的なレンダリングを生成します。",
    howItWorksDesc2: "各生成はユニークで、あなたの部屋に最適化されています。",
    uploadPhoto: "写真をアップロード",
    useDeviceCamera: "デバイスカメラを使用",
    chooseFromGallery: "ギャラリーから選択",
    browseSamples: "サンプルを見る",
    browseDemoRooms: "デモルームを見る",
    selectRoom: "部屋を選択",
    chooseRoomToDesign: "デザインする部屋を選択",
    preview: "プレビュー",
    beforeDesign: "前",
    viewDesignVariations: "デザイン変更を表示",
    useThisRoom: "この部屋を使用",
    useThisStyle: "このスタイルを使用",
    backToRooms: "部屋に戻る",
    copyPrompt: "デザインプロンプトをコピー",
  },
};

const LANG_KEY = 'app_language';

interface LanguageState {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'uz',
  t: translations['uz'],
  setLanguage: (lang) => {
    SecureStore.setItemAsync(LANG_KEY, lang).catch(() => {});
    set({ lang, t: translations[lang] });
  },
  loadLanguage: async () => {
    try {
      const stored = await SecureStore.getItemAsync(LANG_KEY);
      if (stored && (stored === 'uz' || stored === 'ru' || stored === 'en' || stored === 'jp')) {
        set({ lang: stored as Language, t: translations[stored as Language] });
      }
    } catch {
      // Ignore
    }
  },
}));
