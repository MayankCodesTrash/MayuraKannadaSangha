import { useEffect, useState } from 'react';
import {
  subscribeToTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamPhoto,
} from '../../data/teamRepo.js';
import './TeamAdminTab.css';

const ROLES = ['President', 'Secretary', 'Treasurer', 'Chairperson', 'Committee Member'];

const EMPTY_FORM = { name: '', role: ROLES[0], image: '', storagePath: null };

function sortedByOrder(members) {
  return [...members].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    return orderDiff !== 0 ? orderDiff : a.id.localeCompare(b.id);
  });
}

function TeamAdminTab() {
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => subscribeToTeam(setMembers), []);

  const orderedMembers = sortedByOrder(members);

  function startAdd() {
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(member) {
    setForm({
      name: member.name ?? '',
      role: member.role ?? ROLES[0],
      image: member.image ?? '',
      storagePath: member.storagePath ?? null,
    });
    setPhotoFile(null);
    setEditingId(member.id);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function moveMember(member, direction) {
    const index = orderedMembers.findIndex((m) => m.id === member.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= orderedMembers.length) return;
    const neighbor = orderedMembers[swapIndex];
    const memberOrder = member.order ?? index;
    const neighborOrder = neighbor.order ?? swapIndex;
    await Promise.all([
      updateTeamMember(member.id, { order: neighborOrder }),
      updateTeamMember(neighbor.id, { order: memberOrder }),
    ]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const baseFields = { name: form.name, role: form.role };

      if (editingId) {
        let imageFields = { image: form.image, storagePath: form.storagePath };
        if (photoFile) {
          imageFields = await uploadTeamPhoto(photoFile);
        }
        await updateTeamMember(editingId, { ...baseFields, ...imageFields });
      } else {
        let imageFields = { image: '', storagePath: null };
        if (photoFile) {
          imageFields = await uploadTeamPhoto(photoFile);
        }
        const nextOrder = members.reduce((max, m) => Math.max(max, m.order ?? 0), -1) + 1;
        await createTeamMember({ ...baseFields, order: nextOrder, ...imageFields });
      }

      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save team member:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member) {
    if (!window.confirm(`Delete "${member.name}"?`)) return;
    await deleteTeamMember(member.id);
  }

  return (
    <div className="team-admin">
      <button type="button" className="team-admin__add" onClick={startAdd}>
        Add Team Member
      </button>

      <ul className="team-admin__list">
        {orderedMembers.map((member) => (
          <li key={member.id} className="team-admin__row">
            {member.image && <img className="team-admin__thumb" src={member.image} alt="" />}
            <span className="team-admin__name">{member.name}</span>
            <span className="team-admin__role">{member.role}</span>
            <div className="team-admin__reorder">
              <button
                type="button"
                aria-label={`Move ${member.name} up`}
                onClick={() => moveMember(member, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${member.name} down`}
                onClick={() => moveMember(member, 1)}
              >
                ↓
              </button>
            </div>
            <button type="button" onClick={() => startEdit(member)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(member)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {showForm && (
        <form className="team-admin__form" onSubmit={handleSubmit}>
          <label htmlFor="team-name">Name</label>
          <input
            id="team-name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />

          <label htmlFor="team-role">Role</label>
          <select
            id="team-role"
            value={form.role}
            onChange={(event) => updateField('role', event.target.value)}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <label htmlFor="team-photo">Photo</label>
          <input
            id="team-photo"
            type="file"
            accept="image/*"
            onChange={(event) => setPhotoFile(event.target.files[0] ?? null)}
          />

          {error && <p className="team-admin__error">{error}</p>}

          <div className="team-admin__form-actions">
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

export default TeamAdminTab;
