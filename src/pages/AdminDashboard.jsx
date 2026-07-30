import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import EventsAdminTab from '../components/admin/EventsAdminTab.jsx';
import SponsorsAdminTab from '../components/admin/SponsorsAdminTab.jsx';
import GalleryAdminTab from '../components/admin/GalleryAdminTab.jsx';
import TeamAdminTab from '../components/admin/TeamAdminTab.jsx';
import { seedLegacyData } from '../utils/seedLegacyData.js';
import './AdminDashboard.css';

function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('events');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  async function handleSeed() {
    if (
      !window.confirm(
        'Import the existing static events and gallery data into Firestore? Only run this once.'
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedMessage('');
    try {
      const { skipped } = await seedLegacyData();
      if (skipped.length === 0) {
        setSeedMessage('Legacy data imported successfully.');
      } else if (skipped.length === 3) {
        setSeedMessage('Nothing imported — events, gallery, and team already have data.');
      } else {
        setSeedMessage(`Imported what was missing. Skipped (already had data): ${skipped.join(', ')}.`);
      }
    } catch {
      setSeedMessage('Import failed. Check the console for details.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <h1>Admin Dashboard</h1>
        <div className="admin-dashboard__header-actions">
          <button type="button" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Importing…' : 'Import Legacy Data (one-time)'}
          </button>
          <button type="button" onClick={logout}>
            Log Out
          </button>
        </div>
      </header>

      {seedMessage && <p className="admin-dashboard__seed-message">{seedMessage}</p>}

      <nav className="admin-dashboard__tabs">
        <button
          type="button"
          className={
            tab === 'events'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('events')}
        >
          Events
        </button>
        <button
          type="button"
          className={
            tab === 'sponsors'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('sponsors')}
        >
          Sponsors
        </button>
        <button
          type="button"
          className={
            tab === 'gallery'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('gallery')}
        >
          Gallery
        </button>
        <button
          type="button"
          className={
            tab === 'team'
              ? 'admin-dashboard__tab admin-dashboard__tab--active'
              : 'admin-dashboard__tab'
          }
          onClick={() => setTab('team')}
        >
          Team
        </button>
      </nav>

      {tab === 'events' && <EventsAdminTab />}
      {tab === 'sponsors' && <SponsorsAdminTab />}
      {tab === 'gallery' && <GalleryAdminTab />}
      {tab === 'team' && <TeamAdminTab />}
    </div>
  );
}

export default AdminDashboard;
