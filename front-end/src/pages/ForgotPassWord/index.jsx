import { useState } from "react";
import Header from "../../components/Header";
import { requestPasswordReset, resetPassword } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const steps = [
    { id: 1, label: "Nhận mã" },
    { id: 2, label: "Xác thực" },
    { id: 3, label: "Đặt lại" },
  ];

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";

  const buttonClassName =
    "w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await requestPasswordReset({ email });

      setMessage(response.data?.message || "Đã gửi mã xác thực đến email của bạn.");
      setStep(2);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resetPassword({ email, code, newPassword });

      setMessage(response.data?.message || "Đặt lại mật khẩu thành công!");
      navigate("/login");
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (resetError) {
      setError(
        resetError.response?.data?.message ||
          "Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã xác thực rồi thử lại."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-900 px-6 py-10 text-white shadow-2xl shadow-slate-900/10 sm:px-10 sm:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.18),_transparent_32%)]" />
            <div className="relative max-w-xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-sky-100 backdrop-blur">
                PetShop Account Recovery
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Khôi phục mật khẩu nhanh, an toàn, rõ ràng từng bước.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                Nhập email, xác thực mã OTP và tạo mật khẩu mới trong một luồng
                mạch lạc. Giao diện này được tối ưu để bạn không bị rối khi đặt
                lại tài khoản.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {steps.map((item) => {
                  const active = step === item.id;
                  const completed = step > item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border px-4 py-3 text-sm transition ${
                        active
                          ? "border-sky-400/60 bg-white/15 text-white"
                          : completed
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                            : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                        Bước {item.id}
                      </div>
                      <div className="mt-1 font-semibold">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Quên mật khẩu</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step === 1 && "Nhập email để nhận mã xác thực qua email."}
                {step === 2 && "Nhập mã OTP vừa được gửi tới hộp thư của bạn."}
                {step === 3 && "Tạo mật khẩu mới để hoàn tất quá trình khôi phục."}
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {step === 1 && (
              <form className="space-y-5" onSubmit={handleEmailSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClassName}
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className={buttonClassName}>
                  {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-5" onSubmit={handleOtpSubmit}>
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={inputClassName}
                    placeholder="Nhập mã OTP đã gửi đến email của bạn"
                    required
                  />
                </div>

                <button type="submit" className={buttonClassName}>
                  Xác thực OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClassName}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClassName}
                    placeholder="Xác nhận mật khẩu mới"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className={buttonClassName}>
                  {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
};
export default ForgotPassword;
