import { useState, useEffect } from 'react';
import { Project, ProjectBasicInput, ProjectExtendedInput } from '@/types/project';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: ProjectBasicInput) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchProjects();
      return true;
    }
    return false;
  };

  const updateProject = async (id: number, data: ProjectBasicInput) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchProjects();
      return true;
    }
    return false;
  };

  const updateProjectExtended = async (id: number, data: ProjectExtendedInput) => {
    const response = await fetch(`/api/projects/${id}/extended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchProjects();
      return true;
    }
    return false;
  };

  const fetchProjectExtended = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}/extended`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching extended info:', error);
      return null;
    }
  };

  const deleteProject = async (id: number) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await fetchProjects();
      return true;
    }
    return false;
  };

  const togglePin = async (id: number) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-pin' }),
    });
    if (response.ok) {
      await fetchProjects();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    updateProjectExtended,
    fetchProjectExtended,
    deleteProject,
    togglePin,
  };
}
