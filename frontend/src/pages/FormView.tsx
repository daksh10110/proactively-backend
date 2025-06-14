import { useParams } from 'react-router-dom';

const FormView = () => {
  const { formId } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Form ID: {formId}</h1>
      <p>Live form collaboration will be shown here.</p>
    </div>
  );
};

export default FormView;
