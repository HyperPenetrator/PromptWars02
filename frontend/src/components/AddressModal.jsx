import { MapPin, X } from 'lucide-react'

const AddressModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  addressInput, 
  setAddressInput, 
  isSearching 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addressInput.trim()) onSubmit();
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div 
        className="modal-sheet u-glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <button 
          className="btn-icon-only close-modal" 
          onClick={onClose}
          aria-label="Close Polling Station Finder"
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
        >
          <X size={24} />
        </button>

        <header>
          <h2 id="modal-title" className="sheet-title">
            <MapPin className="logo-icon" size={32} /> Locality Lookup
          </h2>
          <p id="modal-desc" className="sheet-description">
            Locate your polling area in Assam. For official ward-level data, please consult the 
            <a 
              href="https://ceoassam.nic.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--accent-primary)', marginLeft: '0.4rem', fontWeight: '700', textDecoration: 'underline' }}
            >
              CEO Assam Portal
            </a>.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="locality-input">Locality or Booth Name</label>
            <input
              id="locality-input"
              type="text"
              placeholder="e.g., Dispur, Guwahati, Assam"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              autoFocus
              className="u-focus-ring"
              aria-required="true"
              disabled={isSearching}
            />
          </div>
          
          <div className="sheet-actions">
            <button 
              type="button" 
              className="btn-secondary u-focus-ring" 
              onClick={onClose}
              disabled={isSearching}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary btn-civic u-focus-ring" 
              disabled={isSearching || !addressInput.trim()}
              aria-busy={isSearching}
            >
              {isSearching ? "Locating..." : "Locate on Map"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
