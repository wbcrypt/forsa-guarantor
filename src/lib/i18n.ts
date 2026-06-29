export type Locale = 'en' | 'fr' | 'ar'

export const LOCALES: { code: Locale; label: string; dir: 'ltr' | 'rtl'; flag: string }[] = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', dir: 'rtl', flag: '🇹🇳' },
]

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    home: 'Home', myApplication: 'My Application', documents: 'Documents',
    payments: 'Payments', notifications: 'Notifications', profile: 'Profile',
    signOut: 'Sign out', signIn: 'Sign in', register: 'Create account',
    // Auth
    welcomeBack: 'Welcome back', signInSubtitle: 'Sign in to your FORSA account',
    emailAddress: 'Email address', password: 'Password', forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?', haveAccount: 'Already have an account?',
    createAccount: 'Create your account', createAccountSubtitle: 'Start your financing journey with FORSA',
    firstName: 'First name', lastName: 'Last name', phone: 'Phone number',
    confirmPassword: 'Confirm password', agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
    // Application
    applyTitle: 'Apply for Financing', applySubtitle: 'Complete your application in a few steps',
    selectUniversity: 'Select your university', selectProgram: 'Select your program',
    tuitionAmount: 'Tuition amount', academicYear: 'Academic year',
    requestedAmount: 'Requested financing amount', submit: 'Submit application',
    // Status
    statusPending: 'Under Review', statusApproved: 'Approved', statusRejected: 'Bronze Member',
    statusDocs: 'Documents Required', statusNew: 'Received',
    // Documents
    uploadDocs: 'Upload Documents', uploadDocsSubtitle: 'Please upload the required documents',
    nationalId: 'National ID Card', bacDiploma: 'Bac Diploma',
    acceptanceLetter: 'University Acceptance Letter', incomeProof: 'Income Proof',
    upload: 'Upload', uploaded: 'Uploaded', verified: 'Verified', required: 'Required',
    // Payments
    paymentSchedule: 'Payment Schedule', installment: 'Installment',
    dueDate: 'Due date', amount: 'Amount', status: 'Status',
    paid: 'Paid', pending: 'Pending', late: 'Late',
    // Common
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', next: 'Next', back: 'Back',
    edit: 'Edit', close: 'Close', retry: 'Try again',
    noData: 'Nothing here yet',
    // Activation Meeting
    activationMeeting: 'Activation Meeting',
    activationMeetingDesc: 'Your application is pre-approved! The next step is an in-person Activation Meeting at FORSA.',
    bringDocuments: 'Documents to Bring',
    guarantorMustAttend: 'Your guarantor must attend the same meeting.',
    activationSteps: 'What happens at the meeting',
    meetingContact: 'To schedule your appointment, contact FORSA:',
    docStudentId: 'Original National ID Card (CIN)',
    docGuarantorId: "Guarantor's Original National ID Card",
    docEnrollment: 'University Admission / Enrollment Certificate',
    docTuitionInvoice: 'Official Tuition Invoice',
    docBankDetails: "Guarantor's Bank Account Details",
    docIncomeProof: 'Income Proof (latest 3 payslips or employer certificate)',
    notYetPreApproved: 'Not yet pre-approved',
    notYetPreApprovedDesc: 'The document checklist and activation meeting details will appear here once your application is pre-approved by FORSA.',
    // Payments
    paymentCenter: 'Payment Center',
    howToPay: 'How to Pay',
    bankTransfer: 'Bank Transfer',
    cashDeposit: 'Cash Deposit',
    bankTransferDesc: 'Transfer to the FORSA account using your unique reference',
    cashDepositDesc: 'Deposit cash at any branch of our partner bank',
    forsaBankName: 'Zitouna Bank',
    forsaBankAccount: 'TN59 2050 0000 0012 3456 7890',
    forsaBankRib: '20500000001234567890',
    paymentReference: 'Your Payment Reference',
    paymentReferenceDesc: 'Always include this reference in your bank transfer or deposit',
    uploadReceipt: 'Upload Payment Receipt',
    uploadReceiptDesc: 'After paying, upload your bank receipt or transfer confirmation',
    receiptFile: 'Receipt file (photo or PDF)',
    paymentDate: 'Payment date',
    paidAmount: 'Amount paid',
    bankName: 'Bank name',
    referenceNumber: 'Bank reference / transfer number',
    submitReceipt: 'Submit receipt',
    receiptSubmitted: 'Receipt submitted — FORSA will verify within 24 hours',
    installmentRef: 'Payment Reference',
    transferInstructions: 'Transfer Instructions',
    depositInstructions: 'Deposit Instructions',
    step: 'Step',
 errorTitle: 'Something went wrong',
    // Dashboard
    hello: 'Hello', yourApplication: 'Your application',
    documentsStatus: 'Documents', paymentsStatus: 'Payments',
    scoreLabel: 'FORSA Score', checkStatus: 'Check status',
    viewSchedule: 'View schedule', viewAll: 'View all', noApplicationYet: 'No application yet', applyToGetStarted: 'Apply for FORSA financing to get started', applyNow: 'Apply now',
    // Profile
    personalInfo: 'Personal Information', accountSettings: 'Account Settings',
    changePassword: 'Change Password', language: 'Language',
  },
  fr: {
    home: 'Accueil', myApplication: 'Mon dossier', documents: 'Documents',
    payments: 'Paiements', notifications: 'Notifications', profile: 'Profil',
    signOut: 'Déconnexion', signIn: 'Se connecter', register: 'Créer un compte',
    welcomeBack: 'Bon retour', signInSubtitle: 'Connectez-vous à votre compte FORSA',
    emailAddress: 'Adresse e-mail', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié ?',
    noAccount: "Pas encore de compte ?", haveAccount: 'Déjà un compte ?',
    createAccount: 'Créer votre compte', createAccountSubtitle: 'Commencez votre parcours de financement avec FORSA',
    firstName: 'Prénom', lastName: 'Nom', phone: 'Numéro de téléphone',
    confirmPassword: 'Confirmer le mot de passe', agreeTerms: "J'accepte les Conditions d'utilisation et la Politique de confidentialité",
    applyTitle: 'Demander un financement', applySubtitle: 'Complétez votre dossier en quelques étapes',
    selectUniversity: 'Sélectionnez votre université', selectProgram: 'Sélectionnez votre programme',
    tuitionAmount: 'Frais de scolarité', academicYear: 'Année universitaire',
    requestedAmount: 'Montant de financement demandé', submit: 'Soumettre le dossier',
    statusPending: "En cours d\'examen", statusApproved: 'Approuvé', statusRejected: 'Membre Bronze',
    statusDocs: 'Documents requis', statusNew: 'Reçu',
    uploadDocs: 'Télécharger les documents', uploadDocsSubtitle: 'Veuillez télécharger les documents requis',
    nationalId: "Carte d\'identité nationale", bacDiploma: 'Diplôme du Bac',
    acceptanceLetter: "Lettre d\'admission universitaire", incomeProof: 'Justificatif de revenus',
    upload: 'Télécharger', uploaded: 'Téléchargé', verified: 'Vérifié', required: 'Requis',
    paymentSchedule: 'Échéancier de paiement', installment: 'Versement',
    dueDate: "Date d\'échéance", amount: 'Montant', status: 'Statut',
    paid: 'Payé', pending: 'En attente', late: 'En retard',
    loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', next: 'Suivant', back: 'Retour',
    edit: 'Modifier', close: 'Fermer', retry: 'Réessayer',
    noData: "Rien ici pour l\'instant",
    // Activation Meeting
    activationMeeting: "Réunion d'Activation",
    activationMeetingDesc: "Votre demande est pré-approuvée ! La prochaine étape est une Réunion d'Activation en personne chez FORSA.',
    bringDocuments: 'Documents à apporter',
    guarantorMustAttend: 'Votre garant doit être présent à la même réunion.',
    activationSteps: 'Ce qui se passe lors de la réunion',
    meetingContact: 'Pour prendre rendez-vous, contactez FORSA :',
    docStudentId: "Carte d'identité nationale originale (CIN)",
    docGuarantorId: "Carte d'identité nationale originale du garant",
    docEnrollment: "Certificat d'admission / d'inscription universitaire",
    docTuitionInvoice: 'Facture officielle de scolarité',
    docBankDetails: 'Coordonnées bancaires du garant',
    docIncomeProof: 'Justificatifs de revenus (3 dernières fiches de paie ou attestation employeur)',
    notYetPreApproved: 'Pas encore pré-approuvé',
    notYetPreApprovedDesc: "La liste des documents et les détails de la réunion d'activation apparaîtront ici une fois votre demande pré-approuvée par FORSA.',
    // Payments
    paymentCenter: 'Centre de paiement',
    howToPay: 'Comment payer',
    bankTransfer: 'Virement bancaire',
    cashDeposit: 'Dépôt en espèces',
    bankTransferDesc: 'Virement vers le compte FORSA avec votre référence unique',
    cashDepositDesc: 'Dépôt en espèces dans toute agence de notre banque partenaire',
    forsaBankName: 'Banque Zitouna',
    forsaBankAccount: 'TN59 2050 0000 0012 3456 7890',
    forsaBankRib: '20500000001234567890',
    paymentReference: 'Votre référence de paiement',
    paymentReferenceDesc: 'Incluez toujours cette référence dans votre virement ou dépôt',
    uploadReceipt: 'Télécharger le reçu de paiement',
    uploadReceiptDesc: 'Après paiement, téléchargez votre reçu bancaire ou confirmation de virement',
    receiptFile: 'Fichier reçu (photo ou PDF)',
    paymentDate: 'Date de paiement',
    paidAmount: 'Montant payé',
    bankName: 'Nom de la banque',
    referenceNumber: 'Référence bancaire / numéro de virement',
    submitReceipt: 'Soumettre le reçu',
    receiptSubmitted: 'Reçu soumis — FORSA vérifiera dans les 24 heures',
    installmentRef: 'Référence de paiement',
    transferInstructions: 'Instructions de virement',
    depositInstructions: 'Instructions de dépôt',
    step: 'Étape',
 errorTitle: "Une erreur s\'est produite",
    hello: 'Bonjour', yourApplication: 'Votre dossier',
    documentsStatus: 'Documents', paymentsStatus: 'Paiements',
    scoreLabel: 'Score FORSA', checkStatus: 'Voir le statut',
    viewSchedule: "Voir l\'échéancier", viewAll: 'Tout voir', noApplicationYet: 'Pas encore de dossier', applyToGetStarted: 'Demandez un financement FORSA pour commencer', applyNow: 'Postuler maintenant',
    personalInfo: 'Informations personnelles', accountSettings: 'Paramètres du compte',
    changePassword: 'Changer le mot de passe', language: 'Langue',
  },
  ar: {
    home: 'الرئيسية', myApplication: 'ملفي', documents: 'الوثائق',
    payments: 'المدفوعات', notifications: 'الإشعارات', profile: 'الملف الشخصي',
    signOut: 'تسجيل الخروج', signIn: 'تسجيل الدخول', register: 'إنشاء حساب',
    welcomeBack: 'مرحباً بعودتك', signInSubtitle: 'سجّل الدخول إلى حساب FORSA الخاص بك',
    emailAddress: 'البريد الإلكتروني', password: 'كلمة المرور', forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب بالفعل؟',
    createAccount: 'إنشاء حسابك', createAccountSubtitle: 'ابدأ رحلة التمويل مع FORSA',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', phone: 'رقم الهاتف',
    confirmPassword: 'تأكيد كلمة المرور', agreeTerms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    applyTitle: 'التقدم بطلب تمويل', applySubtitle: 'أكمل طلبك في خطوات بسيطة',
    selectUniversity: 'اختر جامعتك', selectProgram: 'اختر برنامجك',
    tuitionAmount: 'رسوم الدراسة', academicYear: 'السنة الدراسية',
    requestedAmount: 'مبلغ التمويل المطلوب', submit: 'تقديم الطلب',
    statusPending: 'قيد المراجعة', statusApproved: 'مقبول', statusRejected: 'عضو برونزي',
    statusDocs: 'مطلوب وثائق', statusNew: 'مستلم',
    uploadDocs: 'رفع الوثائق', uploadDocsSubtitle: 'يرجى رفع الوثائق المطلوبة',
    nationalId: 'بطاقة الهوية الوطنية', bacDiploma: 'شهادة الباكالوريا',
    acceptanceLetter: 'رسالة قبول الجامعة', incomeProof: 'إثبات الدخل',
    upload: 'رفع', uploaded: 'تم الرفع', verified: 'تم التحقق', required: 'مطلوب',
    paymentSchedule: 'جدول الدفع', installment: 'قسط',
    dueDate: 'تاريخ الاستحقاق', amount: 'المبلغ', status: 'الحالة',
    paid: 'مدفوع', pending: 'معلق', late: 'متأخر',
    loading: 'جاري التحميل...', save: 'حفظ', cancel: 'إلغاء', next: 'التالي', back: 'رجوع',
    edit: 'تعديل', close: 'إغلاق', retry: 'إعادة المحاولة',
    noData: 'لا يوجد شيء هنا بعد',
    // Activation Meeting
    activationMeeting: 'اجتماع التفعيل',
    activationMeetingDesc: 'طلبك موافق عليه مبدئياً! الخطوة التالية هي اجتماع تفعيل حضوري في مقر FORSA.',
    bringDocuments: 'الوثائق التي يجب إحضارها',
    guarantorMustAttend: 'يجب أن يحضر ضامنك نفس الاجتماع.',
    activationSteps: 'ما يحدث في الاجتماع',
    meetingContact: 'لتحديد موعدك، تواصل مع FORSA:',
    docStudentId: 'بطاقة الهوية الوطنية الأصلية (CIN)',
    docGuarantorId: 'بطاقة الهوية الوطنية الأصلية للضامن',
    docEnrollment: 'شهادة القبول / التسجيل الجامعي',
    docTuitionInvoice: 'فاتورة الرسوم الدراسية الرسمية',
    docBankDetails: 'تفاصيل الحساب البنكي للضامن',
    docIncomeProof: 'إثبات الدخل (آخر 3 فيشات الأجر أو شهادة صاحب العمل)',
    notYetPreApproved: 'لم تتم الموافقة المبدئية بعد',
    notYetPreApprovedDesc: 'ستظهر قائمة الوثائق وتفاصيل اجتماع التفعيل هنا بعد الموافقة المبدئية على طلبك من FORSA.',
    // Payments
    paymentCenter: 'مركز الدفع',
    howToPay: 'كيفية الدفع',
    bankTransfer: 'تحويل بنكي',
    cashDeposit: 'إيداع نقدي',
    bankTransferDesc: 'حوّل إلى حساب FORSA باستخدام مرجعك الفريد',
    cashDepositDesc: 'أودع نقداً في أي فرع من فروع البنك الشريك',
    forsaBankName: 'بنك الزيتونة',
    forsaBankAccount: 'TN59 2050 0000 0012 3456 7890',
    forsaBankRib: '20500000001234567890',
    paymentReference: 'مرجع دفعك',
    paymentReferenceDesc: 'قم دائماً بتضمين هذا المرجع في تحويلك البنكي أو إيداعك',
    uploadReceipt: 'رفع إيصال الدفع',
    uploadReceiptDesc: 'بعد الدفع، ارفع إيصالك البنكي أو تأكيد التحويل',
    receiptFile: 'ملف الإيصال (صورة أو PDF)',
    paymentDate: 'تاريخ الدفع',
    paidAmount: 'المبلغ المدفوع',
    bankName: 'اسم البنك',
    referenceNumber: 'المرجع البنكي / رقم التحويل',
    submitReceipt: 'تقديم الإيصال',
    receiptSubmitted: 'تم تقديم الإيصال — ستتحقق FORSA خلال 24 ساعة',
    installmentRef: 'مرجع الدفع',
    transferInstructions: 'تعليمات التحويل',
    depositInstructions: 'تعليمات الإيداع',
    step: 'خطوة',
 errorTitle: 'حدث خطأ ما',
    hello: 'مرحباً', yourApplication: 'طلبك',
    documentsStatus: 'الوثائق', paymentsStatus: 'المدفوعات',
    scoreLabel: 'نقاط FORSA', checkStatus: 'تحقق من الحالة',
    viewSchedule: 'عرض الجدول', viewAll: 'عرض الكل', noApplicationYet: 'لا يوجد طلب بعد', applyToGetStarted: 'تقدم بطلب تمويل FORSA للبدء', applyNow: 'تقدم الآن',
    personalInfo: 'المعلومات الشخصية', accountSettings: 'إعدادات الحساب',
    changePassword: 'تغيير كلمة المرور', language: 'اللغة',
  },
}

function getSaved(): Locale {
  try { return (localStorage.getItem('forsa_student_locale') as Locale) || 'fr' } catch { return 'fr' }
}

let currentLocale: Locale = getSaved()

export function getLocale(): Locale { return currentLocale }

export function setLocale(locale: Locale) {
  currentLocale = locale
  try { localStorage.setItem('forsa_student_locale', locale) } catch {}
  const dir = LOCALES.find(l => l.code === locale)?.dir || 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', locale)
  window.dispatchEvent(new Event('localechange'))
}

export function t(key: string): string {
  return translations[currentLocale]?.[key] || translations['en']?.[key] || key
}

// Init
try {
  const saved = getSaved()
  const dir = LOCALES.find(l => l.code === saved)?.dir || 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', saved)
} catch {}
