import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FormResults = () => {
  const { formId } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/response?formId=${formId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResults(res.data);
      } catch (err) {
        setError('Failed to fetch results.');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchResults();
    }
  }, [formId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Results for Form ID: {formId}</h2>
      {results.length === 0 ? (
        <p>No responses found.</p>
      ) : (
        results.map((result, idx) => (
          <pre key={idx}>{JSON.stringify(result, null, 2)}</pre>
        ))
      )}
    </div>
  );
};

export default FormResults;
