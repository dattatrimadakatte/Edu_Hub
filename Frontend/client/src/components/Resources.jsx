import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, Edit, Trash2, BookOpen, FileText, Github, Globe } from 'lucide-react';
import { resourceAPI } from '../services/api';
import AddResourceModal from '../AddResourceModal';
import './Resources.css';

const Resources = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [publicResources, setPublicResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filter, setFilter] = useState('my');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchResources();
    fetchPublicResources();
  }, [user]);

  const fetchResources = async () => {
    try {
      const data = await resourceAPI.getUserResources(user.id);
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicResources = async () => {
    try {
      const data = await resourceAPI.getPublicResources();
      setPublicResources(data);
    } catch (error) {
      console.error('Failed to fetch public resources:', error);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceAPI.deleteResource(resourceId);
        fetchResources();
      } catch (error) {
        console.error('Failed to delete resource:', error);
      }
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'YouTube': return <BookOpen size={20} />;
      case 'PDF': return <FileText size={20} />;
      case 'GitHub': return <Github size={20} />;
      default: return <Globe size={20} />;
    }
  };

  const currentResources = filter === 'my' ? resources : publicResources;
  const filteredResources = currentResources.filter(resource => 
    categoryFilter === 'all' || resource.category.toLowerCase() === categoryFilter
  );

  const categories = [...new Set(currentResources.map(r => r.category))];

  if (loading) return <div className="loading">Loading resources...</div>;

  return (
    <div className="resources-page">
      <div className="resources-header">
        <div>
          <h1>Resources</h1>
          <p>Manage your learning materials and explore public resources</p>
        </div>
        {filter === 'my' && (
          <button 
            className="add-resource-btn"
            onClick={() => {
              setEditingResource(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={20} />
            Add Resource
          </button>
        )}
      </div>

      <div className="resources-filters">
        <div className="filter-group">
          <button 
            className={filter === 'my' ? 'active' : ''}
            onClick={() => setFilter('my')}
          >
            My Resources ({resources.length})
          </button>
          <button 
            className={filter === 'public' ? 'active' : ''}
            onClick={() => setFilter('public')}
          >
            Public Resources ({publicResources.length})
          </button>
        </div>
        
        <div className="filter-group">
          <button 
            className={categoryFilter === 'all' ? 'active' : ''}
            onClick={() => setCategoryFilter('all')}
          >
            All ({currentResources.length})
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={categoryFilter === category.toLowerCase() ? 'active' : ''}
              onClick={() => setCategoryFilter(category.toLowerCase())}
            >
              {category} ({currentResources.filter(r => r.category === category).length})
            </button>
          ))}
        </div>
      </div>

      <div className="resources-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No resources found</h3>
            <p>{filter === 'my' ? 'Start building your learning library by adding your first resource.' : 'No public resources available in this category.'}</p>
            {filter === 'my' && (
              <button 
                className="primary-btn"
                onClick={() => {
                  setEditingResource(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus size={18} />
                Add Resource
              </button>
            )}
          </div>
        ) : (
          filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <div className="resource-icon">
                  {getResourceIcon(resource.resource_type)}
                </div>
                <div className="resource-type">{resource.resource_type}</div>
              </div>
              
              <div className="resource-content">
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-category">{resource.category}</p>
                {resource.is_public && (
                  <span className="public-badge">Public</span>
                )}
                {filter === 'public' && resource.owner_id !== user.id && (
                  <span className="shared-badge">Shared</span>
                )}
              </div>
              
              <div className="resource-actions">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-btn primary"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
                {filter === 'my' && (
                  <>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AddResourceModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
          fetchResources();
        }}
        userId={user?.id}
        editingResource={editingResource}
      />
    </div>
  );
};

export default Resources;