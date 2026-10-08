export const translations = {
  ru: {
    catalog_title: "Топ 100 игр",
    catalog_tab_all: "Все",
    catalog_tab_nes: "Денди",
    catalog_tab_sega: "Сега",
    catalog_tab_snes: "Нинтендо",
    btn_play: "ИГРАТЬ",
    btn_download: "СКАЧАТЬ",
    btn_downloading: "Загрузка...",
    btn_archive: "Archive.org",
    error_download: "Ошибка при загрузке игры. Возможно файл недоступен из-за CORS политик.",
    
    archive_title: "Archive.org Каталог",
    archive_search: "Поиск игр...",
    archive_error: "Ошибка загрузки. Возможно файл недоступен из-за CORS или заблокирован.",
    archive_show_more: "Показать еще...",
    archive_empty: "Ничего не найдено",

    player_settings: "Настройки",
    player_resume: "Продолжить",
    player_reset: "Сброс игры",
    player_exit: "Выход в меню",
    player_confirm_exit: "Вы уверены, что хотите выйти? Несохраненный прогресс будет утерян.",
    
    settings_joystick_type: "Тип джойстика",
    settings_joystick_analog: "Плавающий 'аналоговый' 3D-джойстик (тап и тяни)",
    settings_joystick_dpad: "Крестовина (классика)",
    settings_button_layout: "Расположение кнопок",
    settings_layout_scheme: "Схема",
    settings_scale: "Размер крестовины/стика",
    settings_edit_layout: "Настроить кнопки на экране",
    settings_edit_done: "Готово",
    settings_reset_layout: "Сбросить расположение",
    
    saves_title: "Сохранения",
    saves_empty_slot: "Пустой слот",
    saves_no_saves: "Нет сохранений",
    btn_save: "Сохранить",
    btn_load: "Загрузить",
    
    netplay_title: "Сетевая игра",
    netplay_host: "Создать сервер (Хост)",
    netplay_join: "Подключиться к серверу",
    netplay_room_id: "ID комнаты",
    netplay_disconnect: "Отключиться от сервера",
    netplay_waiting: "Ожидание подключения...",
    netplay_connected: "Подключено!",
  },
  en: {
    catalog_title: "Top 100 Games",
    catalog_tab_all: "All",
    catalog_tab_nes: "NES",
    catalog_tab_sega: "SEGA",
    catalog_tab_snes: "SNES",
    btn_play: "PLAY",
    btn_download: "DOWNLOAD",
    btn_downloading: "Downloading...",
    btn_archive: "Archive.org",
    error_download: "Download error. File might be unavailable due to CORS policies.",
    
    archive_title: "Archive.org Catalog",
    archive_search: "Search games...",
    archive_error: "Download error. File might be unavailable or blocked.",
    archive_show_more: "Show more...",
    archive_empty: "No results found",

    player_settings: "Settings",
    player_resume: "Resume",
    player_reset: "Reset Game",
    player_exit: "Exit to Menu",
    player_confirm_exit: "Are you sure you want to exit? Unsaved progress will be lost.",
    
    settings_joystick_type: "Joystick Type",
    settings_joystick_analog: "Floating 'Analog' 3D Joystick (tap & drag)",
    settings_joystick_dpad: "D-Pad (Classic)",
    settings_button_layout: "Button Layout",
    settings_layout_scheme: "Scheme",
    settings_scale: "Joystick / D-Pad Scale",
    settings_edit_layout: "Customize on-screen controls",
    settings_edit_done: "Done",
    settings_reset_layout: "Reset Layout",
    
    saves_title: "Save States",
    saves_empty_slot: "Empty slot",
    saves_no_saves: "No saves",
    btn_save: "Save",
    btn_load: "Load",
    
    netplay_title: "Netplay",
    netplay_host: "Host Server",
    netplay_join: "Join Server",
    netplay_room_id: "Room ID",
    netplay_disconnect: "Disconnect",
    netplay_waiting: "Waiting for peer...",
    netplay_connected: "Connected!",
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ru;

export function getBrowserLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ru') || lang.startsWith('uk') || lang.startsWith('be') || lang.startsWith('kk')) {
    return 'ru';
  }
  return 'en';
}

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations['en'][key] || key;
}
