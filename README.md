
# Neuro Therapy 🧠

Neuro Therapy is a mood-boosting web application designed to uplift spirits through color therapy, cognitive games, interactive animations, and calming music frequencies.

## 🚀 Features

*   **Cognitive Games**: Color Match, Memory Flip, Shape Sequence, Odd One Out.
*   **Therapeutic Exercises**: Breathing Circle, Hand Mirroring, Visual Tracking.
*   **Interactive Art**: Digital coloring and creative expression.
*   **Visual Toys**: Bubble Pop, Star Shower, Rainbow Trail.
*   **Zen Focus**: Short, calming animations (Sunrise, Flower Bloom).
*   **Music Therapy**: Binaural beats and healing frequencies.
*   **Progress Tracking**: AI-powered insights, cognitive radar chart, and achievements.

## 📋 Prerequisites

*   **Node.js** (v16 or higher)
*   **MySQL Server**

## 🛠️ Installation & Setup

1.  **Clone the repository**.
2.  **Install All Dependencies** (Frontend + Backend):
    ```bash
    npm install react react-dom react-scripts framer-motion lucide-react @google/genai
    npm install express mysql2 cors bcrypt jsonwebtoken dotenv
    ```

### 1. Environment Configuration

Create a `.env` file in the root directory and add your configuration:

```env
API_KEY=your_google_genai_api_key_here
API_URL=http://localhost:5000/api

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=neuro_therapy
JWT_SECRET=mysecretkey
```

### 2. Database Setup 🗄️

1.  Ensure MySQL is running.
2.  Import the schema:
    ```bash
    mysql -u root -p < database/schema.sql
    ```

### 3. Audio Files Setup 🎵

Add these files to `public/audio/`: `binaural.mp3`, `alpha.mp3`, `gamma.mp3`, `theta.mp3`, `om.mp3`, `flute.mp3`.

### 4. Running the App (Full Stack) ▶️

You need to run the **Frontend** and **Backend** in separate terminals.

**Terminal 1: Backend Server**
```bash
node server.js
```
*You should see: "🚀 Server running on http://localhost:5000" and "✅ Connected to MySQL Database!"*

**Terminal 2: Frontend App**
```bash
npm start
```
*Open [http://localhost:3000](http://localhost:3000)*

### 5. Enabling Real Backend Mode

Open `services/authService.ts` and ensure `MOCK_MODE` is set to `false`:
```typescript
const MOCK_MODE = false; 
```

Now the Login and Signup forms will connect to your MySQL database!
