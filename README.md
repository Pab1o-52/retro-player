# 🎮 Retro Player Web

[![Deploy Status](https://img.shields.io/badge/Deploy-GitHub_Pages-success)](https://Pab1o-52.github.io/retro-player/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🇺🇸 English](#english) | [🇷🇺 Русский](#русский)

---

<a name="english"></a>
# 🇺🇸 Retro Player Web (English)

**Retro Player** is an open-source web emulator for classic gaming consoles (NES, SNES, Sega Mega Drive), built with React and TypeScript, powered by WebAssembly via [Nostalgist.js](https://github.com/retroarch-web/nostalgist.js) (RetroArch engine).

Play games straight from your browser, connect gamepads, enjoy responsive touch controls, or load your own ROMs!

🔥 **KEY FEATURE: You can play together with a friend! (Multiplayer P2P)** 🔥

🕹 **Play Now:** [https://Pab1o-52.github.io/retro-player/](https://Pab1o-52.github.io/retro-player/)

### ✨ Features
* **Built-in Archive.org Catalog:** Browse and play thousands of free PD/homebrew games directly from the cloud.
* **Supported Consoles:** Nintendo (NES / Dendy), Super Nintendo (SNES), Sega Mega Drive / Genesis.
* **🔥 Multiplayer (Netplay P2P):** **Play 2-player games online with a friend!** Just click "Invite Friend", send them the link, and their game will automatically sync with yours using WebRTC!
* **Mobile Friendly (PWA-ready):** Advanced touch controls with analog sticks and classic D-Pads, customizable button layouts (drag and drop!), and haptic feedback.
* **Save States:** Save and load your game progress anytime using IndexedDB.
* **Keyboard & Gamepad Support:** Fully map your keyboard keys and connect USB/Bluetooth controllers.

---

<a name="русский"></a>
# 🇷🇺 Retro Player Web (Русский)

**Retro Player** — это открытый веб-эмулятор классических ретро-консолей (NES, SNES, Sega Mega Drive), написанный на React и TypeScript с использованием WebAssembly-ядра [Nostalgist.js](https://github.com/retroarch-web/nostalgist.js) (RetroArch). 

Играйте прямо в браузере, подключайте геймпады, настраивайте сенсорное управление или загружайте свои собственные ромы!

🔥 **ОСОБЕННОСТЬ: Можно играть вдвоем по сети с другом! (Мультиплеер P2P)** 🔥

🕹 **Играть сейчас:** [https://Pab1o-52.github.io/retro-player/](https://Pab1o-52.github.io/retro-player/)

### ✨ Главные возможности

* **Встроенный каталог Archive.org:** 
  * Загружайте тысячи бесплатных игр (PD / Homebrew) прямо из облака.
* **Поддерживаемые консоли:** 
  * Nintendo (NES / Dendy)
  * Super Nintendo (SNES)
  * Sega Mega Drive / Genesis
* **🔥 Сетевая игра (Netplay P2P):** 
  * **Можно играть вдвоем по сети!** Нажмите "Пригласить друга", отправьте ему ссылку, и игра автоматически синхронизируется через WebRTC! Работает даже с вашими собственными загруженными файлами.
* **Идеально для смартфонов (PWA-ready):**
  * Два типа крестовины (Аналоговый стик и Классический D-pad).
  * **Кастомизация управления:** перетаскивайте кнопки пальцем по экрану и меняйте их размер.
  * Виброотклик (Haptic Feedback).
* **Сохранения (Save States):** 
  * Сохраняйте и загружайте игру в любой момент (IndexedDB).
* **Поддержка клавиатуры и геймпадов:** 
  * Переназначение клавиш и поддержка настоящих Bluetooth-геймпадов.

## 💻 Разработка / Development

* **Frontend:** React 18, TypeScript, Vite
* **UI/Styles:** Tailwind CSS
* **State Management:** Zustand
* **Storage:** LocalForage (IndexedDB)
* **Emulator Core:** Nostalgist.js (`fceumm`, `snes9x`, `genesis_plus_gx`)
* **Multiplayer:** PeerJS (WebRTC)

### Запуск локально / Run Locally

1. Clone repo:
   ```bash
   git clone https://github.com/Pab1o-52/retro-player.git
   cd retro-player
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

> ⚠️ **Note:** To play with friends (Netplay) or use gamepads, the site must be served over a secure context (HTTPS) or `localhost`.
