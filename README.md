# Travel Planner

An AI-powered travel planner. Enter a destination, trip length, budget and interests, get a day-by-day itinerary, then edit it by hand and take it with you as a PDF.

**Live demo:** [YOUR_LIVE_URL_HERE](YOUR_LIVE_URL_HERE)

> The demo runs on free hosting. If nobody has used it for a while, the server is asleep and the first request can take up to a minute. After that it responds normally.


![Trip form](docs/form.png)
![Generated itinerary](docs/itinerary.png)
![PDF export](docs/pdf.png)

## Features

- **AI itinerary generation:** country, city, number of days, total budget, currency, group size, travel style and interests go in; a structured, day-by-day plan comes out.
- **Full manual editing:** edit, add, delete and reorder activities; change an activity's time, category, cost and description; rename days; move activities between days; sort a day by time.
- **Live budget tracking:** trip and daily totals are calculated from the activities themselves, so they update instantly as you edit, with a progress bar that turns red when you go over budget.
- **PDF export:** a print-optimised layout turns the itinerary into a clean PDF with selectable text.
- **Save and restore:** the trip autosaves in the browser, and can be downloaded as a `.json` file and imported again later or on another device.
- **Responsive design:** works on desktop and mobile.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, plain CSS |
| Backend | Node.js, Express |
| AI | Google Gemini API (`@google/genai`) with JSON-schema structured output |
| Validation | Zod |
| Protection | express-rate-limit, CORS allow-list |
| Hosting | Render (Web Service for the API, Static Site for the client) |

## How it works

```
React form ──POST /api/itinerary──▶ Express ──▶ Gemini (structured JSON)
                                       │
                          Zod validates the response,
                          server adds unique IDs
                                       │
React editor ◀────── itinerary JSON ◀──┘
     │
     ├─ autosave (localStorage)
     ├─ download / import (.json)
     └─ export (print stylesheet → PDF)
```

### Design decisions

- **Structured output, validated twice.** The model is asked for JSON matching a schema, and the server validates every response with Zod before it reaches the client. Invalid or incomplete responses are retried instead of crashing the app.
- **Retries and a fallback model.** Temporary provider errors (overload, server errors) are retried with a short backoff, and an optional fallback model is tried if the main one keeps failing.
- **IDs are added by the server, not the model.** Models are unreliable at generating unique IDs, and the editor needs stable IDs for editing and reordering.
- **Totals are computed on the client.** LLMs make arithmetic mistakes, so the displayed total is always the sum of the activity costs, never the number the AI claims.
- **Imported files are sanitised.** Every imported or restored itinerary is rebuilt field by field, so a malformed or hand-edited file cannot crash the page.
- **Protecting the API key and quota.** The key lives only on the server, requests are rate-limited per IP, and the server only accepts requests from the configured client origin.
- **Cold-start friendly.** The client pings the server as soon as the page opens, so a sleeping free-tier server is usually awake by the time the user submits the form.

## Project structure

```
travel-planner/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # TripForm, ItineraryView, DayCard, ActivityItem
│       ├── api.js           # calls to the backend
│       ├── itineraryOps.js  # pure functions for editing an itinerary
│       ├── storage.js       # autosave, JSON download/import, validation
│       ├── pdf.js           # print/PDF helper
│       └── utils.js         # formatting and cost helpers
└── server/                  # Express API
    ├── index.js             # routes, CORS, rate limiting
    ├── schema.js            # Zod schemas
    └── services/ai.js       # prompt, Gemini call, retries
```

## Run it locally

You need Node.js 20 or newer and a free Gemini API key from [Google AI Studio](https://aistudio.google.com).

```bash
git clone https://github.com/chashara/Travel-Planner.git
cd Travel-Planner

# Server
cd server
npm install
cp .env.example .env     # then add your GEMINI_API_KEY
npm run dev

# Client (in a second terminal)
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

### Environment variables

**Server (`server/.env`)**

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key (required) |
| `GEMINI_MODEL` | Main model to use, e.g. `gemini-3.8-flash` |
| `GEMINI_FALLBACK_MODEL` | Optional backup model tried if the main one keeps failing |
| `CLIENT_URL` | Allowed frontend origin (default `http://localhost:5173`) |
| `PORT` | Server port (default `5000`) |

**Client**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default `http://localhost:5000`). Read at build time. |

## Deployment

- **API:** Render Web Service, root directory `server`, build command `npm install`, start command `npm start`.
- **Client:** Render Static Site, root directory `client`, build command `npm install && npm run build`, publish directory `dist`, with `VITE_API_URL` pointing at the API.
- Set the API's `CLIENT_URL` to the deployed client's address so CORS allows it.

## Limitations

- Itineraries are AI-generated estimates. Prices, opening hours and availability should be verified before travelling.
- The app uses a free-tier AI API, so heavy traffic can hit rate limits or temporary overload.
- Trips are stored in the browser (and in downloaded files), not in user accounts.

## Possible future improvements

- User accounts and cloud sync
- Map view of each day's activities
- Drag-and-drop reordering
- Links to flights and hotels
- Shareable read-only trip links
