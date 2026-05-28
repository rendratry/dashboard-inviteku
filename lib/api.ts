/**
 * Inviteku API utilities.
 * All requests are signed with the global x-api-key header.
 * Authenticated requests additionally carry a Bearer JWT.
 */

const BASE_URL = "https://api-inviteku.heyrend.cloud/api/v1";
const API_KEY = "12345678";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}

// ── Header helpers ─────────────────────────────────────────────────────────

function publicHeaders(): HeadersInit {
  return {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  };
}

function authHeaders(token: string): HeadersInit {
  return {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
    Authorization: token,
  };
}

function authMultipartHeaders(token: string): HeadersInit {
  // Don't set Content-Type for multipart — let the browser set it with the boundary
  return {
    "x-api-key": API_KEY,
    Authorization: token,
  };
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    // Disable Next.js caching for all API calls (always fresh data)
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMessage = "Terjadi kesalahan, mohon coba lagi.";
    switch (res.status) {
      case 400: errorMessage = "Data yang dikirim tidak valid. Mohon periksa kembali."; break;
      case 401: 
        errorMessage = "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."; 
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-expired"));
        }
        break;
      case 403: errorMessage = "Anda tidak memiliki izin untuk tindakan ini."; break;
      case 404: errorMessage = "Data yang diminta tidak ditemukan."; break;
      case 413: errorMessage = "Ukuran file terlalu besar. Mohon upload file dengan ukuran lebih kecil."; break;
      case 500: case 502: case 503: case 504:
        errorMessage = "Terjadi gangguan pada server. Mohon coba beberapa saat lagi."; break;
    }

    try {
      const body = await res.json();
      if (body.message && typeof body.message === "string" && body.message.trim() !== "") {
        const msg = body.message.toLowerCase();
        // Ignore raw/generic technical errors from the backend and stick to our friendly ones
        if (!msg.includes("http 4") && !msg.includes("http 5") && !msg.includes("sqlstate")) {
          errorMessage = body.message;
        }
      } else if (body.data && body.data.error && typeof body.data.error === "string") {
        errorMessage = body.data.error;
      }
    } catch {
      // swallow JSON parse errors and use fallback
    }
    throw { message: errorMessage, status: res.status } as ApiError;
  }

  return res.json() as Promise<T>;
}

// ── Public endpoints ───────────────────────────────────────────────────────

export async function loginApi(email: string, password: string) {
  return apiFetch<{
    code: number;
    status: string;
    data: { status: string; token: string };
  }>("/login", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email_or_username: email, password }),
  });
}

export async function registerApi(payload: {
  username: string;
  email: string;
  password: string;
  name: string;
}) {
  return apiFetch<{
    code: number;
    status: string;
    data: RegisteredUser;
  }>("/register-user", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function verifyOtpApi(payload: { id: number; otp: number }) {
  return apiFetch<{
    code: number;
    status: string;
    data: { username: string; email: string; name: string };
  }>("/verification", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function resendOtpApi(email: string) {
  return apiFetch<{
    code: number;
    status: string;
    data: unknown;
  }>("/resend-otp", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ email }),
  });
}

// ── Authenticated endpoints ────────────────────────────────────────────────

export async function getUserApi(token: string) {
  return apiFetch<{ data: User }>("/user", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function updateAvatarApi(token: string, formData: FormData) {
  return apiFetch<ApiResponse>("/update-avatar", {
    method: "POST",
    headers: authMultipartHeaders(token),
    body: formData,
  });
}

export async function updateUserApi(token: string, name: string) {
  return apiFetch<ApiResponse>("/update-user", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
}

export async function changePasswordApi(token: string, old_password: string, new_password: string) {
  return apiFetch<ApiResponse>("/change-password", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ old_password, new_password }),
  });
}

// ── Overview ───────────────────────────────────────────────────────────────

export interface OverviewResponse {
  total_undangan: number;
  total_tamu: number;
  total_komentar: number;
  total_assets: number;
}

export async function getOverviewApi(token: string) {
  return apiFetch<{ data: OverviewResponse; message?: string; status?: boolean }>("/user/overview", {
    method: "GET",
    headers: authHeaders(token),
  });
}

// ── Tamu (Guest) ───────────────────────────────────────────────────────────
export async function getTamuApi(token: string, idUndangan: number | string) {
  return apiFetch<{ data: Tamu[] }>(`/get-tamu/${idUndangan}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function addTamuApi(
  token: string,
  payload: { id_undangan: number; key: string; nama: string; alamat: string; no_wa?: string },
) {
  return apiFetch<ApiResponse>("/add-tamu", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateTamuApi(
  token: string,
  payload: { id: number; nama: string; alamat?: string; no_wa?: string },
) {
  return apiFetch<ApiResponse>("/update-tamu", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteTamuApi(
  token: string,
  idUndangan: number,
  id: number,
) {
  return apiFetch<ApiResponse>(`/delete-tamu/${idUndangan}/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

// ── Assets Library ─────────────────────────────────────────────────────────

export async function getLibraryAssetsApi(token: string) {
  return apiFetch<{ data: LibraryAsset[] }>("/assets", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function uploadAssetsApi(token: string, formData: FormData) {
  // Matches backend expectations: file, key, name, id_user
  return apiFetch<{ data: LibraryAsset }>("/upload-assets", {
    method: "POST",
    headers: authMultipartHeaders(token),
    body: formData,
  });
}

export async function getUndanganApi(token: string) {
  return apiFetch<{ data: Undangan[] }>("/get-undangan", {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function createUndanganApi(
  token: string,
  payload: { nama: string; template: string },
) {
  return apiFetch<{ data: Undangan }>("/create-undangan", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getAssetOpeningApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetOpening }>(`/asset-opening/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetMempelaiApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetMempelai }>(`/asset-mempelai/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetAkadApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetAkad }>(`/asset-akad/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetResepsiApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetResepsi }>(`/asset-resepsi/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetGalleryApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetGallery }>(`/asset-gallery/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetMapsApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetMaps }>(`/asset-maps/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function getAssetGiftApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetGift[] }>(`/asset-gift/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function updateAssetOpeningApi(
  token: string,
  payload: Partial<AssetOpening>,
) {
  return apiFetch<ApiResponse>("/update-asset-opening", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetMempelaiApi(
  token: string,
  payload: Partial<AssetMempelai>,
) {
  return apiFetch<ApiResponse>("/update-asset-mempelai", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetAkadApi(
  token: string,
  payload: Partial<AssetAkad>,
) {
  return apiFetch<ApiResponse>("/update-asset-akad", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetResepsiApi(
  token: string,
  payload: Partial<AssetResepsi>,
) {
  return apiFetch<ApiResponse>("/update-asset-resepsi", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetGalleryApi(
  token: string,
  payload: Partial<AssetGallery>,
) {
  return apiFetch<ApiResponse>("/update-asset-gallery", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetMapsApi(
  token: string,
  payload: Partial<AssetMaps>,
) {
  return apiFetch<ApiResponse>("/update-asset-maps", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAssetGiftApi(
  token: string,
  payload: { id_undangan: number; gifts: Omit<AssetGift, "id" | "id_undangan">[] },
) {
  return apiFetch<ApiResponse>("/update-asset-gift", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteAssetApi(token: string, id: number) {
  return apiFetch<ApiResponse>(`/delete-asset/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Template Prices (Public) ────────────────────────────────────────────────

export async function getTemplatePricesApi() {
  return apiFetch<{ data: TemplatePrice[] }>("/template-prices", {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });
}

// ── Payment Logos (Public/Global) ──────────────────────────────────────────

export async function getPaymentLogosApi() {
  return apiFetch<{ data: { id: number; name: string; path: string }[] }>("/payment-logos", {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });
}

// ── Undangan Update (Draft only) ───────────────────────────────────────────

export async function updateUndanganApi(
  token: string,
  payload: { id_undangan: number; nama: string; template: string },
) {
  return apiFetch<ApiResponse>("/update-undangan", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

// ── Request Publish (multipart) ────────────────────────────────────────────

export async function requestPublishApi(
  token: string,
  payload: {
    id_undangan: number;
    key: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    voucher_code?: string;
  },
) {
  return apiFetch<{ data: { payment_url: string; order_id: number } }>("/request-publish", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

// ── Preview Token ──────────────────────────────────────────────────────────

export async function generatePreviewTokenApi(token: string, idUndangan: number | string) {
  return apiFetch<{ data: { preview_token: string } }>(`/generate-preview/${idUndangan}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

// ── Payment Status ─────────────────────────────────────────────────────────

export async function getPaymentStatusApi(
  token: string,
  idUndangan: number | string,
) {
  return apiFetch<{ data: PaymentStatus }>(`/payment-status/${idUndangan}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function cancelOrderApi(token: string, idUndangan: number | string) {
  return apiFetch<ApiResponse>(`/cancel-order/${idUndangan}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Admin ──────────────────────────────────────────────────────────────────

function adminHeaders(adminToken: string): HeadersInit {
  return {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
    Authorization: adminToken,
  };
}

export async function adminLoginApi(username: string, password: string) {
  return apiFetch<{ data: { token: string } }>("/admin/login", {
    method: "POST",
    headers: publicHeaders(),
    body: JSON.stringify({ username, password }),
  });
}

export async function adminGetPendingPaymentsApi(adminToken: string) {
  return apiFetch<{ data: AdminPayment[] }>("/admin/pending-payments", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetApprovedPaymentsApi(adminToken: string) {
  return apiFetch<{ data: AdminPayment[] }>("/admin/approved-payments", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetRejectedPaymentsApi(adminToken: string) {
  return apiFetch<{ data: AdminPayment[] }>("/admin/rejected-payments", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetAllPaymentsApi(adminToken: string) {
  return apiFetch<{ data: AdminPayment[] }>("/admin/all-payments", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetAllUndanganApi(adminToken: string) {
  return apiFetch<{ data: AdminUndangan[] }>("/admin/undangan", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminVerifyPaymentApi(
  adminToken: string,
  payload: { order_id: number; approved: boolean; note: string },
) {
  return apiFetch<ApiResponse>("/admin/verify-payment", {
    method: "POST",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateUndanganApi(
  adminToken: string,
  payload: { id_undangan: number; nama: string; template: string; note: string },
) {
  return apiFetch<ApiResponse>("/admin/update-undangan", {
    method: "PUT",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(payload),
  });
}

// ── Voucher (Admin) ────────────────────────────────────────────────────────

export interface Voucher {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_price: number;
  max_discount: number;
  quota: number;
  used_count: number;
  specific_user: string;
  is_active: boolean;
  expired_at: number;
  created_at: number;
}

export interface CreateVoucherPayload {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_price: number;
  max_discount: number;
  quota: number;
  specific_user: string;
  is_active: boolean;
  expired_at: number;
}

export async function adminGetVouchersApi(adminToken: string) {
  return apiFetch<{ data: Voucher[] }>("/admin/vouchers", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminCreateVoucherApi(adminToken: string, payload: CreateVoucherPayload) {
  return apiFetch<{ data: Voucher }>("/admin/vouchers", {
    method: "POST",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteVoucherApi(adminToken: string, id: number) {
  return apiFetch<ApiResponse>(`/admin/vouchers/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminToken),
  });
}

// ── Voucher (User) ─────────────────────────────────────────────────────────

export interface VoucherValidateResult {
  code: string;
  type: string;
  value: number;
  original_price: number;
  discount_amount: number;
  final_price: number;
}

export async function validateVoucherApi(token: string, code: string, originalPrice: number) {
  return apiFetch<{ data: VoucherValidateResult }>("/validate-voucher", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ code, original_price: originalPrice }),
  });
}

export async function adminCreateTemplateApi(adminToken: string, formData: FormData) {
  return apiFetch<ApiResponse>("/admin/template-assets", {
    method: "POST",
    headers: authMultipartHeaders(adminToken),
    body: formData,
  });
}

export async function adminUpdateTemplateApi(adminToken: string, id: number | string, formData: FormData) {
  return apiFetch<ApiResponse>(`/admin/template-assets/${id}`, {
    method: "PUT",
    headers: authMultipartHeaders(adminToken),
    body: formData,
  });
}

export async function adminGetTemplatesApi(adminToken: string) {
  return apiFetch<{ data: TemplatePrice[] }>("/admin/template-assets", {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetTemplateByIdApi(adminToken: string, id: number | string) {
  return apiFetch<{ data: TemplatePrice }>(`/admin/template-assets/${id}`, {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminGetUsersApi(
  adminToken: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.search) query.append("search", params.search);

  const queryString = query.toString();
  const url = `/admin/users${queryString ? `?${queryString}` : ""}`;

  return apiFetch<{ data: AdminUsersResponse }>(url, {
    method: "GET",
    headers: adminHeaders(adminToken),
  });
}

export async function adminUpdateUserMitraApi(
  adminToken: string,
  id: string,
  isMitra: boolean
) {
  return apiFetch<ApiResponse>(`/admin/users/${id}/mitra`, {
    method: "PUT",
    headers: adminHeaders(adminToken),
    body: JSON.stringify({ is_mitra: isMitra }),
  });
}

export async function getAssetBacksoundApi(token: string, id: number | string) {
  return apiFetch<{ data: AssetBacksound }>(`/asset-backsound/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function updateAssetBacksoundApi(
  token: string,
  payload: { id?: number; id_undangan: number; backsound: number },
) {
  return apiFetch<ApiResponse>("/update-asset-backsound", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

// ── Komentar ───────────────────────────────────────────────────────────────

export async function getKomentarApi(token: string, id: number | string) {
  return apiFetch<{ data: Komentar[] }>(`/asset-comentar/${id}`, {
    method: "GET",
    headers: authHeaders(token),
  });
}

export async function updateKomentarApi(
  token: string,
  payload: { id: number; id_undangan: number; from: string; pesan: string; status: boolean },
) {
  return apiFetch<ApiResponse>("/update-asset-comentar", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteKomentarApi(token: string, id: number) {
  return apiFetch<ApiResponse>(`/delete-asset-comentar/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

// ── Domain Types ───────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface RegisteredUser {
  id: number;
  username: string;
  email: string;
  name: string;
  register_done: boolean;
}

export interface Undangan {
  id: number;
  nama: string;
  key_undangan?: string;
  template?: string;
  exp?: string;
  id_user?: string;
  is_published?: boolean;
  is_deleted?: boolean;
}

export interface AdminUndangan extends Undangan {
  opening_assets?: any;
  mempelai_assets?: any;
  akad_assets?: any;
  resepsi_assets?: any;
  gallery_assets: AssetGallery;
  maps_assets: AssetMaps;
  gift_accounts: AssetGift[];
  backsound_assets: AssetBacksound;
  display_config: DisplayConfig;
  quotes_assets: AssetQuotes;
}

export interface TemplatePrice {
  id: number;
  template: string;
  name_template: string;
  effective_price: number;
  accent_color?: string;
  thumbnail?: string;
  background?: string;
  top_right?: string;
  top_left?: string;
  bottom_right?: string;
  bottom_left?: string;
  foto_cover?: string;
  foto_pria?: string;
  foto_wanita?: string;
  foto_akad?: string;
  foto_resepsi?: string;
  foto_gallery1?: string;
  foto_gallery2?: string;
  foto_gallery3?: string;
  foto_gallery4?: string;
  foto_gallery5?: string;
  foto_gallery6?: string;
  description?: string;
  features?: string[];
  price?: number;
  price_disc?: number;
  is_disc?: boolean;
  is_published?: boolean;
  lat?: string;
  lang?: string;
  backsound?: string;
  backsound_filename?: string;
}

export type PaymentStatusValue = "draft" | "pending" | "paid" | "approved" | "rejected" | "failed";

export interface PaymentStatus {
  id: number;
  id_undangan: number;
  status: PaymentStatusValue;
  payment_url?: string;
  ipaymu_session_id?: string;
  bukti_transfer?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminPayment {
  id: number;
  id_undangan: number;
  id_user?: string;
  nama_undangan?: string;
  user_name?: string;
  user_email?: string;
  template?: string;
  status: PaymentStatusValue;
  amount?: number;
  discount_amount?: number;
  voucher_id?: number;
  payment_method?: string;
  requested_key?: string;
  bukti_transfer?: string;
  note?: string;
  created_at?: string;
  verified_at?: number;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  is_mitra: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersResponse {
  limit: number;
  page: number;
  total: number;
  users: AdminUser[];
}

export interface LibraryAsset {
  id: number;
  key: string;
  name: string;
  id_user: string;
  link: string;
}

export interface Tamu {
  id: number;
  id_undangan: number;
  key?: string;
  nama: string;
  alamat: string;
  no_wa?: string;
}

export interface AssetOpening {
  id: number;
  id_undangan: number;
  nama_mempelai: string;
  foto_cover: number;
}

export interface AssetMempelai {
  id: number;
  id_undangan: number;
  nama_mempelai_pria: string;
  nama_mempelai_wanita: string;
  keluarga_mempelai_pria: string;
  keluarga_mempelai_wanita: string;
  foto_mempelai_pria: number;
  foto_mempelai_wanita: number;
  salam_pembuka?: string;
  kalimat_pengantar?: string;
}

export interface AssetAkad {
  id: number;
  id_undangan: number;
  title: string;
  hari: string;
  tanggal: number;
  bulan: string;
  tahun: number;
  keterangan: string;
  alamat: string;
  foto_akad: number;
}

export interface AssetResepsi {
  id: number;
  id_undangan: number;
  title: string;
  hari: string;
  tanggal: number;
  bulan: string;
  tahun: number;
  keterangan: string;
  alamat: string;
  foto_resepsi: number;
}

export interface AssetGallery {
  id: number;
  id_undangan: number;
  foto1: number;
  foto2: number;
  foto3: number;
  foto4: number;
  foto5: number;
  foto6: number;
}

export interface AssetMaps {
  id: number;
  id_undangan: number;
  title: string;
  lat: string;
  lang: string;
}

export interface AssetGift {
  id: number;
  id_undangan: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo_id?: number;
  logo_link?: string;
  logo?: {
    id: number;
    name: string;
    path: string;
  };
}

export interface AssetBacksound {
  id: number;
  id_undangan: number;
  backsound: number;
}

export interface Komentar {
  id: number;
  id_undangan: number;
  from: string;
  pesan: string;
  status: boolean;
  created_at?: string;
}

// ── Display Config (Frame Foto & Grid Gallery) ──────────────────────────────

export interface AssetQuotes {
  id: number;
  id_undangan: number;
  teks: string;
  sumber: string;
}

export interface DisplayConfig {
  id?: number;
  id_undangan: number;
  frame_opening: string;
  frame_mempelai_pria: string;
  frame_mempelai_wanita: string;
  frame_akad: string;
  frame_resepsi: string;
  gallery_grid: string;
}


/**
 * Mengambil konfigurasi tampilan (frame foto & grid gallery) untuk undangan.
 */
export async function getDisplayConfigApi(token: string, idUndangan: number | string) {
  return apiFetch<{ data: DisplayConfig }>(`/display-config/${idUndangan}`, {
    headers: authHeaders(token),
  });
}

/**
 * Memperbarui konfigurasi tampilan untuk undangan.
 */
export async function updateDisplayConfigApi(token: string, payload: DisplayConfig) {
  return apiFetch<ApiResponse>("/update-display-config", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

/**
 * Mengambil konfigurasi default sesuai template undangan.
 * Digunakan untuk fitur "Reset ke Default Template".
 */
export async function getTemplateDefaultConfigApi(token: string, idUndangan: number | string) {
  return apiFetch<{ data: DisplayConfig }>(`/display-config-default/${idUndangan}`, {
    headers: authHeaders(token),
  });
}

export async function updateQuotesAssetsApi(
  token: string,
  payload: {
    id_undangan: number;
    teks: string;
    sumber: string;
  }
) {
  return apiFetch<ApiResponse>(
    "/update-asset-quotes",
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }
  );
}

export async function getQuotesAssetsApi(token: string, idUndangan: number) {
  return apiFetch<{ data: AssetQuotes }>(`/asset-quotes/${idUndangan}`, {
    headers: authHeaders(token),
  });
}

export const adminSoftDeleteUndanganApi = (token: string, id: number) => {
  return apiFetch<ApiResponse>(`/admin/undangan/${id}/delete`, {
    method: "PUT",
    headers: authHeaders(token),
  });
};

export const adminRestoreUndanganApi = (token: string, id: number) => {
  return apiFetch<ApiResponse>(`/admin/undangan/${id}/restore`, {
    method: "PUT",
    headers: authHeaders(token),
  });
};
