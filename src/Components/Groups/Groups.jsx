import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Groups.css';

const Groups = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [joinGroupPassword, setJoinGroupPassword] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [userFiles, setUserFiles] = useState([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [error, setError] = useState(null);
  const [groupAction, setGroupAction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatContainerRef = useRef(null);

  const fetchGroups = async () => {
    if (!user?.username) {
      setError('No username available');
      console.error('No username available for fetching groups');
      return;
    }

    try {
      console.log(`Fetching groups for username: ${user.username}`);
      const response = await axios.get(`http://192.168.97.20:8080/api/groups/user/${user.username}`);
      const fetchedGroups = Array.isArray(response.data) ? response.data : [];
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups: ' + (error.response?.data || error.message));
      setGroups([]);
    }
  };

  const fetchUserFiles = async () => {
    try {
      console.log(`Fetching user files for username: ${user.username}`);
      const response = await axios.get(`http://192.168.97.20:8080/api/file/viewall/${user.username}`);
      setUserFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching user files:', error);
      setError('Failed to load files: ' + (error.response?.data || error.message));
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      console.log(`Fetching messages for groupId: ${groupId}`);
      const response = await axios.get(`http://192.168.97.20:8080/api/groups/messages/${groupId}`);
      const fetchedMessages = Array.isArray(response.data) ? response.data : [];
      setGroupMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching group messages:', error);
      setError('Failed to load messages: ' + (error.response?.data || error.message));
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !newGroupPassword) {
      setError('Group name and password are required');
      return;
    }

    try {
      const response = await axios.post('http://192.168.97.20:8080/api/groups/create', {
        name: newGroupName,
        password: newGroupPassword,
        creatorUsername: user.username
      });
      setGroups([...groups, response.data]);
      setNewGroupName('');
      setNewGroupPassword('');
      setGroupAction(null);
      setError(null);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group: ' + (error.response?.data || error.message));
    }
  };

  const handleJoinGroup = async () => {
    // Validate inputs
    if (!joinGroupId || !joinGroupPassword) {
      setError('Group ID and password are required');
      return;
    }

    // Validate that joinGroupId is a number
    const groupIdNumber = parseInt(joinGroupId, 10);
    if (isNaN(groupIdNumber) || groupIdNumber <= 0) {
      setError('Group ID must be a valid positive number');
      return;
    }

    try {
      const response = await axios.post(`http://192.168.97.20:8080/api/groups/join/${groupIdNumber}`, {
        password: joinGroupPassword,
        username: user.username
      });

      const groupExists = groups.some(group => group.id === response.data.id);
      if (!groupExists) {
        setGroups([...groups, response.data]);
      }

      console.log('Joined group:', response.data);
      setJoinGroupId('');
      setJoinGroupPassword('');
      setGroupAction(null);
      setError(null);
    } catch (error) {
      console.error('Error joining group:', error);
      console.log('Error response:', error.response);
      console.log('Error data:', error.response?.data);

      let errorMessage = 'An error occurred while joining the group';

      if (error.response) {
        if (error.response.status === 400) {
          // Check the specific error message from the backend
          const backendMessage = error.response.data || 'Invalid group ID or password';
          if (backendMessage.includes('Invalid group ID')) {
            errorMessage = 'Invalid group ID. Please check the group ID and try again.';
          } else if (backendMessage.includes('password')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else {
            errorMessage = backendMessage;
          }
        } else if (error.response.status === 404) {
          errorMessage = 'Group not found. Please check the group ID.';
        } else if (error.response.status === 403) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (error.response.data) {
          errorMessage = typeof error.response.data === 'string'
            ? error.response.data
            : error.response.data.message || JSON.stringify(error.response.data);
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message;
      }

      setError(`Failed to join group: ${errorMessage}`);
      // Optionally clear the form on error
      setJoinGroupId('');
      setJoinGroupPassword('');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const response = await axios.post(`http://192.168.97.20:8080/api/groups/leave/${groupId}`, {
        username: user.username
      });
      setGroups(groups.filter(group => group.id !== groupId));
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setGroupMessages([]);
      }
      setError(null);
      alert(response.data);
    } catch (error) {
      console.error('Error leaving group:', error);
      setError('Failed to leave group: ' + (error.response?.data || error.message));
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent || !selectedGroup) return;

    try {
      const response = await axios.post(`http://192.168.97.20:8080/api/groups/message/${selectedGroup.id}`, {
        senderUsername: user.username,
        content: messageContent,
        type: 'text'
      });
      setGroupMessages([...groupMessages, response.data]);
      setMessageContent('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message: ' + (error.response?.data || error.message));
    }
  };

  const handleShareFile = async (fileId) => {
    if (!selectedGroup) return;

    try {
      const response = await axios.post(`http://192.168.97.20:8080/api/groups/message/${selectedGroup.id}`, {
        senderUsername: user.username,
        content: fileId.toString(),
        type: 'file'
      });
      setGroupMessages([...groupMessages, response.data]);
      setShowFileSelector(false);
      setError(null);
    } catch (error) {
      console.error('Error sharing file:', error);
      setError('Failed to share file: ' + (error.response?.data || error.message));
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await axios.get(`http://192.168.97.20:8080/api/file/download/${fileId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file: ' + (error.response?.data || error.message));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetchGroups();
    fetchUserFiles();
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [groupMessages]);

  return (
    <div className="groups-container">
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? '×' : '☰'}
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 className="logo">Groups</h2>
        <div className="group-actions">
          <button
            className={`action-btn ${groupAction === 'create' ? 'active' : ''}`}
            onClick={() => setGroupAction(groupAction === 'create' ? null : 'create')}
          >
            Create Group
          </button>
          <button
            className={`action-btn ${groupAction === 'join' ? 'active' : ''}`}
            onClick={() => setGroupAction(groupAction === 'join' ? null : 'join')}
          >
            Join Group
          </button>

          {groupAction === 'create' && (
            <div className="action-form">
              <h3>Create Group</h3>
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={newGroupPassword}
                onChange={(e) => setNewGroupPassword(e.target.value)}
              />
              <button onClick={handleCreateGroup}>Create</button>
            </div>
          )}

          {groupAction === 'join' && (
            <div className="action-form">
              <h3>Join Group</h3>
              <input
                type="text"
                placeholder="Group ID (e.g., 1)"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={joinGroupPassword}
                onChange={(e) => setJoinGroupPassword(e.target.value)}
              />
              <button onClick={handleJoinGroup}>Join</button>
            </div>
          )}
        </div>
        <div className="group-list">
          <h3>Your Groups</h3>
          {groups.length === 0 ? (
            <p>No groups joined</p>
          ) : (
            groups.map(group => (
              <div
                key={group.id}
                className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGroup(group);
                  setIsSidebarOpen(false);
                }}
              >
                {group.name}
                <button onClick={(e) => { e.stopPropagation(); handleLeaveGroup(group.id); }}>Leave</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="main-content">
        {selectedGroup ? (
          <>
            <div className="group-header">
              <h3>{selectedGroup.name}</h3>
              <p>Members: {selectedGroup.usernames.join(', ')}</p>
            </div>
            <div className="chat-container" ref={chatContainerRef}>
              {groupMessages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.senderUsername === user.username ? 'sent' : 'received'}`}
                >
                  <span className="sender">{message.senderUsername}</span>
                  {message.type === 'text' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="file-message">
                      <span>File: </span>
                      {userFiles.find(file => file.id === parseInt(message.content))?.fileName || 'File not found'}
                      <button onClick={() => handleDownloadFile(message.content, userFiles.find(file => file.id === parseInt(message.content))?.fileName)}>
                        Download
                      </button>
                    </div>
                  )}
                  <span className="timestamp">{new Date(message.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <div className="message-buttons">
                <button onClick={handleSendMessage}>Send</button>
                <button onClick={() => setShowFileSelector(!showFileSelector)}>
                  {showFileSelector ? 'Cancel' : 'Share File'}
                </button>
              </div>
              {showFileSelector && (
                <div className="file-selector">
                  <h4>Select a file to share:</h4>
                  {userFiles.length === 0 ? (
                    <p>No files available</p>
                  ) : (
                    userFiles.map(file => (
                      <div key={file.id} className="file-item" onClick={() => handleShareFile(file.id)}>
                        {file.fileName}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-group-selected">
            <h3>Select a group to start chatting</h3>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Groups;