import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function RangeRefresh() {
  const navigate = useNavigate();
  const [blueYonderFile, setBlueYonderFile] = useState<File | null>(null);
  const [ecommerceFile, setEcommerceFile] = useState<File | null>(null);
  const [salesOrderFile, setSalesOrderFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploading, setUploading] = useState<{
    blueYonder: boolean;
    ecommerce: boolean;
    salesOrder: boolean;
  }>({ blueYonder: false, ecommerce: false, salesOrder: false });
  const blueYonderInputRef = React.useRef<HTMLInputElement>(null);
  const ecommerceInputRef = React.useRef<HTMLInputElement>(null);
  const salesOrderInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'blueYonder' | 'ecommerce' | 'salesOrder') => {
    setError('');
    setSuccess('');

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validTypes = ['text/csv', 'application/csv'];
      const validExtensions = ['.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        if (fileType === 'blueYonder') setBlueYonderFile(file);
        else if (fileType === 'ecommerce') setEcommerceFile(file);
        else if (fileType === 'salesOrder') setSalesOrderFile(file);
      } else {
        setError('Please upload only CSV files (.csv)');
        event.target.value = '';
      }
    }
  };

  const uploadToS3 = async (file: File, fileName: string, fileType: 'blueYonder' | 'ecommerce' | 'salesOrder') => {
    try {
      // Step 1: Get presigned URL from Lambda
      const lambdaResponse = await fetch('https://gt3yxk0ak5.execute-api.ap-southeast-2.amazonaws.com/get-upload-url', {
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
        const errorText = await lambdaResponse.text();
        throw new Error(`Failed to get upload URL: ${errorText || lambdaResponse.statusText}`);
      }

      const responseData = await lambdaResponse.json();
      const { url } = responseData;

      // Step 2: Upload file to S3 using presigned URL
      const contentType = file.type || 'text/csv';

      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      setSuccess((prev) => prev + `${fileName} uploaded successfully!\n`);

      // Clear the specific file
      if (fileType === 'blueYonder') {
        setBlueYonderFile(null);
        if (blueYonderInputRef.current) blueYonderInputRef.current.value = '';
      } else if (fileType === 'ecommerce') {
        setEcommerceFile(null);
        if (ecommerceInputRef.current) ecommerceInputRef.current.value = '';
      } else if (fileType === 'salesOrder') {
        setSalesOrderFile(null);
        if (salesOrderInputRef.current) salesOrderInputRef.current.value = '';
      }

      setUploading((prev) => ({ ...prev, [fileType]: false }));
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed for ${fileName}: ${err.message || 'Unknown error occurred'}`);
      setUploading((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleUpload = (file: File, fileName: string, fileType: 'blueYonder' | 'ecommerce' | 'salesOrder') => {
    setError('');
    setSuccess('');
    setUploading((prev) => ({ ...prev, [fileType]: true }));

    // For CSV files, skip validation and upload directly
    console.log('Uploading to S3...');
    uploadToS3(file, fileName, fileType);
  };

  return (
    <div className="App">
      <div className="background-images-wrapper">
        <div className="background-image left" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/7eleven_svg.svg)` }}></div>
        <div className="background-image right" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/tipple_svg.svg)` }}></div>
      </div>
      <main className="content range-refresh-content">
        <button onClick={() => navigate('/')} className="back-button">← Home</button>
        <h1>Upload Range Refresh Files</h1>
        <p style={{ marginBottom: '0.5rem' }}>Select and upload your CSV files below</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0' }}>All files must be in CSV format</p>

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

        <div className="file-upload-grid">
          <div className="file-card">
            <div className="file-card-icon">📊</div>
            <h3 className="file-card-title">Blue Yonder File</h3>
            <p className="file-card-description">Upload your Blue Yonder inventory data</p>

            <input
              type="file"
              id="blue-yonder-upload"
              ref={blueYonderInputRef}
              onChange={(e) => handleFileChange(e, 'blueYonder')}
              accept=".csv"
              className="file-input"
            />
            <label htmlFor="blue-yonder-upload" className="file-label-card">
              <span className="file-icon">📁</span>
              <span className="file-text">{blueYonderFile ? blueYonderFile.name : 'Choose file'}</span>
            </label>

            {blueYonderFile && (
              <button
                onClick={() => handleUpload(blueYonderFile, 'blue_yonda_range-test.csv', 'blueYonder')}
                className="upload-button-card"
                disabled={uploading.blueYonder}
              >
                {uploading.blueYonder ? (
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
          </div>

          <div className="file-card">
            <div className="file-card-icon">💰</div>
            <h3 className="file-card-title">eCommerce Price File</h3>
            <p className="file-card-description">Upload your eCommerce pricing data</p>

            <input
              type="file"
              id="ecommerce-upload"
              ref={ecommerceInputRef}
              onChange={(e) => handleFileChange(e, 'ecommerce')}
              accept=".csv"
              className="file-input"
            />
            <label htmlFor="ecommerce-upload" className="file-label-card">
              <span className="file-icon">📁</span>
              <span className="file-text">{ecommerceFile ? ecommerceFile.name : 'Choose file'}</span>
            </label>

            {ecommerceFile && (
              <button
                onClick={() => handleUpload(ecommerceFile, 'ecommerce_file-test.csv', 'ecommerce')}
                className="upload-button-card"
                disabled={uploading.ecommerce}
              >
                {uploading.ecommerce ? (
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
          </div>

          <div className="file-card">
            <div className="file-card-icon">📦</div>
            <h3 className="file-card-title">Sales & Order File</h3>
            <p className="file-card-description">Upload your sales and order data</p>

            <input
              type="file"
              id="sales-order-upload"
              ref={salesOrderInputRef}
              onChange={(e) => handleFileChange(e, 'salesOrder')}
              accept=".csv"
              className="file-input"
            />
            <label htmlFor="sales-order-upload" className="file-label-card">
              <span className="file-icon">📁</span>
              <span className="file-text">{salesOrderFile ? salesOrderFile.name : 'Choose file'}</span>
            </label>

            {salesOrderFile && (
              <button
                onClick={() => handleUpload(salesOrderFile, 'sevs_sales_orders-test.csv', 'salesOrder')}
                className="upload-button-card"
                disabled={uploading.salesOrder}
              >
                {uploading.salesOrder ? (
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default RangeRefresh;
