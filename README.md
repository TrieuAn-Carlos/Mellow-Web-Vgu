# Mellow - A Task Companion App

A delightful and motivating task management application built with Next.js and Firebase. This project uses interactive animations and real-time data to create an engaging user experience, turning task completion into a rewarding visual journey.

---

## 📖 Table of Contents

- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Installation Guide](#-installation-guide)
- [✨ Key Features](#-key-features)
- [📂 Folder Structure](#-folder-structure)

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Animation:** [Anime.js](https://animejs.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (provides accessible and reusable components built on Radix UI)

**Native Web APIs Leveraged:**
This project also relies on several powerful APIs built directly into the web browser, requiring no external installation:

- **Notifications API:** To send meeting alerts directly to the user's desktop.
- **DOM & Event Listeners:** For all animations, interactive elements like the eye-following character, and keyboard controls (e.g., pressing `Spacebar` on the timer page).
- **Window Timers (`setTimeout`, `setInterval`):** Crucial for the timer logic, message cycling on the home page, and sequencing complex animations.
- **History API:** Used under the hood by the Next.js App Router for smooth, client-side page transitions without full page reloads.

---

## 🚀 Installation Guide

This guide will walk you through setting up the project from scratch, assuming you are starting with just a code editor like VS Code.

### Step 1: Install Prerequisites (Node.js and Git)

Our project relies on two essential tools: Node.js (to run the JavaScript code) and Git (to download the source code). Let's make sure you have them.

**1. Check for and Install Node.js:**

- Open a terminal in VS Code (`View` > `Terminal` or `Ctrl+~`).
- Type `node -v` and press Enter.
- If you see a version number (like `v18.17.0`), you're all set!
- **If not, or you get an error:**
  1.  Visit the [official Node.js website](https://nodejs.org/).
  2.  Download the installer for the **LTS (Long Term Support)** version. This is the most stable version.
  3.  Run the installer and follow the on-screen instructions.
  4.  Restart VS Code to ensure it recognizes the new installation, then check the version again in the terminal.

**2. Check for and Install Git:**

- In the same VS Code terminal, type `git --version` and press Enter.
- If you see a version number (like `git version 2.39.2`), you have Git.
- **If not:**
  1.  Go to the [official Git website](https://git-scm.com/).
  2.  Download and run the installer for your operating system (Windows, macOS, or Linux).
  3.  Restart VS Code and check the version again.

### Step 2: Get the Project Code

Now we'll download the project code from its repository.

1.  **Clone the repository:** In the VS Code terminal, run the following command. This will create a `my-nextjs-firebase-app` folder containing the project.

    ```bash
    git clone https://github.com/TrieuAn-Carlos/Mellow-Web-Vgu.git
    ```

2.  **Navigate into the project directory:**
    ```bash
    cd my-nextjs-firebase-app
    ```
    Your terminal prompt should now indicate you are inside the project folder.

### Step 3: Install All Project Libraries (Next.js, Anime.js, etc.)

You don't need to install libraries like Next.js, Anime.js, or shadcn/ui manually. The project lists all of its required libraries (called "dependencies") in a file named `package.json`.

The following command will automatically read that file and download and install every library needed to run the application.

- **Install all dependencies:**
  ```bash
  npm install
  ```
  This process might take a few minutes as it downloads all the necessary code into a new `node_modules` folder inside your project.

### Step 4: Firebase Configuration (Important Note)

For this project, the Firebase API keys have been included directly in the file `src/lib/firebase.ts` for ease of setup and demonstration.

**⚠️ Security Best Practice:**
In a real-world application, you should **never** hardcode API keys. The standard practice is to use environment variables. To do this, you would create a `.env.local` file and add your keys there. For running this project now, you don't need to change anything.

### Step 5: Run the Project

You're ready to go! Let's start the local development server.

- **Start the server:**

  ```bash
  npm run dev
  ```

- **Look for the confirmation message** in the terminal. It should say something like:

  ```
  ✓ Ready in x.x s
  - Local:   http://localhost:3000
  ```

- **View the app:** Open your web browser (like Chrome, Firefox, or Edge) and navigate to `http://localhost:3000`.

You should now see the Mellow task companion app live and running on your machine. Welcome!

---

## ✨ Key Features

- **Interactive Home Page:**

  - A floating, animated "Mellow" character that follows the cursor with its eyes and blinks periodically.
  - Dynamic "thought bubble" messages that change to keep the user engaged.
  - **How to trigger:** This is the default view at the `/` or `/home` route.

- **Task Completion Animation:**

  - When a task is marked as complete in Firebase, a new cloud animates, falling from the sky.
  - These "Mellow" clouds accumulate at the bottom of the screen.
  - **How to trigger:** Update a task's status to `COMPLETED` in the Firebase Firestore `tasks` collection for the current day.

- **Draggable Cloud Physics:**

  - The collected clouds can be clicked, dragged, and tossed around the screen with a physics-based animation.
  - **How to trigger:** Click and drag any of the clouds that have fallen to the bottom.

- **Navigation Gestures:**

  - A short click on the main floating cloud navigates to the `/time` page (timer page).
  - A **long press** (hold the mouse button down for 1.2 seconds) on the background navigates to the `/stats` page.

- **Real-time Task & Meeting Display:**

  - Fetches and displays tasks for the current day from Firestore.
  - Shows a summary of scheduled meetings and prompts for notification permissions.
  - **How to trigger:** Add task or meeting documents to the `tasks` collection in Firestore for the current date.

- **Auto-Start Timer:**

  - The application listens for tasks that are due and shows an overlay to automatically start the timer.
  - **How to trigger:** Set a task's `autoStart` property to `true` and its `startTime` to a time in the near future in Firestore.

- **Statistics Page (`/stats`):**

  - A comprehensive dashboard to view user statistics.
  - Features date navigation and different view modes (Day, Week, Month, Year).
  - **How to trigger:** Navigate to `/stats` directly or use the long-press gesture on the home page.

- **Smart Timer Page (`/time`):**
  - **Real-time Task Sync:** The timer page actively listens for tasks marked as `IN_PROGRESS` in Firestore.
  - **Automatic Task Switching:** When a new task becomes active, the timer automatically resets to 00:00 and starts tracking the new task.
  - **Pause on Completion:** If the current task is marked as complete, the timer pauses, preserving the final session time.
  - **Manual Control:** The timer can be manually paused and resumed at any time by pressing the `Spacebar`.
  - **How to trigger:** Navigate to `/time` by clicking the main cloud on the home page. The timer's behavior is then driven by changes to task statuses in Firestore.

---

## 📂 Folder Structure

A more detailed look at the project's architecture.

```
my-nextjs-firebase-app/
├── public/
│   └── *.svg              # SVG assets for clouds and icons
│
├── src/
│   ├── app/               # Next.js App Router (defines all pages/routes)
│   │   ├── admin/         # Page for administrative tasks
│   │   ├── home/          # The main interactive home page
│   │   ├── stats/         # The user statistics and dashboard page
│   │   ├── time/          # The smart timer page
│   │   ├── layout.tsx     # The root layout for the application
│   │   └── page.tsx       # The entry point, redirects to /home
│   │
│   ├── components/        # Reusable React components, organized by feature
│   │   ├── home/          # Components used exclusively on the home page (e.g., ChatHomePage)
│   │   ├── stats/         # Components for the statistics page (e.g., StatCard, Header)
│   │   ├── animations/    # General purpose animation components
│   │   └── ui/            # Generic UI elements like buttons, cards etc.
│   │
│   ├── hooks/             # Custom React hooks for stateful logic
│   │   ├── useMeetingNotifications.ts # Hook to listen for upcoming meetings
│   │   ├── useCompletedTasksStream.ts # Hook to get a real-time stream of completed tasks
│   │   └── useStatsData.ts  # Hook for fetching and processing statistics
│   │
│   ├── lib/               # Core application logic, services, and Firebase setup
│   │   ├── firebase.ts    # Firebase app initialization and configuration
│   │   ├── firebase-collections.ts # References to Firestore collections
│   │   ├── firebase-services.ts    # High-level functions to interact with Firebase (e.g., get tasks)
│   │   ├── firebase-converters.ts  # Functions to convert data between Firestore and client
│   │   └── auto-start-service.ts   # Logic for the auto-start timer feature
│   │
│   ├── types/             # TypeScript type definitions
│   │   ├── schema.ts      # Defines the core data structures (Task, Project, etc.)
│   │   └── stats.ts       # Types specific to the statistics page
│   │
│   └── globals.css        # Global CSS styles
│
├── firebase.json          # Configuration for Firebase (e.g., Firestore rules)
├── next.config.ts         # Configuration for Next.js
├── tailwind.config.ts     # Configuration for Tailwind CSS
└── README.md              # This file
```

---

THANK YOU
