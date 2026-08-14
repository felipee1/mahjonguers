# Mahjonguers 🀄

A free, browser-based Mahjong point calculator and match manager with AI-powered tile recognition.

---

## 🎯 What is Mahjonguers?

Mahjonguers is a **free tool** designed to make Mahjong scoring simple and match management effortless. Whether you're playing casually with friends or in competitive tournaments, Mahjonguers helps you:

- **Calculate points instantly** - No more manual calculations or scoring disputes
- **Manage matches for free** - Track multiple games, players, and scores without any cost
- **Recognize tiles with AI** - Just take a picture of your hand and let the AI identify the tiles automatically

All processing happens **directly in your browser** - your data stays private, and the app works offline!

---

## ✨ Key Features

### 🧮 Point Calculator

- Instant point calculation for winning hands
- Support for all standard Riichi Mahjong scoring rules
- Automatic han and fu calculation
- Dora indicator tracking

### 📸 AI Tile Recognition

- **Take a photo** of your tiles and the AI identifies them automatically
- Deep learning model runs entirely in your browser
- No server uploads - your photos stay on your device
- Fast and accurate tile detection

### 🎮 Match Management

- Track scores for up to 4 players
- Automatic dealer rotation and wind assignment
- Round-by-round score tracking
- Match history to review past games

### 🎲 Interactive Wall Setup
- Animated 3D-like visualizer for building and breaking the Mahjong wall
- Automatic dead wall boundary calculations matching standard CCW-selection and CW-drawing rules
- Dynamic dealer assignment and dice-roll simulation

### 🎨 Modern & Accessible UI
- **Light & Dark Mode** support featuring the custom "Pineapple King" color palettes
- Mobile-responsive design for use at the table
- **Internationalization (i18n)** with full support for English and Portuguese (PT-BR)

### ☁️ Optional Cloud Sync

- **Play without an account** - everything works with local storage
- **Create a free account** to sync your matches across devices
- Your choice: stay anonymous or enable cloud backup

### 🌐 Works Everywhere

- No installation required - runs in any modern browser
- Works offline after first load
- Mobile-friendly interface
- Cross-platform compatibility

---

## 🚀 How to Use

1. **Open the App** - Visit [mahjonguers](https://felipee1.github.io/mahjonguers) or run locally with `npm run dev`
2. **Optional: if you have an account** - Click the Login button to enable cloud sync (or skip to use locally)
3. **Start a Match** - Enter player names and begin tracking your game
4. **Calculate Points** - Use the AI camera to scan tiles or manually select them
5. **Track Your Games** - All scores are automatically saved and organized

---

## 🏗️ Architecture

### AI Tile Recognition System

The tile recognition feature uses a custom-trained **YOLOv8** (You Only Look Once) object detection model:

1. **Model Training**: The YOLOv8 model was trained on a dataset of Mahjong tiles to detect 42 different tile classes
2. **ONNX Conversion**: The trained model was converted to ONNX (Open Neural Network Exchange) format for cross-platform compatibility
3. **Browser Inference**: ONNX Runtime Web runs the model directly in the browser using WebAssembly and WebGPU
4. **Logits to Probabilities**: Raw model outputs (logits) are processed into probability distributions for accurate classification
5. **Post-processing**: Non-Maximum Suppression (NMS) removes duplicate detections and overlapping bounding boxes

**Key Features:**

- 🚀 Real-time detection in the browser
- 🔒 Complete privacy - no server uploads
- 📱 Works on mobile and desktop
- ⚡ Hardware acceleration via WebGPU when available

### Data Storage Architecture

The app uses a **dual-storage strategy** for maximum flexibility:

- **LocalStorage** (Always): Immediate, offline-first storage for all users
- **Firestore** (Optional): Cloud sync when users are logged in
- **Automatic Sync**: Game state saves to both storage systems simultaneously
- **Fallback System**: If Firestore fails, localStorage ensures no data loss

---

## 🛠️ Technologies

- **React + TypeScript** - Modern, type-safe UI framework
- **Tailwind CSS** - Beautiful, responsive design
- **YOLOv8 + ONNX Runtime Web** - Custom-trained AI model for tile recognition
- **Firebase** - Optional authentication and cloud sync
- **Vite** - Lightning-fast development and builds
- **i18next** - Internationalization support
- **Graphify** - Codebase knowledge graph extraction

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🤝 Contributing

Mahjonguers is open source and we welcome contributions from the community!

### Contribution Method

To contribute to this project, please follow these standard steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/mahjonguers.git
   ```
3. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
4. **Make your changes** and test them locally using `npm run dev`.
5. **Update Graphify** (if you made code architecture changes) by running `graphify update .`.
6. **Commit your changes** with descriptive commit messages:
   ```bash
   git commit -m "feat: add awesome new feature"
   ```
7. **Push your branch** to your fork:
   ```bash
   git push origin feature/my-awesome-feature
   ```
8. **Open a Pull Request** against the main repository and describe your changes.

We welcome all types of contributions, including:
- 🐛 Bug reports and fixes
- 💡 Feature requests and implementations
- 🌐 Translations and i18n improvements
- 🎨 UI/UX enhancements and accessibility fixes
- 📖 Documentation improvements

---

## 📄 License

This project is open source and available for free use.

---

## 🎴 About Riichi Mahjong

Mahjonguers is designed for **Riichi Mahjong** (Japanese Mahjong), the most popular competitive variant worldwide. The scoring system follows standard Japanese rules with support for all common yaku and scoring patterns.

---

**Made with ❤️ for the Mahjong community**
