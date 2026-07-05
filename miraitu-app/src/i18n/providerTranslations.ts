'use client';

// ─────────────────────────────────────────────────────────────────
// Provider-section translations (isolated from the main translations.ts).
// Covers every visible string in the provider workspace across all
// supported languages. English is the source/fallback.
// NOTE: non-English strings are machine-quality; native review advised.
// ─────────────────────────────────────────────────────────────────

import { useLanguage } from '@/i18n/LanguageContext';
import type { LangCode } from '@/i18n/translations';

type Dict = Record<string, string>;

const en: Dict = {
    // nav
    home: 'Home', booking: 'Booking', wallet: 'Wallet', profile: 'Profile',
    // common
    viewAll: 'View all', all: 'All', new: 'New', accepted: 'Accepted', inProgress: 'In Progress',
    completed: 'Completed', add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', saving: 'Saving…',
    setDefault: 'Set default', default: 'Default', back: 'Back', hello: 'Hello',
    // home
    walletBalance: 'Wallet Balance', todaysServices: "Today's Services", totalBookings: 'Total Bookings',
    totalEarnings: 'Total Earnings', actionNeeded: 'Action Needed', noActions: 'No actions required at the moment',
    workSchedule: 'Work Schedule', noBookingsNow: 'No bookings available right now',
    newJobRequestsHint: 'New job requests will appear here when available',
    // bookings
    bookingsTitle: 'Bookings', noBookingsFound: 'No bookings found',
    // wallet
    walletTitle: 'Wallet', netEarningsNote: 'Net earnings from completed jobs (after 10% platform fee)',
    transactions: 'Transactions', noTransactions: 'No transactions yet', noTransactionsHint: 'Completed jobs will show up here',
    // profile
    profileTitle: 'Profile', servicesDelivered: 'Services Delivered', serviceWord: 'Service', servicesWord: 'Services',
    memberSince: 'Member since', general: 'General', profileSettings: 'Profile Settings', myServices: 'My Services & Pricing',
    insights: 'Insights', manageLocations: 'Manage Locations', myReviews: 'My Reviews', appDetails: 'App Details',
    changeLanguage: 'Change Language', terms: 'Terms of Service', privacy: 'Privacy Policy',
    switchToFarmer: 'Switch to Farmer view', signOut: 'Sign out',
    // reviews
    basedOn: 'Based on', reviewWord: 'review', reviewsWord: 'reviews', noReviews: 'No reviews yet',
    noReviewsHint: 'Reviews from customers will appear here after completed jobs',
    // locations
    noLocations: 'No saved locations', noLocationsHint: 'Add a location to help customers find you',
    addLocation: 'Add Location', editLocation: 'Edit Location', setAsDefault: 'Set as default location',
    // notifications
    notificationsTitle: 'Notifications', noNotifications: 'No notifications yet',
};

const hi: Dict = {
    home: 'होम', booking: 'बुकिंग', wallet: 'वॉलेट', profile: 'प्रोफ़ाइल',
    viewAll: 'सभी देखें', all: 'सभी', new: 'नई', accepted: 'स्वीकृत', inProgress: 'चालू',
    completed: 'पूर्ण', add: 'जोड़ें', edit: 'संपादित करें', delete: 'हटाएँ', save: 'सहेजें', saving: 'सहेजा जा रहा है…',
    setDefault: 'डिफ़ॉल्ट करें', default: 'डिफ़ॉल्ट', back: 'वापस', hello: 'नमस्ते',
    walletBalance: 'वॉलेट बैलेंस', todaysServices: 'आज की सेवाएँ', totalBookings: 'कुल बुकिंग',
    totalEarnings: 'कुल कमाई', actionNeeded: 'कार्रवाई आवश्यक', noActions: 'फ़िलहाल कोई कार्रवाई आवश्यक नहीं',
    workSchedule: 'कार्य अनुसूची', noBookingsNow: 'अभी कोई बुकिंग उपलब्ध नहीं',
    newJobRequestsHint: 'नए काम के अनुरोध उपलब्ध होने पर यहाँ दिखेंगे',
    bookingsTitle: 'बुकिंग', noBookingsFound: 'कोई बुकिंग नहीं मिली',
    walletTitle: 'वॉलेट', netEarningsNote: 'पूर्ण कार्यों से शुद्ध कमाई (10% प्लेटफ़ॉर्म शुल्क के बाद)',
    transactions: 'लेन-देन', noTransactions: 'अभी कोई लेन-देन नहीं', noTransactionsHint: 'पूर्ण किए गए काम यहाँ दिखेंगे',
    profileTitle: 'प्रोफ़ाइल', servicesDelivered: 'दी गई सेवाएँ', serviceWord: 'सेवा', servicesWord: 'सेवाएँ',
    memberSince: 'सदस्य बने', general: 'सामान्य', profileSettings: 'प्रोफ़ाइल सेटिंग्स', myServices: 'मेरी सेवाएँ और कीमतें',
    insights: 'विश्लेषण', manageLocations: 'स्थान प्रबंधित करें', myReviews: 'मेरी समीक्षाएँ', appDetails: 'ऐप विवरण',
    changeLanguage: 'भाषा बदलें', terms: 'सेवा की शर्तें', privacy: 'गोपनीयता नीति',
    switchToFarmer: 'किसान व्यू पर जाएँ', signOut: 'साइन आउट',
    basedOn: 'आधारित', reviewWord: 'समीक्षा', reviewsWord: 'समीक्षाएँ', noReviews: 'अभी कोई समीक्षा नहीं',
    noReviewsHint: 'पूर्ण कार्यों के बाद ग्राहकों की समीक्षाएँ यहाँ दिखेंगी',
    noLocations: 'कोई सहेजा गया स्थान नहीं', noLocationsHint: 'ग्राहकों को खोजने में मदद के लिए स्थान जोड़ें',
    addLocation: 'स्थान जोड़ें', editLocation: 'स्थान संपादित करें', setAsDefault: 'डिफ़ॉल्ट स्थान बनाएँ',
    notificationsTitle: 'सूचनाएँ', noNotifications: 'अभी कोई सूचना नहीं',
};

const mr: Dict = {
    home: 'होम', booking: 'बुकिंग', wallet: 'वॉलेट', profile: 'प्रोफाइल',
    viewAll: 'सर्व पहा', all: 'सर्व', new: 'नवीन', accepted: 'स्वीकृत', inProgress: 'चालू',
    completed: 'पूर्ण', add: 'जोडा', edit: 'संपादित करा', delete: 'हटवा', save: 'जतन करा', saving: 'जतन करत आहे…',
    setDefault: 'डीफॉल्ट करा', default: 'डीफॉल्ट', back: 'मागे', hello: 'नमस्कार',
    walletBalance: 'वॉलेट शिल्लक', todaysServices: 'आजच्या सेवा', totalBookings: 'एकूण बुकिंग',
    totalEarnings: 'एकूण कमाई', actionNeeded: 'कृती आवश्यक', noActions: 'सध्या कोणतीही कृती आवश्यक नाही',
    workSchedule: 'कामाचे वेळापत्रक', noBookingsNow: 'सध्या कोणतीही बुकिंग उपलब्ध नाही',
    newJobRequestsHint: 'नवीन कामाच्या विनंत्या उपलब्ध झाल्यावर येथे दिसतील',
    bookingsTitle: 'बुकिंग', noBookingsFound: 'कोणतीही बुकिंग आढळली नाही',
    walletTitle: 'वॉलेट', netEarningsNote: 'पूर्ण कामांमधून निव्वळ कमाई (10% प्लॅटफॉर्म शुल्कानंतर)',
    transactions: 'व्यवहार', noTransactions: 'अजून कोणतेही व्यवहार नाहीत', noTransactionsHint: 'पूर्ण झालेली कामे येथे दिसतील',
    profileTitle: 'प्रोफाइल', servicesDelivered: 'दिलेल्या सेवा', serviceWord: 'सेवा', servicesWord: 'सेवा',
    memberSince: 'सदस्य पासून', general: 'सामान्य', profileSettings: 'प्रोफाइल सेटिंग्ज', myServices: 'माझ्या सेवा आणि दर',
    insights: 'विश्लेषण', manageLocations: 'स्थाने व्यवस्थापित करा', myReviews: 'माझी पुनरावलोकने', appDetails: 'अ‍ॅप तपशील',
    changeLanguage: 'भाषा बदला', terms: 'सेवा अटी', privacy: 'गोपनीयता धोरण',
    switchToFarmer: 'शेतकरी व्ह्यूवर जा', signOut: 'साइन आउट',
    basedOn: 'आधारित', reviewWord: 'पुनरावलोकन', reviewsWord: 'पुनरावलोकने', noReviews: 'अजून पुनरावलोकने नाहीत',
    noReviewsHint: 'पूर्ण कामांनंतर ग्राहकांची पुनरावलोकने येथे दिसतील',
    noLocations: 'कोणतीही जतन केलेली स्थाने नाहीत', noLocationsHint: 'ग्राहकांना शोधण्यात मदत करण्यासाठी स्थान जोडा',
    addLocation: 'स्थान जोडा', editLocation: 'स्थान संपादित करा', setAsDefault: 'डीफॉल्ट स्थान करा',
    notificationsTitle: 'सूचना', noNotifications: 'अजून कोणतीही सूचना नाही',
};

const gu: Dict = {
    home: 'હોમ', booking: 'બુકિંગ', wallet: 'વૉલેટ', profile: 'પ્રોફાઇલ',
    viewAll: 'બધું જુઓ', all: 'બધું', new: 'નવું', accepted: 'સ્વીકૃત', inProgress: 'ચાલુ',
    completed: 'પૂર્ણ', add: 'ઉમેરો', edit: 'સંપાદિત કરો', delete: 'કાઢી નાખો', save: 'સાચવો', saving: 'સાચવી રહ્યું છે…',
    setDefault: 'ડિફૉલ્ટ કરો', default: 'ડિફૉલ્ટ', back: 'પાછળ', hello: 'નમસ્તે',
    walletBalance: 'વૉલેટ બેલેન્સ', todaysServices: 'આજની સેવાઓ', totalBookings: 'કુલ બુકિંગ',
    totalEarnings: 'કુલ કમાણી', actionNeeded: 'પગલાં જરૂરી', noActions: 'હાલમાં કોઈ પગલાં જરૂરી નથી',
    workSchedule: 'કાર્ય શેડ્યૂલ', noBookingsNow: 'હાલમાં કોઈ બુકિંગ ઉપલબ્ધ નથી',
    newJobRequestsHint: 'નવી કામની વિનંતીઓ ઉપલબ્ધ થતાં અહીં દેખાશે',
    bookingsTitle: 'બુકિંગ', noBookingsFound: 'કોઈ બુકિંગ મળી નથી',
    walletTitle: 'વૉલેટ', netEarningsNote: 'પૂર્ણ કામોમાંથી ચોખ્ખી કમાણી (10% પ્લેટફોર્મ ફી પછી)',
    transactions: 'વ્યવહારો', noTransactions: 'હજુ કોઈ વ્યવહાર નથી', noTransactionsHint: 'પૂર્ણ થયેલા કામ અહીં દેખાશે',
    profileTitle: 'પ્રોફાઇલ', servicesDelivered: 'આપેલી સેવાઓ', serviceWord: 'સેવા', servicesWord: 'સેવાઓ',
    memberSince: 'સભ્ય થયા', general: 'સામાન્ય', profileSettings: 'પ્રોફાઇલ સેટિંગ્સ', myServices: 'મારી સેવાઓ અને ભાવ',
    insights: 'વિશ્લેષણ', manageLocations: 'સ્થાનો સંચાલિત કરો', myReviews: 'મારી સમીક્ષાઓ', appDetails: 'એપ વિગતો',
    changeLanguage: 'ભાષા બદલો', terms: 'સેવાની શરતો', privacy: 'ગોપનીયતા નીતિ',
    switchToFarmer: 'ખેડૂત વ્યૂ પર જાઓ', signOut: 'સાઇન આઉટ',
    basedOn: 'આધારિત', reviewWord: 'સમીક્ષા', reviewsWord: 'સમીક્ષાઓ', noReviews: 'હજુ કોઈ સમીક્ષા નથી',
    noReviewsHint: 'પૂર્ણ કામ પછી ગ્રાહકોની સમીક્ષાઓ અહીં દેખાશે',
    noLocations: 'કોઈ સાચવેલ સ્થાન નથી', noLocationsHint: 'ગ્રાહકોને શોધવામાં મદદ માટે સ્થાન ઉમેરો',
    addLocation: 'સ્થાન ઉમેરો', editLocation: 'સ્થાન સંપાદિત કરો', setAsDefault: 'ડિફૉલ્ટ સ્થાન બનાવો',
    notificationsTitle: 'સૂચનાઓ', noNotifications: 'હજુ કોઈ સૂચના નથી',
};

const te: Dict = {
    home: 'హోమ్', booking: 'బుకింగ్', wallet: 'వాలెట్', profile: 'ప్రొఫైల్',
    viewAll: 'అన్నీ చూడండి', all: 'అన్నీ', new: 'కొత్త', accepted: 'ఆమోదించబడింది', inProgress: 'జరుగుతోంది',
    completed: 'పూర్తయింది', add: 'జోడించు', edit: 'సవరించు', delete: 'తొలగించు', save: 'సేవ్ చేయి', saving: 'సేవ్ అవుతోంది…',
    setDefault: 'డిఫాల్ట్ చేయి', default: 'డిఫాల్ట్', back: 'వెనుకకు', hello: 'నమస్తే',
    walletBalance: 'వాలెట్ బ్యాలెన్స్', todaysServices: 'నేటి సేవలు', totalBookings: 'మొత్తం బుకింగ్‌లు',
    totalEarnings: 'మొత్తం ఆదాయం', actionNeeded: 'చర్య అవసరం', noActions: 'ప్రస్తుతం ఏ చర్య అవసరం లేదు',
    workSchedule: 'పని షెడ్యూల్', noBookingsNow: 'ప్రస్తుతం బుకింగ్‌లు అందుబాటులో లేవు',
    newJobRequestsHint: 'కొత్త పని అభ్యర్థనలు అందుబాటులోకి వచ్చినప్పుడు ఇక్కడ కనిపిస్తాయి',
    bookingsTitle: 'బుకింగ్‌లు', noBookingsFound: 'బుకింగ్‌లు కనబడలేదు',
    walletTitle: 'వాలెట్', netEarningsNote: 'పూర్తయిన పనుల నుండి నికర ఆదాయం (10% ప్లాట్‌ఫారమ్ ఫీ తర్వాత)',
    transactions: 'లావాదేవీలు', noTransactions: 'ఇంకా లావాదేవీలు లేవు', noTransactionsHint: 'పూర్తయిన పనులు ఇక్కడ కనిపిస్తాయి',
    profileTitle: 'ప్రొఫైల్', servicesDelivered: 'అందించిన సేవలు', serviceWord: 'సేవ', servicesWord: 'సేవలు',
    memberSince: 'సభ్యుడు నుండి', general: 'సాధారణ', profileSettings: 'ప్రొఫైల్ సెట్టింగ్‌లు', myServices: 'నా సేవలు & ధరలు',
    insights: 'విశ్లేషణలు', manageLocations: 'స్థానాలను నిర్వహించండి', myReviews: 'నా సమీక్షలు', appDetails: 'యాప్ వివరాలు',
    changeLanguage: 'భాష మార్చు', terms: 'సేవా నిబంధనలు', privacy: 'గోప్యతా విధానం',
    switchToFarmer: 'రైతు వీక్షణకు మారండి', signOut: 'సైన్ అవుట్',
    basedOn: 'ఆధారంగా', reviewWord: 'సమీక్ష', reviewsWord: 'సమీక్షలు', noReviews: 'ఇంకా సమీక్షలు లేవు',
    noReviewsHint: 'పూర్తయిన పనుల తర్వాత కస్టమర్ల సమీక్షలు ఇక్కడ కనిపిస్తాయి',
    noLocations: 'సేవ్ చేసిన స్థానాలు లేవు', noLocationsHint: 'కస్టమర్లు మిమ్మల్ని కనుగొనడంలో సహాయపడటానికి స్థానాన్ని జోడించండి',
    addLocation: 'స్థానాన్ని జోడించు', editLocation: 'స్థానాన్ని సవరించు', setAsDefault: 'డిఫాల్ట్ స్థానంగా చేయి',
    notificationsTitle: 'నోటిఫికేషన్లు', noNotifications: 'ఇంకా నోటిఫికేషన్లు లేవు',
};

const ta: Dict = {
    home: 'முகப்பு', booking: 'முன்பதிவு', wallet: 'வாலட்', profile: 'சுயவிவரம்',
    viewAll: 'அனைத்தையும் காண்க', all: 'அனைத்தும்', new: 'புதிய', accepted: 'ஏற்கப்பட்டது', inProgress: 'நடைபெறுகிறது',
    completed: 'முடிந்தது', add: 'சேர்', edit: 'திருத்து', delete: 'நீக்கு', save: 'சேமி', saving: 'சேமிக்கிறது…',
    setDefault: 'இயல்பாக்கு', default: 'இயல்பு', back: 'பின்', hello: 'வணக்கம்',
    walletBalance: 'வாலட் இருப்பு', todaysServices: 'இன்றைய சேவைகள்', totalBookings: 'மொத்த முன்பதிவுகள்',
    totalEarnings: 'மொத்த வருவாய்', actionNeeded: 'நடவடிக்கை தேவை', noActions: 'தற்போது நடவடிக்கை எதுவும் தேவையில்லை',
    workSchedule: 'வேலை அட்டவணை', noBookingsNow: 'தற்போது முன்பதிவுகள் எதுவும் இல்லை',
    newJobRequestsHint: 'புதிய வேலை கோரிக்கைகள் கிடைக்கும்போது இங்கே தோன்றும்',
    bookingsTitle: 'முன்பதிவுகள்', noBookingsFound: 'முன்பதிவுகள் எதுவும் இல்லை',
    walletTitle: 'வாலட்', netEarningsNote: 'முடிக்கப்பட்ட வேலைகளின் நிகர வருவாய் (10% தள கட்டணத்திற்குப் பிறகு)',
    transactions: 'பரிவர்த்தனைகள்', noTransactions: 'இதுவரை பரிவர்த்தனைகள் இல்லை', noTransactionsHint: 'முடிக்கப்பட்ட வேலைகள் இங்கே தோன்றும்',
    profileTitle: 'சுயவிவரம்', servicesDelivered: 'வழங்கிய சேவைகள்', serviceWord: 'சேவை', servicesWord: 'சேவைகள்',
    memberSince: 'உறுப்பினர் முதல்', general: 'பொது', profileSettings: 'சுயவிவர அமைப்புகள்', myServices: 'என் சேவைகள் & விலை',
    insights: 'பகுப்பாய்வு', manageLocations: 'இடங்களை நிர்வகிக்கவும்', myReviews: 'என் விமர்சனங்கள்', appDetails: 'ஆப் விவரங்கள்',
    changeLanguage: 'மொழியை மாற்று', terms: 'சேவை விதிமுறைகள்', privacy: 'தனியுரிமைக் கொள்கை',
    switchToFarmer: 'விவசாயி பார்வைக்கு மாறு', signOut: 'வெளியேறு',
    basedOn: 'அடிப்படையில்', reviewWord: 'விமர்சனம்', reviewsWord: 'விமர்சனங்கள்', noReviews: 'இதுவரை விமர்சனங்கள் இல்லை',
    noReviewsHint: 'முடிக்கப்பட்ட வேலைகளுக்குப் பிறகு வாடிக்கையாளர் விமர்சனங்கள் இங்கே தோன்றும்',
    noLocations: 'சேமித்த இடங்கள் இல்லை', noLocationsHint: 'வாடிக்கையாளர்கள் உங்களைக் கண்டறிய இடத்தைச் சேர்க்கவும்',
    addLocation: 'இடத்தைச் சேர்', editLocation: 'இடத்தைத் திருத்து', setAsDefault: 'இயல்பு இடமாக அமை',
    notificationsTitle: 'அறிவிப்புகள்', noNotifications: 'இதுவரை அறிவிப்புகள் இல்லை',
};

const kn: Dict = {
    home: 'ಮುಖಪುಟ', booking: 'ಬುಕಿಂಗ್', wallet: 'ವಾಲೆಟ್', profile: 'ಪ್ರೊಫೈಲ್',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', all: 'ಎಲ್ಲಾ', new: 'ಹೊಸ', accepted: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ', inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ',
    completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ', add: 'ಸೇರಿಸಿ', edit: 'ಸಂಪಾದಿಸಿ', delete: 'ಅಳಿಸಿ', save: 'ಉಳಿಸಿ', saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    setDefault: 'ಡೀಫಾಲ್ಟ್ ಮಾಡಿ', default: 'ಡೀಫಾಲ್ಟ್', back: 'ಹಿಂದೆ', hello: 'ನಮಸ್ಕಾರ',
    walletBalance: 'ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್', todaysServices: 'ಇಂದಿನ ಸೇವೆಗಳು', totalBookings: 'ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು',
    totalEarnings: 'ಒಟ್ಟು ಗಳಿಕೆ', actionNeeded: 'ಕ್ರಮ ಅಗತ್ಯವಿದೆ', noActions: 'ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಕ್ರಮ ಅಗತ್ಯವಿಲ್ಲ',
    workSchedule: 'ಕೆಲಸದ ವೇಳಾಪಟ್ಟಿ', noBookingsNow: 'ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಬುಕಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ',
    newJobRequestsHint: 'ಹೊಸ ಕೆಲಸದ ವಿನಂತಿಗಳು ಲಭ್ಯವಾದಾಗ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ',
    bookingsTitle: 'ಬುಕಿಂಗ್‌ಗಳು', noBookingsFound: 'ಯಾವುದೇ ಬುಕಿಂಗ್ ಸಿಗಲಿಲ್ಲ',
    walletTitle: 'ವಾಲೆಟ್', netEarningsNote: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳಿಂದ ನಿವ್ವಳ ಗಳಿಕೆ (10% ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕದ ನಂತರ)',
    transactions: 'ವಹಿವಾಟುಗಳು', noTransactions: 'ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟು ಇಲ್ಲ', noTransactionsHint: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ',
    profileTitle: 'ಪ್ರೊಫೈಲ್', servicesDelivered: 'ನೀಡಿದ ಸೇವೆಗಳು', serviceWord: 'ಸೇವೆ', servicesWord: 'ಸೇವೆಗಳು',
    memberSince: 'ಸದಸ್ಯರಾದ ದಿನಾಂಕ', general: 'ಸಾಮಾನ್ಯ', profileSettings: 'ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು', myServices: 'ನನ್ನ ಸೇವೆಗಳು ಮತ್ತು ಬೆಲೆ',
    insights: 'ವಿಶ್ಲೇಷಣೆ', manageLocations: 'ಸ್ಥಳಗಳನ್ನು ನಿರ್ವಹಿಸಿ', myReviews: 'ನನ್ನ ವಿಮರ್ಶೆಗಳು', appDetails: 'ಆ್ಯಪ್ ವಿವರಗಳು',
    changeLanguage: 'ಭಾಷೆ ಬದಲಿಸಿ', terms: 'ಸೇವಾ ನಿಯಮಗಳು', privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    switchToFarmer: 'ರೈತ ವೀಕ್ಷಣೆಗೆ ಬದಲಿಸಿ', signOut: 'ಸೈನ್ ಔಟ್',
    basedOn: 'ಆಧಾರಿತ', reviewWord: 'ವಿಮರ್ಶೆ', reviewsWord: 'ವಿಮರ್ಶೆಗಳು', noReviews: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಮರ್ಶೆ ಇಲ್ಲ',
    noReviewsHint: 'ಪೂರ್ಣಗೊಂಡ ಕೆಲಸಗಳ ನಂತರ ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ',
    noLocations: 'ಉಳಿಸಿದ ಸ್ಥಳಗಳಿಲ್ಲ', noLocationsHint: 'ಗ್ರಾಹಕರು ನಿಮ್ಮನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಲು ಸ್ಥಳ ಸೇರಿಸಿ',
    addLocation: 'ಸ್ಥಳ ಸೇರಿಸಿ', editLocation: 'ಸ್ಥಳ ಸಂಪಾದಿಸಿ', setAsDefault: 'ಡೀಫಾಲ್ಟ್ ಸ್ಥಳವಾಗಿ ಹೊಂದಿಸಿ',
    notificationsTitle: 'ಅಧಿಸೂಚನೆಗಳು', noNotifications: 'ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆ ಇಲ್ಲ',
};

const pa: Dict = {
    home: 'ਹੋਮ', booking: 'ਬੁਕਿੰਗ', wallet: 'ਵਾਲਿਟ', profile: 'ਪ੍ਰੋਫਾਈਲ',
    viewAll: 'ਸਭ ਵੇਖੋ', all: 'ਸਭ', new: 'ਨਵਾਂ', accepted: 'ਸਵੀਕਾਰ', inProgress: 'ਜਾਰੀ',
    completed: 'ਮੁਕੰਮਲ', add: 'ਸ਼ਾਮਲ ਕਰੋ', edit: 'ਸੋਧੋ', delete: 'ਮਿਟਾਓ', save: 'ਸੰਭਾਲੋ', saving: 'ਸੰਭਾਲ ਰਿਹਾ ਹੈ…',
    setDefault: 'ਡਿਫਾਲਟ ਕਰੋ', default: 'ਡਿਫਾਲਟ', back: 'ਵਾਪਸ', hello: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    walletBalance: 'ਵਾਲਿਟ ਬਕਾਇਆ', todaysServices: 'ਅੱਜ ਦੀਆਂ ਸੇਵਾਵਾਂ', totalBookings: 'ਕੁੱਲ ਬੁਕਿੰਗ',
    totalEarnings: 'ਕੁੱਲ ਕਮਾਈ', actionNeeded: 'ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ', noActions: 'ਇਸ ਵੇਲੇ ਕੋਈ ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ ਨਹੀਂ',
    workSchedule: 'ਕੰਮ ਦਾ ਸ਼ੈਡਿਊਲ', noBookingsNow: 'ਇਸ ਵੇਲੇ ਕੋਈ ਬੁਕਿੰਗ ਉਪਲਬਧ ਨਹੀਂ',
    newJobRequestsHint: 'ਨਵੀਆਂ ਕੰਮ ਦੀਆਂ ਬੇਨਤੀਆਂ ਉਪਲਬਧ ਹੋਣ ਤੇ ਇੱਥੇ ਦਿਖਣਗੀਆਂ',
    bookingsTitle: 'ਬੁਕਿੰਗ', noBookingsFound: 'ਕੋਈ ਬੁਕਿੰਗ ਨਹੀਂ ਮਿਲੀ',
    walletTitle: 'ਵਾਲਿਟ', netEarningsNote: 'ਮੁਕੰਮਲ ਕੰਮਾਂ ਤੋਂ ਸ਼ੁੱਧ ਕਮਾਈ (10% ਪਲੇਟਫਾਰਮ ਫੀਸ ਤੋਂ ਬਾਅਦ)',
    transactions: 'ਲੈਣ-ਦੇਣ', noTransactions: 'ਹਾਲੇ ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ', noTransactionsHint: 'ਮੁਕੰਮਲ ਕੰਮ ਇੱਥੇ ਦਿਖਣਗੇ',
    profileTitle: 'ਪ੍ਰੋਫਾਈਲ', servicesDelivered: 'ਦਿੱਤੀਆਂ ਸੇਵਾਵਾਂ', serviceWord: 'ਸੇਵਾ', servicesWord: 'ਸੇਵਾਵਾਂ',
    memberSince: 'ਮੈਂਬਰ ਤੋਂ', general: 'ਆਮ', profileSettings: 'ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਾਂ', myServices: 'ਮੇਰੀਆਂ ਸੇਵਾਵਾਂ ਤੇ ਕੀਮਤਾਂ',
    insights: 'ਵਿਸ਼ਲੇਸ਼ਣ', manageLocations: 'ਟਿਕਾਣੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ', myReviews: 'ਮੇਰੀਆਂ ਸਮੀਖਿਆਵਾਂ', appDetails: 'ਐਪ ਵੇਰਵੇ',
    changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ', terms: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ', privacy: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ',
    switchToFarmer: 'ਕਿਸਾਨ ਵਿਊ ਤੇ ਜਾਓ', signOut: 'ਸਾਈਨ ਆਊਟ',
    basedOn: 'ਅਧਾਰਿਤ', reviewWord: 'ਸਮੀਖਿਆ', reviewsWord: 'ਸਮੀਖਿਆਵਾਂ', noReviews: 'ਹਾਲੇ ਕੋਈ ਸਮੀਖਿਆ ਨਹੀਂ',
    noReviewsHint: 'ਮੁਕੰਮਲ ਕੰਮਾਂ ਤੋਂ ਬਾਅਦ ਗਾਹਕਾਂ ਦੀਆਂ ਸਮੀਖਿਆਵਾਂ ਇੱਥੇ ਦਿਖਣਗੀਆਂ',
    noLocations: 'ਕੋਈ ਸੰਭਾਲਿਆ ਟਿਕਾਣਾ ਨਹੀਂ', noLocationsHint: 'ਗਾਹਕਾਂ ਨੂੰ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਲਈ ਟਿਕਾਣਾ ਸ਼ਾਮਲ ਕਰੋ',
    addLocation: 'ਟਿਕਾਣਾ ਸ਼ਾਮਲ ਕਰੋ', editLocation: 'ਟਿਕਾਣਾ ਸੋਧੋ', setAsDefault: 'ਡਿਫਾਲਟ ਟਿਕਾਣਾ ਬਣਾਓ',
    notificationsTitle: 'ਸੂਚਨਾਵਾਂ', noNotifications: 'ਹਾਲੇ ਕੋਈ ਸੂਚਨਾ ਨਹੀਂ',
};

const bn: Dict = {
    home: 'হোম', booking: 'বুকিং', wallet: 'ওয়ালেট', profile: 'প্রোফাইল',
    viewAll: 'সব দেখুন', all: 'সব', new: 'নতুন', accepted: 'গৃহীত', inProgress: 'চলমান',
    completed: 'সম্পন্ন', add: 'যোগ করুন', edit: 'সম্পাদনা', delete: 'মুছুন', save: 'সংরক্ষণ', saving: 'সংরক্ষণ হচ্ছে…',
    setDefault: 'ডিফল্ট করুন', default: 'ডিফল্ট', back: 'পিছনে', hello: 'নমস্কার',
    walletBalance: 'ওয়ালেট ব্যালেন্স', todaysServices: 'আজকের সেবা', totalBookings: 'মোট বুকিং',
    totalEarnings: 'মোট আয়', actionNeeded: 'পদক্ষেপ প্রয়োজন', noActions: 'এই মুহূর্তে কোনো পদক্ষেপ প্রয়োজন নেই',
    workSchedule: 'কাজের সময়সূচি', noBookingsNow: 'এই মুহূর্তে কোনো বুকিং উপলব্ধ নেই',
    newJobRequestsHint: 'নতুন কাজের অনুরোধ উপলব্ধ হলে এখানে দেখা যাবে',
    bookingsTitle: 'বুকিং', noBookingsFound: 'কোনো বুকিং পাওয়া যায়নি',
    walletTitle: 'ওয়ালেট', netEarningsNote: 'সম্পন্ন কাজ থেকে নিট আয় (10% প্ল্যাটফর্ম ফি বাদে)',
    transactions: 'লেনদেন', noTransactions: 'এখনও কোনো লেনদেন নেই', noTransactionsHint: 'সম্পন্ন কাজ এখানে দেখা যাবে',
    profileTitle: 'প্রোফাইল', servicesDelivered: 'প্রদত্ত সেবা', serviceWord: 'সেবা', servicesWord: 'সেবা',
    memberSince: 'সদস্য যেদিন থেকে', general: 'সাধারণ', profileSettings: 'প্রোফাইল সেটিংস', myServices: 'আমার সেবা ও মূল্য',
    insights: 'বিশ্লেষণ', manageLocations: 'অবস্থান পরিচালনা', myReviews: 'আমার পর্যালোচনা', appDetails: 'অ্যাপ বিবরণ',
    changeLanguage: 'ভাষা পরিবর্তন', terms: 'পরিষেবার শর্তাবলী', privacy: 'গোপনীয়তা নীতি',
    switchToFarmer: 'কৃষক ভিউতে যান', signOut: 'সাইন আউট',
    basedOn: 'ভিত্তিক', reviewWord: 'পর্যালোচনা', reviewsWord: 'পর্যালোচনা', noReviews: 'এখনও কোনো পর্যালোচনা নেই',
    noReviewsHint: 'সম্পন্ন কাজের পরে গ্রাহকদের পর্যালোচনা এখানে দেখা যাবে',
    noLocations: 'কোনো সংরক্ষিত অবস্থান নেই', noLocationsHint: 'গ্রাহকদের আপনাকে খুঁজে পেতে সাহায্য করতে অবস্থান যোগ করুন',
    addLocation: 'অবস্থান যোগ করুন', editLocation: 'অবস্থান সম্পাদনা', setAsDefault: 'ডিফল্ট অবস্থান করুন',
    notificationsTitle: 'বিজ্ঞপ্তি', noNotifications: 'এখনও কোনো বিজ্ঞপ্তি নেই',
};

const ml: Dict = {
    home: 'ഹോം', booking: 'ബുക്കിംഗ്', wallet: 'വാലറ്റ്', profile: 'പ്രൊഫൈൽ',
    viewAll: 'എല്ലാം കാണുക', all: 'എല്ലാം', new: 'പുതിയത്', accepted: 'സ്വീകരിച്ചു', inProgress: 'നടക്കുന്നു',
    completed: 'പൂർത്തിയായി', add: 'ചേർക്കുക', edit: 'തിരുത്തുക', delete: 'ഇല്ലാതാക്കുക', save: 'സേവ് ചെയ്യുക', saving: 'സേവ് ചെയ്യുന്നു…',
    setDefault: 'ഡിഫോൾട്ട് ആക്കുക', default: 'ഡിഫോൾട്ട്', back: 'തിരികെ', hello: 'നമസ്കാരം',
    walletBalance: 'വാലറ്റ് ബാലൻസ്', todaysServices: 'ഇന്നത്തെ സേവനങ്ങൾ', totalBookings: 'ആകെ ബുക്കിംഗുകൾ',
    totalEarnings: 'ആകെ വരുമാനം', actionNeeded: 'നടപടി ആവശ്യമാണ്', noActions: 'ഇപ്പോൾ നടപടിയൊന്നും ആവശ്യമില്ല',
    workSchedule: 'ജോലി ഷെഡ്യൂൾ', noBookingsNow: 'ഇപ്പോൾ ബുക്കിംഗുകളൊന്നും ലഭ്യമല്ല',
    newJobRequestsHint: 'പുതിയ ജോലി അഭ്യർത്ഥനകൾ ലഭ്യമാകുമ്പോൾ ഇവിടെ കാണാം',
    bookingsTitle: 'ബുക്കിംഗുകൾ', noBookingsFound: 'ബുക്കിംഗുകളൊന്നും കണ്ടെത്തിയില്ല',
    walletTitle: 'വാലറ്റ്', netEarningsNote: 'പൂർത്തിയായ ജോലികളിൽ നിന്നുള്ള അറ്റ വരുമാനം (10% പ്ലാറ്റ്ഫോം ഫീസിന് ശേഷം)',
    transactions: 'ഇടപാടുകൾ', noTransactions: 'ഇതുവരെ ഇടപാടുകളൊന്നുമില്ല', noTransactionsHint: 'പൂർത്തിയായ ജോലികൾ ഇവിടെ കാണാം',
    profileTitle: 'പ്രൊഫൈൽ', servicesDelivered: 'നൽകിയ സേവനങ്ങൾ', serviceWord: 'സേവനം', servicesWord: 'സേവനങ്ങൾ',
    memberSince: 'അംഗമായത് മുതൽ', general: 'പൊതുവായത്', profileSettings: 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ', myServices: 'എന്റെ സേവനങ്ങളും വിലയും',
    insights: 'വിശകലനം', manageLocations: 'സ്ഥലങ്ങൾ കൈകാര്യം ചെയ്യുക', myReviews: 'എന്റെ റിവ്യൂകൾ', appDetails: 'ആപ്പ് വിശദാംശങ്ങൾ',
    changeLanguage: 'ഭാഷ മാറ്റുക', terms: 'സേവന നിബന്ധനകൾ', privacy: 'സ്വകാര്യതാ നയം',
    switchToFarmer: 'കർഷക കാഴ്ചയിലേക്ക് മാറുക', signOut: 'സൈൻ ഔട്ട്',
    basedOn: 'അടിസ്ഥാനമാക്കി', reviewWord: 'റിവ്യൂ', reviewsWord: 'റിവ്യൂകൾ', noReviews: 'ഇതുവരെ റിവ്യൂകളൊന്നുമില്ല',
    noReviewsHint: 'പൂർത്തിയായ ജോലികൾക്ക് ശേഷം ഉപഭോക്താക്കളുടെ റിവ്യൂകൾ ഇവിടെ കാണാം',
    noLocations: 'സേവ് ചെയ്ത സ്ഥലങ്ങളൊന്നുമില്ല', noLocationsHint: 'ഉപഭോക്താക്കൾക്ക് നിങ്ങളെ കണ്ടെത്താൻ സഹായിക്കാൻ ഒരു സ്ഥലം ചേർക്കുക',
    addLocation: 'സ്ഥലം ചേർക്കുക', editLocation: 'സ്ഥലം തിരുത്തുക', setAsDefault: 'ഡിഫോൾട്ട് സ്ഥലമായി സജ്ജീകരിക്കുക',
    notificationsTitle: 'അറിയിപ്പുകൾ', noNotifications: 'ഇതുവരെ അറിയിപ്പുകളൊന്നുമില്ല',
};

export const providerT: Record<LangCode, Dict> = { en, hi, mr, gu, te, ta, kn, pa, bn, ml };

/** Hook returning a translator scoped to the provider section (English fallback). */
export function useProviderT() {
    const { lang } = useLanguage();
    return (key: string): string => providerT[lang]?.[key] || providerT.en[key] || key;
}
