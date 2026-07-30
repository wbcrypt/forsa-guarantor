// Bilingual/trilingual labels for the Financial Assessment's closed-vocabulary
// fields. Kept separate from src/lib/i18n.ts's flat key->string dict (which
// covers static UI copy) because these are keyed by backend enum code, not
// by a translation key — a different shape, and a lot of entries.

type L = { en: string; fr: string; ar: string };
const L = (en: string, fr: string, ar: string): L => ({ en, fr, ar });

export const RELATIONSHIP_LABELS: Record<string, L> = {
  father: L('Father', 'Père', 'الأب'),
  mother: L('Mother', 'Mère', 'الأم'),
  spouse: L('Spouse', 'Époux/Épouse', 'الزوج/الزوجة'),
  sibling: L('Sibling', 'Frère/Sœur', 'الأخ/الأخت'),
  uncle_aunt: L('Uncle/Aunt', 'Oncle/Tante', 'العم/العمة أو الخال/الخالة'),
  grandparent: L('Grandparent', 'Grand-parent', 'الجد/الجدة'),
  legal_guardian: L('Legal guardian', 'Tuteur légal', 'الولي الشرعي'),
  other: L('Other', 'Autre', 'أخرى'),
};

export const GOVERNORATE_LABELS: Record<string, L> = {
  tunis: L('Tunis', 'Tunis', 'تونس'),
  ariana: L('Ariana', 'Ariana', 'أريانة'),
  ben_arous: L('Ben Arous', 'Ben Arous', 'بن عروس'),
  manouba: L('Manouba', 'Manouba', 'منوبة'),
  nabeul: L('Nabeul', 'Nabeul', 'نابل'),
  zaghouan: L('Zaghouan', 'Zaghouan', 'زغوان'),
  bizerte: L('Bizerte', 'Bizerte', 'بنزرت'),
  beja: L('Béja', 'Béja', 'باجة'),
  jendouba: L('Jendouba', 'Jendouba', 'جندوبة'),
  kef: L('Le Kef', 'Le Kef', 'الكاف'),
  siliana: L('Siliana', 'Siliana', 'سليانة'),
  sousse: L('Sousse', 'Sousse', 'سوسة'),
  monastir: L('Monastir', 'Monastir', 'المنستير'),
  mahdia: L('Mahdia', 'Mahdia', 'المهدية'),
  sfax: L('Sfax', 'Sfax', 'صفاقس'),
  kairouan: L('Kairouan', 'Kairouan', 'القيروان'),
  kasserine: L('Kasserine', 'Kasserine', 'القصرين'),
  sidi_bouzid: L('Sidi Bouzid', 'Sidi Bouzid', 'سيدي بوزيد'),
  gabes: L('Gabès', 'Gabès', 'قابس'),
  medenine: L('Médenine', 'Médenine', 'مدنين'),
  tataouine: L('Tataouine', 'Tataouine', 'تطاوين'),
  gafsa: L('Gafsa', 'Gafsa', 'قفصة'),
  tozeur: L('Tozeur', 'Tozeur', 'توزر'),
  kebili: L('Kébili', 'Kébili', 'قبلي'),
};

export const EMPLOYMENT_STATUS_LABELS: Record<string, L> = {
  employed_public: L('Public sector employee', 'Fonctionnaire (secteur public)', 'موظف في القطاع العام'),
  employed_private: L('Private sector employee', 'Salarié (secteur privé)', 'موظف في القطاع الخاص'),
  self_employed: L('Self-employed', 'Indépendant', 'عامل لحسابه الخاص'),
  business_owner: L('Business owner', "Chef d'entreprise", 'صاحب مؤسسة'),
  retired: L('Retired', 'Retraité', 'متقاعد'),
  unemployed: L('Unemployed', 'Sans emploi', 'بدون عمل'),
  other: L('Other', 'Autre', 'أخرى'),
};

export const EMPLOYMENT_TYPE_LABELS: Record<string, L> = {
  permanent: L('Permanent contract', 'CDI (contrat permanent)', 'عقد دائم'),
  temporary: L('Temporary contract', 'CDD (contrat temporaire)', 'عقد مؤقت'),
  seasonal: L('Seasonal work', 'Travail saisonnier', 'عمل موسمي'),
  freelance: L('Freelance', 'Freelance', 'عمل حر'),
  none: L('Not applicable', 'Non applicable', 'غير منطبق'),
};

export const ADDITIONAL_INCOME_TYPE_LABELS: Record<string, L> = {
  none: L('None', 'Aucun', 'لا يوجد'),
  rental: L('Rental income', 'Revenus locatifs', 'دخل من الكراء'),
  business: L('Business income', "Revenus d'entreprise", 'دخل من نشاط تجاري'),
  pension: L('Pension', 'Pension', 'معاش'),
  family_support: L('Family support', 'Aide familiale', 'دعم عائلي'),
  freelance: L('Freelance income', 'Revenus freelance', 'دخل من عمل حر'),
  other: L('Other', 'Autre', 'أخرى'),
};

export const CHECKLIST_LABELS: Record<string, L> = {
  original_cin: L('Original CIN', 'CIN original', 'بطاقة التعريف الوطنية الأصلية'),
  proof_of_employment: L('Proof of employment', "Justificatif d'emploi", 'إثبات العمل'),
  last_3_payslips: L('Last 3 payslips or proof of income', 'Les 3 dernières fiches de paie ou justificatif de revenus', 'آخر 3 كشوف رواتب أو إثبات دخل'),
  last_3_bank_statements: L('Last 3 bank statements', 'Les 3 derniers relevés bancaires', 'آخر 3 كشوف حساب بنكي'),
  loan_repayment_documents: L('Loan repayment documents (if applicable)', 'Documents de remboursement de prêt (le cas échéant)', 'وثائق تسديد القروض (إن وجدت)'),
  additional_documents: L('Any additional documents requested by FORSA', 'Tout document supplémentaire demandé par FORSA', 'أي وثائق إضافية تطلبها FORSA'),
};

export const BAND_LABELS: Record<string, L> = {
  excellent: L('Excellent', 'Excellent', 'ممتاز'),
  good: L('Good', 'Bon', 'جيد'),
  borderline: L('Borderline', 'Limite', 'حدّي'),
  high_risk: L('High Risk', 'Risque élevé', 'مخاطر مرتفعة'),
};

export function pickLabel(map: Record<string, L>, code: string | null | undefined, locale: 'en' | 'fr' | 'ar'): string {
  if (!code) return '—';
  return map[code]?.[locale] || code;
}
