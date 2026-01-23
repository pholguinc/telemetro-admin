import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import fondoImage from "../../assets/fondo_telemtro.png";

// Types
interface LoginFormData {
  email: string;
  pin: string;
}

interface FormErrors {
  email?: string;
  pin?: string;
  submit?: string;
}

const Login: React.FC = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const [showLoginCard, setShowLoginCard] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    pin: "",
  });
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingrese un correo electrónico válido";
    }

    if (!formData.pin) {
      newErrors.pin = "El PIN es requerido";
    } else if (formData.pin.length < 4) {
      newErrors.pin = "El PIN debe tener al menos 4 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.pin);

    if (!result.success) {
      setErrors({ submit: result.error });
    }
  };

  const handleTogglePin = (): void => {
    setShowPin(!showPin);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${fondoImage})` }}
    >
      {/* Botón inicial */}
      {!showLoginCard ? (
        <button
          onClick={() => setShowLoginCard(true)}
          className="bg-white hover:bg-gray-50 text-primary-500 font-bold py-4 px-8 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <LogIn className="h-6 w-6 inline-block mr-2" />
          Acceder al Panel
        </button>
      ) : (
        <div className="w-full max-w-md animate-scale-in">
          {/* Card de login */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Panel Telemetro
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo de Correo */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="usuario@ejemplo.com"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                      }`}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Campo de PIN */}
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    id="pin"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="123456"
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${errors.pin
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                      }`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePin}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                    aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                  >
                    {showPin ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.pin && (
                  <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                )}
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center mt-6"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Texto inferior */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Usa tus credenciales de administrador
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;