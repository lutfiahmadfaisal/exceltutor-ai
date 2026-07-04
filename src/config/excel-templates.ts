// ============================================================
// ExcelTutor AI — Default Excel Templates
// ============================================================

import type { ExcelTemplate } from '@/types';

/**
 * Daftar template spreadsheet yang bisa dipilih user.
 * Setiap template punya data awal + systemHint untuk LLM.
 */
export const EXCEL_TEMPLATES: ExcelTemplate[] = [
  // ──────────── VLOOKUP ────────────
  {
    id: 'vlookup',
    name: 'VLOOKUP — Pencarian Data',
    description: 'Mencari harga produk berdasarkan ID produk menggunakan VLOOKUP',
    columns: [
      { id: 'A', name: 'Product ID', width: 14, type: 'text' },
      { id: 'B', name: 'Product Name', width: 22, type: 'text' },
      { id: 'C', name: 'Price', width: 14, type: 'currency' },
      { id: 'D', name: 'Stock', width: 10, type: 'number' },
    ],
    initialData: {
      'A2': 'P001',  'B2': 'Laptop',       'C2': '15000000', 'D2': '12',
      'A3': 'P002',  'B3': 'Mouse',         'C3': '250000',   'D3': '45',
      'A4': 'P003',  'B4': 'Keyboard',      'C4': '500000',   'D4': '30',
      'A5': 'P004',  'B5': 'Monitor 24"',   'C5': '3000000',  'D5': '8',
      'A6': 'P006',  'B6': 'Webcam',        'C6': '450000',   'D6': '20',
    },
    systemHint: 'Data ini berisi daftar produk dengan kolom Product ID (A), Product Name (B), Price (C), dan Stock (D). Gunakan data ini untuk demonstrasi VLOOKUP. Contoh: mencari harga berdasarkan Product ID. Tunjukkan di cell F2 dan seterusnya.',
    examplePrompt: 'Jelaskan cara menggunakan VLOOKUP untuk mencari harga produk berdasarkan ID produk',
  },

  // ──────────── IF Function ────────────
  {
    id: 'if-function',
    name: 'IF — Logika Kondisional',
    description: 'Menentukan status kelulusan atau grade dengan fungsi IF',
    columns: [
      { id: 'A', name: 'Nama Siswa', width: 20, type: 'text' },
      { id: 'B', name: 'Nilai', width: 10, type: 'number' },
      { id: 'C', name: 'Status', width: 14, type: 'text' },
    ],
    initialData: {
      'A2': 'Andi',     'B2': '85',
      'A3': 'Budi',     'B3': '60',
      'A4': 'Citra',    'B4': '92',
      'A5': 'Dewi',     'B5': '45',
      'A6': 'Eko',      'B6': '73',
    },
    systemHint: 'Data berisi nama siswa (A) dan nilai (B). Gunakan kolom C untuk menampilkan hasil IF. Contoh: IF(B2>=70,"Lulus","Tidak Lulus"). Tunjukkan nested IF untuk grade (A/B/C/D) jika relevan.',
    examplePrompt: 'Jelaskan cara menggunakan fungsi IF untuk menentukan status kelulusan siswa',
  },

  // ──────────── SUMIF ────────────
  {
    id: 'sumif',
    name: 'SUMIF — Penjumlahan Bersyarat',
    description: 'Menjumlahkan nilai berdasarkan kategori tertentu dengan SUMIF',
    columns: [
      { id: 'A', name: 'Kategori', width: 14, type: 'text' },
      { id: 'B', name: 'Item', width: 20, type: 'text' },
      { id: 'C', name: 'Jumlah', width: 12, type: 'number' },
    ],
    initialData: {
      'A2': 'Makanan',  'B2': 'Nasi Goreng',    'C2': '25000',
      'A3': 'Minuman',  'B3': 'Es Teh',         'C3': '8000',
      'A4': 'Makanan',  'B4': 'Mie Ayam',       'C4': '20000',
      'A5': 'Minuman',  'B5': 'Jus Jeruk',      'C5': '15000',
      'A6': 'Makanan',  'B6': 'Sate Ayam',      'C6': '35000',
      'A7': 'Camilan',  'B7': 'Pisang Goreng',  'C7': '10000',
    },
    systemHint: 'Data berisi kategori (A), item (B), dan jumlah (C). Tunjukkan SUMIF untuk menjumlah total per kategori. Contoh: SUMIF(A2:A7,"Makanan",C2:C7).',
    examplePrompt: 'Jelaskan cara menggunakan SUMIF untuk menjumlah total penjualan per kategori',
  },

  // ──────────── COUNTIF ────────────
  {
    id: 'countif',
    name: 'COUNTIF — Menghitung Data Bersyarat',
    description: 'Menghitung jumlah cell yang memenuhi kriteria tertentu',
    columns: [
      { id: 'A', name: 'Departemen', width: 16, type: 'text' },
      { id: 'B', name: 'Nama', width: 20, type: 'text' },
      { id: 'C', name: 'Gaji', width: 14, type: 'currency' },
    ],
    initialData: {
      'A2': 'IT',       'B2': 'Ahmad',     'C2': '8000000',
      'A3': 'HRD',     'B3': 'Bella',      'C3': '6000000',
      'A4': 'IT',       'B4': 'Charlie',   'C4': '9000000',
      'A5': 'Finance',  'B5': 'Diana',     'C5': '7500000',
      'A6': 'IT',       'B6': 'Evan',      'C6': '8500000',
      'A7': 'HRD',     'B7': 'Fiona',      'C7': '6500000',
    },
    systemHint: 'Data berisi departemen (A), nama (B), dan gaji (C). Tunjukkan COUNTIF untuk menghitung jumlah karyawan per departemen. Contoh: COUNTIF(A2:A7,"IT").',
    examplePrompt: 'Jelaskan cara menggunakan COUNTIF untuk menghitung jumlah pegawai per departemen',
  },

  // ──────────── XLOOKUP ────────────
  {
    id: 'xlookup',
    name: 'XLOOKUP — Pencarian Modern',
    description: 'Mencari data di tabel dengan fungsi XLOOKUP yang lebih fleksibel',
    columns: [
      { id: 'A', name: 'Kode Buku', width: 14, type: 'text' },
      { id: 'B', name: 'Judul Buku', width: 30, type: 'text' },
      { id: 'C', name: 'Pengarang', width: 20, type: 'text' },
      { id: 'D', name: 'Harga', width: 14, type: 'currency' },
    ],
    initialData: {
      'A2': 'BK-001',  'B2': 'Pemrograman Python',   'C2': 'John Doe',    'D2': '120000',
      'A3': 'BK-002',  'B3': 'Data Science 101',      'C3': 'Jane Smith',  'D3': '150000',
      'A4': 'BK-003',  'B4': 'Machine Learning',      'C4': 'Alan Turing', 'D4': '200000',
      'A5': 'BK-004',  'B5': 'Jaringan Komputer',     'C5': 'Bob Brown',   'D5': '90000',
    },
    systemHint: 'Data berisi kode buku (A), judul (B), pengarang (C), dan harga (D). Tunjukkan XLOOKUP untuk mencari data berdasarkan kode buku. Contoh: XLOOKUP(F2,A2:A5,B2:D5).',
    examplePrompt: 'Jelaskan cara menggunakan XLOOKUP untuk mencari informasi buku berdasarkan kode buku',
  },

  // ──────────── CONCATENATE / TEXTJOIN ────────────
  {
    id: 'text-join',
    name: 'TEXTJOIN — Menggabungkan Teks',
    description: 'Menggabungkan teks dari beberapa cell dengan pemisah tertentu',
    columns: [
      { id: 'A', name: 'First Name', width: 14, type: 'text' },
      { id: 'B', name: 'Last Name', width: 16, type: 'text' },
      { id: 'C', name: 'Full Name', width: 22, type: 'text' },
    ],
    initialData: {
      'A2': 'Ahmad',    'B2': 'Pratama',
      'A3': 'Siti',     'B3': 'Nurhaliza',
      'A4': 'Bambang',  'B4': 'Susilo',
      'A5': 'Dewi',     'B5': 'Sartika',
    },
    systemHint: 'Data berisi nama depan (A) dan nama belakang (B). Tunjukkan TEXTJOIN atau CONCATENATE untuk menggabungkannya di kolom C. Contoh: TEXTJOIN(" ",TRUE,A2:B2).',
    examplePrompt: 'Jelaskan cara menggunakan TEXTJOIN untuk menggabungkan nama depan dan nama belakang',
  },
];

/** Get template by ID */
export function getTemplateById(id: string): ExcelTemplate | undefined {
  return EXCEL_TEMPLATES.find((t) => t.id === id);
}

/** Get default template (first one) */
export function getDefaultTemplate(): ExcelTemplate {
  return EXCEL_TEMPLATES[0];
}

/** Empty template for custom data */
export function getEmptyTemplate(): ExcelTemplate {
  return {
    id: 'custom',
    name: 'Custom / Kosong',
    description: 'Mulai dari spreadsheet kosong. Data diatur oleh LLM.',
    columns: [
      { id: 'A', name: 'A', width: 12 },
      { id: 'B', name: 'B', width: 12 },
      { id: 'C', name: 'C', width: 12 },
    ],
    initialData: {},
    systemHint: 'Spreadsheet kosong. LLM akan membuat data sendiri sesuai topik tutorial.',
    examplePrompt: 'Jelaskan cara membuat tabel data penjualan sederhana',
  };
}

/** Get all templates including empty */
export function getAllTemplates(): ExcelTemplate[] {
  return [getEmptyTemplate(), ...EXCEL_TEMPLATES];
}
