import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImageBlob } from '../../utils/cropImage.js';
import './ImageCropModal.css';

const ASPECT = 4 / 5;

function ImageCropModal({ imageSrc, onCancel, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    setError('');
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onCropComplete(blob);
    } catch (err) {
      console.error('Failed to crop image:', err);
      setError('Could not crop that image. Try a different photo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="image-crop-modal__overlay">
      <div className="image-crop-modal">
        <h3 className="image-crop-modal__title">Adjust photo</h3>
        <div className="image-crop-modal__stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            cropShape="rect"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <label className="image-crop-modal__zoom-label" htmlFor="crop-zoom">
          Zoom
        </label>
        <input
          id="crop-zoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />

        <p className="image-crop-modal__hint">Drag the photo to reposition it — pull it up to show their face.</p>

        {error && <p className="image-crop-modal__error">{error}</p>}

        <div className="image-crop-modal__actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;
