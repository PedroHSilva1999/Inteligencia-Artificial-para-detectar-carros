import axios from 'axios';
import React, { useState } from 'react';

const GifUpload = () => {
  const [file, setFile] = useState(null);
  const [processedGif, setProcessedGif] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setProcessedGif(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/process-gif/', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      setProcessedGif(url);
    } catch (error) {
      console.error('Error uploading GIF:', error);
      setError('An error occurred while processing the GIF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container  bg-dark text-white p-5 mt-5'>
      <div>
        <h1 className='text-center'>IA para detectar carros</h1>
      </div>
      <input type="file" onChange={handleFileChange} accept=".gif" className='form-control' />
      <button onClick={handleUpload} disabled={isLoading || !file} className='btn btn-primary mt-3 w-100'>
        {isLoading ? 'Processing...' : 'Upload GIF'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {processedGif && (
        <div className='mt-5 text-center' >
          <h3>GIF Processado:</h3>
          <img className='img-fluid' style={{width: '50%'}} src={processedGif} alt="Processed GIF" />
        </div>
      )}
    </div>
  );
};

export default GifUpload;