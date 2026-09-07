// All copy is intentionally easy to replace — edit the strings below.

export const SITE = {
  name: 'Samira Art',
  domain: 'samiraart.shop',
  url: 'https://samiraart.shop',
  tagline: 'Hand-embroidered textiles and freshwater pearl bracelets, made one at a time in the studio.',
  email: 'studio@samiraart.shop',
  phone: '+212 5 24 00 00 00',
  address: 'Atelier 12, Rue des Oliviers, Marrakech',
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Pinterest', href: 'https://pinterest.com/' },
    { label: 'Behance', href: 'https://behance.net/' },
  ],
};

export const IMAGES = {
  hero: 'https://images.hostinger.com/456853d1-0f29-4e21-8928-fea4bd8f7c4c.png',
  artist: 'https://images.hostinger.com/32e3624f-fdc1-447a-bfc3-9bb1ea2a4a39.png',
  studio: 'https://images.hostinger.com/91c1fac9-d15f-4e43-a5c9-cd267d16e87e.png',
  texture: 'https://images.hostinger.com/1add59e6-bf1d-472b-a784-79188959d46b.png',
  flat: 'https://images.hostinger.com/505ae293-4621-4bc7-add5-8f474386471c.png',
  packing: 'https://images.hostinger.com/42f4d032-d813-4cbb-bc6d-ed5bb5da26a8.png',
};

export const PIECES = [
  {
    slug: 'ochre-threadwork',
    title: 'Ochre Threadwork',
    year: '2024',
    category: 'Embroideries',
    medium: 'Hand embroidery on ivory linen',
    dimensions: '30 × 40 cm',
    availability: 'Available',
    image: IMAGES.hero,
    alt: 'Hand-embroidered textile in warm ochre and ivory thread displayed in a sunlit studio',
    note: 'A horizon stitched at the hour when the light goes long and the heat drops out of the air — ochre thread laid slowly over ivory linen.',
  },
  {
    slug: 'saffron-stitch-study',
    title: 'Saffron Stitch Study No. 4',
    year: '2024',
    category: 'Embroideries',
    medium: 'Silk thread on cotton',
    dimensions: '18 × 24 cm',
    availability: 'Available',
    image: IMAGES.flat,
    alt: 'Small embroidered study in muted taupe and ivory thread photographed flat on linen',
    note: 'One of nine small studies stitched in a single week of unusually quiet mornings.',
  },
  {
    slug: 'pearl-field-bracelet',
    title: 'Pearl Field Bracelet',
    year: '2024',
    category: 'Pearl bracelets',
    medium: 'Freshwater pearls on silk thread',
    dimensions: '17 cm adjustable',
    availability: 'Available',
    image: IMAGES.texture,
    alt: 'Close view of a freshwater pearl bracelet with warm ivory and ochre-toned pearls',
    note: 'A graduated strand of freshwater pearls knotted by hand on silk, finished with an adjustable closure.',
  },
  {
    slug: 'terracotta-hoop',
    title: 'Terracotta Hoop',
    year: '2024',
    category: 'Embroideries',
    medium: 'Hand embroidery in a wooden hoop',
    dimensions: '20 cm hoop',
    availability: 'Made to order',
    image: IMAGES.studio,
    alt: 'Embroidered textile in a wooden hoop with terracotta and ivory thread on a studio table',
    note: 'Stitched within its hoop and left framed there — ready to hang as it is, no glass needed.',
  },
  {
    slug: 'studio-strand',
    title: 'Studio Strand',
    year: '2023',
    category: 'Pearl bracelets',
    medium: 'Freshwater pearls and sterling silver',
    dimensions: '16 cm',
    availability: 'Available',
    image: IMAGES.packing,
    alt: 'A freshwater pearl bracelet with sterling silver clasp resting on tissue paper',
    note: 'A single row of irregular baroque pearls, each chosen for its warmth, on a sterling silver clasp.',
  },
  {
    slug: 'morning-pearl-cuff',
    title: 'Morning Pearl Cuff',
    year: '2025',
    category: 'Pearl bracelets',
    medium: 'Freshwater pearls on wire',
    dimensions: '15 cm',
    availability: 'Available',
    image: IMAGES.flat,
    alt: 'A delicate freshwater pearl cuff bracelet laid flat on ivory linen',
    note: 'A soft cuff that wraps the wrist once — light enough to forget, warm enough to notice.',
  },
];

export const PIECE_CATEGORIES = ['All', 'Embroideries', 'Pearl bracelets'];

export const FAQS = [
  {
    q: 'How are pieces shipped?',
    a: 'Embroideries travel flat between acid-free tissue in a rigid sleeve, and pearl bracelets arrive in a small kraft gift box. Everything is insured for its full value. Orders leave the studio within 3–5 working days; Morocco 2–4 days, Europe 5–8 days, rest of world 8–14 days. Tracking is emailed the moment your parcel is collected.',
  },
  {
    q: 'What is your returns policy?',
    a: 'You may return a piece within 14 days of delivery in its original packaging for a full refund of the item price. Made-to-order embroideries are not returnable unless they arrive damaged. Email photographs within 48 hours of delivery and we will resolve it.',
  },
  {
    q: 'Do you take custom orders?',
    a: 'Yes, a small number each season. Custom embroideries begin with a conversation about size, palette and where the piece will live, followed by a thread sample and a 50% deposit. Typical delivery is 4–8 weeks. Bespoke pearl bracelets can be sized to your wrist on request.',
  },
  {
    q: 'How should I care for my embroidery?',
    a: 'Keep embroideries away from direct sunlight, radiators and damp walls. Dust gently with a dry, soft brush — never a wet cloth or solvent. Hoop pieces can be hung as they are; framed embroideries should sit behind glass with an acid-free mount. Handle pearls by their thread, not the clasp.',
  },
  {
    q: 'How do I care for pearl bracelets?',
    a: 'Put your bracelet on after perfume and cosmetics, and take it off before swimming or sleeping. Wipe the pearls with a soft, dry cloth after wear. Store them flat and separate from harder jewellery so the pearls are not scratched. With care, the silk thread should be re-knotted every year or two — the studio offers this service.',
  },
  {
    q: 'Can I see pieces in person?',
    a: 'Studio visits are welcome by appointment. Use the contact form to suggest a date and we will confirm a time.',
  },
  {
    q: 'Are the pearls real?',
    a: 'Yes — every bracelet uses genuine cultured freshwater pearls, chosen by hand for warmth and lustre. Each piece arrives with a small card noting the pearl type and care.',
  },
];
