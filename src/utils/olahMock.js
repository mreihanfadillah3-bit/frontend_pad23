// DATA SEMENTARA (in-memory) untuk proses Olah Sampah dan Hasil Olahan

export const INITIAL_BATCH_SEDANG = [
  {
    id: "#O-A05",
    jenisOlahan: "Kompos",
    pic: "Budi Santoso",
    bahanBaku: "50 kg Organik",
    tanggalSelesai: "6 September 2026",
    status: "dalam_pengolahan",
  },
  {
    id: "#O-A03",
    jenisOlahan: "Kertas Daur Ulang",
    pic: "Siti Aminah",
    bahanBaku: "25 kg Kertas",
    tanggalSelesai: "5 September 2026",
    status: "dalam_pengolahan",
  },
];

export const INITIAL_BATCH_SELESAI = [
  {
    batchId: "#O-A04",
    namaOlahan: "Vas Plastik",
    pic: "Sule",
    statusPublikasi: "belum",
    bahanBaku: "50 kg Botol Plastik",
    tanggalSelesai: "6 September 2026",
    beratHasil: 30,
    nilaiJual: 90000,
  },
  {
    batchId: "#O-A03",
    namaOlahan: "Vas Plastik",
    pic: "Sule",
    statusPublikasi: "sudah",
    bahanBaku: "45 kg Botol Plastik",
    tanggalSelesai: "5 September 2026",
    beratHasil: 28,
    nilaiJual: 84000,
  },
  {
    batchId: "#O-A02",
    namaOlahan: "Vas Plastik",
    pic: "Sule",
    statusPublikasi: "sudah",
    bahanBaku: "50 kg Botol Plastik",
    tanggalSelesai: "4 September 2026",
    beratHasil: 30,
    nilaiJual: 90000,
  },
];

let batchSedangList = [...INITIAL_BATCH_SEDANG];
let batchSelesaiList = [...INITIAL_BATCH_SELESAI];

export function getBatchSedangList() {
  return batchSedangList;
}

export function addBatchSedang(batch) {
  batchSedangList = [batch, ...batchSedangList];
  return batchSedangList;
}

export function completeBatch(batchId) {
  const target = batchSedangList.find((b) => b.id === batchId);
  batchSedangList = batchSedangList.filter((b) => b.id !== batchId);
  return target;
}

export function getBatchSelesaiList() {
  return batchSelesaiList;
}

export function addOrUpdateBatchSelesai(data) {
  const exists = batchSelesaiList.some((b) => b.batchId === data.batchId);
  if (exists) {
    batchSelesaiList = batchSelesaiList.map((b) =>
      b.batchId === data.batchId ? { ...b, ...data } : b
    );
  } else {
    batchSelesaiList = [data, ...batchSelesaiList];
  }
  return batchSelesaiList;
}

export function publikasikanBatch(batchId) {
  batchSelesaiList = batchSelesaiList.map((b) =>
    b.batchId === batchId ? { ...b, statusPublikasi: "sudah" } : b
  );
  return batchSelesaiList;
}

export function findBatchDetail(batchId) {
  // Cek apakah ada di batch sedang yang baru diselesaikan
  const inSedang = batchSedangList.find((b) => b.id === batchId);
  if (inSedang) {
    return {
      batchId: inSedang.id,
      namaOlahan: inSedang.jenisOlahan,
      bahanBaku: inSedang.bahanBaku || "50 kg Organik",
      pic: inSedang.pic,
      tanggalSelesai: inSedang.tanggalSelesai || "6 September 2026",
    };
  }

  // Cek di batch selesai
  const inSelesai = batchSelesaiList.find((b) => b.batchId === batchId);
  if (inSelesai) {
    return {
      batchId: inSelesai.batchId,
      namaOlahan: inSelesai.namaOlahan,
      bahanBaku: inSelesai.bahanBaku,
      pic: inSelesai.pic,
      tanggalSelesai: inSelesai.tanggalSelesai,
    };
  }

  return {
    batchId: batchId || "#O-A05",
    namaOlahan: "Kompos",
    bahanBaku: "50 kg Organik",
    pic: "Budi Santoso",
    tanggalSelesai: "6 September 2026",
  };
}

