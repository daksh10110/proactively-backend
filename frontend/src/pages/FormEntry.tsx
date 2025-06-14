import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FormEntry = () => {
  const [formId, setFormId] = useState('');
  const navigate = useNavigate();

  const handleEnter = () => {
    if (formId) navigate(`/form/${formId}`);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Form ID"
        value={formId}
        onChange={(e) => setFormId(e.target.value)}
      />
      <button onClick={handleEnter}>
        Join Form
      </button>
    </div>
  );
};

export default FormEntry;
