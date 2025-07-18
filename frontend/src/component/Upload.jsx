import React, { useState } from "react";
import axios from "axios";

// Simple spinner component
function Spinner() {
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_BackendURL}/api/upload`, formData);
      setData(response.data);
      console.log("Response data:", response.data);
    } catch (err) {
      setError("Failed to upload or process resume.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-start py-10 font-sans">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center">AI Resume Analyzer</h1>
        <p className="text-gray-600 mb-6 text-center">
          Upload your resume (PDF) and get instant AI-powered feedback!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-auto"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition duration-150 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Analyzing..." : "Upload Resume"}
          </button>
        </div>
        {loading && <Spinner />}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        {data && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">Analysis Results</h2>
            <div>
              <h3 className="font-semibold mb-2 text-blue-600">Feedback:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(data.feedback).map(([key, value], idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-gray-800">{key.replace(/_/g, ' ')}:</span>
                    <span className="ml-2 text-gray-700">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        )}
      </div>
      
    </div>
  );
}

export default App;

