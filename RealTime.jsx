import React, { useState, useEffect } from 'react';
import { User, Edit3, LogOut } from 'lucide-react';
import './App.css';

const dataStore = {
  getContent: () => localStorage.getItem('editorContent') || 'Welcome to the simple collaborative editor!',
  saveContent: (content) => localStorage.setItem('editorContent', content),
  getUsers: () => JSON.parse(localStorage.getItem('users') || '[]'),
  saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users))
};

function RealTime() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleLogin = (username) => {
    if (!username.trim()) return;

    const newUser = {
      id: `user_${Date.now()}`,
      name: username
    };

    setUser(newUser);
    const updatedUsers = [...dataStore.getUsers(), newUser];
    dataStore.saveUsers(updatedUsers);
    setUsers(updatedUsers);

    setContent(dataStore.getContent());
  };

  const handleLogout = () => {
    const currentUsers = dataStore.getUsers();
    const updatedUsers = currentUsers.filter(u => u.id !== user.id);
    dataStore.saveUsers(updatedUsers);
    setUser(null);
  };

  const handleRemoveUser = (id) => {
    const updatedUsers = users.filter(u => u.id !== id);
    dataStore.saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    dataStore.saveContent(newContent);
  };

  useEffect(() => {
    if (!user) return;

    return () => {
      const currentUsers = dataStore.getUsers();
      const updatedUsers = currentUsers.filter(u => u.id !== user.id);
      dataStore.saveUsers(updatedUsers);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const storedContent = dataStore.getContent();
      if (storedContent !== content) {
        setContent(storedContent);
      }
      setUsers(dataStore.getUsers());
    }, 1000);

    return () => clearInterval(interval);
  }, [user, content]);

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Join Collaborative Editor</h1>
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="editor-panel">
        <div className="user-list">
          <h3><User size={16} /> Active Users</h3>
          <ul>
            {users.map(u => (
              <li key={u.id}>
                {u.name} {u.id === user.id && "(You)"}
                {u.id !== user.id && (
                  <button
                    onClick={() => handleRemoveUser(u.id)}
                    style={{
                      marginLeft: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8em'
                    }}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="editor">
          <div className="editor-header">
            <h3><Edit3 size={16} /> Document</h3>
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="editor-textarea"
            />
          ) : (
            <div className="editor-view">{content}</div>
          )}
        </div>
      </div>

      <p className="helper-text">
        Open this page in multiple browsers to see collaboration in action.
      </p>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username);
  };

  return (
    <div className="login-page">
      <h2>Join Collaborative Editor</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <button type="submit">Join Editor</button>
      </form>
    </div>
  );
}

export default RealTime;
