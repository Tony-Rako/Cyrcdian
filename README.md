# Cyrcdian - Circadian Rhythm Health App

**Optimize your sleep and unlock daily potential through circadian rhythm alignment**

Cyrcdian is a science-backed Progressive Web App (PWA) that harnesses the natural power of your circadian rhythm to give you the energy you need for every busy day. By aligning with your body's natural sleep cycles and the sun's natural light patterns, Cyrcdian helps you unleash your potential and maintain the energy to work on yourself and achieve your goals.

## 🌟 Why Circadian Rhythm Matters for Your Health

Your circadian rhythm is your body's internal clock that regulates sleep, energy, and countless biological processes. When optimized:

- 🚀 **Boost Daily Energy**: Wake up naturally refreshed and maintain consistent energy throughout the day
- 💪 **Enhance Performance**: Better sleep cycles mean improved cognitive function, focus, and productivity
- 🎯 **Unlock Your Potential**: With proper rest, you have the mental and physical energy to pursue personal growth
- ⚡ **Sustain Busy Lifestyles**: Optimized sleep helps you keep up with demanding schedules without burning out
- 🧠 **Improve Overall Health**: Better sleep supports immune function, metabolism, and mental well-being

## ✨ Key Features

### 🕐 Smart Sleep Calculator

- Calculate optimal bedtimes based on 90-minute sleep cycles
- Get personalized recommendations aligned with sunrise/sunset times
- Avoid waking up during deep sleep phases
- Choose from 3-6 sleep cycles (4.5-9 hours) based on your needs

### 📱 Automatic Sleep Tracking

- **Intelligent wake detection** using screen activity monitoring
- Automatically tracks when you go to sleep and wake up
- No manual logging required - the app learns your patterns
- Track sleep duration and cycle completion

### 🌅 Circadian Rhythm Optimization

- **Sun-based scheduling** aligned with your location's sunrise/sunset
- Real-time sun phase tracking (dawn, day, dusk, night)
- Science-based recommendations using natural light patterns
- Location-aware calculations for optimal sleep timing

### ⏰ Smart Alarm System

- **Bedtime reminders** 30 minutes before optimal sleep time
- **Wake-up alarms** timed to avoid deep sleep phases
- Browser-based notifications with iOS Clock app integration
- Customizable alarm settings and snooze options

### ⚡ Energy Tracking & Optimization

- **Real-time energy level** monitoring based on circadian rhythm
- **24-hour energy timeline** with peak and low predictions
- **Sleep debt tracking** with battery-style visualization
- **Circadian phase awareness** with activity recommendations
- **Smart insights** for energy optimization and recovery
- **Personalized bedtime countdown** for optimal energy balance

### 📊 Sleep Analytics & History

- **Weekly sleep charts** showing duration patterns
- **Consistency scoring** to track sleep regularity
- **Quality ratings** for subjective sleep assessment
- **Long-term trends** to optimize your sleep schedule

### 💜 Beautiful, Modern Interface

- **Purple gradient theme** designed for evening use
- **Smooth animations** powered by Framer Motion
- **Mobile-first design** optimized for all devices
- **Dark theme** to reduce blue light exposure

## 🚀 Getting Started

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/Tony-Rako/Cyrcdian.git
cd Cyrcdian
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the development server**:

```bash
npm run dev
```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### PWA Installation

**On Mobile (iOS/Android):**

1. Open Cyrcdian in your mobile browser
2. Tap the browser menu (Safari: Share button, Chrome: 3-dots menu)
3. Select "Add to Home Screen"
4. Tap "Add" to install the PWA

**On Desktop:**

1. Look for the install icon in your browser's address bar
2. Click to install Cyrcdian as a desktop app
3. Access from your applications menu

## 📱 How to Use

### 1. Set Your Wake Time (Calculate Tab)

- Open the main dashboard
- Set your desired wake time using the time picker
- The app calculates optimal bedtimes automatically

### 2. Choose Your Bedtime

- Review the recommended bedtime options
- Each shows sleep duration, cycle count, and quality rating
- Tap "Alarm" to set automatic reminders

### 3. Monitor Your Energy (Energy Tab)

- View real-time energy levels based on your circadian rhythm
- Check your sleep debt and recovery timeline
- Get personalized recommendations for optimal daily activities
- See 24-hour energy predictions to plan your day

### 4. Track Your Sleep (Tracking Tab)

- Leave your device nearby while sleeping
- The app detects when you go to sleep and wake up automatically
- Manually log sleep sessions when needed
- View recent sleep sessions and quality metrics

### 5. Analyze Your Patterns (History Tab)

- Check weekly sleep charts for duration patterns
- Review your sleep consistency and average duration
- Monitor long-term trends to optimize your schedule
- Track quality ratings over time

### 6. Manage Your Alarms (Alarms Tab)

- Visit the Alarms page to manage notifications
- Enable bedtime reminders and wake-up alarms
- Test notifications to ensure they work properly
- Set up quick default schedules or custom alarms

## 🛠️ Technology Stack

**Why This Tech Stack for Sleep Tracking:**

- **[Next.js 15](https://nextjs.org/)** with App Router - Server-side rendering for better performance and SEO
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety for reliable sleep calculations and data handling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling for consistent, mobile-first design
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations that enhance the sleep-focused user experience
- **[date-fns](https://date-fns.org/)** - Robust date manipulation for sleep time calculations
- **[suncalc](https://github.com/mourner/suncalc)** - Astronomical calculations for circadian rhythm alignment
- **[next-pwa](https://github.com/shadowwalker/next-pwa)** - PWA functionality for mobile installation and offline access
- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives for better user experience
- **[Vitest](https://vitest.dev/)** - Fast unit testing for reliable sleep calculations

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard (sleep calculator)
│   ├── energy/            # Energy tracking and optimization
│   ├── tracking/          # Sleep tracking and manual logging
│   ├── history/           # Sleep analytics and charts
│   └── alarms/            # Notification management
├── components/
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   ├── circadian-dashboard.tsx  # Main sleep interface
│   ├── energy-dashboard.tsx     # Energy tracking interface
│   └── bottom-navigation.tsx    # Mobile navigation (5 tabs)
├── lib/
│   ├── sleep.ts           # Sleep cycle calculations
│   ├── circadian.ts       # Circadian rhythm logic
│   ├── wake-detection.ts  # Automatic sleep tracking
│   ├── sleep-debt.ts      # Sleep debt calculations
│   ├── energy-tracking.ts # Energy prediction algorithms
│   └── notifications.ts   # Alarm and reminder system
├── hooks/                 # Custom React hooks
├── styles/               # Global styles and animations
└── types/                # TypeScript type definitions
    └── energy.ts         # Energy tracking type definitions
```

## 🧪 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Run TypeScript compiler to check types
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode

## 🔄 Tab Integration & Data Synergy

Cyrcdian's 5 tabs work seamlessly together to provide a comprehensive sleep optimization experience:

### 🎯 Unified Data Flow

**Calculate → Energy → Tracking → History → Alarms**

1. **Calculate Tab** sets your optimal bedtime preferences
2. **Energy Tab** uses this data for real-time energy predictions
3. **Tracking Tab** logs actual sleep sessions (auto + manual)
4. **History Tab** analyzes patterns from tracked sessions
5. **Alarms Tab** schedules notifications based on calculated times

### 📊 Shared Data Services

- **Sleep Detection Service** (`wake-detection.ts`) - Powers automatic tracking across Tracking, History, and Energy tabs
- **Sleep Calculations** (`sleep.ts`) - Provides consistent cycle calculations for Calculate and Energy tabs
- **Circadian Data** (`circadian.ts`) - Supplies rhythm data for Calculate and Energy optimization
- **Notification System** (`notifications.ts`) - Integrates Alarms with all other tabs
- **LocalStorage Persistence** - Maintains sleep sessions and preferences across all tabs

### 🔗 Cross-Tab Features

- **Smart Recommendations**: Energy tab insights influence Calculate tab suggestions
- **Automatic Data Flow**: Sleep tracking populates History analytics without manual input
- **Integrated Alarms**: Bedtime calculations from Calculate tab auto-populate Alarms
- **Consistent UI/UX**: Shared design system and navigation across all tabs
- **Real-time Updates**: Data changes in one tab immediately reflect in others

### 💡 Intelligent Synergy

- **Sleep Debt Calculation**: Uses History data to predict Energy levels
- **Circadian Awareness**: Calculate and Energy tabs share real-time rhythm data
- **Quality Tracking**: Manual quality ratings in Tracking influence Energy predictions
- **Consistency Scoring**: History patterns inform Calculate recommendations

## 🔬 Science Behind Cyrcdian

### Sleep Cycles

Cyrcdian uses the scientifically-proven 90-minute sleep cycle model. Each cycle consists of:

- **Light sleep** (NREM Stage 1 & 2)
- **Deep sleep** (NREM Stage 3)
- **REM sleep** (dreaming phase)

Waking up at the end of a complete cycle helps you feel more refreshed and alert.

### Circadian Rhythm Alignment

The app uses your location's sunrise and sunset times to recommend:

- **Optimal bedtime window**: 2-4 hours after sunset
- **Optimal wake window**: 30 minutes before to 1 hour after sunrise
- **Light exposure timing**: To naturally regulate melatonin production

### Automatic Sleep Detection

Using the Page Visibility API, Cyrcdian detects:

- **Screen inactivity periods** longer than 3 hours
- **User interaction patterns** to infer sleep and wake times
- **Confidence levels** based on activity duration and patterns

## 🔔 Notification Features

### Browser Notifications

- **Bedtime reminders** with custom messages
- **Wake-up alarms** with snooze functionality
- **Permission management** with clear setup instructions

### iOS Integration

- **Deep linking** to iOS Clock app for additional alarm management
- **PWA installation** for native-like experience
- **Vibration support** where available

## 🌍 Privacy & Data

Cyrcdian respects your privacy:

- **Local storage only** - Your sleep data never leaves your device
- **No account required** - Use the app without creating accounts
- **Optional location** - Geolocation is used only for sunrise/sunset times
- **Transparent tracking** - You control all sleep detection features

## 🤝 Contributing

We welcome contributions to improve Cyrcdian! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Technical Integration Details

### Data Storage Architecture

- **Primary Storage**: `localStorage` for client-side persistence
- **Sleep Sessions**: `cyrcdian-sleep-sessions` key stores all tracked sleep data
- **User Preferences**: `cyrcdian-preferences` for settings and configurations
- **Alarm Data**: `cyrcdian-alarms` for scheduled notifications
- **Energy Settings**: `cyrcdian-energy-settings` for optimization preferences

### API Integration Points

- **Geolocation API**: For accurate sunrise/sunset calculations
- **Page Visibility API**: For automatic sleep detection
- **Notification API**: For bedtime reminders and wake alarms
- **Service Worker**: For PWA functionality and offline access

### State Management Flow

1. **User Input** (Calculate tab) → `sleep.ts` calculations → Energy predictions
2. **Sleep Detection** (Tracking tab) → `wake-detection.ts` → History analytics
3. **Manual Logging** (Tracking tab) → localStorage → History charts update
4. **Alarm Scheduling** (Alarms tab) → `notifications.ts` → Browser notifications

## 🚀 Future Improvements & Roadmap

### Near-term Enhancements

- **Cross-tab State Validation**: Add data consistency checks between tabs
- **Unified Settings System**: Centralized preferences management across all tabs
- **Enhanced Error Handling**: Graceful fallbacks for Energy tab complex dependencies
- **Navigation Hints**: Improved cross-tab navigation guidance for users

### Advanced Features

- **Smart Watch Integration**: Connect with wearable devices for more accurate sleep tracking
- **Machine Learning**: Personalized sleep pattern recognition and recommendations
- **Social Features**: Share sleep goals and progress with family/friends
- **Health App Integration**: Sync with Apple Health, Google Fit, and other platforms

### Technical Debt

- **Type Safety**: Strengthen TypeScript types across all Energy tab interfaces
- **Test Coverage**: Expand unit tests for complex integration scenarios
- **Performance**: Optimize localStorage operations and memory usage
- **Accessibility**: Enhance keyboard navigation and screen reader support

## 🆘 Support

Having issues or questions?

- **Check the app's help tooltips** for quick guidance
- **Review your browser's notification permissions** for alarm issues
- **Open an issue** on GitHub for bug reports or feature requests
- **Enable location permissions** for accurate circadian rhythm calculations

## 🙏 Acknowledgments

- **Sleep science research** from the American Academy of Sleep Medicine
- **Circadian rhythm studies** from Harvard Medical School
- **Open source community** for the excellent libraries and tools
- **Design inspiration** from modern health and wellness apps

---

**Sweet dreams and energized mornings with Cyrcdian!** 🌙✨

_Built with ❤️ for better sleep and healthier living_
