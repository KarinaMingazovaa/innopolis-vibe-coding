# KcalSnap Landing MVP

A single-page landing site for a calorie-counting app concept. Users can describe a meal and get estimated calorie and macronutrient values. Includes a daily calorie calculator.

## Tech Stack

- Pure HTML5 / CSS3 / Vanilla JavaScript (no build system)
- Node.js static file server (`server.js`) serving the `projects/` directory

## Project Structure

```
projects/        # Main site files
  index.html     # Landing page
  style.css      # All styles
  script.js      # Calorie estimation logic, localStorage history, BMR calculator

notes/           # Assignment notes and problem statements
assets/          # Media assets (currently empty)
server.js        # Simple Node.js HTTP static file server
```

## Running Locally

The app is served by `server.js` on port 5000 at `0.0.0.0`.

```
node server.js
```

## Key Features

- Meal text input → estimated calories and macros (simulated AI)
- LocalStorage history (key: `kcalsnap_history_v1`)
- Daily calorie calculator (BMR + activity + goal adjustment)
- Responsive design for mobile and desktop
