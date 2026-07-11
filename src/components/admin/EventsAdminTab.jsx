import { useEffect, useState } from 'react';
import {
  subscribeToEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
} from '../../data/eventsRepo.js';
import './EventsAdminTab.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isoToDateFields(isoDate) {
  if (!isoDate) return { day: '', month: '', year: '' };
  const [year, month, day] = isoDate.split('-');
  return {
    day: String(Number(day)),
    month: MONTH_NAMES[Number(month) - 1] ?? '',
    year,
  };
}

function dateFieldsToISO(day, month, year) {
  const monthIndex = MONTH_NAMES.indexOf(month);
  if (!day || monthIndex === -1 || !year) return '';
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const EMPTY_FORM = {
  title: '',
  eventDate: '',
  time: '',
  location: '',
  status: 'upcoming',
  image: '',
  storagePath: null,
  buttons: [],
};

function EventsAdminTab() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => subscribeToEvents(setEvents), []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(event) {
    setForm({
      title: event.title ?? '',
      eventDate: dateFieldsToISO(event.day, event.month, event.year),
      time: event.time ?? '',
      location: event.location ?? '',
      status: event.status ?? 'upcoming',
      image: event.image ?? '',
      storagePath: event.storagePath ?? null,
      buttons: event.buttons ?? [],
    });
    setImageFile(null);
    setEditingId(event.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateButton(index, field, value) {
    setForm((current) => ({
      ...current,
      buttons: current.buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      ),
    }));
  }

  function addButton() {
    setForm((current) =>
      current.buttons.length >= 3
        ? current
        : { ...current, buttons: [...current.buttons, { label: '', url: '' }] }
    );
  }

  function removeButton(index) {
    setForm((current) => ({
      ...current,
      buttons: current.buttons.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const buttons = form.buttons.filter((button) => button.label && button.url);
      const { day, month, year } = isoToDateFields(form.eventDate);
      const baseFields = {
        title: form.title,
        day,
        month,
        year,
        time: form.time,
        location: form.location,
        status: form.status,
        buttons,
      };

      if (editingId) {
        let imageFields = { image: form.image, storagePath: form.storagePath };
        if (imageFile) {
          imageFields = await uploadEventImage(imageFile);
        }
        await updateEvent(editingId, { ...baseFields, ...imageFields });
      } else {
        const newId = await createEvent({ ...baseFields, image: '', storagePath: null });
        if (imageFile) {
          const imageFields = await uploadEventImage(imageFile);
          await updateEvent(newId, imageFields);
        }
      }

      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    await deleteEvent(event.id);
  }

  return (
    <div className="events-admin">
      <button type="button" className="events-admin__add" onClick={startAdd}>
        Add Event
      </button>

      <ul className="events-admin__list">
        {events.map((event) => (
          <li key={event.id} className="events-admin__row">
            <span className="events-admin__title">{event.title}</span>
            <span className="events-admin__status">{event.status}</span>
            <button type="button" onClick={() => startEdit(event)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(event)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form className="events-admin__form" onSubmit={handleSubmit}>
          <label htmlFor="event-title">Title</label>
          <input
            id="event-title"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />

          <label htmlFor="event-date">Date</label>
          <input
            id="event-date"
            type="date"
            value={form.eventDate}
            onChange={(event) => updateField('eventDate', event.target.value)}
            required
          />

          <label htmlFor="event-time">Time</label>
          <input
            id="event-time"
            value={form.time}
            onChange={(event) => updateField('time', event.target.value)}
          />

          <label htmlFor="event-location">Location</label>
          <input
            id="event-location"
            value={form.location}
            onChange={(event) => updateField('location', event.target.value)}
            required
          />

          <label htmlFor="event-status">Status</label>
          <select
            id="event-status"
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>

          <label htmlFor="event-image">Image</label>
          <input
            id="event-image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files[0] ?? null)}
          />

          <fieldset className="events-admin__buttons">
            <legend>Buttons (up to 3)</legend>
            {form.buttons.map((button, index) => (
              <div key={index} className="events-admin__button-row">
                <input
                  aria-label={`Button ${index + 1} label`}
                  placeholder="Label"
                  value={button.label}
                  onChange={(event) => updateButton(index, 'label', event.target.value)}
                />
                <input
                  aria-label={`Button ${index + 1} URL`}
                  placeholder="URL"
                  value={button.url}
                  onChange={(event) => updateButton(index, 'url', event.target.value)}
                />
                <button type="button" onClick={() => removeButton(index)}>
                  Remove
                </button>
              </div>
            ))}
            {form.buttons.length < 3 && (
              <button type="button" onClick={addButton}>
                Add Button
              </button>
            )}
          </fieldset>

          {error && <p className="events-admin__error">{error}</p>}

          <div className="events-admin__form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EventsAdminTab;
