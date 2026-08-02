import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { serverUrl } from "../App";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1 — request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/auth/send-otp`,
        { email: formData.email },
        { withCredentials: true }
      );
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/auth/verify-otp`,
        { email: formData.email, otp: formData.otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/auth/reset-password`,
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        },
        { withCredentials: true }
      );

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 scale-85 md:scale-94">
        {success ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 text-center -mt-3 mb-1">
              Password reset!
            </h1>
            <p className="text-sm text-gray-500 text-center">
              Redirecting you to login...
            </p>
          </>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition ${
                    s <= step ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4 border border-red-200">
                {error}
              </div>
            )}

            {/* STEP 1 — Email */}
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
                  Forgot password?
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Enter your email and we'll send you an OTP to reset it.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-orange-500 font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              </>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
                  Verify OTP
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Enter the OTP sent to{" "}
                  <span className="font-medium">{formData.email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      OTP
                    </label>
                    <div className="relative">
                      <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 tracking-widest"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                  Didn't get an OTP?{" "}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-orange-500 font-medium hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </>
            )}

            {/* STEP 3 — New Password */}
            {step === 3 && (
              <>
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
                  Create new password
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Choose a new password for your account.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;