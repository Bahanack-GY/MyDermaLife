import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { useLogin } from '../hooks/useAuth';
import loginImage from '../assets/Gemini_Generated_Image_azorfwazorfwazor.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side - Image & Brand */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative bg-gray-900"
      >
        <img
          src={loginImage}
          alt="Dermatology Consultation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#7A4429]/90 to-transparent opacity-90" />

        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">
              Elevating <br />Dermatology Care
            </h2>
            <div className="w-20 h-1 bg-[#FDDDCB] mb-6 rounded-full"></div>
            <p className="text-xl text-[#FDDDCB] font-light max-w-md leading-relaxed">
              Managing patient journeys, appointments, and treatments with precision and elegance.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h1 className="text-4xl font-serif font-bold text-[#2d2d2d] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-lg">
              Please sign in to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`block text-sm font-medium transition-colors duration-200 ${focusedInput === 'email' ? 'text-[#9B563A]' : 'text-gray-600'}`}
              >
                Email Address
              </label>
              <motion.div
                className={`relative group rounded-xl border transition-all duration-300 ${focusedInput === 'email' ? 'border-[#9B563A] ring-4 ring-[#9B563A]/10 bg-white' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'}`}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdEmail className={`text-xl transition-colors duration-200 ${focusedInput === 'email' ? 'text-[#9B563A]' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="name@example.com"
                  disabled={isPending}
                  className="block w-full pl-11 pr-4 py-3.5 bg-transparent border-none rounded-xl focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors"
                />
              </motion.div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium transition-colors duration-200 ${focusedInput === 'password' ? 'text-[#9B563A]' : 'text-gray-600'}`}
                >
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-[#9B563A] hover:text-[#7A4429] transition-colors">
                  Forgot password?
                </a>
              </div>
              <motion.div
                className={`relative group rounded-xl border transition-all duration-300 ${focusedInput === 'password' ? 'border-[#9B563A] ring-4 ring-[#9B563A]/10 bg-white' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'}`}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className={`text-xl transition-colors duration-200 ${focusedInput === 'password' ? 'text-[#9B563A]' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="Enter your password"
                  disabled={isPending}
                  className="block w-full pl-11 pr-12 py-3.5 bg-transparent border-none rounded-xl focus:ring-0 text-gray-900 placeholder-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer transition-colors text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="text-xl" />
                  ) : (
                    <MdVisibility className="text-xl" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                disabled={isPending}
                className="h-4 w-4 text-[#9B563A] focus:ring-[#9B563A] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isPending}
              className="w-full bg-[#9B563A] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg shadow-[#9B563A]/20 hover:shadow-[#9B563A]/30 hover:bg-[#8A4C32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B563A] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button disabled className="text-[#9B563A] font-medium hover:text-[#7A4429] cursor-not-allowed">
                Contact Administrator
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
