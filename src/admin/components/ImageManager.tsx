import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, X, ExternalLink } from 'lucide-react';
import { useAdminImages } from '../hooks/useAdminImages';
import { ConfirmDialog } from './ConfirmDialog';

export function ImageManager() {
  const { images, isLoading, error, addImage, updateImage, deleteImage, toggleActive, clearError } =
    useAdminImages();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<{ id: string; order: number } | null>(null);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      alert('URL slike je obavezan');
      return;
    }

    try {
      // Proveri da li je URL validan
      new URL(newImageUrl);
    } catch {
      alert('Unesite validan URL');
      return;
    }

    try {
      await addImage(newImageUrl.trim());
      setNewImageUrl('');
      setShowAddForm(false);
    } catch {
      // Error je već postavljen u hook-u
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteImage(deleteConfirm);
      setDeleteConfirm(null);
    } catch {
      // Error je već postavljen u hook-u
    }
  };

  const handleOrderChange = async (id: string, newOrder: number) => {
    try {
      await updateImage(id, { order: newOrder });
      setEditingOrder(null);
    } catch {
      // Error je već postavljen u hook-u
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Učitavanje slika...</p>
      </div>
    );
  }

  return (
    <div className="image-manager">
      <div className="image-manager-header">
        <h2>Upravljanje Slikama</h2>
        {error && (
          <div className="admin-error">
            <span>{error}</span>
            <button onClick={clearError}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="image-manager-actions">
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <Plus size={20} />
          <span>Dodaj Sliku</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="add-image-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="add-image-form-content">
              <input
                type="url"
                className="admin-input"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Unesite URL slike..."
                autoFocus
              />
              <div className="add-image-form-actions">
                <button className="admin-btn admin-btn--primary" onClick={handleAddImage}>
                  Dodaj
                </button>
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewImageUrl('');
                  }}
                >
                  Otkaži
                </button>
              </div>
            </div>

            {newImageUrl && (
              <div className="add-image-preview">
                <p>Pregled:</p>
                <img
                  src={newImageUrl}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = 'block';
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="image-grid">
        <AnimatePresence>
          {images.map((image) => (
            <motion.div
              key={image.id}
              className={`image-card ${!image.active ? 'inactive' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <div className="image-card-preview">
                <img
                  src={image.url}
                  alt="Slika"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">?</text></svg>';
                  }}
                />
                {!image.active && <div className="image-inactive-overlay">Neaktivna</div>}
              </div>

              <div className="image-card-info">
                <div className="image-card-url">
                  <a href={image.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                    <span>{image.url.length > 30 ? image.url.substring(0, 30) + '...' : image.url}</span>
                  </a>
                </div>

                <div className="image-card-order">
                  <label>Redosled:</label>
                  {editingOrder?.id === image.id ? (
                    <input
                      type="number"
                      className="admin-input admin-input--small"
                      value={editingOrder.order}
                      onChange={(e) =>
                        setEditingOrder({ ...editingOrder, order: parseInt(e.target.value) || 0 })
                      }
                      onBlur={() => handleOrderChange(image.id, editingOrder.order)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleOrderChange(image.id, editingOrder.order);
                        }
                        if (e.key === 'Escape') {
                          setEditingOrder(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="order-value"
                      onClick={() => setEditingOrder({ id: image.id, order: image.order })}
                    >
                      {image.order}
                    </span>
                  )}
                </div>
              </div>

              <div className="image-card-actions">
                <button
                  className={`admin-icon-btn ${image.active ? '' : 'admin-icon-btn--warning'}`}
                  onClick={() => toggleActive(image.id)}
                  title={image.active ? 'Deaktiviraj' : 'Aktiviraj'}
                >
                  {image.active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  className="admin-icon-btn admin-icon-btn--danger"
                  onClick={() => handleDeleteClick(image.id)}
                  title="Obriši"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length === 0 && !showAddForm && (
          <div className="no-images">
            <p>Nema slika. Dodajte prvu sliku klikom na dugme iznad.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Brisanje slike"
        message="Da li ste sigurni da želite da obrišete ovu sliku? Ova akcija se ne može poništiti."
        confirmText="Obriši"
        cancelText="Otkaži"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        variant="danger"
      />
    </div>
  );
}
