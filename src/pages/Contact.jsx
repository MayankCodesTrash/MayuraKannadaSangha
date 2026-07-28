import { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import Layout from '../components/Layout.jsx';
import { EMAILJS_CONFIG, isEmailjsConfigured } from '../emailjs.js';
import './Contact.css';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isEmailjsConfigured()) {
      setStatus('unavailable');
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        { from_name: form.name, from_email: form.email, message: form.message },
        EMAILJS_CONFIG.publicKey
      );
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <Layout>
      <section className="contact-page">
        <div className="contact-page__inner">
          <motion.h1
            className="contact-page__heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            Get in Touch
          </motion.h1>
          <p className="contact-page__subheading">
            Have a question or want to get involved? Send us a message.
          </p>

          <motion.form
            className="contact-page__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />

            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />

            <label htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              rows={5}
              required
            />

            <button type="submit" className="contact-page__submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>

            {status === 'sent' && (
              <p className="contact-page__status contact-page__status--success">
                Thanks! Your message has been sent.
              </p>
            )}
            {status === 'error' && (
              <p className="contact-page__status contact-page__status--error">
                Something went wrong. Please try again later.
              </p>
            )}
            {status === 'unavailable' && (
              <p className="contact-page__status">
                The contact form isn&apos;t connected yet — please email us directly at{' '}
                <a href="mailto:mksdsm2024@gmail.com">mksdsm2024@gmail.com</a>.
              </p>
            )}
          </motion.form>
        </div>
      </section>
    </Layout>
  );
}

export default Contact;
