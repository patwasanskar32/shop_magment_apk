import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

const StaffIDCard = ({ staff, organization }) => {
    if (!staff || !staff.barcode) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>No barcode generated for this staff member</div>;
    }

    // QR code data: JSON with user ID and username for login
    const qrData = JSON.stringify({
        userId: staff.id,
        username: staff.username,
        type: 'login'
    });

    const printCard = () => {
        window.print();
    };

    return (
        <div>
            {/* ID Card Container */}
            <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '2px',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{
                    background: '#1a1a2e',
                    borderRadius: '14px',
                    padding: '2rem',
                    color: 'white'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {organization || 'Staff ID Card'}
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                            Employee Identification
                        </p>
                    </div>

                    {/* Staff Info */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>NAME</span>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.25rem' }}>
                                {staff.username}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>ID</span>
                            <div style={{ fontSize: '1rem', fontWeight: '500', marginTop: '0.25rem' }}>
                                {staff.id}
                            </div>
                        </div>
                    </div>

                    {/* QR Code for Login */}
                    <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#667eea',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                🔐 QR Code - Login
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <QRCodeSVG
                                value={qrData}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>

                    {/* Barcode for Attendance */}
                    <div style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '12px'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#f5576c',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                📋 Barcode - Attendance
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Barcode
                                value={staff.barcode}
                                width={2}
                                height={80}
                                fontSize={14}
                                background="#ffffff"
                                lineColor="#000000"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.5)'
                    }}>
                        This card is property of {organization || 'the organization'}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                marginTop: '2rem',
                '@media print': { display: 'none' }
            }}>
                <button
                    onClick={printCard}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                >
                    🖨️ Print ID Card
                </button>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #root, #root * {
                        visibility: visible;
                    }
                    button {
                        display: none !important;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
};

export default StaffIDCard;
