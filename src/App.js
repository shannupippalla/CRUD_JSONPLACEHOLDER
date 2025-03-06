import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Fetch posts (READ operation)
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // CREATE operation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) return;
    
    setLoading(true);
    
    const newPost = {
      title,
      body,
      userId: 1, // JSONPlaceholder requires a userId
    };
    
    try {
      // If we're editing, update the post (PUT)
      if (editingId) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(newPost),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });
        
        if (!response.ok) throw new Error('Failed to update post');
        
        const updatedPost = await response.json();
        
        // With JSONPlaceholder, the API doesn't actually update the data on the server
        // so we need to update our local state manually
        setPosts(posts.map(post => post.id === editingId ? { ...updatedPost, id: editingId } : post));
        setEditingId(null);
      } 
      // Otherwise create a new post (POST)
      else {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
          method: 'POST',
          body: JSON.stringify(newPost),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        });
        
        if (!response.ok) throw new Error('Failed to create post');
        
        const createdPost = await response.json();
        
        // JSONPlaceholder always returns id: 101 for new posts, so we'll generate a unique ID
        const uniqueId = posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1;
        
        setPosts([...posts, { ...createdPost, id: uniqueId }]);
      }
      
      // Reset form
      setTitle('');
      setBody('');
      setError(null);
      setFormVisible(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE operation
  const handleDelete = async (id) => {
    setLoading(true);
    
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete post');
      
      // Remove the post from our state
      setPosts(posts.filter(post => post.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set up editing (for UPDATE operation)
  const handleEdit = (post) => {
    setTitle(post.title);
    setBody(post.body);
    setEditingId(post.id);
    setFormVisible(true);
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="theme-toggle">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      <header className="app-header">
        <div className="logo-container">
          <div className="logo">
            <span>CRUD</span>
            <span className="logo-highlight">Master</span>
          </div>
        </div>
        <h1>Post Management System</h1>
      </header>
      
      <div className="action-bar">
        <button 
          className="floating-button" 
          onClick={() => {
            setFormVisible(!formVisible);
            setTitle('');
            setBody('');
            setEditingId(null);
          }}
        >
          {formVisible ? '✕ Hide Form' : '＋ New Post'}
        </button>
      </div>
      
      {/* Form for creating or updating posts */}
      <div className={`form-container ${formVisible ? 'visible' : 'hidden'}`}>
        <h2 className="form-title">{editingId ? '✏️ Edit Post' : '📝 Create New Post'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an interesting title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="body">Content:</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts here..."
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : (editingId ? '✓ Update Post' : '✓ Create Post')}
            </button>
            
            <button 
              type="button"
              className="cancel-button"
              onClick={() => {
                setTitle('');
                setBody('');
                setEditingId(null);
                if (!editingId) setFormVisible(false);
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
      
      {/* Display error if any */}
      {error && <div className="error-message">⚠️ Error: {error}</div>}
      
      {/* Display posts */}
      <div className="posts-container">
        <h2 className="section-title">📚 Your Posts</h2>
        {loading && !posts.length ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : (
          posts.length ? (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-id">#{post.id}</span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <div className="post-content">
                    <p>{post.body}</p>
                  </div>
                  <div className="post-actions">
                    <button className="edit-button" onClick={() => handleEdit(post)}>
                      ✏️ Edit
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          handleDelete(post.id);
                        }
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No posts found. Create a new post to get started!</p>
              <button 
                className="create-first-button"
                onClick={() => setFormVisible(true)}
              >
                Create Your First Post
              </button>
            </div>
          )
        )}
      </div>
      
      <footer className="app-footer">
        <p>Built with React & JSONPlaceholder API</p>
        <p>© {new Date().getFullYear()} CRUD Master - All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;