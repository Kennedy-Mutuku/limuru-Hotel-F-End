import api from './api';

const EXCURSIONS = {
    limuru: [
        { id: 'tea-tour', label: 'Tea Plantation Tour', price: 1500, duration: '3 Hours', image: '/images/resorts/limuru/tea farm.jpg', desc: 'Walk through the lush green tea estates of Limuru and learn about the tea-making process.' },
        { id: 'hiking', label: 'Hiking in the Highlands', price: 1000, duration: 'Full Day', image: '/images/resorts/limuru/hike.webp', desc: 'Guided nature walks through the scenic Limuru hills with breathtaking panoramic views.' },
        { id: 'kiambethu', label: 'Kiambethu Farm Visit', price: 2500, duration: '4 Hours', image: '/images/resorts/limuru/flower farm.jpg', desc: 'Visit one of the oldest farmhouses in Kenya and enjoy a traditional tea tasting experience.' },
        { id: 'zipline', label: 'Zipline Adventure', price: 2000, duration: '2 Hours', image: '/images/resorts/limuru/zipline.jpg', desc: 'Experience the thrill of ziplining over the tea canopies with professional guides.' }
    ],
    kanamai: [
        { id: 'mombasa-tour', label: 'Mombasa City Tour', price: 3500, duration: '6 Hours', image: '/images/resorts/kanamai/Mombasa City Tour.jpg', desc: 'Explore the historic Fort Jesus, Elephant Tusks, and the vibrant Old Town of Mombasa.' },
        { id: 'snorkeling', label: 'Marine Park Snorkeling', price: 2500, duration: '4 Hours', image: '/images/resorts/kanamai/aerial ocean.jpg', desc: 'Discover vibrant coral reefs and marine life in a glass-bottom boat tour and snorkeling.' },
        { id: 'haller-park', label: 'Haller Park Wildlife', price: 2000, duration: '3 Hours', image: '/images/resorts/kanamai/Haller Park Wildlife Tour.jpg', desc: 'A nature sanctuary featuring giraffes, hippos, and a variety of bird species.' },
        { id: 'dhow-sailing', label: 'Dhow Sailing Experience', price: 4500, duration: '5 Hours', image: '/images/resorts/kanamai/Dhow Sailing at Wasini Island.gif', desc: 'Enjoy a traditional dhow sail with a romantic sunset view and coastal seafood dinner.' }
    ],
    kisumu: [
        { id: 'sunset-cruise', label: 'Lake Victoria Sunset Cruise', price: 3500, duration: '2 Hours', image: '/images/resorts/kisumu/Lake Victoria Sunset Cruise.gif', desc: 'Enjoy a romantic sunset cruise on the waters of Lake Victoria with refreshments.' },
        { id: 'impala-tour', label: 'Impala Sanctuary Tour', price: 2000, duration: '3 Hours', image: '/images/resorts/kisumu/impala sanctuary.jpg', desc: 'Visit the home of the Sitatunga antelope and see leopards, giraffes, and more.' },
        { id: 'kit-mikayi', label: 'Kit Mikayi Cultural Tour', price: 4000, duration: '4 Hours', image: '/images/resorts/kisumu/Kit-Mikayi.jpg', desc: 'Discover the legendary "Stone of the first wife" and learn about the local Luo culture.' },
        { id: 'museum-visit', label: 'Kisumu Museum Visit', price: 1500, duration: '2 Hours', image: '/images/resorts/kisumu/museum.jpg', desc: 'Explore the history of the Lake region, its people, and its unique biodiversity.' }
    ]
};

export function getExcursions(resort) {
    return EXCURSIONS[resort] || [];
}

const RATES = {
    limuru: {
        'standard-single': { bnb: 4450, hb: 5300, fb: 6100 },
        'standard-double': { bnb: 7850, hb: 9000, fb: 10100 },
        'executive-single': { bnb: 5600, hb: 6700, fb: 7500 },
        'executive-double': { bnb: 9000, hb: 10100, fb: 11200 },
        'studio-suite-single': { bnb: 11200, hb: 12350, fb: 13450 },
        'studio-suite-double': { bnb: 14200, hb: 15600, fb: 16950 },
        'hostel-accommodation': { hostel: 1500 },
        'conference-single-standard': { conference: 6750 },
        'conference-twin-sharing': { conference: 5850 },
        'conference-single-executive': { conference: 7850 },
        'conference-day-full': { conference: 2600 },
        'conference-day-half': { conference: 2200 }
    },
    kanamai: {
        'standard-single': { bnb: 4000, hb: 4900, fb: 6000 },
        'standard-twin': { bnb: 3000, hb: 3900, fb: 4900 },
        'standard-double': { bnb: 6500, hb: 8000, fb: 9500 },
        'ocean-front-single': { bnb: 4500, hb: 5400, fb: 6400 },
        'ocean-front-double': { bnb: 7000, hb: 8500, fb: 10000 },
        'hostel-students': { hostel: 3500 },
        'hostel-adult-groups': { hostel: 4000 },
        'hostel-bed-only': { hostel: 1500 },
        'hostel-kitchen-hire': { hostel: 15000 },
        'hostel-bnb': { hostel: 2000 },
        'conference-single-standard': { conference: 7500 },
        'conference-twin-sharing': { conference: 6000 },
        'conference-single-executive': { conference: 8000 },
        'conference-half-day': { conference: 2250 },
        'conference-full-day': { conference: 2500 }
    },
    kisumu: {
        'standard-single': { bnb: 5500, hb: 6500, fb: 7500 },
        'standard-double-twin': { bnb: 7500, hb: 9500, fb: 11500 },
        'junior-suite-single': { bnb: 8000, hb: 9000, fb: 10000 },
        'junior-suite-double': { bnb: 9000, hb: 11000, fb: 13000 }
    }
};

// Limuru non-residential rates (USD) — exact from rate card
const LIMURU_USD_RATES = {
    'standard-single': { bnb: 60, hb: 65, fb: 70 },
    'standard-double': { bnb: 95, hb: 105, fb: 115 },
    'executive-single': { bnb: 80, hb: 85, fb: 90 },
    'executive-double': { bnb: 110, hb: 120, fb: 130 },
    'studio-suite-single': { bnb: 135, hb: 145, fb: 155 },
    'studio-suite-double': { bnb: 165, hb: 180, fb: 195 },
    'conference-single-standard': { conference: 85 },
    'conference-twin-sharing': { conference: 75 },
    'conference-single-executive': { conference: 95 },
    'conference-day-full': { conference: 35 },
    'conference-day-half': { conference: 30 }
};

// Kisumu non-residential rates (USD) — exact from rate card
const KISUMU_USD_RATES = {
    'standard-single': { bnb: 66, hb: 76, fb: 86 },
    'standard-double-twin': { bnb: 96, hb: 118, fb: 142 },
    'junior-suite-single': { bnb: 89, hb: 100, fb: 110 },
    'junior-suite-double': { bnb: 100, hb: 110, fb: 122 }
};

const ROOM_TYPES = {
    limuru: [
        { value: 'standard-single', label: 'Standard Room Single' },
        { value: 'standard-double', label: 'Standard Room Double' },
        { value: 'executive-single', label: 'Executive Single' },
        { value: 'executive-double', label: 'Executive Double' },
        { value: 'studio-suite-single', label: 'Studio Suite Single' },
        { value: 'studio-suite-double', label: 'Studio Suite Double' },
        { value: 'hostel-accommodation', label: 'Hostel Accommodation' },
        { value: 'conference-single-standard', label: 'Conference FB (Standard Single)' },
        { value: 'conference-twin-sharing', label: 'Conference FB (Twin Sharing)' },
        { value: 'conference-single-executive', label: 'Conference FB (Single Executive)' },
        { value: 'conference-day-full', label: 'Full Day Conference Package' },
        { value: 'conference-day-half', label: 'Half Day Conference Package' }
    ],
    kanamai: [
        { value: 'standard-single', label: 'Standard Single' },
        { value: 'standard-twin', label: 'Standard Twin PPS' },
        { value: 'standard-double', label: 'Double' },
        { value: 'ocean-front-single', label: 'Ocean Front Single' },
        { value: 'ocean-front-double', label: 'Ocean Front Double' },
        { value: 'hostel-students', label: 'Hostel - Students/Kids (Min 20 Pax)' },
        { value: 'hostel-adult-groups', label: 'Hostel - Adult Groups' },
        { value: 'hostel-bed-only', label: 'Hostel - Bed Only' },
        { value: 'hostel-bnb', label: 'Hostel - Bed & Breakfast' },
        { value: 'hostel-kitchen-hire', label: 'Kitchen & 2 Staff Hire (Per Day)' },
        { value: 'conference-single-standard', label: 'Conference FB (Standard Single)' },
        { value: 'conference-twin-sharing', label: 'Conference FB (Twin Sharing)' },
        { value: 'conference-single-executive', label: 'Conference FB (Single Executive)' },
        { value: 'conference-full-day', label: 'Full Day Conference Package' },
        { value: 'conference-half-day', label: 'Half Day Conference Package' }
    ],
    kisumu: [
        { value: 'standard-single', label: 'Standard Single' },
        { value: 'standard-double-twin', label: 'Standard Double/twin' },
        { value: 'junior-suite-single', label: 'Junior Suite Single' },
        { value: 'junior-suite-double', label: 'Junior Suite Double' }
    ]
};

export function getRoomTypes(resort) {
    return ROOM_TYPES[resort] || [];
}

export function getFilteredRoomTypes(resort, packageType, guestType = 'residential') {
    const allTypes = ROOM_TYPES[resort] || [];

    let resortRates = RATES[resort] || {};
    let currency = 'KES';

    if (guestType === 'non-residential') {
        if (resort === 'kisumu') {
            resortRates = KISUMU_USD_RATES;
            currency = 'USD';
        } else if (resort === 'limuru') {
            resortRates = LIMURU_USD_RATES;
            currency = 'USD';
        }
    }

    // Helper to map rates to labels
    const mapType = (rt) => {
        const rateObj = resortRates[rt.value] || {};
        const basePrice = rateObj[packageType] || rateObj.bnb || rateObj.hostel || rateObj.conference || 0;
        const priceStr = basePrice > 0 ? ` (${currency} ${basePrice.toLocaleString()})` : '';
        return {
            ...rt,
            label: `${rt.label}${priceStr}`
        };
    };

    // Helper to get price for sorting
    const getPrice = (rt) => {
        const rateObj = resortRates[rt.value] || {};
        return rateObj[packageType] || rateObj.bnb || rateObj.hostel || rateObj.conference || 0;
    };

    if (resort === 'kanamai') {
        const rooms = allTypes
            .filter(rt => !rt.value.startsWith('hostel') && !rt.value.startsWith('conference'))
            .sort((a, b) => getPrice(a) - getPrice(b))
            .map((rt, i) => ({ ...rt, label: `${i + 1}. ${rt.label}` }))
            .map(mapType);

        const hostels = allTypes
            .filter(rt => rt.value.startsWith('hostel'))
            .sort((a, b) => getPrice(a) - getPrice(b))
            .map((rt, i) => ({ ...rt, label: `${i + 6}. ${rt.label}` }))
            .map(mapType);

        const conferences = allTypes
            .filter(rt => rt.value.startsWith('conference'))
            .sort((a, b) => getPrice(a) - getPrice(b))
            .map((rt, i) => ({ ...rt, label: `${i + 11}. ${rt.label}` }))
            .map(mapType);

        return [
            { group: '1-5 Rooms & Accommodation', options: rooms },
            { group: '6-10 Hostel Accommodation', options: hostels },
            { group: '11-15 Conference Packages', options: conferences }
        ];
    }

    let filtered = [];
    if (packageType === 'hostel') {
        filtered = allTypes.filter(rt => rt.value.startsWith('hostel'));
    } else if (packageType === 'conference') {
        filtered = allTypes.filter(rt => rt.value.startsWith('conference'));
    } else {
        // Standard rooms
        filtered = allTypes.filter(rt => !rt.value.startsWith('hostel') && !rt.value.startsWith('conference'));
    }

    return filtered
        .sort((a, b) => getPrice(a) - getPrice(b))
        .map(mapType);
}

export function calculateRate(resort, roomType, packageType, nights, adults, children = 0) {
    const resortRates = RATES[resort];
    if (!resortRates || !resortRates[roomType]) return 0;

    const rate = resortRates[roomType][packageType] || 0;
    const childRate = Math.round(rate * 0.5);

    // For day-based services (conferences, hostels kitchen hire) or excursions, 
    // we use at least 1 unit even if check-in/out same day
    const effectiveUnits = Math.max(1, nights);
    const adultCount = parseInt(adults) || 0;
    const childCount = parseInt(children) || 0;

    const total = (rate * adultCount + childRate * childCount) * effectiveUnits;
    return isNaN(total) ? 0 : total;
}

/**
 * Calculates an itemized rate breakdown with child policy support.
 * @param {string} resort - Resort key
 * @param {string} roomType - Room type key
 * @param {string} packageType - bnb/hb/fb/conference
 * @param {number} nights - Number of nights
 * @param {number} adults - Number of adults
 * @param {Array} childrenDetails - Array of { age: number, sharing: boolean }
 * @param {string} guestType - 'residential' or 'non-residential'
 * @returns {Object} Itemized breakdown
 */
export function calculateDetailedRate(resort, roomType, packageType, nights, adults, childrenDetails = [], guestType = 'residential', excursionId = null) {
    const boardLabels = { bnb: 'Bed & Breakfast', hb: 'Half Board', fb: 'Full Board', conference: 'Conference', hostel: 'Hostel Package' };
    const roomLabel = (ROOM_TYPES[resort] || []).find(rt => rt.value === roomType)?.label || roomType;
    const isConference = roomType.startsWith('conference');
    const isHostel = roomType.startsWith('hostel');
    const isFlatRate = roomType === 'hostel-kitchen-hire';
    const adultPersonLabel = isConference ? 'Delegate(s)' : (isHostel ? 'Guest(s)' : 'Adult(s)');
    const boardLabel = boardLabels[packageType] || packageType;

    // Determine which rate table to use
    let rate = 0;
    let currency = 'KES';

    if (guestType === 'non-residential') {
        if (resort === 'kisumu') {
            const usdRates = KISUMU_USD_RATES[roomType];
            rate = usdRates ? (usdRates[packageType] || usdRates.conference || 0) : 0;
            currency = 'USD';
        } else if (resort === 'limuru') {
            const usdRates = LIMURU_USD_RATES[roomType];
            rate = usdRates ? (usdRates[packageType] || usdRates.conference || 0) : 0;
            currency = 'USD';
        } else {
            const resortRates = RATES[resort];
            rate = resortRates && resortRates[roomType] ? (resortRates[roomType][packageType] || resortRates[roomType].conference || resortRates[roomType].hostel || 0) : 0;
            currency = 'KES';
        }
    } else {
        const resortRates = RATES[resort];
        rate = resortRates && resortRates[roomType] ? (resortRates[roomType][packageType] || resortRates[roomType].conference || resortRates[roomType].hostel || 0) : 0;
        currency = 'KES';
    }

    // Adult/Guest charges
    const stayDuration = (isConference || isHostel || excursionId) ? Math.max(1, nights) : nights;
    const adultCount = parseInt(adults) || 0;
    const adultTotal = (isFlatRate) ? (rate * stayDuration) : (rate * adultCount * stayDuration);

    // Excursion charges
    let excursionItem = null;
    if (excursionId) {
        const ex = (EXCURSIONS[resort] || []).find(e => e.id === excursionId);
        if (ex) {
            excursionItem = {
                label: ex.label,
                price: ex.price,
                total: ex.price * adultCount // Excursions are usually per person
            };
        }
    }

    // Child charges — apply resort-specific policy
    const childItems = childrenDetails.map((child, idx) => {
        const age = parseInt(child.age) || 0;
        const sharing = child.sharing !== false; // default true

        // Kanamai: Free <= 3, Child <= 11
        // Default/Kisumu: Free < 3, Child <= 12
        const isFree = resort === 'kanamai' ? age <= 3 : age < 3;
        const maxChildAge = resort === 'kanamai' ? 11 : 12;

        if (isFree) {
            return { label: `Child ${idx + 1} (Age ${age})`, policy: resort === 'kanamai' ? 'Free (3 yrs & below)' : 'Free under 3 yrs', rate: 0, total: 0 };
        } else if (age <= maxChildAge) {
            if (sharing) {
                const childRate = Math.round(rate * 0.5);
                return { label: `Child ${idx + 1} (Age ${age})`, policy: '50% – sharing with parent', rate: childRate, total: childRate * nights };
            } else {
                const childRate = Math.round(rate * 0.75);
                return { label: `Child ${idx + 1} (Age ${age})`, policy: '75% – own room', rate: childRate, total: childRate * nights };
            }
        } else {
            // Over max age = adult rate
            return { label: `Child ${idx + 1} (Age ${age})`, policy: `Adult rate (${maxChildAge + 1}+)`, rate: rate, total: rate * nights };
        }
    });

    const childTotal = childItems.reduce((sum, c) => sum + c.total, 0);
    const excursionTotal = excursionItem ? excursionItem.total : 0;

    return {
        roomLabel,
        boardLabel,
        adultLabel: adultPersonLabel,
        currency,
        ratePerNight: rate,
        nights,
        adults,
        adultTotal,
        childItems,
        childTotal,
        excursionItem,
        excursionTotal,
        grandTotal: adultTotal + childTotal + excursionTotal
    };
}

export async function saveBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
}

export async function getBooking(bookingId) {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
}

export async function checkAvailability(resort, checkIn, checkOut, roomType) {
    const response = await api.get('/bookings/availability', {
        params: { resort, checkIn, checkOut, roomType }
    });
    return response.data;
}

export function getResortName(code) {
    const names = {
        limuru: 'Jumuia Conference & Country Home, Limuru',
        kanamai: 'Jumuia Conference & Beach Resort, Kanamai',
        kisumu: 'Jumuia Hotel Kisumu'
    };
    return names[code] || code;
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-KE', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
}
