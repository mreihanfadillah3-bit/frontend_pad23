import { useState, useRef, useEffect } from "react";
import { LuChevronLeft, LuChevronRight, LuChevronDown } from "react-icons/lu";

export const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MODE_OPTIONS = [
  { key: "semua", label: "Semua" },
  { key: "bulan", label: "Bulan" },
  { key: "tahun", label: "Tahun" },
];

/**
 * Filter periode (Semua / Bulan / Tahun) dengan gaya seragam seperti Dashboard.
 */
export default function PeriodFilter({
  mode,
  onModeChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  availableMonths = null,
  availableYears = null,
  placement = "bottom",
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);

  const pickerRef = useRef(null);
  const modeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
      if (modeRef.current && !modeRef.current.contains(e.target)) {
        setIsModeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const periodLabel =
    mode === "tahun" ? String(year) : `${MONTHS_ID[month]} ${year}`;

  const currentModeLabel =
    MODE_OPTIONS.find((opt) => opt.key === mode)?.label ?? "Semua";

  function handlePrev() {
    if (mode === "tahun") {
      onYearChange(year - 1);
    } else if (mode === "bulan") {
      if (month === 0) {
        onMonthChange(11);
        onYearChange(year - 1);
      } else {
        onMonthChange(month - 1);
      }
    }
  }

  function handleNext() {
    if (mode === "tahun") {
      onYearChange(year + 1);
    } else if (mode === "bulan") {
      if (month === 11) {
        onMonthChange(0);
        onYearChange(year + 1);
      } else {
        onMonthChange(month + 1);
      }
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs sm:text-sm text-[#14201A]">
        Menampilkan data periode
      </span>

      {mode !== "semua" && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44] cursor-pointer"
            title={mode === "tahun" ? "Tahun sebelumnya" : "Bulan sebelumnya"}
          >
            <LuChevronLeft size={18} strokeWidth={2} />
          </button>

          {/* Month / Year Picker Dropdown */}
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsPickerOpen((prev) => !prev);
                setIsModeOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#DDE2DF] bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#14201A] hover:bg-[#F6F8F7] transition-colors cursor-pointer"
            >
              {periodLabel}
              <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
            </button>

            {isPickerOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-0 ${
                  placement === "top" ? "bottom-10" : "top-10"
                } z-50 w-72 bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-4`}
              >
                {mode === "tahun" ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F1] mb-3">
                      <button
                        type="button"
                        onClick={() => onYearChange(year - 1)}
                        className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                        aria-label="Tahun sebelumnya"
                      >
                        <LuChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold text-[#14201A] font-jakarta">
                        {year}
                      </span>
                      <button
                        type="button"
                        onClick={() => onYearChange(year + 1)}
                        className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                        aria-label="Tahun berikutnya"
                      >
                        <LuChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[year - 1, year, year + 1].map((yr) => {
                        const isSelected = yr === year;
                        const hasInfo = availableYears instanceof Set;
                        const yearHasData = hasInfo ? availableYears.has(yr) : true;
                        return (
                          <button
                            key={yr}
                            type="button"
                            disabled={hasInfo && !yearHasData}
                            onClick={() => {
                              onYearChange(yr);
                              setIsPickerOpen(false);
                            }}
                            title={
                              hasInfo
                                ? yearHasData
                                  ? "Ada data"
                                  : "Tidak ada data"
                                : undefined
                            }
                            className={`py-2 px-1 min-h-12 flex flex-col items-center justify-center gap-1 text-xs rounded-lg font-medium transition text-center ${
                              isSelected
                                ? "bg-[#1F6B3F] text-white font-semibold"
                                : yearHasData
                                ? "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F] cursor-pointer"
                                : "text-[#C4CCC7] cursor-not-allowed"
                            }`}
                          >
                            <span>{yr}</span>
                            {hasInfo && (
                              <span
                                aria-hidden="true"
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected && yearHasData
                                    ? "bg-white"
                                    : yearHasData
                                    ? "bg-[#1F6B3F]"
                                    : "bg-transparent"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {availableYears instanceof Set && (
                      <div className="flex items-center gap-3 pt-3 mt-2 border-t border-[#F0F2F1] text-[11px] text-[#5B6B61]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B3F]" />
                          Ada data
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DDE2DF]" />
                          Tidak ada data
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F1] mb-3">
                      <button
                        type="button"
                        onClick={() => onYearChange(year - 1)}
                        className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                        aria-label="Tahun sebelumnya"
                      >
                        <LuChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold text-[#14201A] font-jakarta">
                        {year}
                      </span>
                      <button
                        type="button"
                        onClick={() => onYearChange(year + 1)}
                        className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                        aria-label="Tahun berikutnya"
                      >
                        <LuChevronRight size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS_ID.map((mName, idx) => {
                        const isSelected = month === idx;
                        const hasInfo = availableMonths instanceof Set;
                        const monthHasData = hasInfo ? availableMonths.has(idx) : true;
                        return (
                          <button
                            key={mName}
                            type="button"
                            disabled={hasInfo && !monthHasData}
                            onClick={() => {
                              onMonthChange(idx);
                              setIsPickerOpen(false);
                            }}
                            title={
                              hasInfo
                                ? monthHasData
                                  ? "Ada data"
                                  : "Tidak ada data"
                                : undefined
                            }
                            className={`py-2 px-1 min-h-12 flex flex-col items-center justify-center gap-1 text-xs rounded-lg font-medium transition text-center ${
                              isSelected
                                ? "bg-[#1F6B3F] text-white font-semibold"
                                : monthHasData
                                ? "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F] cursor-pointer"
                                : "text-[#C4CCC7] cursor-not-allowed"
                            }`}
                          >
                            <span>{mName.slice(0, 3)}</span>
                            {hasInfo && (
                              <span
                                aria-hidden="true"
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected && monthHasData
                                    ? "bg-white"
                                    : monthHasData
                                    ? "bg-[#1F6B3F]"
                                    : "bg-transparent"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {availableMonths instanceof Set && (
                      <div className="flex items-center gap-3 pt-3 mt-2 border-t border-[#F0F2F1] text-[11px] text-[#5B6B61]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B3F]" />
                          Ada data
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DDE2DF]" />
                          Tidak ada data
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44] cursor-pointer"
            title={mode === "tahun" ? "Tahun berikutnya" : "Bulan berikutnya"}
          >
            <LuChevronRight size={18} strokeWidth={2} />
          </button>
        </>
      )}

      {/* Period Mode Button (Semua / Bulan / Tahun) */}
      <div className="relative" ref={modeRef}>
        <button
          type="button"
          onClick={() => {
            setIsModeOpen((prev) => !prev);
            setIsPickerOpen(false);
          }}
          className="h-8 px-3.5 flex items-center gap-1.5 justify-center rounded-lg border border-[#DDE2DF] bg-white text-xs sm:text-sm font-medium text-[#14201A] hover:bg-[#F6F8F7] transition cursor-pointer"
        >
          <span>{currentModeLabel}</span>
          <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
        </button>

        {isModeOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute left-0 ${
              placement === "top" ? "bottom-10" : "top-10"
            } z-50 w-28 bg-white rounded-xl border border-[#DDE2DF] shadow-xl p-1.5 space-y-1`}
          >
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onModeChange(opt.key);
                  setIsModeOpen(false);
                }}
                className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  mode === opt.key
                    ? "bg-[#1F6B3F] text-white font-semibold"
                    : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
