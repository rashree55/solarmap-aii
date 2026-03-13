import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type Language = "en" | "hi" | "mr";

interface Translations {
  // Navbar
  "navbar.home": string;
  "navbar.features": string;
  "navbar.technology": string;
  "navbar.about": string;
  "navbar.signIn": string;
  "navbar.dashboard": string;
  "navbar.profile": string;
  "navbar.logout": string;

  // Hero
  "hero.badge": string;
  "hero.headline": string;
  "hero.headlineHighlight": string;
  "hero.description": string;
  "hero.ctaPrimary": string;
  "hero.ctaSecondary": string;
  "hero.suitabilityLabel": string;
  "hero.suitabilityValue": string;
  "hero.savingsLabel": string;
  "hero.savingsValue": string;
  "hero.savingsChange": string;
  "hero.dashboardTitle": string;
  "hero.scoreLabel": string;
  "hero.monthlyOutput": string;
  "hero.roiLabel": string;

  // Features
  "features.title": string;
  "features.subtitle": string;
  "features.aiAnalysis": string;
  "features.aiAnalysisDesc": string;
  "features.smartPanel": string;
  "features.smartPanelDesc": string;
  "features.energyForecasting": string;
  "features.energyForecastingDesc": string;
  "features.reports": string;
  "features.reportsDesc": string;

  // Problems
  "problems.title": string;
  "problems.subtitle": string;
  "problems.uncertain": string;
  "problems.uncertainDesc": string;
  "problems.complex": string;
  "problems.complexDesc": string;
  "problems.financial": string;
  "problems.financialDesc": string;
  "problems.climate": string;
  "problems.climateDesc": string;

  // Why Choose
  "why.title": string;
  "why.subtitle": string;
  "why.realData": string;
  "why.realDataDesc": string;
  "why.trends": string;
  "why.trendsDesc": string;
  "why.ml": string;
  "why.mlDesc": string;

  // How It Works
  "how.title": string;
  "how.subtitle": string;
  "how.step1": string;
  "how.step1Desc": string;
  "how.step2": string;
  "how.step2Desc": string;
  "how.step3": string;
  "how.step3Desc": string;

  // CTA
  "cta.title": string;
  "cta.subtitle": string;
  "cta.button": string;

  // Footer
  "footer.description": string;
  "footer.navigation": string;
  "footer.contact": string;
  "footer.copyright": string;

  // Profile
  "profile.title": string;
  "profile.subtitle": string;
  "profile.languagePreferences": string;
  "profile.languagePreferencesDesc": string;
  "profile.preferredLanguage": string;
  "profile.personalInfo": string;
  "profile.updateDetails": string;
  "profile.displayName": string;
  "profile.email": string;
  "profile.emailCannotChange": string;
  "profile.saveChanges": string;
  "profile.saving": string;
  "profile.accountDetails": string;
  "profile.username": string;
  "profile.phone": string;
  "profile.provider": string;
  "profile.memberSince": string;
  "profile.security": string;
  "profile.signOut": string;
  "profile.deleteAccount": string;
  "profile.deleteConfirmTitle": string;
  "profile.deleteConfirmDesc": string;
  "profile.cancel": string;
  "profile.deleting": string;

  // Dashboard
  "dashboard.newAnalysis": string;
  "dashboard.history": string;
  "dashboard.profile": string;
  "dashboard.home": string;
}

const translations: Record<Language, Translations> = {
  en: {
    "navbar.home": "Home",
    "navbar.features": "Features",
    "navbar.technology": "Technology",
    "navbar.about": "About",
    "navbar.signIn": "Sign In",
    "navbar.dashboard": "Dashboard",
    "navbar.profile": "Profile",
    "navbar.logout": "Logout",

    "hero.badge": "Powered by Advanced AI",
    "hero.headline": "AI-Driven Solar Intelligence for",
    "hero.headlineHighlight": "Smarter Energy Decisions",
    "hero.description": "Analyze any location's solar potential in seconds. Get AI-powered panel recommendations, energy production forecasts, and downloadable professional reports.",
    "hero.ctaPrimary": "Analyze My Solar Potential",
    "hero.ctaSecondary": "Get Started",
    "hero.suitabilityLabel": "Solar Suitability",
    "hero.suitabilityValue": "92% High Suitability",
    "hero.savingsLabel": "Estimated Savings",
    "hero.savingsValue": "₹1.8L per year",
    "hero.savingsChange": "+21% increase",
    "hero.dashboardTitle": "Solar Analysis Dashboard",
    "hero.scoreLabel": "Suitability Score",
    "hero.monthlyOutput": "Est. Monthly Output",
    "hero.roiLabel": "Estimated ROI",

    "features.title": "Intelligent Solar Analysis",
    "features.subtitle": "Everything you need to evaluate solar installations with confidence.",
    "features.aiAnalysis": "AI Solar Analysis",
    "features.aiAnalysisDesc": "Deep learning models assess your site's solar potential with satellite-level precision.",
    "features.smartPanel": "Smart Panel Matching",
    "features.smartPanelDesc": "AI recommends optimal panel configurations based on your site conditions and budget.",
    "features.energyForecasting": "Energy Forecasting",
    "features.energyForecastingDesc": "Predict monthly and annual energy production with weather-adjusted models.",
    "features.reports": "Professional Reports",
    "features.reportsDesc": "Download comprehensive PDF reports with visualizations and financial projections.",

    "problems.title": "Planning Solar Installation Is Complicated",
    "problems.subtitle": "Choosing the right solar setup requires understanding climate conditions, energy demand, roof constraints, and long-term financial impact. Most homeowners and businesses lack access to reliable solar analysis tools. SolarMap AI simplifies this process with intelligent, data-driven insights.",
    "problems.uncertain": "Uncertain Solar Potential",
    "problems.uncertainDesc": "It is difficult to estimate how much energy a location can generate.",
    "problems.complex": "Complex System Decisions",
    "problems.complexDesc": "Choosing the right solar panels and system size can be confusing.",
    "problems.financial": "Financial Uncertainty",
    "problems.financialDesc": "Estimating long-term savings and ROI is challenging.",
    "problems.climate": "Climate Variability",
    "problems.climateDesc": "Weather patterns and climate trends affect solar output.",

    "why.title": "Why Choose SolarMap AI?",
    "why.subtitle": "The only platform that analyzes climate change impact on your solar investment.",
    "why.realData": "Real Climate Data",
    "why.realDataDesc": "Powered by NASA POWER satellite data with more than 10 years of climate records for precise solar analysis.",
    "why.trends": "Climate Trends",
    "why.trendsDesc": "Compare long-term climate patterns with recent changes to understand evolving solar potential.",
    "why.ml": "ML-Powered Insights",
    "why.mlDesc": "Machine learning models trained on climate datasets generate accurate solar suitability predictions.",

    "how.title": "How It Works",
    "how.subtitle": "Three simple steps to solar clarity.",
    "how.step1": "Enter Site Details",
    "how.step1Desc": "Provide your location, roof specifications, and energy requirements.",
    "how.step2": "AI Analysis",
    "how.step2Desc": "SolarMap AI analyzes more than 10 years of NASA climate data and site conditions.",
    "how.step3": "Get Insights",
    "how.step3Desc": "Receive a complete solar feasibility report including energy production and savings estimates.",

    "cta.title": "Ready to Go Solar?",
    "cta.subtitle": "Join thousands making smarter, data-driven solar energy decisions.",
    "cta.button": "Start Free Analysis",

    "footer.description": "AI-powered solar analysis platform helping homeowners and businesses make smarter energy decisions.",
    "footer.navigation": "Navigation",
    "footer.contact": "Contact",
    "footer.copyright": "© 2026 SolarMap AI. All rights reserved.",

    "profile.title": "Profile",
    "profile.subtitle": "Manage your account settings",
    "profile.languagePreferences": "Language Preferences",
    "profile.languagePreferencesDesc": "Choose your preferred language for the interface",
    "profile.preferredLanguage": "Preferred Language",
    "profile.personalInfo": "Personal Information",
    "profile.updateDetails": "Update your profile details",
    "profile.displayName": "Display Name",
    "profile.email": "Email",
    "profile.emailCannotChange": "Email cannot be changed here",
    "profile.saveChanges": "Save Changes",
    "profile.saving": "Saving...",
    "profile.accountDetails": "Account Details",
    "profile.username": "Username",
    "profile.phone": "Phone Number",
    "profile.provider": "Provider",
    "profile.memberSince": "Member Since",
    "profile.security": "Security",
    "profile.signOut": "Sign Out",
    "profile.deleteAccount": "Delete Account",
    "profile.deleteConfirmTitle": "Delete Account",
    "profile.deleteConfirmDesc": "Are you sure you want to delete your account?\n\nThis action cannot be undone.",
    "profile.cancel": "Cancel",
    "profile.deleting": "Deleting...",

    "dashboard.newAnalysis": "New Analysis",
    "dashboard.history": "Analysis History",
    "dashboard.profile": "Profile",
    "dashboard.home": "Dashboard",
  },
  hi: {
    "navbar.home": "होम",
    "navbar.features": "सुविधाएं",
    "navbar.technology": "तकनीक",
    "navbar.about": "हमारे बारे में",
    "navbar.signIn": "साइन इन",
    "navbar.dashboard": "डैशबोर्ड",
    "navbar.profile": "प्रोफ़ाइल",
    "navbar.logout": "लॉगआउट",

    "hero.badge": "उन्नत AI द्वारा संचालित",
    "hero.headline": "AI-संचालित सौर बुद्धिमत्ता",
    "hero.headlineHighlight": "बेहतर ऊर्जा निर्णयों के लिए",
    "hero.description": "सेकंडों में किसी भी स्थान की सौर क्षमता का विश्लेषण करें। AI-संचालित पैनल सिफारिशें, ऊर्जा उत्पादन पूर्वानुमान और डाउनलोड करने योग्य पेशेवर रिपोर्ट प्राप्त करें।",
    "hero.ctaPrimary": "मेरी सौर क्षमता का विश्लेषण करें",
    "hero.ctaSecondary": "शुरू करें",
    "hero.suitabilityLabel": "सौर उपयुक्तता",
    "hero.suitabilityValue": "92% उच्च उपयुक्तता",
    "hero.savingsLabel": "अनुमानित बचत",
    "hero.savingsValue": "₹1.8L प्रति वर्ष",
    "hero.savingsChange": "+21% वृद्धि",
    "hero.dashboardTitle": "सौर विश्लेषण डैशबोर्ड",
    "hero.scoreLabel": "उपयुक्तता स्कोर",
    "hero.monthlyOutput": "अनु. मासिक उत्पादन",
    "hero.roiLabel": "अनुमानित ROI",

    "features.title": "बुद्धिमान सौर विश्लेषण",
    "features.subtitle": "आत्मविश्वास के साथ सौर स्थापना का मूल्यांकन करने के लिए सब कुछ।",
    "features.aiAnalysis": "AI सौर विश्लेषण",
    "features.aiAnalysisDesc": "डीप लर्निंग मॉडल आपकी साइट की सौर क्षमता का उपग्रह-स्तरीय सटीकता से आकलन करते हैं।",
    "features.smartPanel": "स्मार्ट पैनल मिलान",
    "features.smartPanelDesc": "AI आपकी साइट की स्थितियों और बजट के आधार पर इष्टतम पैनल कॉन्फ़िगरेशन की सिफारिश करता है।",
    "features.energyForecasting": "ऊर्जा पूर्वानुमान",
    "features.energyForecastingDesc": "मौसम-समायोजित मॉडल के साथ मासिक और वार्षिक ऊर्जा उत्पादन की भविष्यवाणी करें।",
    "features.reports": "पेशेवर रिपोर्ट",
    "features.reportsDesc": "विज़ुअलाइज़ेशन और वित्तीय अनुमानों के साथ व्यापक PDF रिपोर्ट डाउनलोड करें।",

    "problems.title": "सौर स्थापना की योजना बनाना जटिल है",
    "problems.subtitle": "सही सौर सेटअप चुनने के लिए जलवायु स्थितियों, ऊर्जा मांग, छत की बाधाओं और दीर्घकालिक वित्तीय प्रभाव को समझना आवश्यक है। SolarMap AI इस प्रक्रिया को बुद्धिमान, डेटा-संचालित अंतर्दृष्टि के साथ सरल बनाता है।",
    "problems.uncertain": "अनिश्चित सौर क्षमता",
    "problems.uncertainDesc": "यह अनुमान लगाना कठिन है कि कोई स्थान कितनी ऊर्जा उत्पन्न कर सकता है।",
    "problems.complex": "जटिल सिस्टम निर्णय",
    "problems.complexDesc": "सही सौर पैनल और सिस्टम आकार चुनना भ्रमित करने वाला हो सकता है।",
    "problems.financial": "वित्तीय अनिश्चितता",
    "problems.financialDesc": "दीर्घकालिक बचत और ROI का अनुमान लगाना चुनौतीपूर्ण है।",
    "problems.climate": "जलवायु परिवर्तनशीलता",
    "problems.climateDesc": "मौसम पैटर्न और जलवायु रुझान सौर उत्पादन को प्रभावित करते हैं।",

    "why.title": "SolarMap AI क्यों चुनें?",
    "why.subtitle": "एकमात्र प्लेटफ़ॉर्म जो आपके सौर निवेश पर जलवायु परिवर्तन के प्रभाव का विश्लेषण करता है।",
    "why.realData": "वास्तविक जलवायु डेटा",
    "why.realDataDesc": "सटीक सौर विश्लेषण के लिए 10 से अधिक वर्षों के जलवायु रिकॉर्ड के साथ NASA POWER उपग्रह डेटा द्वारा संचालित।",
    "why.trends": "जलवायु रुझान",
    "why.trendsDesc": "विकसित हो रही सौर क्षमता को समझने के लिए दीर्घकालिक जलवायु पैटर्न की तुलना करें।",
    "why.ml": "ML-संचालित अंतर्दृष्टि",
    "why.mlDesc": "जलवायु डेटासेट पर प्रशिक्षित मशीन लर्निंग मॉडल सटीक सौर उपयुक्तता भविष्यवाणियां उत्पन्न करते हैं।",

    "how.title": "यह कैसे काम करता है",
    "how.subtitle": "सौर स्पष्टता के लिए तीन सरल कदम।",
    "how.step1": "साइट विवरण दर्ज करें",
    "how.step1Desc": "अपना स्थान, छत विनिर्देश और ऊर्जा आवश्यकताएं प्रदान करें।",
    "how.step2": "AI विश्लेषण",
    "how.step2Desc": "SolarMap AI 10 से अधिक वर्षों के NASA जलवायु डेटा और साइट स्थितियों का विश्लेषण करता है।",
    "how.step3": "अंतर्दृष्टि प्राप्त करें",
    "how.step3Desc": "ऊर्जा उत्पादन और बचत अनुमान सहित एक पूर्ण सौर व्यवहार्यता रिपोर्ट प्राप्त करें।",

    "cta.title": "सौर ऊर्जा अपनाने के लिए तैयार?",
    "cta.subtitle": "हजारों लोगों से जुड़ें जो स्मार्ट, डेटा-संचालित सौर ऊर्जा निर्णय ले रहे हैं।",
    "cta.button": "मुफ्त विश्लेषण शुरू करें",

    "footer.description": "AI-संचालित सौर विश्लेषण प्लेटफ़ॉर्म जो घर मालिकों और व्यवसायों को बेहतर ऊर्जा निर्णय लेने में मदद करता है।",
    "footer.navigation": "नेविगेशन",
    "footer.contact": "संपर्क",
    "footer.copyright": "© 2026 SolarMap AI. सर्वाधिकार सुरक्षित।",

    "profile.title": "प्रोफ़ाइल",
    "profile.subtitle": "अपनी खाता सेटिंग्स प्रबंधित करें",
    "profile.languagePreferences": "भाषा प्राथमिकताएं",
    "profile.languagePreferencesDesc": "इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें",
    "profile.preferredLanguage": "पसंदीदा भाषा",
    "profile.personalInfo": "व्यक्तिगत जानकारी",
    "profile.updateDetails": "अपनी प्रोफ़ाइल विवरण अपडेट करें",
    "profile.displayName": "प्रदर्शन नाम",
    "profile.email": "ईमेल",
    "profile.emailCannotChange": "ईमेल यहाँ बदला नहीं जा सकता",
    "profile.saveChanges": "परिवर्तन सहेजें",
    "profile.saving": "सहेज रहे हैं...",
    "profile.accountDetails": "खाता विवरण",
    "profile.username": "उपयोगकर्ता नाम",
    "profile.phone": "फोन नंबर",
    "profile.provider": "प्रदाता",
    "profile.memberSince": "सदस्य तिथि",
    "profile.security": "सुरक्षा",
    "profile.signOut": "साइन आउट",
    "profile.deleteAccount": "खाता हटाएं",
    "profile.deleteConfirmTitle": "खाता हटाएं",
    "profile.deleteConfirmDesc": "क्या आप वाकई अपना खाता हटाना चाहते हैं?\n\nयह कार्रवाई पूर्ववत नहीं की जा सकती।",
    "profile.cancel": "रद्द करें",
    "profile.deleting": "हटा रहे हैं...",

    "dashboard.newAnalysis": "नया विश्लेषण",
    "dashboard.history": "विश्लेषण इतिहास",
    "dashboard.profile": "प्रोफ़ाइल",
    "dashboard.home": "डैशबोर्ड",
  },
  mr: {
    "navbar.home": "मुखपृष्ठ",
    "navbar.features": "वैशिष्ट्ये",
    "navbar.technology": "तंत्रज्ञान",
    "navbar.about": "आमच्याबद्दल",
    "navbar.signIn": "साइन इन",
    "navbar.dashboard": "डॅशबोर्ड",
    "navbar.profile": "प्रोफाइल",
    "navbar.logout": "लॉगआउट",

    "hero.badge": "प्रगत AI द्वारे समर्थित",
    "hero.headline": "AI-चालित सौर बुद्धिमत्ता",
    "hero.headlineHighlight": "चांगल्या ऊर्जा निर्णयांसाठी",
    "hero.description": "काही सेकंदांत कोणत्याही ठिकाणाच्या सौर क्षमतेचे विश्लेषण करा. AI-चालित पॅनेल शिफारसी, ऊर्जा उत्पादन अंदाज आणि डाउनलोड करण्यायोग्य व्यावसायिक अहवाल मिळवा.",
    "hero.ctaPrimary": "माझ्या सौर क्षमतेचे विश्लेषण करा",
    "hero.ctaSecondary": "सुरू करा",
    "hero.suitabilityLabel": "सौर योग्यता",
    "hero.suitabilityValue": "92% उच्च योग्यता",
    "hero.savingsLabel": "अंदाजित बचत",
    "hero.savingsValue": "₹1.8L प्रति वर्ष",
    "hero.savingsChange": "+21% वाढ",
    "hero.dashboardTitle": "सौर विश्लेषण डॅशबोर्ड",
    "hero.scoreLabel": "योग्यता स्कोअर",
    "hero.monthlyOutput": "अंदा. मासिक उत्पादन",
    "hero.roiLabel": "अंदाजित ROI",

    "features.title": "बुद्धिमान सौर विश्लेषण",
    "features.subtitle": "आत्मविश्वासाने सौर स्थापनेचे मूल्यांकन करण्यासाठी आवश्यक सर्वकाही.",
    "features.aiAnalysis": "AI सौर विश्लेषण",
    "features.aiAnalysisDesc": "डीप लर्निंग मॉडेल्स तुमच्या साइटच्या सौर क्षमतेचे उपग्रह-स्तरीय अचूकतेने मूल्यांकन करतात.",
    "features.smartPanel": "स्मार्ट पॅनेल जुळणी",
    "features.smartPanelDesc": "AI तुमच्या साइटच्या परिस्थिती आणि बजेटवर आधारित इष्टतम पॅनेल कॉन्फिगरेशनची शिफारस करते.",
    "features.energyForecasting": "ऊर्जा अंदाज",
    "features.energyForecastingDesc": "हवामान-समायोजित मॉडेल्ससह मासिक आणि वार्षिक ऊर्जा उत्पादनाचा अंदाज लावा.",
    "features.reports": "व्यावसायिक अहवाल",
    "features.reportsDesc": "व्हिज्युअलायझेशन आणि आर्थिक अंदाजांसह सर्वसमावेशक PDF अहवाल डाउनलोड करा.",

    "problems.title": "सौर स्थापनेचे नियोजन क्लिष्ट आहे",
    "problems.subtitle": "योग्य सौर सेटअप निवडण्यासाठी हवामान परिस्थिती, ऊर्जा मागणी, छताच्या मर्यादा आणि दीर्घकालीन आर्थिक प्रभाव समजून घेणे आवश्यक आहे. SolarMap AI ही प्रक्रिया बुद्धिमान, डेटा-चालित अंतर्दृष्टीने सोपी करते.",
    "problems.uncertain": "अनिश्चित सौर क्षमता",
    "problems.uncertainDesc": "एखादे ठिकाण किती ऊर्जा निर्माण करू शकते याचा अंदाज लावणे कठीण आहे.",
    "problems.complex": "जटिल प्रणाली निर्णय",
    "problems.complexDesc": "योग्य सौर पॅनेल आणि प्रणाली आकार निवडणे गोंधळात टाकणारे असू शकते.",
    "problems.financial": "आर्थिक अनिश्चितता",
    "problems.financialDesc": "दीर्घकालीन बचत आणि ROI चा अंदाज लावणे आव्हानात्मक आहे.",
    "problems.climate": "हवामान परिवर्तनशीलता",
    "problems.climateDesc": "हवामान नमुने आणि हवामान ट्रेंड सौर उत्पादनावर परिणाम करतात.",

    "why.title": "SolarMap AI का निवडावे?",
    "why.subtitle": "तुमच्या सौर गुंतवणुकीवर हवामान बदलाच्या प्रभावाचे विश्लेषण करणारे एकमेव व्यासपीठ.",
    "why.realData": "वास्तविक हवामान डेटा",
    "why.realDataDesc": "अचूक सौर विश्लेषणासाठी 10 वर्षांहून अधिक हवामान नोंदींसह NASA POWER उपग्रह डेटाद्वारे समर्थित.",
    "why.trends": "हवामान ट्रेंड",
    "why.trendsDesc": "विकसित होत असलेल्या सौर क्षमतेला समजून घेण्यासाठी दीर्घकालीन हवामान नमुन्यांची तुलना करा.",
    "why.ml": "ML-चालित अंतर्दृष्टी",
    "why.mlDesc": "हवामान डेटासेटवर प्रशिक्षित मशीन लर्निंग मॉडेल्स अचूक सौर योग्यता अंदाज तयार करतात.",

    "how.title": "हे कसे कार्य करते",
    "how.subtitle": "सौर स्पष्टतेसाठी तीन सोपी पायऱ्या.",
    "how.step1": "साइट तपशील प्रविष्ट करा",
    "how.step1Desc": "तुमचे स्थान, छताचे तपशील आणि ऊर्जा आवश्यकता प्रदान करा.",
    "how.step2": "AI विश्लेषण",
    "how.step2Desc": "SolarMap AI 10 वर्षांहून अधिक NASA हवामान डेटा आणि साइट परिस्थितीचे विश्लेषण करते.",
    "how.step3": "अंतर्दृष्टी मिळवा",
    "how.step3Desc": "ऊर्जा उत्पादन आणि बचत अंदाजांसह संपूर्ण सौर व्यवहार्यता अहवाल प्राप्त करा.",

    "cta.title": "सौर ऊर्जेसाठी तयार?",
    "cta.subtitle": "स्मार्ट, डेटा-चालित सौर ऊर्जा निर्णय घेणाऱ्या हजारोंमध्ये सामील व्हा.",
    "cta.button": "मोफत विश्लेषण सुरू करा",

    "footer.description": "AI-चालित सौर विश्लेषण व्यासपीठ जे घरमालक आणि व्यवसायांना चांगले ऊर्जा निर्णय घेण्यास मदत करते.",
    "footer.navigation": "नेविगेशन",
    "footer.contact": "संपर्क",
    "footer.copyright": "© 2026 SolarMap AI. सर्व हक्क राखीव.",

    "profile.title": "प्रोफाइल",
    "profile.subtitle": "तुमच्या खात्याच्या सेटिंग्ज व्यवस्थापित करा",
    "profile.languagePreferences": "भाषा प्राधान्ये",
    "profile.languagePreferencesDesc": "इंटरफेससाठी तुमची पसंतीची भाषा निवडा",
    "profile.preferredLanguage": "पसंतीची भाषा",
    "profile.personalInfo": "वैयक्तिक माहिती",
    "profile.updateDetails": "तुमचे प्रोफाइल तपशील अपडेट करा",
    "profile.displayName": "प्रदर्शन नाव",
    "profile.email": "ईमेल",
    "profile.emailCannotChange": "ईमेल येथे बदलता येत नाही",
    "profile.saveChanges": "बदल जतन करा",
    "profile.saving": "जतन करत आहे...",
    "profile.accountDetails": "खाते तपशील",
    "profile.username": "वापरकर्तानाव",
    "profile.phone": "फोन नंबर",
    "profile.provider": "प्रदाता",
    "profile.memberSince": "सदस्य तारीख",
    "profile.security": "सुरक्षा",
    "profile.signOut": "साइन आउट",
    "profile.deleteAccount": "खाते हटवा",
    "profile.deleteConfirmTitle": "खाते हटवा",
    "profile.deleteConfirmDesc": "तुम्हाला खात्री आहे की तुम्ही तुमचे खाते हटवू इच्छिता?\n\nही क्रिया पूर्ववत करता येत नाही.",
    "profile.cancel": "रद्द करा",
    "profile.deleting": "हटवत आहे...",

    "dashboard.newAnalysis": "नवीन विश्लेषण",
    "dashboard.history": "विश्लेषण इतिहास",
    "dashboard.profile": "प्रोफाइल",
    "dashboard.home": "डॅशबोर्ड",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

const STORAGE_KEY = "selected_language";

interface LanguageContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
  persistLanguageToProfile: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "hi" || stored === "mr") return stored;
  } catch {}
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  // Load language from profile on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("language_preference")
          .eq("id", session.user.id)
          .maybeSingle();
        if (data?.language_preference && ["en", "hi", "mr"].includes(data.language_preference)) {
          setLanguage(data.language_preference as Language);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [setLanguage]);

  const persistLanguageToProfile = useCallback(async (lang: Language) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ language_preference: lang }).eq("id", user.id);
    }
  }, []);

  const t = (key: string): string => {
    return (translations[language] as unknown as Record<string, string>)[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames, persistLanguageToProfile }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
