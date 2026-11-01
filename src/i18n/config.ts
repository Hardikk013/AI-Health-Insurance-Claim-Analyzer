import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'ClaimFight',
      tagline: 'Fight Unfair Health Insurance Rejections with AI & IRDAI Rules',
      disclaimerBanner: 'This is general information, not legal advice. Verify rules at official sources.',
      nav: {
        dashboard: 'Dashboard',
        newCase: 'New Case',
        howItWorks: 'How It Works',
        sampleCases: 'Sample Cases',
        officialSources: 'Official Sources',
        privacy: 'Data & Privacy',
        login: 'Sign In',
        register: 'Sign Up',
        logout: 'Log Out'
      },
      hero: {
        badge: 'Built for Indian Families & IRDAI Regulations',
        title: 'Was your health insurance claim wrongly rejected?',
        subtitle: 'Upload your rejection letter, policy document, and discharge summary. ClaimFight compares insurer statements against policy clauses and IRDAI rules, finds grounds to contest, and drafts your appeal in under 2 minutes.',
        ctaStart: 'Check My Claim Free',
        ctaSample: 'Try a Live Sample Case',
        stats1: '₹20,000+ Cr',
        stats1Desc: 'Claim deductions annually in India',
        stats2: '4 Supported Reasons',
        stats2Desc: 'Waiting period, PED, Room rent, Medical necessity',
        stats3: '24-Hour Purge',
        stats3Desc: 'Auto-delete all documents for privacy'
      },
      verdicts: {
        grounds_to_contest: 'Grounds to Contest Found',
        insurer_appears_correct: 'Insurer Appears Correct',
        unclear: 'Unclear: Needs More Information',
        not_supported: 'Reason Not Yet Supported'
      },
      comparison: {
        insurerSays: 'Insurer says in Rejection Letter',
        policySays: 'Your Policy Wordings State',
        medicalFact: 'Medical Fact from Hospital Discharge Summary',
        whyContestable: 'Why This Claim is Contestable'
      },
      appeal: {
        generateAppeal: 'Draft Grievance Appeal',
        ombudsmanComplaint: 'Draft Ombudsman Complaint',
        exportPdf: 'Download PDF',
        exportDocx: 'Download Word (.docx)',
        copied: 'Letter copied to clipboard!'
      },
      consent: {
        label: 'I understand my documents are processed by AI, automatically deleted after 24 hours, and this is general information, not legal advice.'
      }
    }
  },
  hi: {
    translation: {
      appName: 'ClaimFight',
      tagline: 'हेल्थ इंश्योरेंस क्लेम रिजेक्शन के खिलाफ कानूनी व IRDAI नियमों से अपील करें',
      disclaimerBanner: 'यह सामान्य जानकारी है, कानूनी सलाह नहीं। आधिकारिक स्रोतों पर नियमों की पुष्टि करें।',
      nav: {
        dashboard: 'डैशबोर्ड',
        newCase: 'नया केस',
        howItWorks: 'यह कैसे काम करता है',
        sampleCases: 'सैंपल केस',
        officialSources: 'आधिकारिक नियम',
        privacy: 'गोपनीयता',
        login: 'लॉग इन',
        register: 'साइन अप',
        logout: 'लॉग आउट'
      },
      hero: {
        badge: 'भारतीय परिवारों और IRDAI नियमों के लिए विशेष निर्मित',
        title: 'क्या आपका हेल्थ इंश्योरेंस क्लेम गलत तरीके से खारिज किया गया?',
        subtitle: 'रिजेक्शन लेटर, पॉलिसी दस्तावेज और डिस्चार्ज सारांश अपलोड करें। ClaimFight बीमा कंपनी के बयानों की तुलना पॉलिसी की शर्तों और IRDAI दिशानिर्देशों से करके अपील तैयार करता है।',
        ctaStart: 'मुफ़्त में क्लेम जांचें',
        ctaSample: 'लाइव सैंपल केस देखें',
        stats1: '₹20,000+ करोड़',
        stats1Desc: 'भारत में हर साल क्लेम कटौती',
        stats2: '4 समर्थित कारण',
        stats2Desc: 'वेटिंग पीरियड, पुरानी बीमारी, रूम रेंट, चिकित्सीय आवश्यकता',
        stats3: '24 घंटे में स्वतः डिलीट',
        stats3Desc: 'दस्तावेजों की पूर्ण गोपनीयता'
      },
      verdicts: {
        grounds_to_contest: 'चुनौती देने के ठोस आधार मिले',
        insurer_appears_correct: 'बीमाकर्ता का फैसला सही प्रतीत होता है',
        unclear: 'अस्पष्ट: अधिक जानकारी आवश्यक',
        not_supported: 'यह कारण वर्तमान में समर्थित नहीं है'
      },
      comparison: {
        insurerSays: 'बीमा कंपनी का रिजेक्शन पत्र में तर्क',
        policySays: 'आपकी पॉलिसी की वास्तविक शर्तें',
        medicalFact: 'अस्पताल के डिस्चार्ज सारांश से चिकित्सीय तथ्य',
        whyContestable: 'यह दावा चुनौती देने योग्य क्यों है'
      },
      appeal: {
        generateAppeal: 'शिकायत अपील तैयार करें',
        ombudsmanComplaint: 'बीमा लोकपाल शिकायत तैयार करें',
        exportPdf: 'PDF डाउनलोड करें',
        exportDocx: 'Word (.docx) डाउनलोड करें',
        copied: 'पत्र क्लिपबोर्ड पर कॉपी हो गया!'
      },
      consent: {
        label: 'मैं समझता/समझती हूँ कि मेरे दस्तावेज़ AI द्वारा संसाधित होते हैं, 24 घंटे बाद स्वतः हटा दिए जाते हैं, और यह कानूनी सलाह नहीं है।'
      }
    }
  },
  gu: {
    translation: {
      appName: 'ClaimFight',
      tagline: 'ખોટી રીતે નકારેલા હેલ્થ ઇન્શ્યોરન્સ ક્લેઇમ સામે અપીલ ડ્રાફ્ટ કરો',
      disclaimerBanner: 'આ સામાન્ય માહિતી છે, કાનૂની સલાહ નથી. અધિકૃત સ્રોતો પર નિયમો ચકાસો.',
      nav: {
        dashboard: 'ડેશબોર્ડ',
        newCase: 'નવો કેસ',
        howItWorks: 'કેવી રીતે કાર્ય કરે છે',
        sampleCases: 'નમૂના કેસ',
        officialSources: 'અધિકૃત નિયમો',
        privacy: 'ગોપનીયતા',
        login: 'લૉગ ઇન',
        register: 'સાઇન અપ',
        logout: 'લૉગ આઉટ'
      },
      hero: {
        badge: 'ભારતીય પરિવારો અને IRDAI નિયમો માટે તૈયાર',
        title: 'શું તમારો હેલ્થ ઇન્શ્યોરન્સ ક્લેઇમ ખોટી રીતે નકારવામાં આવ્યો?',
        subtitle: 'રિજેક્શન પત્ર, પોલિસી દસ્તાવેજ અને ડિસ્ચાર્જ સમરી અપલોડ કરો. ClaimFight ઇન્શ્યોરન્સ કંપનીના કારણોને નિયમો સાથે ચકાસીને અપીલ ડ્રાફ્ટ કરે છે.',
        ctaStart: 'ક્લેઇમ મફત તપાસો',
        ctaSample: 'સેમ્પલ કેસ જુઓ',
        stats1: '₹20,000+ કરોડ',
        stats1Desc: 'ભારતમાં વાર્ષિક અયોગ્ય કપાત',
        stats2: '4 માન્ય કારણો',
        stats2Desc: 'વેઇટિંગ પિરિયડ, જૂની બીમારી, રૂમ રેન્ટ, દાખલ થવાની જરૂરિયાત',
        stats3: '24 કલાકમાં ડિલીટ',
        stats3Desc: 'સંપૂર્ણ ડેટા ગોપનીયતા'
      },
      verdicts: {
        grounds_to_contest: 'પડકારવાના નક્કર આધાર મળ્યા',
        insurer_appears_correct: 'વીમા કંપનીનો નિર્ણય યોગ્ય લાગે છે',
        unclear: 'અસ્પષ્ટ: વધુ વિગત જરૂરી',
        not_supported: 'હાલમાં સમર્થિત નથી'
      },
      comparison: {
        insurerSays: 'રિજેક્શન પત્રમાં વીમા કંપનીનું કારણ',
        policySays: 'પોલિસી શરતો શું કહે છે',
        medicalFact: 'હોસ્પિટલ ડિસ્ચાર્જ સમરીની હકીકત',
        whyContestable: 'આ ક્લેઇમ કેમ પડકારી શકાય છે'
      },
      appeal: {
        generateAppeal: 'અપીલ ડ્રાફ્ટ કરો',
        ombudsmanComplaint: 'ઓમ્બડ્સમેન ફરિયાદ તૈયાર કરો',
        exportPdf: 'PDF ડાઉનલોડ કરો',
        exportDocx: 'Word ડાઉનલોડ કરો',
        copied: 'પત્ર કૉપિ થયો!'
      },
      consent: {
        label: 'હું સમજું છું કે મારા દસ્તાવેજો AI દ્વારા પ્રોસેસ થાય છે, 24 કલાકમાં ડિલીટ થશે, અને આ કાનૂની સલાહ નથી.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
