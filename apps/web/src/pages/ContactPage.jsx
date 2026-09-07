import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageProvider';
import { IMAGES, SITE } from '@/data/site';

const field =
  'h-12 w-full border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-accent';

const ContactPage = () => {
  const { t } = useLang();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const subjects = t('contact.subjects');
  const [form, setForm] = useState({ name: '', email: '', subject: subjects[0], message: '' });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 10) {
      toast({ title: t('contact.toastCheckTitle'), description: t('contact.toastCheckDesc'), variant: 'destructive' });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setForm({ name: '', email: '', subject: subjects[0], message: '' });
      toast({ title: t('contact.toastSentTitle'), description: t('contact.toastSentDesc') });
    }, 700);
  };

  return (
    <>
      <Helmet>
        <title>{t('contact.seoTitle')}</title>
        <meta name="description" content={t('contact.seoDesc')} />
        <link rel="canonical" href={`${SITE.url}/contact`} />
      </Helmet>

      <section className="mx-auto grid w-full max-w-[90rem] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="eyebrow text-accent">{t('contact.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] sm:text-6xl">
            {t('contact.title')}
          </h1>
          <p className="mt-6 max-w-prose text-[15px] leading-[1.9] text-muted-foreground">
            {t('contact.intro')}
          </p>

          <ul className="mt-10 space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <Mail size={17} strokeWidth={1.4} className="text-accent" />
              <a href={`mailto:${SITE.email}`} className="hover:text-accent">{SITE.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={17} strokeWidth={1.4} className="text-accent" />
              <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="hover:text-accent">{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={17} strokeWidth={1.4} className="text-accent" />
              {SITE.address}
            </li>
          </ul>

          <div className="mt-8 flex gap-5">
            {SITE.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="eyebrow border-b border-border pb-1 hover:border-accent hover:text-accent">
                {s.label}
              </a>
            ))}
          </div>

          <img src={IMAGES.studio} alt={t('contact.eyebrow')} className="mt-12 h-64 w-full object-cover" />
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={submit} className="border border-border bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl">{t('contact.sendTitle')}</h2>
            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="c-name" className="eyebrow text-muted-foreground">{t('contact.name')}</label>
                <input id="c-name" className={`${field} mt-2`} value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label htmlFor="c-email" className="eyebrow text-muted-foreground">{t('contact.email')}</label>
                <input id="c-email" type="email" className={`${field} mt-2`} value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label htmlFor="c-subject" className="eyebrow text-muted-foreground">{t('contact.subject')}</label>
                <select id="c-subject" className={`${field} mt-2`} value={form.subject} onChange={set('subject')}>
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="c-message" className="eyebrow text-muted-foreground">{t('contact.message')}</label>
                <textarea
                  id="c-message"
                  rows={6}
                  className="mt-2 w-full border border-border bg-background p-3 text-sm outline-none focus:border-accent"
                  value={form.message}
                  onChange={set('message')}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="flex min-h-[52px] items-center justify-center gap-2 bg-foreground text-[11px] uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent active:scale-[0.99] disabled:opacity-60"
              >
                {sending && <Loader2 size={16} className="animate-spin" />}
                {sending ? t('contact.sending') : t('contact.send')}
              </button>
              {sent && (
                <p className="text-sm text-accent">
                  {t('contact.sent')}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </section>
    </>
  );
};

export default ContactPage;
