import React from 'react';
import { 
  Droplet, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Home, 
  ChevronRight,
  Info
} from 'lucide-react';

export const TestCard = ({ test, isSelected, onSelect }) => {
  return (
    <div 
      className={`test-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(test)}
    >
      <div>
        <div className="test-card-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
              {test.category}
            </span>
            <h3 className="test-card-title">{test.name}</h3>
          </div>
          {isSelected && (
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
        </div>

        <p className="test-card-desc">{test.description}</p>

        <div className="test-specs-list">
          <div className="test-spec-item" title="Sample Tube Requirement">
            <Droplet size={13} color="#0284c7" />
            <span>{test.sampleType}</span>
          </div>
          <div className="test-spec-item" title="Typical Turnaround Guideline">
            <Clock size={13} color="#f59e0b" />
            <span>2-8 Hrs</span>
          </div>
          <div className="test-spec-item" title="Included Parameters">
            <FileText size={13} color="#10b981" />
            <span>{test.parametersCount} Parameters</span>
          </div>
          {test.homeCollectionSupported && (
            <div className="test-spec-item" title="Home collection supported">
              <Home size={13} color="#6366f1" />
              <span>Home Collection</span>
            </div>
          )}
        </div>

        {test.preparation && (
          <div style={{
            fontSize: '0.78rem',
            color: '#475569',
            background: '#f8fafc',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            marginBottom: '16px'
          }}>
            <Info size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Prep:</strong> {test.preparation}</span>
          </div>
        )}
      </div>

      <button 
        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        style={{ width: '100%' }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(test);
        }}
      >
        <span>{isSelected ? 'Viewing Labs Below' : 'Compare Nearby Labs'}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
};
