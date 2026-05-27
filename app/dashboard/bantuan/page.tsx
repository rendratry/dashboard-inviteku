"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles, Image as ImageIcon, CheckCircle, CreditCard, Users, MessageSquare, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-cream-200 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold text-ink hover:text-lavender-500 transition-colors py-1 cursor-pointer"
      >
        <span className="text-sm sm:text-base pr-4">{question}</span>
        <span className={`transform transition-transform duration-300 text-lavender-400 shrink-0 text-xl font-medium leading-none`}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs sm:text-sm text-slate-soft mt-2 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BantuanPage() {
  const steps = [
    {
      icon: <Sparkles size={20} className="text-white" />,
      color: "from-[#ff9fb5] to-[#ffc2cf]",
      title: "1. Membuat Undangan (Gratis)",
      description: "Mulai dengan menu **Buat Undangan**. Di tahap ini Anda bisa membuat, mencoba, dan berganti-ganti desain template sesuka hati **secara GRATIS**. Temukan desain yang paling cocok untuk momen Anda sebelum memutuskan untuk mempublikasikan."
    },
    {
      icon: <ImageIcon size={20} className="text-white" />,
      color: "from-[#b297ff] to-[#d9c8ff]",
      title: "2. Unggah Media (Wajib)",
      description: "Sebelum mengatur halaman undangan, Anda wajib mengunggah foto-foto (prewedding, galeri) dan musik latar Anda ke menu **Galeri Aset**. File yang sudah terunggah di sini baru bisa dipilih di tahap selanjutnya."
    },
    {
      icon: <CheckCircle size={20} className="text-white" />,
      color: "from-[#6ee7b7] to-[#9af5db]",
      title: "3. Melengkapi Aset Undangan",
      description: "Setelah media siap, buka menu **Aset Undangan**. Lengkapi seluruh detail teks seperti Nama Mempelai, Info Akad, Resepsi, dan pilih foto/musik yang sudah Anda unggah di Galeri Aset sebelumnya."
    },
    {
      icon: <CreditCard size={20} className="text-white" />,
      color: "from-[#fcd34d] to-[#fde68a]",
      title: "4. Publikasi & Pembayaran",
      description: "Jika desain dan data sudah dirasa pas, Anda bisa mempublikasikan undangan melalui menu **Harga** atau tombol Minta Publikasi. **Perhatian:** Setelah melakukan pembayaran dan undangan di-publish, desain template sudah tidak bisa diganti lagi."
    },
    {
      icon: <Users size={20} className="text-white" />,
      color: "from-[#60a5fa] to-[#93c5fd]",
      title: "5. Manajemen Daftar Tamu",
      description: "Menu **Tamu** hanya bisa digunakan *setelah* undangan Anda berhasil di-publish. Di sini Anda bisa memasukkan nama-nama tamu dan sistem akan membuatkan *link* khusus lengkap dengan sapaan nama tamu untuk disebar via WhatsApp."
    },
    {
      icon: <MessageSquare size={20} className="text-white" />,
      color: "from-[#f472b6] to-[#fbcfe8]",
      title: "6. Pantau RSVP & Komentar",
      description: "Setelah undangan tersebar, pantau kehadiran dan ucapan doa dari para tamu Anda melalui menu **Komentar**. Anda bisa menyembunyikan komentar yang kurang pantas jika diperlukan."
    }
  ];

  const faqs = [
    {
      q: "Apakah saya benar-benar bisa mencoba membuat undangan secara gratis?",
      a: "Tentu saja! Anda bebas mencoba membuat undangan, mengisi data detail, mengunggah foto, dan berganti template undangan sepuasnya tanpa biaya apa pun (100% Gratis). Pembayaran hanya diperlukan ketika Anda siap mempublikasikan (publish) undangan Anda agar aktif secara online."
    },
    {
      q: "Berapa lama masa aktif undangan setelah dipublikasikan?",
      a: "Setelah undangan Anda resmi dipublikasikan dan pembayaran dikonfirmasi, undangan digital Anda akan aktif selama 1 tahun penuh."
    },
    {
      q: "Apakah saya bisa mengubah data undangan setelah dipublikasikan?",
      a: "Bisa! Anda tetap dapat merubah detail teks seperti info acara, lokasi, galeri foto, musik latar, serta mengelola daftar tamu kapan saja melalui dashboard, namun pilihan desain template tidak dapat diganti setelah undangan berhasil diterbitkan."
    },
    {
      q: "Apakah tamu undangan bisa mengisi ucapan doa dan RSVP?",
      a: "Ya, tamu Anda dapat mengisi konfirmasi kehadiran (RSVP) serta menuliskan ucapan doa restu yang akan langsung tampil di halaman undangan dan masuk ke menu Komentar di dashboard Anda secara real-time."
    },
    {
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Untuk saat ini kami mendukung pembayaran melalui Transfer Bank (manual). Konfirmasi pembayaran dilakukan setelah Anda mengirimkan bukti transfer kepada tim kami."
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}>
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink">Pusat Bantuan</h1>
          <p className="text-slate-soft">Panduan lengkap, FAQ, dan informasi kantor resmi Inviteku.</p>
        </div>
      </motion.div>

      {/* Main Flow Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-cream-200">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-ink mb-2">Alur Penggunaan Inviteku</h2>
            <p className="text-sm text-slate-soft">Ikuti 6 langkah mudah di bawah ini untuk membuat undangan digital impian Anda hingga siap disebar.</p>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-cream-200 before:via-lavender-200 before:to-cream-100">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Icon Marker */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-md bg-gradient-to-br ${step.color} text-white absolute left-0 md:left-1/2 -translate-x-0 md:-translate-x-1/2 shrink-0 z-10`}>
                  {step.icon}
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-16 md:ml-0 p-5 rounded-2xl bg-cream-50/50 border border-cream-100 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300">
                  <h3 className="font-bold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-soft leading-relaxed" dangerouslySetInnerHTML={{
                    __html: step.description.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-ink">$1</span>').replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FAQ & Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Accordions (Span 2) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle size={20} className="text-lavender-500" />
            <h2 className="text-xl font-bold text-ink">Pertanyaan Populer (FAQ)</h2>
          </div>
          <div className="divide-y divide-cream-100">
            {faqs.map((faq, idx) => (
              <FaqItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </motion.div>

        {/* Address Card (Span 1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-cream-200 flex flex-col justify-between gap-6"
        >
          <div className="space-y-4 text-sm text-ink-muted">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blush-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Alamat</p>
                  <p className="text-slate-soft text-xs mt-0.5 leading-relaxed">
                    Blabakan, Kec. Mejayan,<br />Kab. Madiun, 63153
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-blush-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Telepon / WhatsApp</p>
                  <p className="text-slate-soft text-xs mt-0.5">0851-7962-4972</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-lavender-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Jam Operasional</p>
                  <p className="text-slate-soft text-xs mt-0.5">
                    Senin - Sabtu: 08.00 - 17.00 WIB
                  </p>
                </div>
              </div>
            </div>

          {/* Premium Visual Mock Map */}
          <div className="relative h-44 rounded-2xl overflow-hidden border border-cream-200 bg-slate-100 flex items-center justify-center">
            {/* Styled Map Background Grid */}
            <div className="absolute inset-0 bg-gradient-to-tr from-lavender-100 via-cream-50 to-baby-100 opacity-80" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "radial-gradient(circle, #8b5cf6 1.2px, transparent 1.2px)",
              backgroundSize: "16px 16px"
            }} />
            
            {/* Visual pulsing indicator */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                <MapPin size={18} className="text-blush-500" />
              </div>
              <span className="text-[10px] font-bold text-ink mt-2 bg-white/95 backdrop-blur px-2.5 py-0.5 rounded-full border border-cream-200 shadow-sm font-sans tracking-wide">
                Mejayan, Madiun
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pt-4 space-y-3">
        <p className="text-sm text-slate-soft">Masih mengalami kendala? Hubungi tim support kami via WhatsApp.</p>
        <a
          href="https://wa.me/6285179624972"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)" }}
        >
          <MessageCircle size={18} />
          Chat WhatsApp — 0851-7962-4972
        </a>
      </motion.div>
    </div>
  );
}
