import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LuEye, LuEyeOff, LuShieldCheck } from "react-icons/lu";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Username atau password salah.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-xl px-10 py-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight font-jakarta text-[#14201A]">
            Sumber<span className="text-[#1F6B3F]">Arum</span>
          </h1>
          <p className="mt-2 text-sm text-[#5B6B61]">
            Masuk untuk mengelola data bank sampah.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-[#3F4B44] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all"
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#3F4B44] mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-2.5 pr-11 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-center">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Divider & Footer badge */}
        <div className="mt-8 pt-6 border-t border-[#F2F4F3] flex items-center justify-center gap-1.5 text-xs text-[#5B6B61]">
          <LuShieldCheck size={16} className="text-[#5B6B61]" />
          <span>Akses khusus petugas bank sampah</span>
        </div>
      </div>
    </div>
  );
}
