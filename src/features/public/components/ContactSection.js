import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Toast } from "shared/components/ui";
import { useSectionEntrance } from "shared/hooks/useGSAPAnimations";

const RECAPTCHA_SITE_KEY = "6LfAcwgsAAAAAEZJBVAhHWN1xjmipXMjRk7qkUPw";

const contactInfo = [
  {
    emoji: "📍",
    label: "Universidad de La Guajira, Bloque 8 - Ingeniería",
    sub: "Riohacha, Colombia · Km 3+354 vía Maicao, La Guajira",
  },
  {
    emoji: "📞",
    label: "+57 (xxx) xxx-xxxx",
    sub: "Lun–Vie: 8:00–20:00 · Sáb–Dom: 8:00–16:00 · Festivos: 8:00–16:00",
  },
  {
    emoji: "✉️",
    label: "equipo@goaltime.site",
    sub: null,
  },
];

function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const recaptchaRef = useRef(null);
  const headerRef = useSectionEntrance({ y: 20 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaValue) { setCaptchaError(true); return; }
    setIsSubmitting(true);
    setCaptchaError(false);
    try {
      const res = await fetch("https://formspree.io/f/mrbrzboy", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...formData, "g-recaptcha-response": recaptchaValue }),
      });
      if (res.ok) {
        setFormData({ name: "", email: "", message: "" });
        setRecaptchaValue(null);
        recaptchaRef.current?.reset();
        setToast({ open: true, type: "success", message: "¡Mensaje enviado! Te responderemos pronto." });
      } else {
        setToast({ open: true, type: "error", message: "Hubo un problema al enviar. Inténtalo de nuevo." });
      }
    } catch {
      setToast({ open: true, type: "error", message: "Error de red. Verifica tu conexión." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-goaltime focus:ring-2 focus:ring-goaltime/20 transition-all bg-white disabled:opacity-60";

  return (
    <section id="contacto" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div ref={headerRef} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Contáctanos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información de contacto */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold text-goaltime mb-3">Información de Contacto</h3>
              <div className="border-b border-gray-100 mb-4" />
            </div>
            {contactInfo.map(({ emoji, label, sub }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-sm font-medium text-dark">{label}</p>
                  {sub && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sub}</p>}
                </div>
              </div>
            ))}
            <div className="mt-2">
              <h4 className="text-sm font-bold text-goaltime mb-2">Ubicación en el Mapa</h4>
              <div className="w-full h-48 rounded-xl overflow-hidden">
                <iframe
                  title="Ubicación Universidad de La Guajira"
                  src="https://www.google.com/maps?q=Universidad+de+La+Guajira,+Bloque+8,+Riohacha,+Colombia&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="text-lg font-bold text-goaltime mb-3">Envíanos un Mensaje</h3>
            <div className="border-b border-gray-100 mb-4" />
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className={inputClass}
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input
                className={inputClass}
                type="email"
                name="email"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <textarea
                className={`${inputClass} resize-none`}
                name="message"
                placeholder="Mensaje"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(v) => { setRecaptchaValue(v); setCaptchaError(false); }}
                  onExpired={() => setRecaptchaValue(null)}
                />
              </div>
              {captchaError && (
                <p className="text-xs text-red-500 text-center">Por favor, completa el reCAPTCHA para continuar.</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !recaptchaValue}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar Mensaje ✉️"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </section>
  );
}

export default ContactSection;
