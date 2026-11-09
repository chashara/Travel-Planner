import { useState } from "react";
import { CATEGORY_META, formatMoney } from "../utils";

export default function ActivityItem({ activity, currency, isFirst, isLast, onUpdate, onDelete, onMove }) {
  const [editing, setEditing] = useState(Boolean(activity._new));
  const [draft, setDraft] = useState({
    time: activity.time,
    title: activity.title,
    description: activity.description,
    category: activity.category,
    estimatedCost: String(activity.estimatedCost),
  });

  const category = activity.category in CATEGORY_META ? activity.category : "other";
  const meta = CATEGORY_META[category];

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onUpdate({
      time: draft.time,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      estimatedCost: Math.max(0, Number(draft.estimatedCost) || 0),
    });
    setEditing(false);
  };

  const handleCancel = () => {
    if (activity._new) {
      onDelete(); // cancelling a brand-new activity removes it
    } else {
      setDraft({
        time: activity.time,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        estimatedCost: String(activity.estimatedCost),
      });
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <li className="activity editing">
        <div className="edit-form">
          <div className="edit-row">
            <label>
              Time
              <input type="time" value={draft.time} onChange={(e) => setField("time", e.target.value)} />
            </label>
            <label>
              Category
              <select value={draft.category} onChange={(e) => setField("category", e.target.value)}>
                {Object.entries(CATEGORY_META).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cost ({currency})
              <input
                type="number"
                min="0"
                value={draft.estimatedCost}
                onChange={(e) => setField("estimatedCost", e.target.value)}
              />
            </label>
          </div>

          <label>
            Title
            <input
              value={draft.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="What are you doing?"
              autoFocus
            />
          </label>

          <label>
            Description
            <textarea
              rows="2"
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Optional notes"
            />
          </label>

          <div className="edit-actions">
            <button type="button" className="btn-soft" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="btn-solid" onClick={handleSave} disabled={!draft.title.trim()}>
              Save
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="activity">
      <span className="activity-time">{activity.time}</span>
      <span className={`activity-icon cat-${category}`} title={meta.label}>
        {meta.icon}
      </span>
      <div className="activity-body">
        <h4>{activity.title}</h4>
        {activity.description && <p>{activity.description}</p>}
      </div>
      <div className="activity-side">
        <span className="activity-cost">
          {activity.estimatedCost > 0 ? formatMoney(activity.estimatedCost, currency) : "Free"}
        </span>
        <div className="activity-actions">
          <button className="icon-btn" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move up" title="Move up">
            ↑
          </button>
          <button className="icon-btn" onClick={() => onMove(1)} disabled={isLast} aria-label="Move down" title="Move down">
            ↓
          </button>
          <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Edit" title="Edit">
            ✎
          </button>
          <button className="icon-btn danger" onClick={onDelete} aria-label="Delete" title="Delete">
            ✕
          </button>
        </div>
      </div>
    </li>
  );
}