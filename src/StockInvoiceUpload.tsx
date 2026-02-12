import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function StockInvoiceUpload() {
  const navigate = useNavigate();
  const [stockInvoiceFile, setStockInvoiceFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [funMessage, setFunMessage] = useState<string>('');
  const stockInvoiceInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validTypes = ['text/csv', 'application/csv'];
      const validExtensions = ['.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setStockInvoiceFile(file);
      } else {
        setError('Please upload only CSV files (.csv)');
        event.target.value = '';
      }
    }
  };

  const funMessages = [
    "📦 Packing your data with care...",
    "🚀 Launching files to the cloud...",
    "☁️ Your data is traveling at lightspeed!",
    "🎯 Almost there! Organizing your files...",
    "💪 Working hard on this upload...",
    "🌟 Your patience is appreciated!",
    "🎨 Making your data look pretty...",
    "🔐 Securing your files...",
    "🙋🏽‍♂️ A wave from Kush...",
    "✨ Adding some magic to your data...",
  ];

  const uploadToS3 = async (file: File, fileName: string) => {
    try {
      setTotalBytes(file.size);
      setUploadedBytes(0);
      setUploadProgress(0);

      // Rotate fun messages during upload
      const messageInterval = setInterval(() => {
        const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
        setFunMessage(randomMessage);
      }, 3000);

      // Step 1: Get presigned URL from Lambda
      const lambdaResponse = await fetch('https://gh5zd4vl2f.execute-api.ap-southeast-2.amazonaws.com/get-upload-url', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileName
        })
      });

      if (!lambdaResponse.ok) {
        clearInterval(messageInterval);
        const errorText = await lambdaResponse.text();
        throw new Error(`Failed to get upload URL: ${errorText || lambdaResponse.statusText}`);
      }

      const responseData = await lambdaResponse.json();
      const { url } = responseData;

      // Step 2: Upload file to S3 using XMLHttpRequest for progress tracking
      const contentType = file.type || 'text/csv';

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(percentComplete);
            setUploadedBytes(e.loaded);

            // Calculate upload speed
            const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
            const speed = e.loaded / elapsedTime; // bytes per second
            setUploadSpeed(speed);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Failed to upload file to S3: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.send(file);
      });

      clearInterval(messageInterval);
      setFunMessage('');
      setSuccess(`${fileName} uploaded successfully!\n`);

      // Mark as completed and clear the file
      setCompleted(true);
      setStockInvoiceFile(null);
      if (stockInvoiceInputRef.current) stockInvoiceInputRef.current.value = '';

      setUploading(false);
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(0);
      setUploadSpeed(0);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed for ${fileName}: ${err.message || 'Unknown error occurred'}`);
      setUploading(false);
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(0);
      setUploadSpeed(0);
      setFunMessage('');
    }
  };

  const handleUpload = (file: File, fileName: string) => {
    setError('');
    setSuccess('');
    setUploading(true);
    setFunMessage(funMessages[0]);

    // For CSV files, skip validation and upload directly
    uploadToS3(file, fileName);
  };

  const handleStockSync = async () => {
    setError('');
    setSuccess('');
    setSyncing(true);

    try {
      const response = await fetch('https://c69l9tot7k.execute-api.ap-southeast-2.amazonaws.com/Prod/trigger-stock-receipt-sync', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to trigger stock sync: ${errorText || response.statusText}`);
      }

      setSuccess('Stock sync triggered successfully!');
    } catch (err: any) {
      console.error('Stock sync error:', err);
      setError(`Stock sync failed: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setSyncing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const calculateETA = (): string => {
    if (uploadSpeed === 0 || uploadedBytes === 0) return 'Calculating...';
    const remainingBytes = totalBytes - uploadedBytes;
    const secondsRemaining = remainingBytes / uploadSpeed;

    if (secondsRemaining < 60) {
      return `${Math.ceil(secondsRemaining)}s`;
    } else if (secondsRemaining < 3600) {
      const minutes = Math.ceil(secondsRemaining / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(secondsRemaining / 3600);
      const minutes = Math.ceil((secondsRemaining % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="App">
      <div className="background-images-wrapper">
        <div className="background-image left" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/7eleven_svg.svg)` }}></div>
        <div className="background-image right" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/tipple_svg.svg)` }}></div>
      </div>
      <main className="content range-refresh-content">
        <button onClick={() => navigate('/')} className="back-button">← Home</button>
        <h1>Stock Invoice Upload</h1>
        <p style={{ marginBottom: '0.5rem' }}>Upload your stock invoice file and trigger stock sync</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0' }}>File must be in CSV format</p>

        {error && (
          <div className="message-box error-box">
            <strong>Error:</strong>
            <pre>{error}</pre>
          </div>
        )}

        {success && (
          <div className="message-box success-box">
            <strong>Success:</strong>
            <pre>{success}</pre>
          </div>
        )}

        {/* Upload Progress Overlay */}
        {uploading && uploadProgress > 0 && (
          <div className="upload-progress-overlay">
            <div className="upload-progress-container">
              <h2 className="upload-title">Uploading Your Files</h2>

              {/* Animated Characters */}
              <div className="character-animation">
                <span className="character-file">📄</span>
                <div className="dots-container">
                  <span className="dot dot-1"></span>
                  <span className="dot dot-2"></span>
                  <span className="dot dot-3"></span>
                  <span className="dot dot-4"></span>
                  <span className="dot dot-5"></span>
                </div>
                <span className="character-cloud">☁️</span>
              </div>

              {/* Fun Message */}
              {funMessage && <p className="fun-message">{funMessage}</p>}

              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                  <span className="progress-text">{Math.round(uploadProgress)}%</span>
                </div>
              </div>

              {/* Upload Stats */}
              <div className="upload-stats">
                <div className="stat-item">
                  <span className="stat-label">Uploaded:</span>
                  <span className="stat-value">{formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Speed:</span>
                  <span className="stat-value">{formatSpeed(uploadSpeed)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">ETA:</span>
                  <span className="stat-value">{calculateETA()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="file-upload-grid">
          {/* Step 1: Stock Invoice File */}
          <div className={`file-card ${completed ? 'completed' : ''}`}>
            <div className="step-number">Step 1</div>
            <div className="file-card-icon">📊</div>
            <h3 className="file-card-title">Stock Invoice File</h3>
            <p className="file-card-description">Upload your stock invoice file</p>

            {!completed ? (
              <>
                <input
                  type="file"
                  id="stock-invoice-upload"
                  ref={stockInvoiceInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="file-input"
                />
                <label htmlFor="stock-invoice-upload" className="file-label-card">
                  <span className="file-icon">📁</span>
                  <span className="file-text">{stockInvoiceFile ? stockInvoiceFile.name : 'Choose file'}</span>
                </label>

                {stockInvoiceFile && (
                  <button
                    onClick={() => handleUpload(stockInvoiceFile, stockInvoiceFile.name)}
                    className="upload-button-card"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span>⬆️</span> Upload
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="completed-badge">
                <span className="check-icon">✓</span>
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Step 2: Trigger Stock Sync */}
          <div className={`file-card ${!completed ? 'disabled' : ''}`}>
            <div className="step-number">Step 2</div>
            <div className="file-card-icon">🔄</div>
            <h3 className="file-card-title">Trigger Stock Sync</h3>
            <p className="file-card-description">
              {!completed ? 'Complete Step 1 first' : 'Click to start stock synchronization'}
            </p>

            {completed && (
              <button
                onClick={handleStockSync}
                className="upload-button-card"
                disabled={syncing}
                style={{ marginTop: '1rem' }}
              >
                {syncing ? (
                  <>
                    <span className="spinner"></span>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span>🔄</span> Trigger Sync
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StockInvoiceUpload;
