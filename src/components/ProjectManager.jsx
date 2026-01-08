import { useState } from 'react';
import { saveProject, deleteProject } from '../lib/storage';

const COLORS = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#a371f7', '#db6d28'];

export default function ProjectManager({ projects, onUpdate }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        saveProject({ name, color });
        setName('');
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        if (onUpdate) onUpdate();
    };

    const handleDelete = (id) => {
        if (confirm('Delete project? Entries associated with this project will remain but lose their project link.')) {
            deleteProject(id);
            if (onUpdate) onUpdate();
        }
    };

    return (
        <div className="card">
            <h2>Projects</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <input
                    type="text"
                    placeholder="New Project Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: '100px' }}
                >
                    {COLORS.map(c => (
                        <option key={c} value={c} style={{ color: c }}>● Color</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary">Add</button>
            </form>

            <ul style={{ listStyle: 'none', marginTop: '24px' }}>
                {projects.map(project => (
                    <li key={project.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: project.color }}></span>
                            <span>{project.name}</span>
                        </div>
                        <button
                            onClick={() => handleDelete(project.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                            Delete
                        </button>
                    </li>
                ))}
                {projects.length === 0 && <li className="text-muted" style={{ padding: '8px 0' }}>No projects yet.</li>}
            </ul>
        </div>
    );
}
