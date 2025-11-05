import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      brandSub: 'Bibliothèque des PFE',
      searchPlaceholder: 'Rechercher un sujet, auteur ou mot-clé...',
      pfeTitle: 'PFE Books',
      pfeSub: 'Tous les PDFs trouvés dans {{path}}',
      loading: 'Chargement…',
      noFiles: 'Aucun fichier PDF trouvé dans {{path}}.',
      filesCount: '{{count}} fichier(s)',
      filteredBy: 'Filtré par "{{query}}"',
      open: 'Ouvrir',
      download: 'Télécharger',
      close: 'Fermer',
      manifestHint: 'Pour générer automatiquement le fichier manifest, exécutez :',
      openNewTab: 'Ouvrir dans un nouvel onglet',
      modalFallback: 'Impossible d\'afficher le PDF dans la popup sur cet appareil. Ouvrez le PDF dans un nouvel onglet :',
      retryWeather: 'Réessayer la météo'
      ,
      profile: 'Profil utilisateur',
      profileMenuProfile: 'Mon profil',
      profileMenuSettings: 'Paramètres',
      profileMenuLogout: 'Se déconnecter',
      signIn: 'Se connecter'
      ,
      profileName: 'Mohamed Aziz Ben Ismail',
      profileTagline: '"Sharing is caring"',
      profileDesc1: "Je suis ingénieur en informatique, spécialisé dans le développement Web2 et Web3, ainsi que formateur agréé en Web2 et Web3 par l'État Tunisien. Avec 3 ans d'expérience, j'accompagne des équipes et des apprenants dans la conception d'applications modernes, sécurisées et évolutives.",
      profileDesc2: "Ma vision : démocratiser l'accès aux compétences numériques, tirer parti des technologies Web3 quand elles apportent de la valeur, et promouvoir l'open source comme moteur d'innovation et de partage.",
      socialGitHub: 'GitHub',
      socialLinkedIn: 'LinkedIn',
      socialInstagram: 'Instagram',
      socialFacebook: 'Facebook',
      socialYouTube: 'YouTube',
      socialEmail: 'Email',
      profileImageAlt: 'Photo de Mohamed Aziz Ben Ismail'
    }
  },
  en: {
    translation: {
      brandSub: 'PFE Library',
      searchPlaceholder: 'Search by topic, author or keyword...',
      pfeTitle: 'PFE Books',
      pfeSub: 'All PDFs found in {{path}}',
      loading: 'Loading…',
      noFiles: 'No PDF files found in {{path}}.',
      filesCount: '{{count}} file(s)',
      filteredBy: 'Filtered by "{{query}}"',
      open: 'Open',
      download: 'Download',
      close: 'Close',
      manifestHint: 'To auto-generate the manifest file, run:',
      openNewTab: 'Open in new tab',
      modalFallback: 'Unable to preview the PDF in the popup on this device. Open the PDF in a new tab:',
      retryWeather: 'Retry weather'
      ,
      profile: 'User profile',
      profileMenuProfile: 'My profile',
      profileMenuSettings: 'Settings',
      profileMenuLogout: 'Sign out',
      signIn: 'Sign in'
      ,
      profileName: 'Mohamed Aziz Ben Ismail',
      profileTagline: '"Sharing is caring"',
      profileDesc1: "I am a software engineer specialized in Web2 and Web3 development, and a certified trainer in Web2/Web3 by the Tunisian state. With 3 years of experience I support teams and learners in designing modern, secure and scalable applications.",
      profileDesc2: "My vision: democratize access to digital skills, leverage Web3 where it brings value, and promote open source as a driver for innovation and sharing.",
      socialGitHub: 'GitHub',
      socialLinkedIn: 'LinkedIn',
      socialInstagram: 'Instagram',
      socialFacebook: 'Facebook',
      socialYouTube: 'YouTube',
      socialEmail: 'Email',
      profileImageAlt: 'Photo of Mohamed Aziz Ben Ismail'
    }
  },
  ar: {
    translation: {
      brandSub: 'مكتبة مذكرات التخرج',
      searchPlaceholder: 'ابحث حسب الموضوع، المؤلف أو كلمة مفتاحية...',
      pfeTitle: 'كتب PFE',
      pfeSub: 'كل ملفات PDF الموجودة في {{path}}',
      loading: 'جارٍ التحميل…',
      noFiles: 'لا توجد ملفات PDF في {{path}}.',
      filesCount: '{{count}} ملف(ملفات)',
      filteredBy: 'مفلتر بواسطة "{{query}}"',
      open: 'فتح',
      download: 'تنزيل',
      close: 'إغلاق',
      manifestHint: 'لتوليد ملف الـ manifest تلقائياً، نفّذ:',
      openNewTab: 'افتح في لسان جديد',
      modalFallback: 'لا يمكن عرض الملف داخل النافذة على هذا الجهاز. افتح الملف في لسان جديد:',
      retryWeather: 'إعادة محاولة الطقس'
      ,
      profile: 'الملف الشخصي',
      profileMenuProfile: 'ملفي الشخصي',
      profileMenuSettings: 'الإعدادات',
      profileMenuLogout: 'تسجيل الخروج',
      signIn: 'تسجيل الدخول'
      ,
      profileName: 'محمد عزيز بن إسماعيل',
      profileTagline: '"المشاركة تعني الاهتمام"',
      profileDesc1: 'أنا مهندس برمجيات متخصص في تطوير الويب Web2 و Web3، ومدرب معتمد في Web2 و Web3 من قبل الدولة التونسية. مع خبرة 3 سنوات، أرافق الفرق والمتعلمين في تصميم تطبيقات حديثة وآمنة وقابلة للتوسع.',
      profileDesc2: 'رؤيتي: ديمقراطية الوصول إلى المهارات الرقمية، الاستفادة من تقنيات Web3 عندما تضيف قيمة، والترويج لمصدر المفتوح كمحرك للابتكار والمشاركة.',
      socialGitHub: 'GitHub',
      socialLinkedIn: 'LinkedIn',
      socialInstagram: 'Instagram',
      socialFacebook: 'Facebook',
      socialYouTube: 'YouTube',
      socialEmail: 'البريد الإلكتروني',
      profileImageAlt: 'صورة محمد عزيز بن إسماعيل'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || navigator.language.split('-')[0] || 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });

export default i18n;
