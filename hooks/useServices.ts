import { useState, useEffect } from 'react';
import { Service, ServiceInput } from '@/types/service';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const createService = async (data: ServiceInput) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchServices();
      return true;
    }
    return false;
  };

  const updateService = async (id: number, data: ServiceInput) => {
    const response = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchServices();
      return true;
    }
    return false;
  };

  const deleteService = async (id: number) => {
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await fetchServices();
      return true;
    }
    return false;
  };

  const togglePin = async (id: number) => {
    const response = await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-pin' }),
    });
    if (response.ok) {
      await fetchServices();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
    togglePin,
  };
}
