import React, { useState } from 'react';
import XLSX from 'xlsx-js-style';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SokhambenhRow, SoCapThuocRow, BaoCaoThuocRow } from '../types';

// ============================================================================
// School / signature constants — edit these to match your unit.
// ============================================================================
const DON_VI_CAP_TREN = 'UBND XÃ QUANG BÌNH';
const TEN_TRUONG = 'TRƯỜNG PTDTBT THCS TÂN NAM';
const CAN_BO_Y_TE = 'Hoàng Văn Huấn';
const HIEU_TRUONG = '';

interface ExcelSheetsProps {
  lang: 'vi' | 'en';
  onAddStudentFromExcel?: (studentName: string, studentClass: string, diagnosis: string) => void;
  soKhambenhData: SokhambenhRow[];
  setSoKhambenhData: React.Dispatch<React.SetStateAction<SokhambenhRow[]>>;
  phatthuocData: SoCapThuocRow[];
  setPhatthuocData: React.Dispatch<React.SetStateAction<SoCapThuocRow[]>>;
  baocaotonData: BaoCaoThuocRow[];
  setBaocaotonData: React.Dispatch<React.SetStateAction<BaoCaoThuocRow[]>>;
}

type ActiveSheet = 'KHAM_BENH' | 'CAP_THUOC' | 'BAO_CAO';

export default function ExcelSheets({
  lang,
  onAddStudentFromExcel,
  soKhambenhData = [],
  setSoKhambenhData,
  phatthuocData = [],
  setPhatthuocData,
  baocaotonData = [],
  setBaocaotonData
}: ExcelSheetsProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('KHAM_BENH');
  const [notification, setNotification] = useState<string | null>(null);
  const [localConfirm, setLocalConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showNotificationMsg = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================================================================
  // Sổ Cấp Thuốc is fully derived from Sổ Khám Bệnh (mirrors the SoCapThuoc
  // formulas in the sample workbook: =SoKhamBenh!A3, =SoKhamBenh!H3, etc.)
  // ==========================================================================
  const deriveSoCapThuoc = (rows: SokhambenhRow[]): SoCapThuocRow[] =>
    rows.map((r, idx) => ({
      stt: idx + 1,
      ngay: r.ngayKham || '',
      hoTen: r.hoTen || '',
      lop: r.lop || '',
      chanDoan: r.chanDoan || '',
      thuoc1: r.thuoc1 || '',
      sl1: Number(r.sl1) || 0,
      thuoc2: r.thuoc2 || '',
      sl2: Number(r.sl2) || 0
    }));

  const syncSoCapThuoc = (updated: SokhambenhRow[], notify = false) => {
    setPhatthuocData(deriveSoCapThuoc(updated));
    if (notify) {
      showNotificationMsg(
        lang === 'vi'
          ? '⚡ Đã đồng bộ Sổ Khám Bệnh → Sổ Cấp Phát Thuốc!'
          : '⚡ Synced Medical Log → Dispensing Log!'
      );
    }
  };

  // ==========================================================================
  // Sổ Khám Bệnh — handlers
  // ==========================================================================
  const updateKhamBenhCell = (index: number, key: keyof SokhambenhRow, value: any) => {
    const updated = [...soKhambenhData];
    if (key === 'sl1' || key === 'sl2') {
      (updated[index] as any)[key] = parseInt(value) || 0;
    } else {
      (updated[index] as any)[key] = value;
    }
    setSoKhambenhData(updated);
    syncSoCapThuoc(updated, false);
  };

  const addKhamBenhRow = () => {
    const newRow: SokhambenhRow = {
      stt: soKhambenhData.length + 1,
      ngayKham: new Date().toLocaleDateString('vi-VN'),
      hoTen: '',
      gioiTinh: 'Nam',
      lop: '',
      diaChi: '',
      trieuChung: '',
      chanDoan: '',
      thuoc1: '',
      sl1: 0,
      thuoc2: '',
      sl2: 0
    };
    const updated = [...soKhambenhData, newRow];
    setSoKhambenhData(updated);
    syncSoCapThuoc(updated, true);
  };

  const syncStudentToSystem = (row: SokhambenhRow) => {
    if (!row.hoTen) {
      showNotificationMsg(lang === 'vi' ? 'Vui lòng nhập họ tên trước khi lưu học sinh!' : 'Please enter student name first!');
      return;
    }
    if (onAddStudentFromExcel) {
      onAddStudentFromExcel(row.hoTen, row.lop || '', row.chanDoan || '');
      showNotificationMsg(lang === 'vi' ? `Đã lưu và đồng bộ học sinh "${row.hoTen}" vào hệ thống chính!` : `Synchronized "${row.hoTen}" into main database!`);
    }
  };

  // ==========================================================================
  // Báo Cáo Thuốc — handlers (drug inventory catalog)
  // ==========================================================================
  const updateBaoCaoCell = (index: number, key: keyof BaoCaoThuocRow, value: any) => {
    const updated = [...baocaotonData];
    if (key === 'donGia' || key === 'tonCuoiKy' || key === 'nhapTrongThang') {
      (updated[index] as any)[key] = parseInt(value) || 0;
    } else {
      (updated[index] as any)[key] = value;
    }
    setBaocaotonData(updated);
  };

  const addBaoCaoRow = () => {
    const newRow: BaoCaoThuocRow = {
      stt: baocaotonData.length + 1,
      tenThuoc: '',
      donVi: 'Viên',
      donGia: 0,
      tonCuoiKy: 0,
      nhapTrongThang: 0
    };
    setBaocaotonData([...baocaotonData, newRow]);
    showNotificationMsg(lang === 'vi' ? 'Đã thêm dòng mới vào Báo Cáo Thuốc!' : 'Added row to Drug Report!');
  };

  const deleteLastRow = () => {
    if (activeSheet === 'KHAM_BENH') {
      if (soKhambenhData.length === 0) return;
      const updated = soKhambenhData.slice(0, -1);
      setSoKhambenhData(updated);
      syncSoCapThuoc(updated, false);
    } else if (activeSheet === 'BAO_CAO') {
      if (baocaotonData.length === 0) return;
      setBaocaotonData(baocaotonData.slice(0, -1));
    }
    showNotificationMsg(lang === 'vi' ? 'Đã xóa dòng cuối cùng!' : 'Removed last row!');
  };

  // Đã sử dụng (lượng) for a drug name = tổng SL1/SL2 trong Sổ Khám Bệnh có tên thuốc trùng khớp
  const daSuDungFor = (tenThuoc: string) => {
    if (!tenThuoc) return 0;
    return soKhambenhData.reduce((sum, r) => {
      let s = 0;
      if (r.thuoc1 === tenThuoc) s += Number(r.sl1) || 0;
      if (r.thuoc2 === tenThuoc) s += Number(r.sl2) || 0;
      return sum + s;
    }, 0);
  };

  const baoCaoComputed = baocaotonData.map((r) => {
    const tonCuoiKy = Number(r.tonCuoiKy) || 0;
    const nhapTrongThang = Number(r.nhapTrongThang) || 0;
    const donGia = Number(r.donGia) || 0;
    const tongCong = tonCuoiKy + nhapTrongThang;
    const daSuDung = daSuDungFor(r.tenThuoc);
    const conLai = tongCong - daSuDung;
    return { ...r, tongCong, daSuDung, conLai, thanhTienDaSuDung: daSuDung * donGia, thanhTienConLai: conLai * donGia };
  });

  // ==========================================================================
  // XLSX export — mirrors PTDTBT_YTCS_PRO_V1.xlsx exactly:
  //   Sheet "SoKhamBenh"  (A1:L, title + 2-row header + data, formula in col A)
  //   Sheet "SoCapThuoc"  (A1:I, formula-linked to SoKhamBenh, totals row)
  //   Sheet "BaoCaoThuoc" (A1:N, unit header block + 2-row table header + SUMIF)
  // ==========================================================================

  const thinBorder = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  };

  const titleStyle = {
    font: { name: 'Times New Roman', sz: 12, bold: true },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: thinBorder
  };

  const headerStyle = {
    font: { name: 'Times New Roman', sz: 12, bold: true },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: thinBorder
  };

  const dataStyle = {
    font: { name: 'Times New Roman', sz: 11 },
    alignment: { vertical: 'center', wrapText: true },
    border: thinBorder
  };

  const totalStyle = {
    font: { name: 'Times New Roman', sz: 11, bold: true },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: thinBorder
  };

  const createSoKhamBenhSheet = () => {
    const headers1 = ['STT', 'Ngày, tháng khám bệnh', 'Họ tên', 'Giới tính', 'Lớp', 'Địa chỉ', 'Triệu chứng', 'Chẩn đoán', 'Thuốc 1', 'SL1', 'Thuốc 2', 'SL2'];
    const aoa: any[][] = [
      ['SỔ KHÁM BỆNH', '', '', '', '', '', '', '', '', '', '', ''],
      headers1
    ];

    soKhambenhData.forEach((r) => {
      aoa.push([
        r.stt,
        r.ngayKham || '',
        r.hoTen || '',
        r.gioiTinh || '',
        r.lop || '',
        r.diaChi || '',
        r.trieuChung || '',
        r.chanDoan || '',
        r.thuoc1 || '',
        Number(r.sl1) || 0,
        r.thuoc2 || '',
        Number(r.sl2) || 0
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const lastRow = 1 + soKhambenhData.length; // 0-indexed row of last data row

    // Column A holds "=ROW()-2" like the sample sheet
    for (let i = 0; i < soKhambenhData.length; i++) {
      const r = 2 + i;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = { t: 'n', f: 'ROW()-2' };
    }

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];
    ws['!cols'] = [
      { wch: 6 }, { wch: 11 }, { wch: 15 }, { wch: 7 }, { wch: 9 }, { wch: 16 },
      { wch: 29 }, { wch: 15 }, { wch: 24 }, { wch: 9 }, { wch: 23 }, { wch: 9 }
    ];
    ws['!rows'] = [{ hpt: 24 }, { hpt: 30 }];

    for (let c = 0; c < 12; c++) {
      const t = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[t]) ws[t] = { t: 's', v: '' };
      ws[t].s = titleStyle;
      const h = XLSX.utils.encode_cell({ r: 1, c });
      ws[h].s = headerStyle;
    }
    for (let r = 2; r <= lastRow; r++) {
      for (let c = 0; c < 12; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        const val = ws[ref].v;
        const isNum = typeof val === 'number';
        ws[ref].s = { ...dataStyle, alignment: { ...dataStyle.alignment, horizontal: (c === 0 || c === 3 || c === 9 || c === 11 || isNum) ? 'center' : 'left' } };
      }
    }

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(lastRow, 1), c: 11 } });
    ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 };
    return ws;
  };

  const createSoCapThuocSheet = () => {
    const headers = ['STT', 'Ngày', 'Họ tên', 'Lớp', 'Chẩn đoán', 'Tên thuốc, số lượng', 'SL1', 'Tên thuốc, số lượng', 'SL2'];
    const aoa: any[][] = [
      ['SỔ CẤP PHÁT THUỐC', '', '', '', '', '', '', '', ''],
      headers
    ];

    const n = soKhambenhData.length;
    for (let i = 0; i < n; i++) {
      aoa.push(['', '', '', '', '', '', '', '', '']);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    for (let i = 0; i < n; i++) {
      const r = 2 + i;
      const sk = r + 1; // matching row number in SoKhamBenh (1-indexed sheet rows)
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = { t: 'n', f: `SoKhamBenh!A${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 1 })] = { t: 's', f: `SoKhamBenh!B${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 2 })] = { t: 's', f: `SoKhamBenh!C${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 3 })] = { t: 's', f: `SoKhamBenh!E${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 4 })] = { t: 's', f: `SoKhamBenh!H${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 5 })] = { t: 's', f: `SoKhamBenh!I${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 6 })] = { t: 'n', f: `SoKhamBenh!J${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 7 })] = { t: 's', f: `SoKhamBenh!K${sk}` };
      ws[XLSX.utils.encode_cell({ r, c: 8 })] = { t: 'n', f: `SoKhamBenh!L${sk}` };
    }

    const totalRow = 2 + n;
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 0 })] = { t: 's', v: 'Tổng cộng:' };
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 6 })] = { t: 'n', f: `SUM(G3:G${totalRow})` };
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 8 })] = { t: 'n', f: `SUM(I3:I${totalRow})` };

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 5 } }
    ];
    ws['!cols'] = [
      { wch: 5 }, { wch: 14 }, { wch: 18 }, { wch: 9 }, { wch: 28 },
      { wch: 16 }, { wch: 6 }, { wch: 18 }, { wch: 7 }
    ];

    for (let c = 0; c < 9; c++) {
      const t = XLSX.utils.encode_cell({ r: 0, c });
      ws[t].s = titleStyle;
      const h = XLSX.utils.encode_cell({ r: 1, c });
      ws[h].s = headerStyle;
    }
    for (let r = 2; r < totalRow; r++) {
      for (let c = 0; c < 9; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        ws[ref].s = { ...dataStyle, alignment: { ...dataStyle.alignment, horizontal: (c === 0 || c === 6 || c === 8) ? 'center' : 'left' } };
      }
    }
    for (let c = 0; c < 9; c++) {
      const ref = XLSX.utils.encode_cell({ r: totalRow, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = totalStyle;
    }

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRow, c: 8 } });
    ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 };
    return ws;
  };

  const createBaoCaoThuocSheet = () => {
    const today = new Date();
    const aoa: any[][] = [
      [DON_VI_CAP_TREN],
      [TEN_TRUONG],
      [''],
      [`BÁO CÁO THUỐC THÁNG ${String(today.getMonth() + 1).padStart(2, '0')} NĂM ${today.getFullYear()}`],
      [''],
      ['STT', 'Tên thuốc, nồng độ, hàm lượng', 'Đơn vị tính', 'Đơn giá', 'Tồn cuối kỳ', '', 'Nhập trong tháng', '', 'Tổng cộng', '', 'Đã sử dụng', '', 'Còn lại', ''],
      ['', '', '', '', 'Lượng', 'Tiền', 'Lượng', 'Tiền', 'Lượng', 'Tiền', 'Lượng', 'Tiền', 'Lượng', 'Tiền']
    ];

    baocaotonData.forEach((r, idx) => {
      aoa.push([idx + 1, r.tenThuoc || '', r.donVi || '', Number(r.donGia) || 0, Number(r.tonCuoiKy) || 0, '', Number(r.nhapTrongThang) || 0, '', '', '', '', '', '', '']);
    });

    const n = baocaotonData.length;
    const dataStartRow = 7; // 0-indexed
    const dataEndRow = dataStartRow + n - 1;

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    for (let i = 0; i < n; i++) {
      const r = dataStartRow + i;
      const rn = r + 1; // 1-indexed excel row
      ws[XLSX.utils.encode_cell({ r, c: 8 })] = { t: 'n', f: `E${rn}+G${rn}` };
      ws[XLSX.utils.encode_cell({ r, c: 10 })] = { t: 'n', f: `SUMIF(SoCapThuoc!F:F,B${rn},SoCapThuoc!G:G)+SUMIF(SoCapThuoc!H:H,B${rn},SoCapThuoc!I:I)` };
      ws[XLSX.utils.encode_cell({ r, c: 11 })] = { t: 'n', f: `K${rn}*D${rn}` };
      ws[XLSX.utils.encode_cell({ r, c: 12 })] = { t: 'n', f: `I${rn}-K${rn}` };
      ws[XLSX.utils.encode_cell({ r, c: 13 })] = { t: 'n', f: `D${rn}*M${rn}` };
    }

    const totalRow = dataStartRow + n;
    const firstDataRn = dataStartRow + 1;
    const lastDataRn = totalRow;
    ws[XLSX.utils.encode_cell({ r: totalRow, c: 1 })] = { t: 's', v: 'Tổng cộng' };
    for (const c of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
      const col = XLSX.utils.encode_col(c);
      ws[XLSX.utils.encode_cell({ r: totalRow, c })] = { t: 'n', f: `SUM(${col}${firstDataRn}:${col}${lastDataRn})` };
    }

    const signRow1 = totalRow + 2;
    const signRow2 = signRow1 + 1;
    const signRow3 = signRow1 + 6;
    ws[XLSX.utils.encode_cell({ r: signRow1, c: 0 })] = { t: 's', v: 'Người lập biểu' };
    ws[XLSX.utils.encode_cell({ r: signRow1, c: 8 })] = { t: 's', v: `Quang Bình, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}` };
    ws[XLSX.utils.encode_cell({ r: signRow2, c: 8 })] = { t: 's', v: 'XÁC NHẬN CỦA HIỆU TRƯỞNG' };
    ws[XLSX.utils.encode_cell({ r: signRow3, c: 0 })] = { t: 's', v: CAN_BO_Y_TE };
    ws[XLSX.utils.encode_cell({ r: signRow3, c: 8 })] = { t: 's', v: HIEU_TRUONG };

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 13 } },
      { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },
      { s: { r: 5, c: 3 }, e: { r: 6, c: 3 } },
      { s: { r: 5, c: 4 }, e: { r: 5, c: 5 } },
      { s: { r: 5, c: 6 }, e: { r: 5, c: 7 } },
      { s: { r: 5, c: 8 }, e: { r: 5, c: 9 } },
      { s: { r: 5, c: 10 }, e: { r: 5, c: 11 } },
      { s: { r: 5, c: 12 }, e: { r: 5, c: 13 } },
      { s: { r: signRow1, c: 0 }, e: { r: signRow1, c: 3 } },
      { s: { r: signRow1, c: 8 }, e: { r: signRow1, c: 13 } },
      { s: { r: signRow2, c: 8 }, e: { r: signRow2, c: 13 } },
      { s: { r: signRow3, c: 0 }, e: { r: signRow3, c: 3 } },
      { s: { r: signRow3, c: 8 }, e: { r: signRow3, c: 13 } }
    ];

    ws['!cols'] = [
      { wch: 6 }, { wch: 30 }, { wch: 9 }, { wch: 10 },
      { wch: 9 }, { wch: 12 }, { wch: 9 }, { wch: 12 },
      { wch: 9 }, { wch: 12 }, { wch: 9 }, { wch: 12 }, { wch: 9 }, { wch: 12 }
    ];

    // Styling
    for (let c = 0; c <= 4; c++) {
      const r0 = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[r0]) ws[r0].s = { font: { name: 'Times New Roman', sz: 14 }, alignment: { horizontal: 'left' } };
      const r1 = XLSX.utils.encode_cell({ r: 1, c });
      if (ws[r1]) ws[r1].s = { font: { name: 'Times New Roman', sz: 14, bold: true }, alignment: { horizontal: 'left' } };
    }
    for (let c = 0; c < 14; c++) {
      const ref = XLSX.utils.encode_cell({ r: 3, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = { font: { name: 'Times New Roman', sz: 14, bold: true }, alignment: { horizontal: 'center' } };
      const h6 = XLSX.utils.encode_cell({ r: 5, c });
      if (!ws[h6]) ws[h6] = { t: 's', v: '' };
      ws[h6].s = headerStyle;
      const h7 = XLSX.utils.encode_cell({ r: 6, c });
      if (!ws[h7]) ws[h7] = { t: 's', v: '' };
      ws[h7].s = headerStyle;
    }
    for (let r = dataStartRow; r <= totalRow; r++) {
      for (let c = 0; c < 14; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        const isTotal = r === totalRow;
        const val = ws[ref].v;
        const isNum = typeof val === 'number' || !!ws[ref].f;
        ws[ref].s = isTotal
          ? totalStyle
          : { ...dataStyle, alignment: { ...dataStyle.alignment, horizontal: (c === 0 || c === 2 || isNum) ? 'center' : 'left' } };
      }
    }
    for (const [r, c] of [[signRow1, 0], [signRow1, 8], [signRow2, 8], [signRow3, 0], [signRow3, 8]]) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (ws[ref]) ws[ref].s = { font: { name: 'Times New Roman', sz: 12, bold: r === signRow2 || c === 0 }, alignment: { horizontal: 'center' } };
    }

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: signRow3, c: 13 } });
    ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 };
    return ws;
  };

  const handleExportXLSX = (exportAll: boolean = false) => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);

    if (exportAll) {
      XLSX.utils.book_append_sheet(wb, createSoKhamBenhSheet(), 'SoKhamBenh');
      XLSX.utils.book_append_sheet(wb, createSoCapThuocSheet(), 'SoCapThuoc');
      XLSX.utils.book_append_sheet(wb, createBaoCaoThuocSheet(), 'BaoCaoThuoc');
      XLSX.writeFile(wb, `Ho_So_Y_Te_Hoc_Duong_${dateStr}.xlsx`);
      showNotificationMsg(lang === 'vi' ? '⚡ Đã xuất trọn bộ 3 sổ Y Tế ra file Excel .xlsx thành công!' : '⚡ Exported all 3 sheets to Excel .xlsx successfully!');
    } else {
      let sheetName = 'SoKhamBenh';
      let ws = createSoKhamBenhSheet();
      if (activeSheet === 'CAP_THUOC') {
        sheetName = 'SoCapThuoc';
        ws = createSoCapThuocSheet();
      } else if (activeSheet === 'BAO_CAO') {
        sheetName = 'BaoCaoThuoc';
        ws = createBaoCaoThuocSheet();
      }
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${sheetName}_${dateStr}.xlsx`);
      showNotificationMsg(lang === 'vi' ? `⚡ Đã xuất bảng ${sheetName} ra file Excel .xlsx thành công!` : `⚡ Exported sheet ${sheetName} to Excel .xlsx successfully!`);
    }
  };

  const handlePrint = () => window.print();

  const resetToDefault = () => {
    setLocalConfirm({
      isOpen: true,
      title: lang === 'vi' ? 'Khôi phục dữ liệu mặc định' : 'Reset Table Data',
      message: lang === 'vi'
        ? 'Bạn có muốn khôi phục dữ liệu bảng tính về trạng thái mặc định không? Mọi thay đổi hiện tại sẽ bị xóa.'
        : 'Are you sure you want to restore the spreadsheet data to defaults? This will erase all current changes.',
      onConfirm: () => {
        setSoKhambenhData([]);
        setPhatthuocData([]);
        setBaocaotonData([]);
      }
    });
  };

  return (
    <div className="bg-[#f3f2f1] dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-xs">

      {/* ================= TOOLBAR ================= */}
      <div className="bg-[#107c41] text-white p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight uppercase">
              {lang === 'vi' ? 'SỔ SÁCH Y TẾ HỌC ĐƯỜNG' : 'SCHOOL CLINIC RECORDS'}
            </h3>
            <p className="text-[10px] text-emerald-100 font-medium">
              {lang === 'vi' ? 'Sổ Khám Bệnh • Sổ Cấp Phát Thuốc • Báo Cáo Thuốc' : 'Medical Log • Dispensing Log • Drug Report'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white text-emerald-800 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 shadow-sm mr-2"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{notification}</span>
            </motion.div>
          )}

          {activeSheet === 'KHAM_BENH' && (
            <button
              onClick={() => syncSoCapThuoc(soKhambenhData, true)}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 border border-amber-500 rounded text-white font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title={lang === 'vi' ? 'Đồng bộ Sổ Khám Bệnh → Sổ Cấp Thuốc' : 'Sync Medical Log → Dispensing Log'}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Đồng Bộ' : 'Sync'}</span>
            </button>
          )}

          {activeSheet !== 'CAP_THUOC' && (
            <button
              onClick={activeSheet === 'KHAM_BENH' ? addKhamBenhRow : addBaoCaoRow}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 border border-emerald-600 rounded text-white font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Chèn Dòng' : 'Insert Row'}</span>
            </button>
          )}

          {activeSheet !== 'CAP_THUOC' && (
            <button
              onClick={deleteLastRow}
              className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 border border-red-600 rounded text-white font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Xóa Dòng' : 'Delete Row'}</span>
            </button>
          )}

          <button
            onClick={() => handleExportXLSX(false)}
            className="px-3 py-1.5 bg-emerald-900 hover:bg-black/40 border border-emerald-400/50 rounded text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Xuất bảng hiện tại ra tệp Excel .xlsx"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>{lang === 'vi' ? 'Xuất Excel (.xlsx)' : 'Export Sheet (.xlsx)'}</span>
          </button>

          <button
            onClick={() => handleExportXLSX(true)}
            className="px-3 py-1.5 bg-white text-[#107c41] hover:bg-emerald-50 rounded font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md border border-white/20"
            title="Xuất cả 3 sổ ra tệp Excel .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#107c41]" />
            <span>{lang === 'vi' ? 'Xuất Trọn Bộ (.xlsx)' : 'Export All (.xlsx)'}</span>
          </button>

          <button onClick={handlePrint} className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white font-bold transition flex items-center gap-1 cursor-pointer">
            <Printer className="w-4 h-4" />
            <span>{lang === 'vi' ? 'In Ấn' : 'Print'}</span>
          </button>

          <button onClick={resetToDefault} className="p-1.5 bg-black/20 hover:bg-black/30 rounded text-white transition cursor-pointer" title="Khôi phục mặc định">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= SHEET GRID ================= */}
      <div className="flex-1 overflow-x-auto p-4 bg-[#f3f2f1] dark:bg-zinc-900 overflow-y-auto max-h-[600px] print:max-h-none print:p-0 print:bg-white print:overflow-visible">
        <div className="min-w-[1100px] bg-white dark:bg-[#1E1D1D] p-8 border border-slate-300 dark:border-zinc-800 shadow-sm print:border-none print:shadow-none print:p-0">

          {/* ============ SỔ KHÁM BỆNH ============ */}
          {activeSheet === 'KHAM_BENH' && (
            <div className="space-y-4">
              <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-center">
                {lang === 'vi' ? 'SỔ KHÁM BỆNH' : 'MEDICAL EXAMINATION LOG'}
              </p>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium shadow-sm print:hidden">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {lang === 'vi'
                    ? '⚡ Nhập ở đây sẽ tự động cập nhật Sổ Cấp Phát Thuốc và Báo Cáo Thuốc (đã sử dụng tính theo tên thuốc trùng khớp).'
                    : '⚡ Entries here auto-update the Dispensing Log and the Drug Report (used quantity matched by drug name).'}
                </span>
              </div>

              <table className="w-full border-collapse border border-slate-400 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-center text-[11px] leading-tight">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-bold">
                    <th className="border border-slate-400 p-2 w-[36px]">STT</th>
                    <th className="border border-slate-400 p-2 min-w-[100px]">Ngày, tháng khám bệnh</th>
                    <th className="border border-slate-400 p-2 min-w-[130px]">Họ tên</th>
                    <th className="border border-slate-400 p-2 w-[70px]">Giới tính</th>
                    <th className="border border-slate-400 p-2 w-[70px]">Lớp</th>
                    <th className="border border-slate-400 p-2 min-w-[120px]">Địa chỉ</th>
                    <th className="border border-slate-400 p-2 min-w-[220px]">Triệu chứng</th>
                    <th className="border border-slate-400 p-2 min-w-[140px]">Chẩn đoán</th>
                    <th className="border border-slate-400 p-2 min-w-[180px]">Thuốc 1</th>
                    <th className="border border-slate-400 p-2 w-[60px]">SL1</th>
                    <th className="border border-slate-400 p-2 min-w-[180px]">Thuốc 2</th>
                    <th className="border border-slate-400 p-2 w-[60px]">SL2</th>
                    <th className="border border-slate-400 p-2 w-[40px] print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {soKhambenhData.map((row, index) => (
                    <tr key={index} className="hover:bg-emerald-50/40 dark:hover:bg-zinc-800/40">
                      <td className="border border-slate-300 bg-slate-50 dark:bg-zinc-900 p-2 font-bold font-mono">{index + 1}</td>
                      {(['ngayKham', 'hoTen', 'gioiTinh', 'lop', 'diaChi', 'trieuChung', 'chanDoan', 'thuoc1', 'sl1', 'thuoc2', 'sl2'] as (keyof SokhambenhRow)[]).map((key) => (
                        <td key={key} className="border border-slate-300 p-2">
                          <input
                            type={key === 'sl1' || key === 'sl2' ? 'number' : 'text'}
                            value={(row as any)[key]}
                            onChange={(e) => updateKhamBenhCell(index, key, e.target.value)}
                            className="w-full bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 px-1 text-left"
                          />
                        </td>
                      ))}
                      <td className="border border-slate-300 p-1 print:hidden">
                        <button onClick={() => syncStudentToSystem(row)} className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold cursor-pointer" title={lang === 'vi' ? 'Lưu học sinh vào hệ thống' : 'Save student to system'}>
                          ➜
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ============ SỔ CẤP PHÁT THUỐC (read-only, derived) ============ */}
          {activeSheet === 'CAP_THUOC' && (
            <div className="space-y-4">
              <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-center">
                {lang === 'vi' ? 'SỔ CẤP PHÁT THUỐC' : 'DRUG DISPENSING LOG'}
              </p>
              <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-[11px] text-slate-600 dark:text-zinc-300 font-medium print:hidden">
                {lang === 'vi'
                  ? 'Bảng này được tự động liên kết từ Sổ Khám Bệnh (chỉ đọc). Vào tab "Sổ Khám Bệnh" để chỉnh sửa.'
                  : 'This sheet mirrors the Medical Log (read-only). Edit entries in the "Medical Log" tab.'}
              </div>
              <table className="w-full border-collapse border border-slate-400 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-center text-[11px] leading-tight">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-bold">
                    <th className="border border-slate-400 p-2 w-[36px]">STT</th>
                    <th className="border border-slate-400 p-2 min-w-[100px]">Ngày</th>
                    <th className="border border-slate-400 p-2 min-w-[130px]">Họ tên</th>
                    <th className="border border-slate-400 p-2 w-[70px]">Lớp</th>
                    <th className="border border-slate-400 p-2 min-w-[140px]">Chẩn đoán</th>
                    <th className="border border-slate-400 p-2 min-w-[180px]">Tên thuốc, số lượng</th>
                    <th className="border border-slate-400 p-2 w-[60px]">SL1</th>
                    <th className="border border-slate-400 p-2 min-w-[180px]">Tên thuốc, số lượng</th>
                    <th className="border border-slate-400 p-2 w-[60px]">SL2</th>
                  </tr>
                </thead>
                <tbody>
                  {phatthuocData.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-slate-300 p-2 font-mono">{row.stt}</td>
                      <td className="border border-slate-300 p-2">{row.ngay}</td>
                      <td className="border border-slate-300 p-2 text-left">{row.hoTen}</td>
                      <td className="border border-slate-300 p-2">{row.lop}</td>
                      <td className="border border-slate-300 p-2 text-left">{row.chanDoan}</td>
                      <td className="border border-slate-300 p-2 text-left">{row.thuoc1}</td>
                      <td className="border border-slate-300 p-2 font-mono">{row.sl1}</td>
                      <td className="border border-slate-300 p-2 text-left">{row.thuoc2}</td>
                      <td className="border border-slate-300 p-2 font-mono">{row.sl2}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-extrabold">
                    <td className="border border-slate-300 p-2" colSpan={6}>{lang === 'vi' ? 'Tổng cộng' : 'Total'}</td>
                    <td className="border border-slate-300 p-2 font-mono">{phatthuocData.reduce((s, r) => s + (Number(r.sl1) || 0), 0)}</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2 font-mono">{phatthuocData.reduce((s, r) => s + (Number(r.sl2) || 0), 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ============ BÁO CÁO THUỐC ============ */}
          {activeSheet === 'BAO_CAO' && (
            <div className="space-y-4">
              <div className="text-center space-y-0.5">
                <p className="text-xs font-bold uppercase text-slate-600 dark:text-zinc-300">{DON_VI_CAP_TREN}</p>
                <p className="text-sm font-extrabold uppercase text-slate-900 dark:text-white">{TEN_TRUONG}</p>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white uppercase mt-2">
                  {lang === 'vi' ? `BÁO CÁO THUỐC THÁNG ${String(new Date().getMonth() + 1).padStart(2, '0')} NĂM ${new Date().getFullYear()}` : 'MONTHLY DRUG REPORT'}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-400 dark:border-zinc-700 text-slate-800 dark:text-slate-100 text-center text-[11px] leading-tight">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-bold">
                    <th className="border border-slate-400 p-2 w-[36px]" rowSpan={2}>STT</th>
                    <th className="border border-slate-400 p-2 min-w-[180px]" rowSpan={2}>Tên thuốc, nồng độ, hàm lượng</th>
                    <th className="border border-slate-400 p-2 w-[70px]" rowSpan={2}>Đơn vị tính</th>
                    <th className="border border-slate-400 p-2 w-[80px]" rowSpan={2}>Đơn giá</th>
                    <th className="border border-slate-400 p-2" colSpan={2}>Tồn cuối kỳ</th>
                    <th className="border border-slate-400 p-2" colSpan={2}>Nhập trong tháng</th>
                    <th className="border border-slate-400 p-2" colSpan={2}>Tổng cộng</th>
                    <th className="border border-slate-400 p-2" colSpan={2}>Đã sử dụng</th>
                    <th className="border border-slate-400 p-2" colSpan={2}>Còn lại</th>
                    <th className="border border-slate-400 p-2 w-[36px] print:hidden" rowSpan={2}></th>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-bold">
                    <th className="border border-slate-400 p-1 w-[70px]">Lượng</th>
                    <th className="border border-slate-400 p-1 w-[70px]">Lượng</th>
                    <th className="border border-slate-400 p-1 w-[70px]">Lượng</th>
                    <th className="border border-slate-400 p-1 w-[70px]">Lượng</th>
                    <th className="border border-slate-400 p-1 w-[70px]">Lượng</th>
                    <th className="border border-slate-400 p-1"></th>
                    <th className="border border-slate-400 p-1"></th>
                    <th className="border border-slate-400 p-1"></th>
                    <th className="border border-slate-400 p-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {baoCaoComputed.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-slate-300 p-2 font-mono">{index + 1}</td>
                      <td className="border border-slate-300 p-2 text-left">
                        <input type="text" value={row.tenThuoc} onChange={(e) => updateBaoCaoCell(index, 'tenThuoc', e.target.value)} className="w-full bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 text-left" />
                      </td>
                      <td className="border border-slate-300 p-2">
                        <input type="text" value={row.donVi} onChange={(e) => updateBaoCaoCell(index, 'donVi', e.target.value)} className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700" />
                      </td>
                      <td className="border border-slate-300 p-2">
                        <input type="number" value={row.donGia} onChange={(e) => updateBaoCaoCell(index, 'donGia', e.target.value)} className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-mono" />
                      </td>
                      <td className="border border-slate-300 p-2">
                        <input type="number" value={row.tonCuoiKy} onChange={(e) => updateBaoCaoCell(index, 'tonCuoiKy', e.target.value)} className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-mono" />
                      </td>
                      <td className="border border-slate-300 p-2">
                        <input type="number" value={row.nhapTrongThang} onChange={(e) => updateBaoCaoCell(index, 'nhapTrongThang', e.target.value)} className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-mono" />
                      </td>
                      <td className="border border-slate-300 p-2 font-mono bg-slate-50 dark:bg-zinc-900">{row.tongCong}</td>
                      <td className="border border-slate-300 p-2 font-mono bg-slate-50 dark:bg-zinc-900">{row.daSuDung}</td>
                      <td className="border border-slate-300 p-2 font-mono bg-slate-50 dark:bg-zinc-900">{row.conLai}</td>
                      <td className="border border-slate-300 p-1 print:hidden"></td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 dark:bg-zinc-800 font-extrabold">
                    <td className="border border-slate-300 p-2" colSpan={2}>{lang === 'vi' ? 'Tổng cộng' : 'Total'}</td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2"></td>
                    <td className="border border-slate-300 p-2 font-mono">{baoCaoComputed.reduce((s, r) => s + r.tonCuoiKy, 0)}</td>
                    <td className="border border-slate-300 p-2 font-mono">{baoCaoComputed.reduce((s, r) => s + r.nhapTrongThang, 0)}</td>
                    <td className="border border-slate-300 p-2 font-mono">{baoCaoComputed.reduce((s, r) => s + r.tongCong, 0)}</td>
                    <td className="border border-slate-300 p-2 font-mono">{baoCaoComputed.reduce((s, r) => s + r.daSuDung, 0)}</td>
                    <td className="border border-slate-300 p-2 font-mono">{baoCaoComputed.reduce((s, r) => s + r.conLai, 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM TABS ================= */}
      <div className="bg-[#f3f2f1] dark:bg-zinc-800/80 border-t border-slate-300 dark:border-zinc-700 p-1 flex items-center justify-between select-none print:hidden">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSheet('KHAM_BENH')}
            className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${activeSheet === 'KHAM_BENH' ? 'bg-white dark:bg-[#1E1D1D] text-[#107c41] border-[#107c41] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white border-transparent'}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Sổ Khám Bệnh</span>
          </button>
          <button
            onClick={() => setActiveSheet('CAP_THUOC')}
            className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${activeSheet === 'CAP_THUOC' ? 'bg-white dark:bg-[#1E1D1D] text-[#107c41] border-[#107c41] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white border-transparent'}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <span>Sổ Cấp Phát Thuốc</span>
          </button>
          <button
            onClick={() => setActiveSheet('BAO_CAO')}
            className={`px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${activeSheet === 'BAO_CAO' ? 'bg-white dark:bg-[#1E1D1D] text-[#107c41] border-[#107c41] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white border-transparent'}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <span>Báo Cáo Thuốc</span>
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-mono font-bold px-3 uppercase shrink-0">
          Excel Mode: {activeSheet} • Ready
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      <AnimatePresence>
        {localConfirm && localConfirm.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocalConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md bg-white dark:bg-[#252423] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 flex flex-col space-y-4 text-slate-800 dark:text-white"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{localConfirm.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">{localConfirm.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setLocalConfirm(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-slate-300 rounded-xl transition-all font-bold text-xs cursor-pointer">
                  {lang === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => { localConfirm.onConfirm(); setLocalConfirm(null); }}
                  className="px-4.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold text-xs shadow-md shadow-red-500/10 cursor-pointer"
                >
                  {lang === 'vi' ? 'Khôi phục' : 'Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
