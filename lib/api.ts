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
      case 401: errorMessage = "Sesi Anda tidak valid atau telah berakhir. Silakan login kembali."; break;
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
  return apiFetch<{ data: AssetGift }>(`/asset-gift/${id}`, {
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
  payload: { id_undangan: number; gopay?: string; bank?: string; no_rek?: string; nama_rek?: string },
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

export async function requestPublishApi(token: string, formData: FormData) {
  return apiFetch<ApiResponse>("/request-publish", {
    method: "POST",
    headers: authMultipartHeaders(token),
    body: formData,
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

export async function adminGetAllPaymentsApi(adminToken: string) {
  return apiFetch<{ data: AdminPayment[] }>("/admin/all-payments", {
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

export async function adminCreateTemplateApi(adminToken: string, formData: FormData) {
  return apiFetch<ApiResponse>("/template-assets", {
    method: "POST",
    headers: authMultipartHeaders(adminToken),
    body: formData,
  });
}

export async function adminUpdateTemplateApi(adminToken: string, formData: FormData) {
  return apiFetch<ApiResponse>("/template-assets", {
    method: "PUT",
    headers: authMultipartHeaders(adminToken),
    body: formData,
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
  payload: { id: number; status: boolean },
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

export interface Undangan {
  id: number;
  nama: string;
  key_undangan?: string;
  template?: string;
  exp?: string;
  id_user?: string;
  is_published?: boolean;
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
  description?: string;
  features?: string[];
}

export type PaymentStatusValue = "draft" | "pending" | "approved" | "rejected";

export interface PaymentStatus {
  id: number;
  id_undangan: number;
  status: PaymentStatusValue;
  bukti_transfer?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminPayment {
  id: number;
  id_undangan: number;
  nama_undangan?: string;
  user_name?: string;
  user_email?: string;
  template?: string;
  status: PaymentStatusValue;
  bukti_transfer?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
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
  gopay?: string;
  bank?: string;
  no_rek?: string;
  nama_rek?: string;
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
