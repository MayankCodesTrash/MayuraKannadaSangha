import { useEffect, useState } from 'react';
import {
  subscribeToSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  uploadSponsorPhoto,
} from '../../data/sponsorsRepo.js';
import './SponsorsAdminTab.css';

const TIERS = ['platinum', 'gold', 'silver', 'bronze'];

const EMPTY_FORM = { name: '', tier: 'gold', image: '', storagePath: null };

function SponsorsAdminTab() {
  const [sponsors, setSponsors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => subscribeToSponsors(setSponsors), []);

  function startAdd() {
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(sponsor) {
    setForm({
      name: sponsor.name ?? '',
      tier: sponsor.tier ?? 'gold',
      image: sponsor.image ?? '',
      storagePath: sponsor.storagePath ?? null,
    });
    setPhotoFile(null);
    setEditingId(sponsor.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const baseFields = { name: form.name, tier: form.tier };

      if (editingId) {
        let imageFields = { image: form.image, storagePath: form.storagePath };
        if (photoFile) {
          imageFields = await uploadSponsorPhoto(photoFile);
        }
        await updateSponsor(editingId, { ...baseFields, ...imageFields });
      } else {
        const newId = await createSponsor({ ...baseFields, image: '', storagePath: null });
        if (photoFile) {
          const imageFields = await uploadSponsorPhoto(photoFile);
          await updateSponsor(newId, imageFields);
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

  async function handleDelete(sponsor) {
    if (!window.confirm(`Delete "${sponsor.name}"?`)) return;
    await deleteSponsor(sponsor.id);
  }

  return (
    <div className="sponsors-admin">
      <button type="button" className="sponsors-admin__add" onClick={startAdd}>
        Add Sponsor
      </button>

      <ul className="sponsors-admin__list">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id} className="sponsors-admin__row">
            {sponsor.image && <img className="sponsors-admin__thumb" src={sponsor.image} alt="" />}
            <span className="sponsors-admin__name">{sponsor.name}</span>
            <span className="sponsors-admin__tier">{sponsor.tier}</span>
            <button type="button" onClick={() => startEdit(sponsor)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(sponsor)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form className="sponsors-admin__form" onSubmit={handleSubmit}>
          <label htmlFor="sponsor-name">Name</label>
          <input
            id="sponsor-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />

          <label htmlFor="sponsor-tier">Tier</label>
          <select
            id="sponsor-tier"
            value={form.tier}
            onChange={(event) => updateField('tier', event.target.value)}
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>

          <label htmlFor="sponsor-photo">Photo</label>
          <input
            id="sponsor-photo"
            type="file"
            accept="image/*"
            onChange={(event) => setPhotoFile(event.target.files[0] ?? null)}
          />

          {error && <p className="sponsors-admin__error">{error}</p>}

          <div className="sponsors-admin__form-actions">
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

export default SponsorsAdminTab;
