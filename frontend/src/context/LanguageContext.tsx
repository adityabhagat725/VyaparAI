import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface Translations {
  appName: string;
  tagline: string;
  demoMode: string;
  resetDemo: string;
  pendingApprovals: string;
  urgentAttention: string;
  criticalStock: string;
  overdueDues: string;
  gstDeadline: string;
  quickScenarios: string;
  tabs: {
    dashboard: string;
    whatsapp: string;
    assistant: string;
    inventory: string;
    suppliers: string;
    payments: string;
    compliance: string;
    schemes: string;
    approvals: string;
    activity: string;
    audit: string;
    settings: string;
  };
  scenarios: {
    stock: string;
    stockPrompt: string;
    orderStock: string;
    orderStockPrompt: string;
    payments: string;
    paymentsPrompt: string;
    gst: string;
    gstPrompt: string;
    schemes: string;
    schemesPrompt: string;
    expense: string;
    expensePrompt: string;
    insights: string;
    insightsPrompt: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'VyaparAI',
    tagline: 'Autonomous AI Back Office',
    demoMode: 'DEMO MODE — Active Surveillance',
    resetDemo: 'Reset Demo',
    pendingApprovals: 'Actions Awaiting Review',
    urgentAttention: 'Urgent — Needs Immediate Attention',
    criticalStock: 'Cooking Oil & Rice Low',
    overdueDues: 'Supplier Dues Pending',
    gstDeadline: 'GSTR-3B Due in 5 Days',
    quickScenarios: '1-Click Demo Scenarios:',
    tabs: {
      dashboard: 'Dashboard',
      whatsapp: 'WhatsApp Simulator',
      assistant: 'AI Assistant',
      inventory: 'Inventory & Stock',
      suppliers: 'Suppliers',
      payments: 'Payments & Invoices',
      compliance: 'GST & Compliance',
      schemes: 'Govt Schemes',
      approvals: 'Approvals (HITL)',
      activity: 'Agent Activity',
      audit: 'Audit Logs',
      settings: 'Settings',
    },
    scenarios: {
      stock: '1. Check Stock (Rice)',
      stockPrompt: 'Rice kitna bacha hai?',
      orderStock: 'Order Stock',
      orderStockPrompt: 'Order the rice',
      payments: '2. Supplier Dues',
      paymentsPrompt: 'Check supplier payments',
      gst: '3. GST Compliance',
      gstPrompt: 'What compliance tasks are pending?',
      schemes: '4. MSME Schemes',
      schemesPrompt: 'Find schemes for my business',
      expense: '5. Quick Expense',
      expensePrompt: 'Petrol 500 for delivery tempo',
      insights: '6. Business Health',
      insightsPrompt: 'How is my business doing?',
    },
  },
  hi: {
    appName: 'व्यापार AI',
    tagline: 'स्वायत्त AI बैक ऑफिस',
    demoMode: 'डेमो मोड — सक्रिय निगरानी',
    resetDemo: 'डेमो रीसेट करें',
    pendingApprovals: 'कार्य स्वीकृति की प्रतीक्षा में',
    urgentAttention: 'अति आवश्यक — तुरंत ध्यान दें',
    criticalStock: 'कुकिंग ऑयल व चावल कम है',
    overdueDues: 'सप्लायर का बकाया लंबित',
    gstDeadline: 'GSTR-3B 5 दिनों में देय है',
    quickScenarios: '1-क्लिक डेमो परिदृश्य:',
    tabs: {
      dashboard: 'डैशबोर्ड',
      whatsapp: 'व्हाट्सएप सिम्युलेटर',
      assistant: 'AI सहायक',
      inventory: 'इन्वेंट्री व स्टॉक',
      suppliers: 'सप्लायर्स',
      payments: 'भुगतान व बिल',
      compliance: 'जीएसटी अनुपालन',
      schemes: 'सरकारी योजनाएं',
      approvals: 'स्वीकृति केंद्र (HITL)',
      activity: 'एजेंट गतिविधि',
      audit: 'ऑडिट लॉग्स',
      settings: 'सेटिंग्स',
    },
    scenarios: {
      stock: '1. स्टॉक जांचें (चावल)',
      stockPrompt: 'चावल कितना बचा है?',
      orderStock: 'स्टॉक मंगाएं',
      orderStockPrompt: 'चावल का आर्डर तैयार करो',
      payments: '2. सप्लायर बकाया',
      paymentsPrompt: 'सप्लायर का भुगतान चेक करो',
      gst: '3. जीएसटी स्थिति',
      gstPrompt: 'जीएसटी का कौन सा काम पेंडिंग है?',
      schemes: '4. एमएसएमई योजनाएं',
      schemesPrompt: 'मेरे व्यापार के लिए सरकारी योजनाएं बताओ',
      expense: '5. तुरंत खर्चा दर्ज करें',
      expensePrompt: 'पेट्रोल 500 डिलीवरी टेम्पो के लिए',
      insights: '6. व्यापार समीक्षा',
      insightsPrompt: 'मेरा व्यापार कैसा चल रहा है?',
    },
  },
  mr: {
    appName: 'व्यापार AI',
    tagline: 'स्वायत्त AI बॅक ऑफिस',
    demoMode: 'डेमो मोड — सक्रिय पाळत',
    resetDemo: 'डेमो रीसेट करा',
    pendingApprovals: 'मंजुरी प्रलंबित कृती',
    urgentAttention: 'तातडीचे — लगेच लक्ष द्या',
    criticalStock: 'खाद्यतेल आणि तांदूळ कमी आहे',
    overdueDues: 'सप्लायरची देयके बाकी',
    gstDeadline: 'GSTR-3B ५ दिवसांत भरायचे आहे',
    quickScenarios: '१-क्लिक डेमो परिस्थिती:',
    tabs: {
      dashboard: 'डॅशबोर्ड',
      whatsapp: 'व्हॉट्सॲप सिम्युलेटर',
      assistant: 'AI सहाय्यक',
      inventory: 'साठा व इन्व्हेंटरी',
      suppliers: 'पुरवठादार (सप्लायर्स)',
      payments: 'देयके व बिले',
      compliance: 'जीएसटी पूर्तता',
      schemes: 'शासकीय योजना',
      approvals: 'मंजुरी केंद्र (HITL)',
      activity: 'एजंट हालचाली',
      audit: 'ऑडिट लॉग्स',
      settings: 'सेटिंग्ज',
    },
    scenarios: {
      stock: '१. साठा तपासा (तांदूळ)',
      stockPrompt: 'तांदूळ किती शिल्लक आहे?',
      orderStock: 'माल मागवा',
      orderStockPrompt: 'तांदळाची ऑर्डर तयार करा',
      payments: '२. सप्लायर थकबाकी',
      paymentsPrompt: 'सप्लायर्सचे पेमेंट तपासा',
      gst: '३. जीएसटी कामे',
      gstPrompt: 'जीएसटीची कोणती कामे बाकी आहेत?',
      schemes: '४. शासकीय योजना',
      schemesPrompt: 'माझ्या दुकानासाठी सरकारी योजना सांगा',
      expense: '५. खर्च नोंदवा',
      expensePrompt: 'पेट्रोल ५०० टेम्पोसाठी',
      insights: '६. व्यवसायाचा आढावा',
      insightsPrompt: 'माझा व्यवसाय कसा चालू आहे?',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vyaparai_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vyaparai_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
