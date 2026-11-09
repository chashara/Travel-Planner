import { useState } from "react";

const STYLES = ["Budget", "Balanced", "Comfort", "Luxury"];
const INTERESTS = ["Food", "History", "Nature", "Museums", "Nightlife", "Shopping", "Adventure", "Relaxation"];
const CURRENCIES = ["EUR", "USD", "GBP", "JPY"];

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    country: "",
    city: "",
    days: 3,
    budget: 1000,
    currency: "EUR",
    groupSize: 1,
    travelStyle: "Balanced",
    interests: [],
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleInterest = (interest) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));

  const validate = () => {
    const e = {};
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.city.trim()) e.city = "City is required";
    if (form.days < 1 || form.days > 14) e.days = "Days must be between 1 and 14";
    if (form.budget < 0) e.budget = "Budget can't be negative";
    if (form.groupSize < 1) e.groupSize = "At least 1 traveler";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      country: form.country.trim(),
      city: form.city.trim(),
      days: Number(form.days),
      budget: Number(form.budget),
      groupSize: Number(form.groupSize),
      travelStyle: form.travelStyle.toLowerCase(),
      interests: form.interests.map((i) => i.toLowerCase()),
    });
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <div className="row">
        <label>
          Country
          <input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Japan" />
          {errors.country && <span className="error">{errors.country}</span>}
        </label>
        <label>
          City
          <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Tokyo" />
          {errors.city && <span className="error">{errors.city}</span>}
        </label>
      </div>

      <div className="row">
        <label>
          Days
          <input type="number" min="1" max="14" value={form.days} onChange={(e) => update("days", e.target.value)} />
          {errors.days && <span className="error">{errors.days}</span>}
        </label>
        <label>
          Travelers
          <input type="number" min="1" value={form.groupSize} onChange={(e) => update("groupSize", e.target.value)} />
          {errors.groupSize && <span className="error">{errors.groupSize}</span>}
        </label>
      </div>

      <div className="row">
        <label>
          Total budget
          <input type="number" min="0" value={form.budget} onChange={(e) => update("budget", e.target.value)} />
          {errors.budget && <span className="error">{errors.budget}</span>}
        </label>
        <label>
          Currency
          <select value={form.currency} onChange={(e) => update("currency", e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Travel style
        <select value={form.travelStyle} onChange={(e) => update("travelStyle", e.target.value)}>
          {STYLES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>Interests</legend>
        <div className="chips">
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              className={form.interests.includes(i) ? "chip active" : "chip"}
              onClick={() => toggleInterest(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="primary" disabled={loading}>
        {loading ? "Planning your trip..." : "Generate itinerary"}
      </button>
    </form>
  );
}