import { useState, useEffect } from 'react'
import ProjectManager from './components/ProjectManager'
import ManualEntry from './components/ManualEntry'
import DailyLog from './components/DailyLog'
import ConsolidatedView from './components/ConsolidatedView'
import WorkDayCalculator from './components/WorkDayCalculator'
import { getProjects, getEntries, deleteEntry, deleteEntries } from './lib/storage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);

  const loadData = () => {
    setProjects(getProjects());
    setEntries(getEntries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteEntry = (idOrIds) => {
    if (Array.isArray(idOrIds)) {
      deleteEntries(idOrIds);
    } else if (confirm('Delete this entry?')) {
      deleteEntry(idOrIds);
    }
    loadData();
  };

  return (
    <div className="container">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d1117' }}>T</span>
          </div>
          <h1 style={{ fontSize: '24px' }}>Time Tracker</h1>
        </div>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('tracker')}
          >
            Track
          </button>
          <button
            className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button
            className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {activeTab === 'projects' && (
          <ProjectManager projects={projects} onUpdate={loadData} />
        )}

        {activeTab === 'tracker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WorkDayCalculator />
            <ManualEntry projects={projects} onEntryAdded={loadData} />
            <DailyLog entries={entries} projects={projects} onDelete={handleDeleteEntry} />
          </div>
        )}

        {activeTab === 'summary' && (
          <ConsolidatedView entries={entries} projects={projects} />
        )}
      </main>
    </div>
  )
}

export default App
