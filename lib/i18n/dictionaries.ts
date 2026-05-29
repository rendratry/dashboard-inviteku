import { useLanguageStore } from "../store";

// Common UI elements
const commonID = {
  loading: "Memuat...",
  save: "Simpan",
  saving: "Menyimpan...",
  cancel: "Batal",
  close: "Tutup",
  edit: "Edit",
  delete: "Hapus",
  success: "Berhasil",
  error: "Terjadi kesalahan",
  search: "Cari...",
  overview: "Ringkasan",
  navigation: "Navigasi",
  logout: "Keluar",
};

const commonEN = {
  loading: "Loading...",
  save: "Save",
  saving: "Saving...",
  cancel: "Cancel",
  close: "Close",
  edit: "Edit",
  delete: "Delete",
  success: "Success",
  error: "An error occurred",
  search: "Search...",
  overview: "Overview",
  navigation: "Navigation",
  logout: "Log Out",
};

// Topbar & Sidebar
const navID = {
  dashboard: "Ringkasan",
  createInvitation: "Buat Undangan",
  pricing: "Harga",
  guests: "Tamu",
  invitationAssets: "Aset Undangan",
  assetsLibrary: "Galeri Aset",
  comments: "Komentar",
  profile: "Profil",
  help: "Bantuan",
};

const navEN = {
  dashboard: "Overview",
  createInvitation: "Create Invitation",
  pricing: "Pricing",
  guests: "Guests",
  invitationAssets: "Invitation Assets",
  assetsLibrary: "Assets Library",
  comments: "Comments",
  profile: "Profile",
  help: "Help",
};

// Login & Register
const authID = {
  loginTitle: "Masuk ke Inviteku",
  loginSubtitle: "Selamat datang kembali! Silakan masuk ke akun Anda.",
  emailLabel: "Email atau Username",
  emailPlaceholder: "Masukkan email atau username",
  passwordLabel: "Kata Sandi",
  passwordPlaceholder: "Masukkan kata sandi",
  loginButton: "Masuk",
  loggingIn: "Sedang masuk...",
  noAccount: "Belum punya akun?",
  registerLink: "Daftar di sini",

  registerTitle: "Daftar Akun Baru",
  registerSubtitle: "Bergabunglah dengan Inviteku dan buat undangan digital Anda.",
  nameLabel: "Nama Lengkap",
  namePlaceholder: "Masukkan nama lengkap",
  usernameLabel: "Username",
  usernamePlaceholder: "Masukkan username",
  emailRegisterLabel: "Email",
  emailRegisterPlaceholder: "Masukkan email aktif Anda",
  registerButton: "Daftar",
  registering: "Mendaftar...",
  hasAccount: "Sudah punya akun?",
  loginLink: "Masuk di sini",
};

const authEN = {
  loginTitle: "Sign In to Inviteku",
  loginSubtitle: "Welcome back! Please sign in to your account.",
  emailLabel: "Email or Username",
  emailPlaceholder: "Enter your email or username",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  loginButton: "Sign In",
  loggingIn: "Signing in...",
  noAccount: "Don't have an account?",
  registerLink: "Sign up here",

  registerTitle: "Create an Account",
  registerSubtitle: "Join Inviteku and create your digital invitations.",
  nameLabel: "Full Name",
  namePlaceholder: "Enter your full name",
  usernameLabel: "Username",
  usernamePlaceholder: "Enter your username",
  emailRegisterLabel: "Email",
  emailRegisterPlaceholder: "Enter your active email address",
  registerButton: "Sign Up",
  registering: "Signing up...",
  hasAccount: "Already have an account?",
  loginLink: "Sign in here",
};

// Overview / Dashboard Home
const dashboardID = {
  welcome: "Selamat Datang,",
  welcomeSub: "Kelola undangan digital Anda dengan mudah.",
  activeInvitations: "Undangan Aktif",
  totalGuests: "Total Tamu",
  totalComments: "Total Komentar",
  recentActivity: "Aktivitas Terbaru",
  noActivity: "Belum ada aktivitas.",
};

const dashboardEN = {
  welcome: "Welcome,",
  welcomeSub: "Manage your digital invitations effortlessly.",
  activeInvitations: "Active Invitations",
  totalGuests: "Total Guests",
  totalComments: "Total Comments",
  recentActivity: "Recent Activity",
  noActivity: "No activity yet.",
};

// Undangan Page
const undanganID = {
  title: "Buat Undangan",
  subtitle: "Kelola dan buat undangan digital baru untuk momen spesial Anda. Anda bisa mencoba semua template secara gratis, pembayaran hanya dilakukan ketika ingin mem-publish undangan.",
  newInvitation: "Mulai Undangan Baru",
  step1: "1. Nama Pasangan",
  step1Sub: "Nama yang akan menjadi judul utama undangan digital Anda.",
  namePlaceholder: 'Contoh: "Romeo & Juliet"',
  step2: "2. Desain Template",
  step2Sub: "Pilih visual yang sesuai dengan tema pernikahan Anda.",
  selectTemplateBtn: "Klik untuk pilih template",
  changeTemplate: "Ganti",
  createBtn: "Buat Undangan Sekarang",
  creatingBtn: "Memproses...",
  
  yourInvitations: "Undangan Anda",
  noInvitationsTitle: "Belum Ada Undangan",
  noInvitationsSub: "Anda belum membuat undangan digital. Mulai dengan mengisi formulir di atas untuk membuat undangan pertama Anda!",
  
  viewInvitation: "Lihat Undangan",
  editData: "Edit Data",
  requestPublish: "Minta Publikasi",
  waitingVerification: "Menunggu Verifikasi",
  adminNote: "Catatan dari Admin",

  editTitle: "Edit Undangan",
  saveChanges: "Simpan Perubahan",

  pickerTitle: "Pilih Template",
  pickerSub: "Pilih desain yang paling cocok untuk momen spesial Anda.",
  pickerSelected: "Terpilih",
  pickerSelectBtn: "Pilih Template",
  featuresMore: "fitur lainnya",

  publishTitle: "Permintaan Publikasi",
  publishSelectedTemp: "Template Terpilih",
  publishBankInfo: "Instruksi Pembayaran",
  publishBank: "Bank",
  publishAccNo: "No. Rekening",
  publishAccName: "Atas Nama",
  publishAmount: "Jumlah Transfer",
  publishUpload: "Unggah Bukti Transfer",
  publishUploadHint: "Format: JPG, PNG (Maks 5MB)",
  publishUploadClick: "Klik untuk pilih gambar",
  publishSend: "Kirim Permintaan",
  publishSending: "Mengirim...",
};

const undanganEN = {
  title: "Create Invitation",
  subtitle: "Manage and create new digital invitations for your special moments.",
  newInvitation: "Start New Invitation",
  step1: "1. Couple's Name",
  step1Sub: "The name that will be the main title of your digital invitation.",
  namePlaceholder: 'Example: "Romeo & Juliet"',
  step2: "2. Template Design",
  step2Sub: "Choose a visual that suits your wedding theme.",
  selectTemplateBtn: "Click to select template",
  changeTemplate: "Change",
  createBtn: "Create Invitation Now",
  creatingBtn: "Processing...",
  
  yourInvitations: "Your Invitations",
  noInvitationsTitle: "No Invitations Yet",
  noInvitationsSub: "You haven't created any digital invitations. Start by filling out the form above to create your first invitation!",
  
  viewInvitation: "View Invitation",
  editData: "Edit Data",
  requestPublish: "Request Publish",
  waitingVerification: "Waiting for Verification",
  adminNote: "Admin's Note",

  editTitle: "Edit Invitation",
  saveChanges: "Save Changes",

  pickerTitle: "Select Template",
  pickerSub: "Choose the design that best fits your special moment.",
  pickerSelected: "Selected",
  pickerSelectBtn: "Select Template",
  featuresMore: "more features",

  publishTitle: "Publish Request",
  publishSelectedTemp: "Selected Template",
  publishBankInfo: "Payment Instructions",
  publishBank: "Bank",
  publishAccNo: "Account Number",
  publishAccName: "Account Name",
  publishAmount: "Transfer Amount",
  publishUpload: "Upload Proof of Transfer",
  publishUploadHint: "Format: JPG, PNG (Max 5MB)",
  publishUploadClick: "Click to select image",
  publishSend: "Send Request",
  publishSending: "Sending...",
};

// Harga Page
const pricingID = {
  title: "Harga Template",
  subtitle: "Pilih paket undangan digital yang sesuai untuk Anda",
  bannerTitle: "Coba Semua Template Gratis — Bayar Hanya Kalau Sudah Jatuh Cinta!",
  bannerSub: "Eksplorasi, isi data, dan lihat preview undangan Anda sepuasnya tanpa biaya sepeser pun. Ketika sudah menemukan yang sempurna, baru lanjut ke pembayaran.",
  noPricing: "Belum ada paket harga",
  noPricingSub: "Silakan periksa kembali nanti.",
  selectBtn: "Pilih Template Ini",
  footerInfo: "Pembayaran melalui transfer bank · Verifikasi oleh tim Inviteku dalam 1×24 jam",
};

const pricingEN = {
  title: "Template Pricing",
  subtitle: "Choose the digital invitation package that suits you",
  bannerTitle: "Try All Templates for Free — Pay Only When You Fall in Love!",
  bannerSub: "Explore, fill in your details, and preview your invitation to your heart's content — completely free. When you've found the perfect one, then proceed to payment.",
  noPricing: "No pricing packages available",
  noPricingSub: "Please check back later.",
  selectBtn: "Select This Template",
  footerInfo: "Payment via bank transfer · Verification by Inviteku team within 24 hours",
};

// Tamu Page
const guestsID = {
  title: "Manajemen Tamu",
  subtitle: "Kelola daftar tamu yang akan diundang ke pernikahan Anda",
  selectInvitation: "Pilih Undangan",
  selectInvitationPh: "-- Pilih Undangan --",
  noInvitationSelected: "Pilih undangan terlebih dahulu untuk melihat daftar tamu.",
  searchPh: "Cari nama tamu...",
  addGuest: "Tambah Tamu",
  tableName: "Nama",
  tableAddress: "Alamat",
  tableWhatsApp: "No. WhatsApp",
  tableLink: "Link Undangan",
  tableActions: "Aksi",
  noGuests: "Belum ada tamu",
  noGuestsSub: "Klik tombol Tambah Tamu untuk menambahkan daftar tamu Anda.",
  
  modalAddTitle: "Tambah Tamu Baru",
  modalEditTitle: "Edit Tamu",
  formName: "Nama Tamu",
  formNamePh: "Misal: Budi Santoso",
  formAddress: "Alamat / Instansi",
  formAddressPh: "Misal: Jakarta / PT Mencari Cinta Sejati",
  formWa: "No. WhatsApp (Opsional)",
  formWaPh: "Misal: 08123456789",
  formWaDesc: "Gunakan untuk mengirim undangan via WhatsApp.",
  deleteConfirmTitle: "Hapus Tamu",
  deleteConfirmDesc: "Apakah Anda yakin ingin menghapus tamu ini?",
};

const guestsEN = {
  title: "Guest Management",
  subtitle: "Manage the list of guests invited to your wedding",
  selectInvitation: "Select Invitation",
  selectInvitationPh: "-- Select Invitation --",
  noInvitationSelected: "Please select an invitation first to view the guest list.",
  searchPh: "Search guest name...",
  addGuest: "Add Guest",
  tableName: "Name",
  tableAddress: "Address",
  tableWhatsApp: "WhatsApp Number",
  tableLink: "Invitation Link",
  tableActions: "Actions",
  noGuests: "No guests yet",
  noGuestsSub: "Click the Add Guest button to add guests to your list.",

  modalAddTitle: "Add New Guest",
  modalEditTitle: "Edit Guest",
  formName: "Guest Name",
  formNamePh: "E.g., John Doe",
  formAddress: "Address / Organization",
  formAddressPh: "E.g., New York / ABC Corp",
  formWa: "WhatsApp Number (Optional)",
  formWaPh: "E.g., 08123456789",
  formWaDesc: "Used to send the invitation via WhatsApp.",
  deleteConfirmTitle: "Delete Guest",
  deleteConfirmDesc: "Are you sure you want to delete this guest?",
};

// Profile Page
const profileID = {
  title: "Profil Saya",
  subtitle: "Kelola informasi profil dan pengaturan akun Anda",
  personalInfo: "Informasi Pribadi",
  personalInfoDesc: "Perbarui foto dan detail personal Anda.",
  fullName: "Nama Lengkap",
  email: "Alamat Email",
  joined: "Bergabung sejak",
  updateProfile: "Perbarui Profil",
  updating: "Memperbarui...",
  avatarUpload: "Unggah Foto Profil",
  avatarUploadDesc: "Format JPG atau PNG. Ukuran maksimal 2MB.",
  changePhoto: "Ganti Foto",
};

const profileEN = {
  title: "My Profile",
  subtitle: "Manage your profile information and account settings",
  personalInfo: "Personal Information",
  personalInfoDesc: "Update your photo and personal details.",
  fullName: "Full Name",
  email: "Email Address",
  joined: "Joined since",
  updateProfile: "Update Profile",
  updating: "Updating...",
  avatarUpload: "Upload Profile Picture",
  avatarUploadDesc: "JPG or PNG format. Max size 2MB.",
  changePhoto: "Change Photo",
};

export const dictionaries = {
  id: {
    common: commonID,
    nav: navID,
    auth: authID,
    dashboard: dashboardID,
    undangan: undanganID,
    pricing: pricingID,
    guests: guestsID,
    profile: profileID,
  },
  en: {
    common: commonEN,
    nav: navEN,
    auth: authEN,
    dashboard: dashboardEN,
    undangan: undanganEN,
    pricing: pricingEN,
    guests: guestsEN,
    profile: profileEN,
  }
};

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  return { t: dictionaries[language], lang: language };
}
