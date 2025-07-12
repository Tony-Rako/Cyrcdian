# Cyrcdian - Circadian Rhythm Health App

> **Unlock your daily potential through the power of circadian rhythm optimization**

Cyrcdian is a science-backed sleep optimization app that harnesses the natural power of your circadian rhythm to give you the energy you need for every busy day. By aligning with your body's natural sleep cycles, Cyrcdian helps you unleash your potential and maintain the energy to work on yourself and achieve your goals.

## 🌟 Why Circadian Rhythm Matters for Your Health

Your circadian rhythm is your body's internal clock that regulates sleep, energy, and countless biological processes. When optimized:

- **🚀 Boost Daily Energy**: Wake up naturally refreshed and maintain consistent energy throughout the day
- **💪 Enhance Performance**: Better sleep cycles mean improved cognitive function, focus, and productivity
- **🎯 Unlock Your Potential**: With proper rest, you have the mental and physical energy to pursue personal growth
- **⚡ Sustain Busy Lifestyles**: Optimized sleep helps you keep up with demanding schedules without burning out
- **🧠 Improve Overall Health**: Better sleep supports immune function, metabolism, and mental well-being

## ✨ Features

### 🕐 Smart Sleep Calculator
- Calculate optimal bedtimes and wake times based on 1.5-hour sleep cycles
- Get personalized recommendations for your sleep schedule
- Avoid waking up during deep sleep phases

### 📱 Sleep Tracking & Monitoring
- Manual sleep tracking with quality ratings
- Automatic wake detection using device sensors
- Track sleep duration and cycle completion

### 📊 Sleep History & Analytics
- Visualize your sleep patterns over time
- Track improvements in sleep quality and consistency
- Identify trends and optimize your routine

### ⏰ Smart Alarm Management
- Set bedtime reminders to maintain consistent sleep schedules
- Configure wake-up alarms for optimal sleep cycle timing
- Customizable notification settings

### 🎯 Circadian Rhythm Optimization
- Science-based recommendations using 90-minute sleep cycles
- Personalized sleep goals and habit tracking
- Educational content about circadian health

## 🛠️ Technology Stack

- **Frontend**: React 18 with modern hooks
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI for accessible, unstyled components
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library
- **PWA**: Service Worker support for offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cyrcdian
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📱 Usage

### Getting Started with Sleep Optimization

1. **Calculate Your Optimal Sleep Times**: Use the sleep calculator to find the best bedtime and wake time based on your schedule
2. **Set Up Sleep Reminders**: Configure bedtime notifications to maintain consistency
3. **Track Your Sleep**: Log your sleep manually or let the app detect when you wake up
4. **Monitor Your Progress**: Review your sleep history to see improvements over time
5. **Optimize Gradually**: Make small adjustments based on your sleep data and energy levels

### Key Tips for Circadian Health

- **Consistency is Key**: Try to sleep and wake at the same times every day
- **Complete Sleep Cycles**: Aim for full 90-minute cycles (7.5 or 9 hours of sleep)
- **Listen to Your Body**: Use the app's data to understand your natural patterns
- **Gradual Changes**: Shift your sleep schedule by 15-30 minutes at a time

## 📁 Project Structure

```
cyrcdian/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── AlarmManager.jsx
│   │   ├── SleepCalculator.jsx
│   │   ├── SleepHistory.jsx
│   │   └── SleepTracker.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useNotifications.js
│   │   ├── useSleepData.js
│   │   └── useWakeDetection.js
│   ├── lib/              # Utility functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # App entry point
├── tools/                # Build and development tools
└── package.json          # Project dependencies
```

## 🤝 Contributing

We welcome contributions that help improve sleep health and circadian rhythm optimization! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed
- Focus on user experience and health benefits

## 📋 Roadmap

- [ ] Advanced sleep analytics and insights
- [ ] Integration with wearable devices
- [ ] Personalized circadian rhythm coaching
- [ ] Social features for sleep challenges
- [ ] Light exposure tracking and recommendations
- [ ] Meal timing optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌙 About Circadian Health

Cyrcdian was created with the belief that everyone deserves to feel energized and capable of pursuing their goals. By respecting and optimizing your natural circadian rhythm, you're not just improving your sleep – you're investing in your daily energy, mental clarity, and overall potential.

**Start your journey to better sleep and enhanced daily energy today!**

---

*Built with ❤️ for better sleep and healthier lives*