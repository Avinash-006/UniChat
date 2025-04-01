import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MyDrive.css';

const MyDrive = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('My Files');
  const [files, setFiles] = useState({ 
    'My Files': [], 
    'Recents': [], 
    'Favourites': [], 
    'Shared in Groups': [] 
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [showMenu, setShowMenu] = useState(null);
  const [error, setError] = useState(null);
  const prevActiveSectionRef = useRef(null); // Track previous activeSection

  useEffect(() => {
    // Only fetch if activeSection has changed
    if (prevActiveSectionRef.current !== activeSection) {
      fetchFiles();
      prevActiveSectionRef.current = activeSection;
    }
  }, [activeSection, user]);

  const fetchFiles = async () => {
    if (!user?.username) {
      setError('No username available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url;
      if (activeSection === 'Favourites') {
        url = `http://192.168.97.20:8080/api/users/file/favourites/${user.username}`;
      } else if (activeSection === 'Shared in Groups') {
        url = `http://192.168.97.20:8080/api/groups/shared-files/${user.username}`;
      } else {
        url = `http://192.168.97.20:8080/api/file/viewall/${user.username}`;
      }
      
      console.log(`Fetching files from: ${url}`);
      const response = await axios.get(url);
      console.log('API Response:', response.data);

      const fetchedFiles = Array.isArray(response.data) ? response.data : [];
      console.log('Processed files:', fetchedFiles);

      setFiles(prev => ({
        ...prev,
        [activeSection]: fetchedFiles,
        ...(activeSection === 'My Files' && { 'Recents': fetchedFiles.slice(-3) })
      }));
    } catch (error) {
      console.error('Error fetching files:', error);
      let errorMessage = 'Failed to load files: ';
      if (error.response) {
        errorMessage += error.response.data?.message || 'Unknown server error';
      } else {
        errorMessage += error.message || 'Network error';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const uploadUrl = `http://192.168.97.20:8080/api/file/upload/${user.id}`;
      console.log(`Uploading to: ${uploadUrl}`);
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      console.log('Upload response:', response.data);
      await fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Failed to upload file: ';
      if (error.response) {
        errorMessage += error.response.data?.message || 'Unknown server error';
      } else {
        errorMessage += error.message || 'Network error';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (id, fileName) => {
    setDownloadProgress((prev) => ({ ...prev, [id]: 0 }));
    try {
      const response = await axios.get(`http://192.168.97.20:8080/api/file/download/${id}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress((prev) => ({ ...prev, [id]: percentCompleted }));
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadProgress((prev) => ({ ...prev, [id]: 0 }));
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://192.168.97.20:8080/api/file/delete/${id}`);
      console.log('Delete response:', response.data);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  const toggleFavourite = async (file) => {
    try {
      const response = await axios.put(`http://192.168.97.20:8080/api/users/file/favourite/${file.id}/${!file.isFavourite}`);
      console.log('Favourite toggle response:', response.data);
      await fetchFiles();
    } catch (error) {
      console.error('Error updating favourite status:', error);
      setError('Failed to update favourite status: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="mydrive-container">
      <div className="main-content">
        <div className="header">
          <div className="section-tabs">
            {['My Files', 'Recents', 'Favourites', 'Shared in Groups'].map(section => (
              <button
                key={section}
                className={`section-tab ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
          {activeSection === 'My Files' && (
            <label className="upload-btn">
              <span>+ Upload</span>
              <input type="file" hidden onChange={handleFileUpload} />
            </label>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        <div className="files-container">
          {loading ? (
            <div className="loader"></div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : files[activeSection].length === 0 ? (
            <div className="no-files">No files found</div>
          ) : (
            files[activeSection].map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div>
                    <span className="file-name">{file.fileName}</span>
                    {file.groupName && (
                      <div className="group-name">Shared in: {file.groupName}</div>
                    )}
                  </div>
                </div>
                <button className="menu-btn" onClick={() => toggleMenu(file.id)}>⋮</button>
                {showMenu === file.id && (
                  <div className="context-menu">
                    <button onClick={() => handleDownload(file.id, file.fileName)}>Download</button>
                    {activeSection !== 'Shared in Groups' && (
                      <>
                        <button onClick={() => handleDelete(file.id)}>Delete</button>
                        <button onClick={() => toggleFavourite(file)}>
                          {file.isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {downloadProgress[file.id] > 0 && (
                  <div className="progress-bar download">
                    <div style={{ width: `${downloadProgress[file.id]}%` }}></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDrive;