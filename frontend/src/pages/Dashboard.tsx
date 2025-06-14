import { useState } from 'react';
import axios from 'axios';

const elementTypes = [
  'textbox_numeric',
  'textbox_alphanumeric',
  'dropdown_single',
  'dropdown_multi',
];

const SERVER_URL = 'http://localhost:3000/api/forms';

const AdminFormDashboard = () => {
  const [formName, setFormName] = useState('');
  const [elements, setElements] = useState([]);
  const [currentElement, setCurrentElement] = useState({ label: '', type: '', dropdownOptions: [''] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddDropdownOption = () => {
    setCurrentElement({
      ...currentElement,
      dropdownOptions: [...(currentElement.dropdownOptions || []), ''],
    });
  };

  const handleDropdownChange = (index, value) => {
    const newOptions = [...currentElement.dropdownOptions];
    newOptions[index] = value;
    setCurrentElement({ ...currentElement, dropdownOptions: newOptions });
  };

  const addElement = () => {
    if (!currentElement.label || !currentElement.type) return;
    const element = {
      label: currentElement.label,
      type: currentElement.type,
      dropdownOptions:
        currentElement.type.includes('dropdown') && currentElement.dropdownOptions
          ? currentElement.dropdownOptions.filter((o) => o.trim())
          : [],
    };
    setElements([...elements, element]);
    setCurrentElement({ label: '', type: '', dropdownOptions: [''] });
  };

  const createForm = async () => {
    if (!formName || elements.length === 0) return alert('Provide form name and at least one element.');
    setLoading(true);
    try {
      const res = await axios.post(SERVER_URL, {
        title: formName,
        elements,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Form created successfully!');
      setFormName('');
      setElements([]);
    } catch (err) {
      setMessage('Error creating form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Form</h2>
      <input
        type="text"
        placeholder="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
      />

      <h3>Add Element</h3>
      <input
        type="text"
        placeholder="Element Label"
        value={currentElement.label}
        onChange={(e) => setCurrentElement({ ...currentElement, label: e.target.value })}
      />
      <select
        value={currentElement.type}
        onChange={(e) => setCurrentElement({ ...currentElement, type: e.target.value })}
      >
        <option value="">Select Type</option>
        {elementTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      {currentElement.type.includes('dropdown') && (
        <div>
          <h4>Dropdown Options</h4>
          {currentElement.dropdownOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              value={opt}
              onChange={(e) => handleDropdownChange(idx, e.target.value)}
            />
          ))}
          <button onClick={handleAddDropdownOption}>Add Option</button>
        </div>
      )}

      <button onClick={addElement}>Add Element</button>

      <h3>Form Preview</h3>
      <ul>
        {elements.map((el, idx) => (
          <li key={idx}>
            <b>{el.label}</b> - {el.type}
            {el.dropdownOptions?.length > 0 && (
              <ul>
                {el.dropdownOptions.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <button onClick={createForm} disabled={loading}>
        {loading ? 'Creating...' : 'Create Form'}
      </button>
      <p>{message}</p>
    </div>
  );
};

export default AdminFormDashboard;
