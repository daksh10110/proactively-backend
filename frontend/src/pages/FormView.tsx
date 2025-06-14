import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ElementTypeName } from './enum'; // Adjust the import path as necessary

const SOCKET_SERVER_URL = 'http://localhost:4000';


interface ElementOption {
    id: string;
    label: string;
}

interface FormElement {
    id: string;
    label: string;
    type: ElementTypeName;
    dropdownOptions?: ElementOption[];
}

interface FormData {
    id: string;
    title: string;
    elements: FormElement[];
}

const FormView = () => {
    const { formId } = useParams<{ formId: string }>();

    const [form, setForm] = useState<FormData | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [locks, setLocks] = useState<Record<string, string>>({});
    const [userCount, setUserCount] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>('Connecting to server...');
    const [isRoomOpen, setIsRoomOpen] = useState<boolean>(true);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await axios.get<FormData>(`http://localhost:3000/api/forms/${formId}`);
                setForm(res.data);
            } catch (error) {
                console.error('Failed to fetch form:', error);
                setStatusMessage('Error loading form.');
            }
        };

        fetchForm();
    }, [formId]);

    useEffect(() => {
        if (!formId) return;

        const socket = io(SOCKET_SERVER_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
            setStatusMessage('Connected');
            socket.emit('join_room', formId);
        });

        socket.on('disconnect', () => {
            setStatusMessage('Disconnected from server.');
        });

        socket.on('room_closed', () => {
            setIsRoomOpen(false);
            setStatusMessage('This collaboration room is closed.');
        });

        socket.on('user_count', (count: number) => setUserCount(count));

        socket.on('lock_update', ({ fieldId, lockedBy }: { fieldId: string; lockedBy: string | null }) => {
            setLocks(prev => {
                const newLocks = { ...prev };
                if (lockedBy) newLocks[fieldId] = lockedBy;
                else delete newLocks[fieldId];
                return newLocks;
            });
        });

        socket.on('field_update', ({ fieldId, value }: { fieldId: string; value: string }) => {
            setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        });

        return () => {
            socket.emit('leave_room', formId);
            socket.disconnect();
        };
    }, [formId]);

    const handleFocus = (fieldId: string) => {
        const socket = socketRef.current;
        if (!locks[fieldId] || locks[fieldId] === socket?.id) {
            socket?.emit('lock_field', { formId, fieldId });
        }
    };

    const handleChange = (fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        const socket = socketRef.current;
        if (locks[fieldId] === socket?.id) {
            socket?.emit('field_update', { formId, fieldId, value });
        }
    };

    const handleBlur = (fieldId: string) => {
        const socket = socketRef.current;
        if (locks[fieldId] === socket?.id) {
            socket?.emit('unlock_field', { formId, fieldId });
        }
    };

    if (!form) return <div>Loading form...</div>;
    if (!isRoomOpen) return <div><h1>{form.title}</h1><p>{statusMessage}</p></div>;

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <h1>{form.title}</h1>
            <p>Active Users: <span>{userCount}</span></p>
            <div>
                {form.elements.map(el => {
                    const myId = socketRef.current?.id;
                    const isLockedByOther = locks[el.id] && locks[el.id] !== myId;
                    const isLockedByYou = locks[el.id] === myId;

                    const style: React.CSSProperties = {
                        marginBottom: '16px',
                        padding: '8px',
                        border: '1px solid',
                        borderColor: isLockedByYou ? 'green' : '#ccc',
                        backgroundColor: isLockedByOther ? '#f0f0f0' : 'white'
                    };

                    const isTextbox = [
                        ElementTypeName.TEXTBOX_ALPHANUMERIC,
                        ElementTypeName.TEXTBOX_NUMERIC
                    ].includes(el.type as any);

                    const isDropdown = [
                        ElementTypeName.DROPDOWN_SINGLE,
                        ElementTypeName.DROPDOWN_MULTI
                    ].includes(el.type as any);

                    return (
                        <div key={el.id} style={style}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>{el.label}</label>
                            {isTextbox && (
                                <input
                                    type="text"
                                    value={fieldValues[el.id] || ''}
                                    disabled={!!isLockedByOther}
                                    onFocus={() => handleFocus(el.id)}
                                    onChange={(e) => handleChange(el.id, e.target.value)}
                                    onBlur={() => handleBlur(el.id)}
                                    style={{ width: '100%', padding: '6px' }}
                                />
                            )}
                            {isDropdown && (
                                <select
                                    value={fieldValues[el.id] || ''}
                                    disabled={!!isLockedByOther}
                                    onFocus={() => handleFocus(el.id)}
                                    onChange={(e) => handleChange(el.id, e.target.value)}
                                    onBlur={() => handleBlur(el.id)}
                                    style={{ width: '100%', padding: '6px' }}
                                >
                                    <option value="">Select an option</option>
                                    {el.dropdownOptions?.map(opt => (
                                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                            <p style={{ fontSize: '12px', color: isLockedByYou ? 'green' : 'red' }}>
                                {isLockedByYou && 'You are editing this field.'}
                                {isLockedByOther && `Locked by another user (${locks[el.id].substring(0, 6)}...)`}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div>{statusMessage}</div>
        </div>
    );
};

export default FormView;
