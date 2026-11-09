import ActivityItem from "./ActivityItem";
import { formatMoney, sumActivities } from "../utils";

export default function DayCard({ day, currency, onUpdate, onDelete, onMove, onAdd }) {
  return (
    <section className="day-card">
      <header className="day-header">
        <div>
          <span className="day-number">Day {day.dayNumber}</span>
          <h3>{day.title}</h3>
        </div>
        <span className="day-total">{formatMoney(sumActivities(day.activities), currency)}</span>
      </header>

      <ul className="activity-list">
        {day.activities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            currency={currency}
            isFirst={index === 0}
            isLast={index === day.activities.length - 1}
            onUpdate={(patch) => onUpdate(activity.id, patch)}
            onDelete={() => onDelete(activity.id)}
            onMove={(direction) => onMove(activity.id, direction)}
          />
        ))}
      </ul>

      <button className="add-btn" onClick={onAdd}>
        + Add activity
      </button>
    </section>
  );
}