import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function BonusBuy() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      const validExtensions = ['.xls', '.xlsx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        setError('Please upload only Excel files (.xls, .xlsx)');
        event.target.value = '';
      }
    }
  };

  const validateTabs = (sheetNames: string[], requiredTabs: string[]): boolean => {
    return requiredTabs.every(tab =>
      sheetNames.some(sheet => sheet.toLowerCase().trim() === tab.toLowerCase().trim())
    );
  };

  const uploadToS3 = async () => {
    if (!selectedFile) return;

    try {
      // Step 1: Get presigned URL from Lambda
      const lambdaResponse = await fetch('https://419xs82u58.execute-api.ap-southeast-2.amazonaws.com/get-upload-url', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'bonus_buy_report.xlsx',
          fileType: selectedFile.type
        })
      });

      if (!lambdaResponse.ok) {
        const errorText = await lambdaResponse.text();
        throw new Error(`Failed to get upload URL: ${errorText || lambdaResponse.statusText}`);
      }

      const responseData = await lambdaResponse.json();
      const { url } = responseData;

      // Step 2: Upload file to S3 using presigned URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      console.log('Upload successful');
      setSuccess(`File uploaded successfully!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Unknown error occurred'}`);
      setUploading(false);
    }
  };

  const handleUpload = () => {
    setError('');
    setSuccess('');
    setUploading(true);

    if (!selectedFile) {
      setError('Please select a file first');
      setUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
          setError('The file has no sheets/tabs!');
          return;
        }

        // Define required tab names for Bonus Buy file
        const requiredTabs = ['Articles', 'Articles - App'];

        if (validateTabs(sheetNames, requiredTabs)) {
          console.log('Validation passed. Uploading to S3...');
          uploadToS3();
        } else {
          setError(`Invalid file format!\n\nRequired tabs: ${requiredTabs.join(', ')}\n\nFound tabs: ${sheetNames.join(', ')}`);
          setUploading(false);
        }
      } catch (error) {
        setError('Error reading file. Please ensure it is a valid Excel file.');
        setUploading(false);
        console.error(error);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  return (
    <div className="App">
      <div className="background-images-wrapper">
        <div className="background-image left" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/7eleven_svg.svg)` }}></div>
        <div className="background-image right" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/tipple_svg.svg)` }}></div>
      </div>
      <main className="content">
        <button onClick={() => navigate('/')} className="back-button">← Home</button>
        <h1>Upload Monthly Bonus Buy File</h1>
          <br></br>
        <p>Please select and upload your monthly bonus buy file. <br></br>(Excel only)</p>

        {error && (
          <div className="message-box error-box">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}

        {success && (
          <div className="message-box success-box">
            <strong>Success:</strong>
            <p>{success}</p>
          </div>
        )}

        <div className="upload-section">
          <input
            type="file"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose File'}
          </label>

          {selectedFile && (
            <button onClick={handleUpload} className="upload-button" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default BonusBuy;
