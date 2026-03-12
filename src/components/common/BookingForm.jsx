import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRoomTypes, getFilteredRoomTypes, getExcursions, calculateDetailedRate, saveBooking } from '../../services/booking';

export default function BookingForm({ initialResort: propResort }) {
    const location = useLocation();
    const navigate = useNavigate();
    const propResortValue = propResort?.value || (typeof propResort === 'string' ? propResort : '');

    const [formData, setFormData] = useState(() => {
        const state = location.state || {};
        const roomType = state.roomType || '';
        const packageType = state.packageType || (
            roomType.startsWith('hostel') ? 'hostel' :
                (roomType.startsWith('conference') ? 'conference' : 'bnb')
        );
        const guestType = state.nationality === 'intl' ? 'non-residential' : (state.nationality === 'kenyan' ? 'residential' : 'residential');

        return {
            firstName: '', lastName: '', email: '', phone: '',
            nationality: state.nationality || 'kenyan',
            guestType: guestType,
            resort: propResortValue || state.resort || '',
            checkIn: '', checkOut: '', adults: '',
            childrenCount: '0',
            roomType: roomType,
            packageType: packageType,
            excursionId: state.excursionId || '',
            paymentMethod: '', specialRequests: ''
        };
    });

    const isConference = formData.roomType.startsWith('conference');
    const isHostel = formData.roomType.startsWith('hostel');
    const isFlatRate = formData.roomType === 'hostel-kitchen-hire';
    const nightsNum = formData.checkIn && formData.checkOut
        ? Math.max(0, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)))
        : 0;

    const [childrenDetails, setChildrenDetails] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [excursions, setExcursions] = useState([]);
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedResortName, setSubmittedResortName] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const val = propResort?.value || (typeof propResort === 'string' ? propResort : '');
        if (val) setFormData(prev => ({ ...prev, resort: val }));
    }, [propResort]);

    useEffect(() => {
        if (formData.resort) {
            setRoomTypes(getFilteredRoomTypes(formData.resort, formData.packageType, formData.guestType));
            setExcursions(getExcursions(formData.resort));
        } else {
            setRoomTypes([]);
            setExcursions([]);
        }
    }, [formData.resort, formData.packageType, formData.guestType]);

    // Force sync if location.state changes directly while component is mounted
    useEffect(() => {
        if (location.state) {
            setFormData(prev => ({
                ...prev,
                resort: location.state.resort || prev.resort,
                roomType: location.state.roomType || prev.roomType,
                packageType: location.state.packageType || prev.packageType,
                excursionId: location.state.excursionId || prev.excursionId,
                guestType: location.state.nationality === 'intl' ? 'non-residential' : (location.state.nationality === 'kenyan' ? 'residential' : prev.guestType)
            }));
        }
    }, [location.state]);

    useEffect(() => {
        if (formData.roomType.startsWith('conference') && formData.packageType !== 'conference') {
            setFormData(prev => ({ ...prev, packageType: 'conference' }));
        } else if (formData.roomType.startsWith('hostel') && formData.packageType !== 'hostel') {
            setFormData(prev => ({ ...prev, packageType: 'hostel' }));
        } else if (!formData.roomType.startsWith('conference') && !formData.roomType.startsWith('hostel')) {
            if (formData.packageType === 'conference' || formData.packageType === 'hostel') {
                setFormData(prev => ({ ...prev, packageType: 'bnb' }));
            } else if (!formData.packageType && formData.roomType) {
                // Default to B&B for standard rooms if room is selected but meal plan isn't
                setFormData(prev => ({ ...prev, packageType: 'bnb' }));
            }
        }
    }, [formData.roomType, formData.packageType]);

    // Force Kanamai to be Residential Only
    useEffect(() => {
        if (formData.resort === 'kanamai' && formData.guestType === 'non-residential') {
            setFormData(prev => ({ ...prev, guestType: 'residential', nationality: 'ea' }));
        }
    }, [formData.resort, formData.guestType]);

    useEffect(() => {
        if (location.state?.autoScroll) {
            setTimeout(() => {
                const element = document.getElementById('quick-book');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location.state]);

    // Sync childrenDetails array when count changes
    useEffect(() => {
        const count = parseInt(formData.childrenCount) || 0;
        setChildrenDetails(prev => {
            const newArr = [];
            for (let i = 0; i < count; i++) {
                newArr.push(prev[i] || { age: '', sharing: true });
            }
            return newArr;
        });
    }, [formData.childrenCount]);

    // Calculate detailed rate
    useEffect(() => {
        if (formData.resort && formData.roomType && formData.checkIn && formData.checkOut) {
            const nights = Math.max(0, Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)));
            const result = calculateDetailedRate(
                formData.resort, formData.roomType, formData.packageType,
                nights, parseInt(formData.adults) || 1, childrenDetails, formData.guestType, formData.excursionId
            );
            setBreakdown(result);
        } else {
            setBreakdown(null);
        }
    }, [formData.resort, formData.roomType, formData.packageType, formData.checkIn, formData.checkOut, formData.adults, formData.guestType, formData.excursionId, childrenDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updates = { ...prev, [name]: value };
            // Clear roomType ONLY when a user manually changes the resort dropdown
            if (name === 'resort') {
                updates.roomType = '';
                updates.excursionId = '';
            }
            // Auto-update nationality based on guestType selection
            if (name === 'guestType') {
                updates.nationality = value === 'non-residential' ? 'intl' : 'kenyan';
            }
            return updates;
        });
    };

    const handleChildChange = (index, field, value) => {
        setChildrenDetails(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: field === 'sharing' ? value === 'true' : value };
            return updated;
        });
    };

    const handleReview = (e) => {
        e.preventDefault();
        setError(null);

        // Validation helper
        const validateField = (condition, message, elementId) => {
            if (condition) {
                setError(message);
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.transition = 'all 0.3s ease';
                    element.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.3)';
                    setTimeout(() => { element.style.boxShadow = 'none'; }, 2000);
                }
                return false;
            }
            return true;
        };

        if (!validateField(!formData.firstName, "Please enter your first name.", 'guest-info')) return;
        if (!validateField(!formData.lastName, "Please enter your last name.", 'guest-info')) return;
        if (!validateField(!formData.email, "Please enter your email address.", 'guest-info')) return;
        if (!validateField(!formData.phone, "Please enter your phone number.", 'guest-info')) return;
        if (!validateField(!formData.guestType, "Please select a Guest Type.", 'guest-type')) return;
        if (!validateField(!formData.resort, "Please select a Resort Location.", 'stay-details')) return;
        if (!validateField(!formData.roomType, "Please select a Room Type.", 'stay-details')) return;
        if (!validateField(!formData.adults && !isFlatRate, "Please select number of adults/guests.", 'stay-details')) return;
        if (!validateField(!formData.checkIn, "Please select a Check-in date.", 'stay-details')) return;
        if (!validateField(!formData.checkOut, "Please select a Check-out date.", 'stay-details')) return;
        if (!validateField(!formData.packageType, "Please select a Meal Plan.", 'stay-details')) return;
        if (!validateField(!formData.excursionId, "Please select an Additional Service.", 'stay-details')) return;

        // Child Details Validation
        if (!isConference && !isHostel && parseInt(formData.childrenCount) > 0) {
            for (let i = 0; i < childrenDetails.length; i++) {
                if (!childrenDetails[i].age) {
                    setError(`Please enter the age for Child ${i + 1}.`);
                    const childElement = document.getElementById(`child-detail-${i}`);
                    if (childElement) {
                        childElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        childElement.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.3)';
                        setTimeout(() => { childElement.style.boxShadow = 'none'; }, 2000);
                    }
                    return;
                }
            }
        }

        if (!validateField(!formData.paymentMethod, "Please select a Payment Method.", 'payment-method')) return;

        setShowConfirmation(true);
    };

    const totalAmount = breakdown?.grandTotal || 0;
    const currency = breakdown?.currency || 'KES';

    // ─── RECEIPT PDF ───
    const generateReceiptPDF = () => {
        try {
            if (!window.jspdf) { alert("Receipt generator is still loading..."); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: [80, 220] });
            const nightsNum = breakdown?.nights || 0;

            const resortInfo = {
                limuru: { name: 'Jumuia Limuru Country Home', phone: '0710 288 043', email: 'reservations.limuru@resortjumuia.com' },
                kanamai: { name: 'Jumuia Conference & Beach Resort', phone: '0710 288 043', email: 'reservations.kanamai@resortjumuia.com' },
                kisumu: { name: 'Jumuia Hotel Kisumu', phone: '+254 713 576969', email: 'reservations.kisumu@resortjumuia.com' }
            };
            const currentResort = resortInfo[formData.resort] || resortInfo.limuru;
            const guestTypeLabel = formData.guestType === 'non-residential' ? 'Non-Residential (USD)' : 'Residential (KES)';

            // ─── HEADER ───
            const cx = 40;
            const baseY = 5;
            doc.setDrawColor(2, 68, 35);
            doc.setFillColor(255, 255, 255);
            doc.setLineWidth(0.2);

            // Left Petal
            doc.path([{ op: 'm', c: [cx - (66.5 - 42.4) * 0.3, baseY + 12.5 * 0.3] },
            { op: 'c', c: [cx - (66.5 - 42.4) * 0.3, baseY + 12.5 * 0.3, cx - (66.5 - 42.4 - 7) * 0.3, baseY + (12.5 + 5.9) * 0.3, cx - (66.5 - 41.1) * 0.3, baseY + 33.8 * 0.3] },
            { op: 'c', c: [cx - (66.5 - 41.1) * 0.3, baseY + 33.8 * 0.3, cx - (66.5 - 30) * 0.3, baseY + 55.3 * 0.3, cx - (66.5 - 65.8) * 0.3, baseY + 60.6 * 0.3] },
            { op: 'c', c: [cx - (66.5 - 65.8) * 0.3, baseY + 60.6 * 0.3, cx - (66.5 - 52.4) * 0.3, baseY + 51.5 * 0.3, cx - (66.5 - 56.7) * 0.3, baseY + 36.6 * 0.3] },
            { op: 'c', c: [cx - (66.5 - 56.7) * 0.3, baseY + 36.6 * 0.3, cx - (66.5 - 64.5) * 0.3, baseY + 16.5 * 0.3, cx - (66.5 - 42.4) * 0.3, baseY + 12.5 * 0.3] },
            { op: 'h' }], 'FD');
            // Right Petal
            doc.path([{ op: 'm', c: [cx + (94.4 - 66.5) * 0.3, baseY + 12.5 * 0.3] },
            { op: 'c', c: [cx + (94.4 - 66.5) * 0.3, baseY + 12.5 * 0.3, cx + (94.4 - 66.5 - 7) * 0.3, baseY + (12.5 + 5.9) * 0.3, cx + (95.7 - 66.5) * 0.3, baseY + 33.8 * 0.3] },
            { op: 'c', c: [cx + (95.7 - 66.5) * 0.3, baseY + 33.8 * 0.3, cx + (106.8 - 66.5) * 0.3, baseY + 55.3 * 0.3, cx + (72.1 - 66.5) * 0.3, baseY + 60.6 * 0.3] },
            { op: 'c', c: [cx + (72.1 - 66.5) * 0.3, baseY + 60.6 * 0.3, cx + (85.5 - 66.5) * 0.3, baseY + 51.5 * 0.3, cx + (81.2 - 66.5) * 0.3, baseY + 36.6 * 0.3] },
            { op: 'c', c: [cx + (81.2 - 66.5) * 0.3, baseY + 36.6 * 0.3, cx + (73.3 - 66.5) * 0.3, baseY + 16.5 * 0.3, cx + (94.4 - 66.5) * 0.3, baseY + 12.5 * 0.3] },
            { op: 'h' }], 'FD');
            // Center petal
            doc.setFillColor(243, 164, 53); doc.setDrawColor(243, 164, 53);
            doc.path([{ op: 'm', c: [cx, baseY + 17.8 * 0.3] },
            { op: 'c', c: [cx, baseY + 17.8 * 0.3, cx - 22.3 * 0.3, baseY + (17.8 + 20.9) * 0.3, cx, baseY + (17.8 + 42.8) * 0.3] },
            { op: 'c', c: [cx, baseY + 60.6 * 0.3, cx + 22.3 * 0.3, baseY + 41.6 * 0.3, cx, baseY + 17.8 * 0.3] },
            { op: 'h' }], 'F');
            doc.setFillColor(2, 68, 35);
            doc.circle(cx + (71.4 - 68.2) * 0.3, baseY + 7.2 * 0.3, 0.8 * 0.3, 'F');
            doc.circle(cx + (79.7 - 68.2) * 0.3, baseY + 12.6 * 0.3, 0.8 * 0.3, 'F');
            doc.circle(cx + (62.9 - 68.2) * 0.3, baseY + 13 * 0.3, 0.8 * 0.3, 'F');

            doc.setTextColor(2, 68, 35); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            doc.text('JUMUIA RESORTS', cx, baseY + 28, { align: 'center' });
            doc.setFontSize(7); doc.text(currentResort.name.toUpperCase(), cx, baseY + 33, { align: 'center' });
            doc.setTextColor(33, 33, 33); doc.setFontSize(6); doc.setFont('helvetica', 'normal');
            doc.text(`Tel: ${currentResort.phone} | Email: ${currentResort.email}`, cx, baseY + 37, { align: 'center' });
            doc.setDrawColor(200); doc.line(10, baseY + 41, 70, baseY + 41);

            doc.setTextColor(33, 33, 33); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text('RESERVATION SLIP', cx, baseY + 48, { align: 'center' });
            doc.setFontSize(6); doc.setFont('helvetica', 'normal');
            const refId = `JR-${Math.floor(Math.random() * 900000) + 100000}`;
            doc.text(`REF: ${refId}`, 10, baseY + 54);
            doc.text(`DATE: ${new Date().toLocaleDateString('en-KE')}`, 10, baseY + 58);

            // ─── GUEST INFO TABLE ───
            const paymentLabels = { mpesa: 'M-Pesa', bank: 'Bank Transfer', 'pay-on-arrival': 'Pay on Arrival' };
            const guestData = [
                ['GUEST', `${formData.firstName} ${formData.lastName}`],
                ['PHONE', formData.phone],
                ['EMAIL', formData.email],
                ['TYPE', guestTypeLabel],
                ['ROOM', breakdown?.roomLabel || formData.roomType],
                ['BOARD', breakdown?.boardLabel || formData.packageType],
                ['STAY', `${formData.checkIn} to ${formData.checkOut}`],
                ['NIGHTS', nightsNum.toString()],
                ['ADULTS', formData.adults],
                ['PAYMENT', paymentLabels[formData.paymentMethod] || formData.paymentMethod],
                ['ADDITIONAL', breakdown?.excursionItem ? breakdown.excursionItem.label : 'None']
            ];
            if (formData.specialRequests) guestData.push(['REQS', formData.specialRequests]);

            doc.autoTable({
                startY: baseY + 63, body: guestData, theme: 'plain',
                styles: { fontSize: 6.5, cellPadding: 1, textColor: [33, 33, 33], overflow: 'linebreak' },
                columnStyles: { 0: { fontStyle: 'bold', width: 16 }, 1: { width: 44 } },
                margin: { left: 10, right: 10 }
            });

            // ─── ITEMIZED CHARGES TABLE ───
            let chargeY = doc.lastAutoTable.finalY + 5;
            doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(2, 68, 35);
            doc.text('CHARGE BREAKDOWN', cx, chargeY, { align: 'center' });
            doc.setDrawColor(200); doc.line(10, chargeY + 2, 70, chargeY + 2);

            const chargeData = [];
            chargeData.push([
                `Room (${formData.adults} Adult${parseInt(formData.adults) > 1 ? 's' : ''})`,
                `${breakdown?.roomLabel} (${breakdown?.boardLabel})`,
                `${currency} ${breakdown?.adultTotal?.toLocaleString() || 0}`
            ]);

            if (breakdown?.excursionItem) {
                chargeData.push([
                    'Excursion',
                    breakdown.excursionItem.label,
                    `${currency} ${breakdown.excursionTotal.toLocaleString()}`
                ]);
            }

            doc.autoTable({
                startY: chargeY + 4, body: chargeData, theme: 'striped',
                styles: { fontSize: 6, cellPadding: 1.5, textColor: [33, 33, 33] },
                columnStyles: { 0: { fontStyle: 'bold', width: 16 }, 1: { width: 28 }, 2: { width: 16, halign: 'right' } },
                margin: { left: 10, right: 10 }
            });

            // ─── TOTAL ───
            const finalY = doc.lastAutoTable.finalY + 4;
            doc.setFillColor(248); doc.rect(10, finalY, 60, 9, 'F');
            doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(2, 68, 35);
            doc.text(`TOTAL: ${currency} ${totalAmount.toLocaleString()}`, cx, finalY + 6.5, { align: 'center' });

            doc.setTextColor(150); doc.setFontSize(5.5); doc.setFont('helvetica', 'italic');
            doc.text('Hospitality with a Christian touch.', cx, finalY + 18, { align: 'center' });
            doc.save(`Receipt_${formData.lastName}.pdf`);
        } catch (err) {
            console.error('Receipt Error:', err);
            alert("Error creating receipt.");
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const nights = breakdown?.nights || 0;
            const resortNames = {
                limuru: 'Jumuia Limuru Country Home',
                kanamai: 'Jumuia Kanamai Beach Resort',
                kisumu: 'Jumuia Hotel Kisumu'
            };
            const bookingData = {
                firstName: formData.firstName, lastName: formData.lastName,
                fullName: `${formData.firstName} ${formData.lastName}`,
                guestName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email, phone: formData.phone,
                nationality: formData.nationality,
                guestType: formData.guestType,
                resort: formData.resort,
                resortName: resortNames[formData.resort] || 'Jumuia Resort',
                checkIn: formData.checkIn, checkOut: formData.checkOut,
                nights,
                adults: parseInt(formData.adults),
                childrenCount: parseInt(formData.childrenCount),
                childrenDetails,
                roomType: formData.roomType,
                packageType: formData.packageType,
                paymentMethod: formData.paymentMethod,
                specialRequests: formData.specialRequests,
                excursionId: formData.excursionId,
                totalAmount,
                currency,
                breakdown,
                status: 'pending'
            };
            await saveBooking(bookingData);
            setSubmittedResortName(resortNames[formData.resort] || 'Jumuia Resort');
            setShowSuccessModal(true);
            setShowConfirmation(false);
            // Form clearing is now handled along with routing back to home in handleCloseSuccessModal
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setFormData({
            firstName: '', lastName: '', email: '', phone: '', nationality: '',
            guestType: '',
            resort: '', checkIn: '', checkOut: '', adults: '', childrenCount: '0',
            roomType: '', packageType: '', excursionId: '', paymentMethod: '', specialRequests: ''
        });
        setChildrenDetails([]);
        setBreakdown(null);
        setShowSuccessModal(false);
        navigate('/');
    };

    const today = new Date().toISOString().split('T')[0];
    const resortLabels = { limuru: 'Jumuia Limuru Country Home', kanamai: 'Jumuia Kanamai Beach Resort', kisumu: 'Jumuia Hotel Kisumu' };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
            <div style={{ padding: isMobile ? '20px' : '45px' }}>

                {/* ─── SUCCESS MODAL OVERLAY ─── */}
                {showSuccessModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ background: 'white', padding: '50px 30px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
                            <div style={{ width: '90px', height: '90px', background: 'var(--light-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary-green)', boxShadow: '0 10px 20px rgba(39, 110, 54, 0.1)' }}>
                                <i className="fas fa-check-circle" style={{ fontSize: '3.5rem' }}></i>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-green)', marginBottom: '16px', fontWeight: '800' }}>Reservation Sent!</h2>
                            <p style={{ color: 'var(--text-light)', fontSize: '1.15rem', marginBottom: '35px', lineHeight: '1.8' }}>
                                Hi <strong style={{ color: 'var(--text-dark)' }}>{formData.firstName}</strong>! We've received your booking at <strong style={{ color: 'var(--text-dark)' }}>{submittedResortName}</strong>. We are so excited and eagerly waiting to see you soon!
                            </p>
                            <button className="btn btn-primary" style={{ padding: '16px 45px', fontSize: '1.15rem', borderRadius: '30px', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 8px 25px rgba(39, 110, 54, 0.2)' }} onClick={handleCloseSuccessModal}>
                                Return to Homepage
                            </button>
                        </div>
                    </div>
                )}

                {showConfirmation ? (
                    /* ─── CONFIRMATION VIEW ─── */
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h2 style={{ color: 'var(--primary-green)', fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '800', marginBottom: '10px' }}>Double Check Your Stay</h2>
                            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Review all details before we finalize your reservation request.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '30px', marginBottom: '40px' }}>
                            {/* Detailed Info */}
                            <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '15px', border: '1px solid #eee' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--primary-orange)', fontWeight: '700', textTransform: 'uppercase' }}>Resort Selection</label>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{resortLabels[formData.resort]}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Guest Type</label>
                                            <div style={{ fontWeight: '600' }}>{formData.guestType === 'non-residential' ? '🌍 Non-Residential (USD)' : '🏠 Residential (KES)'}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Meal Plan</label>
                                            <div style={{ fontWeight: '600' }}>{breakdown?.boardLabel}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Check-in</label>
                                            <div style={{ fontWeight: '600' }}>{formData.checkIn}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Check-out</label>
                                            <div style={{ fontWeight: '600' }}>{formData.checkOut}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div style={{ gridColumn: breakdown?.excursionItem ? 'span 1' : 'span 2' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#888' }}>Room Type</label>
                                            <div style={{ fontWeight: '600' }}>{breakdown?.roomLabel}</div>
                                        </div>
                                        {breakdown?.excursionItem && (
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888' }}>Add-on</label>
                                                <div style={{ fontWeight: '600' }}>{breakdown.excursionItem.label}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Guests</label>
                                        <div style={{ fontWeight: '600' }}>{formData.adults} Adult{parseInt(formData.adults) > 1 ? 's' : ''}, {formData.childrenCount} Child{parseInt(formData.childrenCount) !== 1 ? 'ren' : ''}</div>
                                    </div>
                                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#888' }}>Main Guest</label>
                                        <div style={{ fontWeight: '600' }}>{formData.firstName} {formData.lastName}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{formData.email} | {formData.phone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown + Total */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Itemized Breakdown */}
                                <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden' }}>
                                    <div style={{ background: 'var(--primary-green)', color: 'white', padding: '12px 20px', fontWeight: '700', fontSize: '0.9rem' }}>
                                        <i className="fas fa-receipt" style={{ marginRight: '8px' }}></i>Price Breakdown
                                    </div>
                                    <div style={{ padding: '15px 20px' }}>
                                        {/* Adult line */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Room ({formData.adults} Adult{parseInt(formData.adults) > 1 ? 's' : ''})</div>
                                                <div style={{ fontSize: '0.72rem', color: '#999' }}>{breakdown?.roomLabel} · {breakdown?.boardLabel} · {nightsNum} night{nightsNum > 1 ? 's' : ''}</div>
                                            </div>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{currency} {breakdown?.adultTotal?.toLocaleString()}</div>
                                        </div>
                                        {/* Child lines */}
                                        {breakdown?.childItems?.map((child, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{child.label}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#999' }}>{child.policy}</div>
                                                </div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: child.total === 0 ? 'var(--primary-green)' : 'var(--text-dark)' }}>
                                                    {child.total === 0 ? 'FREE' : `${currency} ${child.total.toLocaleString()}`}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Excursion line */}
                                        {breakdown?.excursionItem && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>Excursion: {breakdown.excursionItem.label}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#999' }}>{currency} {breakdown.excursionItem.price.toLocaleString()} per person</div>
                                                </div>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{currency} {breakdown.excursionTotal.toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Grand Total */}
                                <div style={{ background: 'var(--primary-green)', color: 'white', padding: '25px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(39, 110, 54, 0.25)' }}>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Estimated Total</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{currency} {totalAmount.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.9 }}>{nightsNum} Night{nightsNum > 1 ? 's' : ''} · {formData.guestType === 'non-residential' ? 'Non-Residential' : 'Residential'}</div>
                                </div>

                                {/* Download Receipt */}
                                <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '2px dashed #ddd', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>Want a copy for your records?</p>
                                    <button onClick={generateReceiptPDF} style={{ width: '100%', background: '#34495e', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <i className="fas fa-file-pdf"></i> Download PDF Receipt
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '18px', fontSize: '1.1rem', borderRadius: '12px' }} onClick={() => setShowConfirmation(false)} disabled={loading}>
                                <i className="fas fa-edit" style={{ marginRight: '10px' }}></i>Make Changes
                            </button>
                            <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '18px', fontSize: '1.2rem', borderRadius: '12px', background: 'var(--primary-orange)', border: 'none', boxShadow: '0 10px 20px rgba(243, 156, 18, 0.2)' }} onClick={handleConfirm} disabled={loading}>
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>Sending Request...</>
                                ) : (
                                    <><i className="fas fa-check-circle" style={{ marginRight: '10px' }}></i>Confirm & Submit Booking</>
                                )}
                            </button>
                        </div>
                    </div>

                ) : (
                    /* ─── BOOKING FORM ─── */
                    <form onSubmit={handleReview}>
                        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                            <h2 style={{ color: 'var(--primary-green)', fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: '800', marginBottom: '8px' }}>Book Your Stay</h2>
                            <p style={{ color: '#999', fontSize: '0.9rem' }}>Fill in the details below to reserve your room</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>

                            {/* ═══ LEFT COLUMN ═══ */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                {error && <div className="alert alert-error" style={{ marginBottom: '0' }}>{error}</div>}

                                {/* ── Guest Information ── */}
                                <div id="guest-info" style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '700' }}>
                                        <i className="fas fa-user-circle" style={{ fontSize: '1.2rem' }}></i> Guest Information
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <input type="text" name="firstName" className="form-control" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <input type="text" name="lastName" className="form-control" placeholder="e.g. Doe" value={formData.lastName} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address <span style={{ color: '#e74c3c' }}>*</span></label>
                                        <input type="email" name="email" className="form-control" placeholder="e.g. john@example.com" value={formData.email} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number <span style={{ color: '#e74c3c' }}>*</span></label>
                                        <input type="tel" name="phone" className="form-control" placeholder="e.g. +254 7XX XXX XXX" value={formData.phone} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                    </div>
                                </div>
                            </div>

                            {/* ═══ RIGHT COLUMN ═══ */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                {/* ── Stay Details ── */}
                                <div id="stay-details" style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '700' }}>
                                        <i className="fas fa-bed" style={{ fontSize: '1.1rem' }}></i> Stay Details
                                    </h4>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resort Location <span style={{ color: '#e74c3c' }}>*</span></label>
                                        <select name="resort" className="form-control" value={formData.resort} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                            <option value="" disabled>Choose Resort</option>
                                            <option value="kanamai">Jumuia Kanamai Beach Resort</option>
                                            <option value="kisumu">Jumuia Hotel Kisumu</option>
                                            <option value="limuru">Jumuia Limuru Country Home</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Type <span style={{ color: '#e74c3c' }}>*</span></label>
                                        <select name="roomType" className="form-control" value={formData.roomType} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                            <option value="" disabled>Choose Room Type</option>
                                            {roomTypes.map((item, idx) => (
                                                item.group ? (
                                                    <optgroup label={item.group} key={idx}>
                                                        {item.options.map(rt => (
                                                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                                                        ))}
                                                    </optgroup>
                                                ) : (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                )
                                            ))}
                                        </select>
                                    </div>

                                    {/* Number of Delegates/Guests/Adults - Move up if conference */}
                                    <div style={{ display: 'grid', gridTemplateColumns: (!isConference && !isHostel) ? '1fr 1fr' : '1fr', gap: '10px', marginBottom: '12px' }}>
                                        {isFlatRate ? (
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Quantity <span style={{ color: '#e74c3c' }}>*</span>
                                                </label>
                                                <select className="form-control" disabled style={{ padding: '10px 14px', borderRadius: '10px', background: '#f5f5f5' }}>
                                                    <option>1 Unit (Per Day)</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {isConference ? 'Delegates' : (isHostel ? 'Guests' : 'Adults')} <span style={{ color: '#e74c3c' }}>*</span>
                                                </label>
                                                <select name="adults" className="form-control" value={formData.adults} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                    <option value="" disabled>Choose {isConference ? 'Delegates' : (isHostel ? 'Guests' : 'Adults')}</option>
                                                    {[...Array(200).keys()].map(i => (
                                                        <option key={i + 1} value={i + 1}>{i + 1} {isConference ? 'Delegate' : (isHostel ? 'Guest' : 'Adult')}{i !== 0 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {(!isConference && !isHostel) && (
                                            <div>
                                                <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Children <span style={{ color: '#e74c3c' }}>*</span></label>
                                                <select name="childrenCount" className="form-control" value={formData.childrenCount} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                    <option value="" disabled>Choose Children</option>
                                                    <option value="0">0 Children</option>
                                                    <option value="1">1 Child</option>
                                                    <option value="2">2 Children</option>
                                                    <option value="3">3 Children</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-in <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <input type="date" name="checkIn" className="form-control" min={today} value={formData.checkIn} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-out <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <input type="date" name="checkOut" className="form-control" min={formData.checkIn || today} value={formData.checkOut} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }} />
                                        </div>
                                    </div>

                                    {/* Meal Plan Dropdown */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meal Plan <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <select name="packageType" className="form-control" value={formData.packageType} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                {isConference ? (
                                                    <option value="conference">Conference Package Included</option>
                                                ) : isHostel ? (
                                                    <option value="hostel">Hostel Rate Included</option>
                                                ) : (
                                                    <>
                                                        <option value="" disabled>Choose Meal Plan</option>
                                                        <option value="bnb">B&B (Bed & Breakfast)</option>
                                                        <option value="hb">Half Board (Breakfast + Dinner)</option>
                                                        <option value="fb">Full Board (All Meals)</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Additional Services <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <select name="excursionId" className="form-control" value={formData.excursionId} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                <option value="" disabled>Choose Service</option>
                                                <option value="none">None (Room Only)</option>
                                                {excursions.map(ex => (
                                                    <option key={ex.id} value={ex.id}>{ex.label} (+{currency} {ex.price.toLocaleString()})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* ── Guest Type & Payment Dropdowns ── */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guest Type <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <select name="guestType" className="form-control" value={formData.guestType} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                <option value="" disabled>Choose Guest Type</option>
                                                <option value="residential">Residential (Kenyan / EA)</option>
                                                {formData.resort !== 'kanamai' && <option value="non-residential">Non-Residential (International)</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method <span style={{ color: '#e74c3c' }}>*</span></label>
                                            <select name="paymentMethod" className="form-control" value={formData.paymentMethod} onChange={handleChange} required style={{ padding: '10px 14px', borderRadius: '10px' }}>
                                                <option value="" disabled>Choose Payment</option>
                                                <option value="mpesa">M-Pesa (Mobile Money)</option>
                                                <option value="bank">Bank Transfer (Direct)</option>
                                                <option value="pay-on-arrival">Pay on Arrival (Check-in)</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Hidden nationality field for form data */}
                                    <select name="nationality" value={formData.nationality} onChange={handleChange} style={{ display: 'none' }}>
                                        <option value="kenyan">Kenyan</option>
                                        <option value="ea">EA Resident</option>
                                        <option value="intl">International</option>
                                    </select>
                                </div>

                                {/* ── Per-Child Details ── */}
                                {(!isConference && !isHostel) && parseInt(formData.childrenCount) > 0 && (
                                    <div id="children-details" style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                        <h4 style={{ color: 'var(--primary-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '700' }}>
                                            <i className="fas fa-child" style={{ fontSize: '1.1rem' }}></i> Children Details <span style={{ color: '#e74c3c', fontSize: '0.75rem' }}>*</span>
                                        </h4>
                                        <div style={{ background: 'linear-gradient(135deg, #fff9f0, #fff3e0)', border: '1px solid #ffe0b2', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', fontSize: '0.75rem', color: '#8B6914', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <i className="fas fa-info-circle" style={{ marginTop: '1px', flexShrink: 0 }}></i>
                                            <span><strong>Child Policy:</strong> Free under 3 yrs · 50% sharing with parent (3–12) · 75% own room (3–12) · Adult rate 13+</span>
                                        </div>
                                        {childrenDetails.map((child, idx) => (
                                            <div key={idx} id={`child-detail-${idx}`} style={{ background: '#f8faf9', borderRadius: '12px', padding: '16px', marginBottom: idx < childrenDetails.length - 1 ? '10px' : '0', border: '1px solid #e8ece5' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--primary-green)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>{idx + 1}</div>
                                                    Child {idx + 1}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age <span style={{ color: '#e74c3c' }}>*</span></label>
                                                        <input type="number" min="0" max="17" placeholder="e.g. 5" className="form-control" value={child.age}
                                                            onChange={(e) => handleChildChange(idx, 'age', e.target.value)} required
                                                            style={{ padding: '9px 12px', borderRadius: '10px' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Arrangement <span style={{ color: '#e74c3c' }}>*</span></label>
                                                        <select className="form-control" value={child.sharing ? 'true' : 'false'}
                                                            onChange={(e) => handleChildChange(idx, 'sharing', e.target.value)}
                                                            style={{ padding: '9px 12px', borderRadius: '10px' }}>
                                                            <option value="true">Sharing with parent</option>
                                                            <option value="false">Own room</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {child.age !== '' && (
                                                    <div style={{
                                                        marginTop: '8px', fontSize: '0.72rem', padding: '7px 10px', borderRadius: '8px',
                                                        background: parseInt(child.age) < 3 ? '#e8f5e9' : parseInt(child.age) <= 12 ? '#fff3e0' : '#fce4ec',
                                                        color: parseInt(child.age) < 3 ? '#2e7d32' : parseInt(child.age) <= 12 ? '#e65100' : '#c62828',
                                                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
                                                    }}>
                                                        <i className={parseInt(child.age) < 3 ? 'fas fa-check-circle' : 'fas fa-info-circle'} style={{ fontSize: '0.75rem' }}></i>
                                                        {parseInt(child.age) < 3 ? 'Free — under 3 years' :
                                                            parseInt(child.age) <= 12 ? (child.sharing ? '50% of room rate — sharing with parent' : '75% of room rate — own room') :
                                                                'Adult rate applies — age 13+'}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Special Requests (optional) ── */}
                                <div style={{ background: 'white', borderRadius: '14px', padding: '22px', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                    <label style={{ fontSize: '0.72rem', color: '#888', fontWeight: '600', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Special Requests <span style={{ fontSize: '0.65rem', color: '#bbb', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                                    <textarea name="specialRequests" className="form-control" placeholder="Dietary needs, anniversary, late check-in, etc." rows="3" value={formData.specialRequests} onChange={handleChange} style={{ padding: '10px 14px', borderRadius: '10px', resize: 'vertical' }}></textarea>
                                </div>

                                {/* ── Live Price Preview ── */}
                                {breakdown && (
                                    <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #388E3C)', color: 'white', borderRadius: '14px', padding: '22px', textAlign: 'center', boxShadow: '0 8px 30px rgba(27,94,32,0.25)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
                                        <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.75, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Estimated Total</div>
                                        <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px' }}>{currency} {totalAmount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '6px' }}>
                                            {nightsNum} night{nightsNum > 1 ? 's' : ''} · {breakdown.boardLabel} · {formData.guestType === 'non-residential' ? 'Non-Residential' : 'Residential'}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 8px 25px rgba(39, 110, 54, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <i className="fas fa-clipboard-check"></i> Review Booking Summary
                        </button>
                    </form>
                )}

            </div>
        </div >
    );
}
