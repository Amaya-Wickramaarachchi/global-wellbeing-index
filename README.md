# Global Wellbeing Index

A modern web application that calculates and visualizes a city’s wellbeing score based on air quality, weather comfort, and population density. Users can log in with Google to save their calculations and track their personal score history.

---

## Features

- **Google OAuth 2.0 authentication** – Secure login with Google accounts.
- **Real-time city score calculation** – Fetches air quality, weather, and population data from external APIs.
- **Personal history** – Save and view previously calculated city scores.
- **Leaderboard** – Displays top liveable cities globally.
- **Interactive charts** – Visual breakdown of factors contributing to the wellbeing score.
- **Responsive design** – Works on both desktop and mobile devices using Tailwind CSS.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Passport.js (Google OAuth 2.0)
- **Frontend:** HTML, Tailwind CSS, Chart.js
- **APIs Used:**
  - [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities/)
  - [OpenAQ API](https://docs.openaq.org/)
  - [OpenWeatherMap API](https://openweathermap.org/api)

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amaya-wickramaarachchi/global-wellbeing-index.git
   cd global-wellbeing-index


2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root with the following variables:

   ```env
   PORT=3000
   MONGO_URI=<Your MongoDB connection string>
   SESSION_SECRET=<Any secure random string>
   GOOGLE_CLIENT_ID=<Your Google OAuth Client ID>
   GOOGLE_CLIENT_SECRET=<Your Google OAuth Client Secret>
   CLIENT_API_KEY=<Secret key for frontend to backend requests>
   GEODB_API_KEY=<Your RapidAPI GeoDB Key>
   OPERAQ_API_KEY=<Your OpenAQ API Key>
   OPENWEATHERMAP_API_KEY=<Your OpenWeatherMap API Key>
   ```

4. **Run the server:**

   ```bash
   npm start
   ```

5. **Access the app** at `http://localhost:3000`.

---

## Usage

1. Click **Login with Google** to authenticate.
2. Enter a city name and click **Calculate** to see the wellbeing score.
3. View your **score breakdown** and interactive chart.
4. Save your results to **your personal history**.
5. Explore the **leaderboard** to see top cities.

---

## Folder Structure

```
global-wellbeing-index/
├─ config/        # Passport.js configuration
├─ models/        # MongoDB models
├─ public/        # Frontend HTML, CSS, JS
├─ routes/        # API endpoints
├─ .env           # Environment variables
├─ README.md      # Project documentation
└─ server.js      # Main Express server
```

---

## Screenshots

<img width="1298" height="638" alt="image" src="https://github.com/user-attachments/assets/237af56d-392a-4463-b9aa-40aa48bf68c7" />


---

## License

This project is open-source under the MIT License. See `LICENSE` for details.

---

## Authors

- W. A. P. A. WICKRAMAARACHCHI - ITBNM-2211-0195
- U. D. S. BANDARA - ITBNM-2211-0112
- W. A. D. N. WEERAWARDHANA - ITBNM-2211-0194


