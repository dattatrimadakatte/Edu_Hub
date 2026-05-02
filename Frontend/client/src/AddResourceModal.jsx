
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { resourceAPI } from './services/api';
import './AddResourceModal.css';

const AddResourceModal = ({ isOpen, onClose, userId, editingResource }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    resource_type: 'YouTube',
    category: 'Web Development',
    is_public: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title,
        url: editingResource.url,
        resource_type: editingResource.resource_type,
        category: editingResource.category,
        is_public: editingResource.is_public
      });
    } else {
      setFormData({
        title: '',
        url: '',
        resource_type: 'YouTube',
        category: 'Web Development',
        is_public: false
      });
    }
  }, [editingResource, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    
    setLoading(true);
    try {
      if (editingResource) {
        await resourceAPI.updateResource(editingResource.id, {
          ...formData,
          owner_id: userId
        });
      } else {
        await resourceAPI.createResource({
          ...formData,
          owner_id: userId
        });
      }
      
      setFormData({
        title: '',
        url: '',
        resource_type: 'YouTube',
        category: 'Web Development',
        is_public: false
      });
      onClose();
    } catch (error) {
      console.error('Failed to save resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Resource Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Master React in 10 Min" 
              className="form-input"
              required
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">URL Link</label>
            <input 
              type="url" 
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://youtube.com/..." 
              className="form-input"
              required
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">Type</label>
            <select 
              name="resource_type"
              value={formData.resource_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="YouTube">YouTube</option>
              <option value="PDF">PDF</option>
              <option value="GitHub">GitHub</option>
              <option value="Website">Website</option>
            </select>
          </div>
          
          <div className="form-field">
            <label className="form-label">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-field">
            <label className="form-label checkbox-container">
              <input 
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Make this resource public (visible to all users)</span>
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : (editingResource ? 'Update Resource' : 'Save Resource')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;