import { useEffect, useState } from 'react';
import {
  subscribeToCategories,
  createCategory,
  renameCategory,
  addImagesToCategory,
  removeImageFromCategory,
  deleteCategory,
} from '../../data/galleryRepo.js';
import './GalleryAdminTab.css';

function GalleryAdminTab() {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [addFiles, setAddFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToCategories(setCategories), []);

  async function handleAddCategory(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createCategory(newTitle, newFiles);
      setNewTitle('');
      setNewFiles([]);
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setRenameValue(category.title);
    setAddFiles([]);
  }

  async function handleRename(category) {
    if (renameValue !== category.title) {
      await renameCategory(category.id, renameValue);
    }
  }

  async function handleAddImages(category) {
    if (addFiles.length === 0) return;
    setSaving(true);
    try {
      await addImagesToCategory(category.id, addFiles);
      setAddFiles([]);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveImage(category, image) {
    if (!window.confirm('Remove this image?')) return;
    await removeImageFromCategory(category.id, image);
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete the "${category.title}" category and all its images?`)) return;
    await deleteCategory(category.id, category.images);
    setEditingId(null);
  }

  const editingCategory = categories.find((category) => category.id === editingId) ?? null;

  return (
    <div className="gallery-admin">
      <button type="button" onClick={() => setShowAddForm((current) => !current)}>
        Add Category
      </button>

      {showAddForm && (
        <form className="gallery-admin__add-form" onSubmit={handleAddCategory}>
          <label htmlFor="category-title">Category Title</label>
          <input
            id="category-title"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            required
          />
          <label htmlFor="category-images">Images</label>
          <input
            id="category-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setNewFiles(Array.from(event.target.files))}
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </form>
      )}

      <ul className="gallery-admin__list">
        {categories.map((category) => (
          <li key={category.id} className="gallery-admin__row">
            <span className="gallery-admin__title">{category.title}</span>
            <span className="gallery-admin__count">{category.images?.length ?? 0} images</span>
            <button type="button" onClick={() => startEdit(category)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDeleteCategory(category)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {editingCategory && (
        <div className="gallery-admin__editor">
          <label htmlFor="rename-category">Rename</label>
          <input
            id="rename-category"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
          />
          <button type="button" onClick={() => handleRename(editingCategory)}>
            Save Name
          </button>

          <div className="gallery-admin__images">
            {editingCategory.images?.map((image) => (
              <div key={image.url} className="gallery-admin__image">
                <img src={image.url} alt="" />
                <button type="button" onClick={() => handleRemoveImage(editingCategory, image)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label htmlFor="add-images">Add Images</label>
          <input
            id="add-images"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setAddFiles(Array.from(event.target.files))}
          />
          <button type="button" onClick={() => handleAddImages(editingCategory)} disabled={saving}>
            {saving ? 'Uploading…' : 'Upload'}
          </button>

          <button type="button" onClick={() => setEditingId(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default GalleryAdminTab;
