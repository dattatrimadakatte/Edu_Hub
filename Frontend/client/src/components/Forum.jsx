import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, ThumbsUp, Reply, Search } from 'lucide-react';
import { forumAPI } from '../services/api';
import './Forum.css';

const Forum = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postReplies, setPostReplies] = useState({});
  const [replyText, setReplyText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const forumPosts = await forumAPI.getAllPosts();
      setPosts(forumPosts.map(post => ({
        ...post,
        author: post.author?.name || user?.name || 'Student',
        authorRole: post.author?.role || user?.role || 'student',
        createdAt: new Date(post.created_at).toLocaleDateString(),
        replies: postReplies[post.id]?.length || 0,
        likes: Math.floor(Math.random() * 20) // Mock likes for now
      })));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Fallback to mock data
      const mockPosts = [
        {
          id: 1,
          title: "How to handle state in React?",
          content: "I'm struggling with managing state in my React application. Can someone explain the best practices?",
          author: "John Student",
          authorRole: "student",
          createdAt: "2 hours ago",
          replies: 5,
          likes: 12,
          category: "React"
        }
      ];
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchPostReplies = async (postId) => {
    try {
      const replies = await forumAPI.getPostReplies(postId);
      setPostReplies(prev => ({ ...prev, [postId]: replies }));
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      setPostReplies(prev => ({ ...prev, [postId]: [] }));
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedPost) return;

    try {
      await forumAPI.createReply({
        content: replyText,
        post_id: selectedPost.id,
        author_id: user.id
      });
      setReplyText('');
      setShowReplyModal(false);
      fetchPostReplies(selectedPost.id);
      fetchPosts(); // Refresh posts
      alert('Reply posted successfully!');
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  const handleLikePost = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
    
    // Update the post likes count
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + (likedPosts.has(postId) ? -1 : 1) }
          : post
      )
    );
  };

  const NewPostModal = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await forumAPI.createPost({
          title,
          content,
          author_id: user.id
        });
        setShowNewPostModal(false);
        setTitle('');
        setContent('');
        fetchPosts(); // Refresh posts
      } catch (error) {
        console.error('Failed to create post:', error);
      }
    };

    if (!showNewPostModal) return null;

    return (
      <div className="modal-overlay" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh'
      }}>
        <div className="modal-container" style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          margin: '0',
          transform: 'none'
        }}>
          <div className="modal-header">
            <h3>Create New Post</h3>
            <button onClick={() => setShowNewPostModal(false)} className="close-btn">×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-field">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your question or topic"
                required
              />
            </div>
            
            <div className="form-field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="React">React</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Database">Database</option>
              </select>
            </div>
            
            <div className="form-field">
              <label>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your question in detail..."
                rows="6"
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">Post Question</button>
          </form>
        </div>
      </div>
    );
  };

  const ReplyModal = () => {
    if (!showReplyModal || !selectedPost) return null;

    return (
      <div className="modal-overlay" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh'
      }}>
        <div className="modal-container" style={{ 
          maxHeight: '90vh', 
          overflowY: 'auto',
          margin: '0',
          transform: 'none'
        }}>
          <div className="modal-header">
            <h3>Reply to: {selectedPost.title}</h3>
            <button onClick={() => setShowReplyModal(false)} className="close-btn">×</button>
          </div>
          
          <div className="replies-section">
            <h4>Existing Replies ({postReplies[selectedPost.id]?.length || 0})</h4>
            <div className="replies-list">
              {(postReplies[selectedPost.id] || []).map(reply => (
                <div key={reply.id} className="reply-item">
                  <div className="reply-author">{reply.author_name || user?.name || 'Student'}</div>
                  <div className="reply-content">{reply.content}</div>
                  <div className="reply-time">{new Date(reply.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmitReply} className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply here..."
              rows="4"
              required
              style={{ resize: 'vertical' }}
            />
            <button type="submit" className="submit-btn">Post Reply</button>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading forum...</div>;

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div>
          <h1>Q&A Forum</h1>
          <p>Ask questions, share knowledge, and help others learn</p>
        </div>
        <button 
          className="new-post-btn"
          onClick={() => setShowNewPostModal(true)}
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      <div className="forum-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No posts found</h3>
            <p>Be the first to start a discussion!</p>
            <button 
              className="primary-btn"
              onClick={() => setShowNewPostModal(true)}
            >
              <Plus size={18} />
              Create Post
            </button>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-category">{post.category}</div>
                <div className="post-time">{post.createdAt}</div>
              </div>
              
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-text">{post.content}</p>
                
                <div className="post-author">
                  <span className="author-name">{post.author}</span>
                  <span className={`author-role ${post.authorRole}`}>
                    {post.authorRole}
                  </span>
                </div>
              </div>
              
              <div className="post-actions">
                <button 
                  className={`action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <ThumbsUp size={16} />
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn">
                  <Reply size={16} />
                  <span>{postReplies[post.id]?.length || post.replies || 0} replies</span>
                </button>
                <button 
                  className="reply-btn"
                  onClick={() => {
                    setSelectedPost(post);
                    setShowReplyModal(true);
                    fetchPostReplies(post.id);
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <NewPostModal />
      <ReplyModal />
    </div>
  );
};

export default Forum;