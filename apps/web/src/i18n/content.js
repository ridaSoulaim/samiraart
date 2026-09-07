import { useLang } from './LanguageProvider';
import { PIECES } from '@/data/site';

const imageBySlug = Object.fromEntries(PIECES.map((p) => [p.slug, p.image]));

/** Localized pieces (translated text) merged with their studio image by slug. */
export const usePieces = () => {
  const { t } = useLang();
  const localized = t('pieces');
  return localized.map((p) => ({ ...p, image: imageBySlug[p.slug] || p.image }));
};

/** Localized FAQ entries. */
export const useFaqs = () => {
  const { t } = useLang();
  return t('faqs');
};
