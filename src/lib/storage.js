const STORAGE_KEYS = {
  PROJECTS: 'tracker_projects',
  ENTRIES: 'tracker_entries'
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

// Projects
export const getProjects = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push({ ...project, id: project.id || generateId() });
  }
  
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return projects;
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return projects;
};

// Entries
export const getEntries = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
};

export const saveEntry = (entry) => {
  const entries = getEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.push({ ...entry, id: entry.id || generateId(), date: entry.date || new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  return entries;
};

export const deleteEntry = (id) => {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  return entries;
};

export const deleteEntries = (ids) => {
  const entries = getEntries().filter(e => !ids.includes(e.id));
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  return entries;
};
