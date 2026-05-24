"use client";

import { motion } from "framer-motion";
import { HelpCircle, Sparkles, Image as ImageIcon, CheckCircle, CreditCard, Users, MessageSquare } from "lucide-react";

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
          <p className="text-slate-soft">Panduan langkah demi langkah menggunakan Inviteku.</p>
        </div>
      </motion.div>

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
                transition={{ delay: 0.15 + idx * 0.1 }}
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
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-sm text-slate-soft">
        Masih mengalami kendala? Hubungi tim support kami via WhatsApp.
      </motion.div>
    </div>
  );
}
