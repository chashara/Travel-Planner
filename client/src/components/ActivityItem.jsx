import { CATEGORY_META, formatMoney } from "../utils";

export default function ActivityItem({ activity, currency }) {
  const meta = CATEGORY_META[activity.category] || CATEGORY_META.other;

  return (
    <li className="activity">
      <span className="activity-time">{activity.time}</span>
      <span className="activity-icon" title={meta.label}>
        {meta.icon}
      </span>
      <div className="activity-body">
        <h4>{activity.title}</h4>
        <p>{activity.description}</p>
      </div>
      <span className="activity-cost">
        {activity.estimatedCost > 0 ? formatMoney(activity.estimatedCost, currency) : "Free"}
      </span>
    </li>
  );
}