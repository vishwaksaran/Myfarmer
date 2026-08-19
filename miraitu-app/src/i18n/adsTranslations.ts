// Advertising label and consent-notice copy, merged into LanguageContext for
// every language.
//
// These strings are compliance surface, not marketing chrome. Two rules when
// editing them:
//   - 'ads.label' must stay a plain word for "advertisement". AdSense policy
//     requires ads to be distinguishable from content; a cute synonym fails it.
//   - The consent copy must keep saying that declining switches ads to
//     non-personalised rather than removing them, because that is what the
//     code actually does. Copy that promises no ads would make the consent
//     invalid under DPDP's "informed" requirement.
import { LangCode } from './translations';

export const adsTranslations: Record<LangCode, Record<string, string>> = {
    en: {
        'ads.label': 'Advertisement',
        'ads.consentTitle': 'Ads on Miraitu',
        'ads.consentBody': 'We show ads to keep Miraitu free. Allow us to use cookies for ads suited to you? If you decline, you will still see ads, just not personalised ones. You can change this anytime in Settings.',
        'ads.consentAccept': 'Allow',
        'ads.consentDecline': 'No, thanks',
        'ads.consentPolicyLink': 'Privacy Policy',
        'ads.settingsTitle': 'Personalised ads',
        'ads.settingsBody': 'Choose whether ads on Miraitu are matched to your interests.',
        'ads.settingsWithdraw': 'Withdraw consent',
    },
    hi: {
        'ads.label': 'विज्ञापन',
        'ads.consentTitle': 'Miraitu पर विज्ञापन',
        'ads.consentBody': 'Miraitu को मुफ़्त रखने के लिए हम विज्ञापन दिखाते हैं। क्या हम आपके अनुसार विज्ञापन दिखाने के लिए कुकीज़ का उपयोग कर सकते हैं? मना करने पर भी विज्ञापन दिखेंगे, बस वे आपके अनुसार नहीं होंगे। आप इसे कभी भी सेटिंग्स में बदल सकते हैं।',
        'ads.consentAccept': 'अनुमति दें',
        'ads.consentDecline': 'नहीं, धन्यवाद',
        'ads.consentPolicyLink': 'गोपनीयता नीति',
        'ads.settingsTitle': 'वैयक्तिकृत विज्ञापन',
        'ads.settingsBody': 'चुनें कि Miraitu पर विज्ञापन आपकी रुचि के अनुसार दिखें या नहीं।',
        'ads.settingsWithdraw': 'सहमति वापस लें',
    },
    mr: {
        'ads.label': 'जाहिरात',
        'ads.consentTitle': 'Miraitu वरील जाहिराती',
        'ads.consentBody': 'Miraitu विनामूल्य ठेवण्यासाठी आम्ही जाहिराती दाखवतो. तुमच्यासाठी योग्य जाहिरातींसाठी कुकीज वापरण्यास परवानगी द्याल का? नकार दिल्यास जाहिराती दिसतीलच, फक्त त्या वैयक्तिक नसतील. तुम्ही हे कधीही सेटिंग्जमध्ये बदलू शकता.',
        'ads.consentAccept': 'परवानगी द्या',
        'ads.consentDecline': 'नको, धन्यवाद',
        'ads.consentPolicyLink': 'गोपनीयता धोरण',
        'ads.settingsTitle': 'वैयक्तिक जाहिराती',
        'ads.settingsBody': 'Miraitu वरील जाहिराती तुमच्या आवडीनुसार दाखवायच्या का ते निवडा.',
        'ads.settingsWithdraw': 'संमती मागे घ्या',
    },
    gu: {
        'ads.label': 'જાહેરાત',
        'ads.consentTitle': 'Miraitu પર જાહેરાતો',
        'ads.consentBody': 'Miraitu ને મફત રાખવા માટે અમે જાહેરાતો બતાવીએ છીએ. તમને અનુકૂળ જાહેરાતો માટે કૂકીઝ વાપરવાની પરવાનગી આપશો? ના પાડશો તો પણ જાહેરાતો દેખાશે, ફક્ત તે વ્યક્તિગત નહીં હોય. તમે આ ગમે ત્યારે સેટિંગ્સમાં બદલી શકો છો.',
        'ads.consentAccept': 'પરવાનગી આપો',
        'ads.consentDecline': 'ના, આભાર',
        'ads.consentPolicyLink': 'ગોપનીયતા નીતિ',
        'ads.settingsTitle': 'વ્યક્તિગત જાહેરાતો',
        'ads.settingsBody': 'Miraitu પરની જાહેરાતો તમારી રુચિ પ્રમાણે બતાવવી કે નહીં તે પસંદ કરો.',
        'ads.settingsWithdraw': 'સંમતિ પાછી ખેંચો',
    },
    te: {
        'ads.label': 'ప్రకటన',
        'ads.consentTitle': 'Miraitu లో ప్రకటనలు',
        'ads.consentBody': 'Miraitu ను ఉచితంగా ఉంచడానికి మేము ప్రకటనలు చూపిస్తాము. మీకు తగిన ప్రకటనల కోసం కుకీలను ఉపయోగించడానికి అనుమతిస్తారా? నిరాకరించినా ప్రకటనలు కనిపిస్తాయి, అవి వ్యక్తిగతం కావు అంతే. దీన్ని ఎప్పుడైనా సెట్టింగ్‌లలో మార్చవచ్చు.',
        'ads.consentAccept': 'అనుమతించు',
        'ads.consentDecline': 'వద్దు, ధన్యవాదాలు',
        'ads.consentPolicyLink': 'గోప్యతా విధానం',
        'ads.settingsTitle': 'వ్యక్తిగతీకరించిన ప్రకటనలు',
        'ads.settingsBody': 'Miraitu లోని ప్రకటనలు మీ ఆసక్తుల ప్రకారం ఉండాలా వద్దా అని ఎంచుకోండి.',
        'ads.settingsWithdraw': 'సమ్మతిని ఉపసంహరించు',
    },
    ta: {
        'ads.label': 'விளம்பரம்',
        'ads.consentTitle': 'Miraitu இல் விளம்பரங்கள்',
        'ads.consentBody': 'Miraitu ஐ இலவசமாக வைத்திருக்க நாங்கள் விளம்பரங்களைக் காட்டுகிறோம். உங்களுக்கு ஏற்ற விளம்பரங்களுக்கு குக்கீகளைப் பயன்படுத்த அனுமதிக்கிறீர்களா? மறுத்தாலும் விளம்பரங்கள் தெரியும், அவை தனிப்பயனாக்கப்படாது அவ்வளவே. இதை எப்போது வேண்டுமானாலும் அமைப்புகளில் மாற்றலாம்.',
        'ads.consentAccept': 'அனுமதி',
        'ads.consentDecline': 'வேண்டாம், நன்றி',
        'ads.consentPolicyLink': 'தனியுரிமைக் கொள்கை',
        'ads.settingsTitle': 'தனிப்பயன் விளம்பரங்கள்',
        'ads.settingsBody': 'Miraitu இல் விளம்பரங்கள் உங்கள் விருப்பப்படி இருக்க வேண்டுமா என்பதைத் தேர்வுசெய்யவும்.',
        'ads.settingsWithdraw': 'ஒப்புதலை திரும்பப் பெறு',
    },
    kn: {
        'ads.label': 'ಜಾಹೀರಾತು',
        'ads.consentTitle': 'Miraitu ನಲ್ಲಿ ಜಾಹೀರಾತುಗಳು',
        'ads.consentBody': 'Miraitu ಅನ್ನು ಉಚಿತವಾಗಿ ಇರಿಸಲು ನಾವು ಜಾಹೀರಾತುಗಳನ್ನು ತೋರಿಸುತ್ತೇವೆ. ನಿಮಗೆ ಸೂಕ್ತವಾದ ಜಾಹೀರಾತುಗಳಿಗಾಗಿ ಕುಕೀಗಳನ್ನು ಬಳಸಲು ಅನುಮತಿಸುತ್ತೀರಾ? ನಿರಾಕರಿಸಿದರೂ ಜಾಹೀರಾತುಗಳು ಕಾಣಿಸುತ್ತವೆ, ಅವು ವೈಯಕ್ತಿಕವಾಗಿರುವುದಿಲ್ಲ ಅಷ್ಟೆ. ಇದನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಬದಲಾಯಿಸಬಹುದು.',
        'ads.consentAccept': 'ಅನುಮತಿಸಿ',
        'ads.consentDecline': 'ಬೇಡ, ಧನ್ಯವಾದಗಳು',
        'ads.consentPolicyLink': 'ಗೌಪ್ಯತಾ ನೀತಿ',
        'ads.settingsTitle': 'ವೈಯಕ್ತಿಕ ಜಾಹೀರಾತುಗಳು',
        'ads.settingsBody': 'Miraitu ನಲ್ಲಿನ ಜಾಹೀರಾತುಗಳು ನಿಮ್ಮ ಆಸಕ್ತಿಗೆ ತಕ್ಕಂತೆ ಇರಬೇಕೇ ಎಂದು ಆರಿಸಿ.',
        'ads.settingsWithdraw': 'ಸಮ್ಮತಿ ಹಿಂಪಡೆಯಿರಿ',
    },
    pa: {
        'ads.label': 'ਇਸ਼ਤਿਹਾਰ',
        'ads.consentTitle': 'Miraitu ਉੱਤੇ ਇਸ਼ਤਿਹਾਰ',
        'ads.consentBody': 'Miraitu ਨੂੰ ਮੁਫ਼ਤ ਰੱਖਣ ਲਈ ਅਸੀਂ ਇਸ਼ਤਿਹਾਰ ਦਿਖਾਉਂਦੇ ਹਾਂ। ਕੀ ਅਸੀਂ ਤੁਹਾਡੇ ਮੁਤਾਬਕ ਇਸ਼ਤਿਹਾਰਾਂ ਲਈ ਕੂਕੀਜ਼ ਵਰਤ ਸਕਦੇ ਹਾਂ? ਇਨਕਾਰ ਕਰਨ ਤੇ ਵੀ ਇਸ਼ਤਿਹਾਰ ਦਿਖਣਗੇ, ਬੱਸ ਉਹ ਨਿੱਜੀ ਨਹੀਂ ਹੋਣਗੇ। ਤੁਸੀਂ ਇਸਨੂੰ ਕਦੇ ਵੀ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ।',
        'ads.consentAccept': 'ਇਜਾਜ਼ਤ ਦਿਓ',
        'ads.consentDecline': 'ਨਹੀਂ, ਧੰਨਵਾਦ',
        'ads.consentPolicyLink': 'ਪਰਾਈਵੇਸੀ ਨੀਤੀ',
        'ads.settingsTitle': 'ਨਿੱਜੀ ਇਸ਼ਤਿਹਾਰ',
        'ads.settingsBody': 'ਚੁਣੋ ਕਿ Miraitu ਉੱਤੇ ਇਸ਼ਤਿਹਾਰ ਤੁਹਾਡੀ ਦਿਲਚਸਪੀ ਮੁਤਾਬਕ ਹੋਣ ਜਾਂ ਨਾ।',
        'ads.settingsWithdraw': 'ਸਹਿਮਤੀ ਵਾਪਸ ਲਓ',
    },
    bn: {
        'ads.label': 'বিজ্ঞাপন',
        'ads.consentTitle': 'Miraitu-তে বিজ্ঞাপন',
        'ads.consentBody': 'Miraitu ফ্রি রাখতে আমরা বিজ্ঞাপন দেখাই। আপনার উপযোগী বিজ্ঞাপনের জন্য কুকি ব্যবহারের অনুমতি দেবেন? অস্বীকার করলেও বিজ্ঞাপন দেখা যাবে, শুধু সেগুলি ব্যক্তিগতকৃত হবে না। আপনি যেকোনো সময় সেটিংসে এটি বদলাতে পারেন।',
        'ads.consentAccept': 'অনুমতি দিন',
        'ads.consentDecline': 'না, ধন্যবাদ',
        'ads.consentPolicyLink': 'গোপনীয়তা নীতি',
        'ads.settingsTitle': 'ব্যক্তিগতকৃত বিজ্ঞাপন',
        'ads.settingsBody': 'Miraitu-তে বিজ্ঞাপন আপনার আগ্রহ অনুযায়ী হবে কিনা তা বেছে নিন।',
        'ads.settingsWithdraw': 'সম্মতি প্রত্যাহার করুন',
    },
    ml: {
        'ads.label': 'പരസ്യം',
        'ads.consentTitle': 'Miraitu-ൽ പരസ്യങ്ങൾ',
        'ads.consentBody': 'Miraitu സൗജന്യമായി നിലനിർത്താൻ ഞങ്ങൾ പരസ്യങ്ങൾ കാണിക്കുന്നു. നിങ്ങൾക്ക് അനുയോജ്യമായ പരസ്യങ്ങൾക്കായി കുക്കികൾ ഉപയോഗിക്കാൻ അനുവദിക്കുമോ? നിരസിച്ചാലും പരസ്യങ്ങൾ കാണും, അവ വ്യക്തിഗതമാകില്ല എന്നു മാത്രം. ഇത് എപ്പോൾ വേണമെങ്കിലും ക്രമീകരണങ്ങളിൽ മാറ്റാം.',
        'ads.consentAccept': 'അനുവദിക്കുക',
        'ads.consentDecline': 'വേണ്ട, നന്ദി',
        'ads.consentPolicyLink': 'സ്വകാര്യതാ നയം',
        'ads.settingsTitle': 'വ്യക്തിഗത പരസ്യങ്ങൾ',
        'ads.settingsBody': 'Miraitu-ലെ പരസ്യങ്ങൾ നിങ്ങളുടെ താൽപ്പര്യങ്ങൾക്കനുസരിച്ച് വേണോ എന്ന് തിരഞ്ഞെടുക്കുക.',
        'ads.settingsWithdraw': 'സമ്മതം പിൻവലിക്കുക',
    },
};
