import ActivityItem from "./ActivityItem";
import { formatMoney, sumActivities } from "../utils";

export default function DayCard({ day, currency }) {
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
        {day.activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} currency={currency} />
        ))}
      </ul>
    </section>
  );
}