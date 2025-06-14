import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { SERVER_URL_FORM } from '../config'; // e.g., http://localhost:3001/forms

interface Form {
  id: string;
  title: string;
}

interface RoomStatus {
  formId: string;
  isRoomEnabled: boolean;
}

export default function FormRoomDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<Record<string, RoomStatus>>({});

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get(SERVER_URL_FORM);
        setForms(res.data);
        res.data.forEach((form: Form) => fetchRoomStatus(form.id));
      } catch (err) {
        console.error('Failed to load forms:', err);
      }
    };

    fetchForms();
  }, []);

  // Poll room status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      forms.forEach(form => fetchRoomStatus(form.id));
    }, 5000);

    return () => clearInterval(interval);
  }, [forms]);

  const fetchRoomStatus = async (formId: string) => {
    try {
      const res = await axios.get(`http://localhost:4000/room-status/${formId}`);
      setRoomStatuses(prev => ({
        ...prev,
        [formId]: {
          formId,
          isRoomEnabled: res.data.isOpen,
        },
      }));
    } catch (err) {
      console.error(`Failed to fetch room status for form ${formId}:`, err);
    }
  };

  const toggleRoom = async (formId: string, currentlyOpen: boolean) => {
    try {
      const endpoint = currentlyOpen
        ? `http://localhost:4000/close-room/${formId}`
        : `http://localhost:4000/open-room/${formId}`;

      const res = await axios.post(endpoint);

      // Optimistically update UI
      setRoomStatuses(prev => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          isRoomEnabled: !currentlyOpen,
        },
      }));

      console.log(res.data.message);
    } catch (err) {
      console.error(`Failed to ${currentlyOpen ? 'close' : 'open'} room for form ${formId}:`, err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Form Room Management Dashboard</h2>
      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Form Name</th>
            <th>Form ID</th>
            <th>Room Enabled</th>
            <th>Toggle Room</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => {
            const status = roomStatuses[form.id];
            const isEnabled = status?.isRoomEnabled;
            return (
              <tr key={form.id}>
                <td>{form.title}</td>
                <td>{form.id}</td>
                <td>{isEnabled ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    onClick={() => toggleRoom(form.id, isEnabled ?? false)}
                  >
                    {isEnabled ? 'Close Room' : 'Open Room'}
                  </button>
                </td>
                <td>
                  <Link to={`/form-results/${form.id}`}>View Results</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
