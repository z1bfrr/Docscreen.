import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';

export const ReportViewModal = ({ booking, onClose }) => {
  if (!booking || !booking.report) return null;
  const { report } = booking;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px', padding: '32px', background: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with download / print */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Verified Diagnostic Report</h3>
            <span className="badge badge-verified">
              <ShieldCheck size={12} /> NABL Validated
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => alert(`Downloading signed PDF report for #${booking.id}...`)}
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Clinical Document Header */}
        <div style={{ 
          border: '2px solid #0f172a', 
          borderRadius: '8px', 
          padding: '24px',
          backgroundColor: '#fff'
        }}>
          {/* Lab Brand Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            borderBottom: '2px solid #0284c7', 
            paddingBottom: '14px',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {report.labName || booking.labName}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                Central Accessioning & Diagnostic Pathology Laboratory
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                NABL Accreditation No: MC-2940 | ISO 15189:2022 Certified
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                PATIENT TEST REPORT
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Booking ID: {booking.id}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Barcode: {booking.sampleBarcode}
              </div>
            </div>
          </div>

          {/* Patient Meta Box */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px',
            background: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Patient Name:</span>
              <strong>{booking.patientName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Age / Gender:</span>
              <strong>32 Yrs / Male</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Contact Phone:</span>
              <strong>{booking.patientPhone}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Sample Collected:</span>
              <strong>{booking.slotDate} ({booking.slotTime})</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Sample Type:</span>
              <strong>Blood (EDTA Vacutainer)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Report Released:</span>
              <strong>{new Date(report.generatedAt).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* Test Name Header */}
          <div style={{ 
            background: '#e0f2fe', 
            padding: '8px 12px', 
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#0369a1',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>DEPARTMENT OF PATHOLOGY — {booking.testName.toUpperCase()}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>FINAL VERIFIED</span>
          </div>

          {/* Clinical Results Table */}
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '0.85rem',
            marginBottom: '24px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '8px 6px' }}>Investigation / Parameter</th>
                <th style={{ padding: '8px 6px' }}>Observed Value</th>
                <th style={{ padding: '8px 6px' }}>Units</th>
                <th style={{ padding: '8px 6px' }}>Reference Range</th>
                <th style={{ padding: '8px 6px', textAlign: 'center' }}>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {report.parameters && report.parameters.map((param, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>{param.name}</td>
                  <td style={{ padding: '10px 6px', fontWeight: 800, color: '#0f172a' }}>{param.value}</td>
                  <td style={{ padding: '10px 6px', color: '#64748b' }}>{param.unit}</td>
                  <td style={{ padding: '10px 6px', color: '#475569' }}>{param.normalRange}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={10} /> {param.status || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Clinical Impression Summary */}
          <div style={{ 
            background: '#f8fafc', 
            borderLeft: '4px solid #0284c7', 
            padding: '12px 14px',
            fontSize: '0.82rem',
            marginBottom: '24px',
            color: '#334155'
          }}>
            <strong>Diagnostic Note:</strong> {report.summary}
          </div>

          {/* Doctor Signature Block */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              *** End of Diagnostic Laboratory Report ***<br />
              Generated via DiagMarket Clinical Infrastructure
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontFamily: 'cursive', 
                fontSize: '1.2rem', 
                color: '#0284c7', 
                marginBottom: '4px' 
              }}>
                Dr. K. S. Sharma
              </div>
              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{report.doctorName}</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Consultant Clinical Pathologist</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
