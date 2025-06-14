import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

interface ElementOption {
  id: string;
  label: string;
}

interface FormElement {
  id: string;
  label: string;
  type: string;
  dropdownOptions?: ElementOption[];
}

interface FormData {
  id: string;
  name: string;
  elements: FormElement[];
}

const socket = io('http://localhost:4000');

const FormView = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [locks, setLocks] = useState<Record<string, string>>({});
  const [roomOpen, setRoomOpen] = useState<boolean | null>(null); // null = loading
  const [activeUsers, setActiveUsers] = useState(0);
  const inactivityTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // const userId = useRef(`${Date.now()}_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Fetch form data
        const formRes = await axios.get(`http://localhost:3000/api/forms/${formId}`);
        setForm(formRes.data);

        // Step 2: Check room 
        const statusRes = await axios.get(`http://localhost:4000/room-status/${formId}`);
        console.log('Room status:', statusRes.data);
        const isOpen = statusRes.data.isRoomEnabled

        if (!isOpen) {
          setRoomOpen(false);
          return;
        }

        setRoomOpen(true);

        // Step 3: Join socket room only if it's open
        socket.emit('join_room', formId);status

        socket.on('room_closed', () => {
          setRoomOpen(false);
        });

        socket.on('user_count', (count: number) => {
          setActiveUsers(count);
        });

        socket.on('lock_update', ({ fieldId, lockedBy }: { fieldId: string; lockedBy: string | null }) => {
          setLocks(prev => ({ ...prev, [fieldId]: lockedBy ?? '' }));
        });

        socket.on('field_update', ({ fieldId, value }: { fieldId: string; value: string }) => {
          setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        });
      } catch (error) {
        console.error('Initialization error:', error);
        setRoomOpen(false); // default to closed
      }
    };

    initialize();

    return () => {
      socket.emit('leave_room', formId);
      Object.values(inactivityTimers.current).forEach(clearTimeout);
    };
  }, [formId]);

  const handleFocus = (fieldId: string) => {
    if (locks[fieldId] && locks[fieldId] !== socket.id) return;
    socket.emit('lock_field', { formId, fieldId });
  };

  const handleChange = (fieldId: string, value: string) => {
    if (locks[fieldId] !== socket.id) return;
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    socket.emit('field_update', { formId, fieldId, value });

    clearTimeout(inactivityTimers.current[fieldId]);
    inactivityTimers.current[fieldId] = setTimeout(() => {
      socket.emit('unlock_field', { formId, fieldId });
    }, 15000);
  };

  if (!form || roomOpen === null) return <div>Loading...</div>;
  if (!roomOpen) return <div>Room is closed. You cannot edit this form.</div>;

  return (
    <div>
      <h1>{form.name}</h1>
      <p>Active users: {activeUsers}</p>
      {form.elements.map((el) => {
        const isLocked = locks[el.id] && locks[el.id] !== socket.id;
        return (
          <div key={el.id} style={{ marginBottom: '16px', padding: '4px', border: '1px solid #000' }}>
            <label>{el.label}</label>
            <br />
            {el.type.startsWith('textbox') && (
              <input
                type="text"
                value={fieldValues[el.id] || ''}
                disabled={!!isLocked}
                onFocus={() => handleFocus(el.id)}
                onChange={(e) => handleChange(el.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  backgroundColor: isLocked ? '#f8d7da' : 'white'
                }}
              />
            )}
            {el.type.startsWith('dropdown') && (
              <select
                value={fieldValues[el.id] || ''}
                disabled={!!isLocked}
                onFocus={() => handleFocus(el.id)}
                onChange={(e) => handleChange(el.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px',
                  backgroundColor: isLocked ? '#f8d7da' : 'white'
                }}
              >
                <option value="">Select</option>
                {el.dropdownOptions?.map((opt) => (
                  <option key={opt.id} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            )}
            {locks[el.id] && (
              <p style={{ color: locks[el.id] !== socket.id ? 'red' : 'green', fontSize: '12px' }}>
                {locks[el.id] === socket.id
                  ? 'You are editing this field'
                  : `Locked by: ${locks[el.id]}`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormView;
