import DayCard from "./DayCard";
import { updateActivity, deleteActivity, addActivity, moveActivity } from "../itineraryOps";
import { formatMoney, sumTrip } from "../utils";

export default function ItineraryView({ itinerary, onChange }) {
  const { trip, days } = itinerary;
  const total = sumTrip(days);
  const percent = trip.budget > 0 ? Math.min((total / trip.budget) * 100, 100) : 0;
  const overBudget = total > trip.budget;

  return (
    <div className="itinerary">
      <header className="trip-header">
        <h2>
          {trip.city}, {trip.country}
        </h2>
        <p className="trip-meta">
          {trip.days} {trip.days === 1 ? "day" : "days"}
        </p>
        <p>{trip.summary}</p>

        <div className="budget">
          <div className="budget-labels">
            <span>Estimated total: {formatMoney(total, trip.currency)}</span>
            <span>Budget: {formatMoney(trip.budget, trip.currency)}</span>
          </div>
          <div className="budget-bar">
            <div className={overBudget ? "budget-fill over" : "budget-fill"} style={{ width: `${percent}%` }} />
          </div>
          {overBudget && <p className="error">Over budget by {formatMoney(total - trip.budget, trip.currency)}</p>}
        </div>
      </header>

      {days.map((day) => (
        <DayCard
          key={day.id}
          day={day}
          currency={trip.currency}
          onUpdate={(activityId, patch) => onChange(updateActivity(itinerary, day.id, activityId, patch))}
          onDelete={(activityId) => onChange(deleteActivity(itinerary, day.id, activityId))}
          onMove={(activityId, direction) => onChange(moveActivity(itinerary, day.id, activityId, direction))}
          onAdd={() => onChange(addActivity(itinerary, day.id))}
        />
      ))}

      <p className="disclaimer">
        Prices, opening hours and availability are AI estimates. Please verify before you go.
      </p>
    </div>
  );
}