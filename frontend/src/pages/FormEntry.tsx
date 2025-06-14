import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FormEntry = () => {
  const [formId, setFormId] = useState('');
  const navigate = useNavigate();

  const handleEnter = () => {
    if (formId) navigate(`/form/${formId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input
        type="text"
        className="input mb-4"
        placeholder="Enter Form ID"
        value={formId}
        onChange={(e) => setFormId(e.target.value)}
      />
      <button className="btn" onClick={handleEnter}>
        Join Form
      </button>
    </div>
  );
};

export default FormEntry;
