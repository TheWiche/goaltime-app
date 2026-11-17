import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Clock, Mail, MapPin } from "lucide-react";
import { Button, TextField, Textarea, Toast } from "shared/components/ui";
import SectionHeader from "features/public/components/SectionHeader";

// Configurables por entorno (REACT_APP_*); los valores por defecto son los de producción actual.
const RECAPTCHA_SITE_KEY =
  process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LfAcwgsAAAAAEZJBVAhHWN1xjmipXMjRk7qkUPw";
const FORMSPREE_ENDPOINT =
  process.env.REACT_APP_FORMSPREE_ENDPOINT || "https://formspree.io/f/mrbrzboy";

const contactInfo = [
  {
    icon: MapPin,
    label: "Universidad de La Guajira, Bloque 8 - Ingeniería",
    sub: "Riohacha, Colombia · Km 3+354 vía Maicao, La Guajira",
  },
  {
    icon: Mail,
    label: "equipo@goaltime.site",
    href: "mailto:equipo@goaltime.site",
  },
  {
    icon: Clock,
    label: "Horario de atención",
    sub: "Lun–Vie: 8:00–20:00 · Sáb–Dom y festivos: 8:00–16:00",
  },
];

const EMPTY_FORM = { name: "", email: "", message: "" };

function ContactSection() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!recaptchaValue) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...formData, "g-recaptcha-response": recaptchaValue }),
      });
      if (res.ok) {
        setFormData(EMPTY_FORM);
        setToast({ open: true, type: "success", message: "¡Mensaje enviado! Te responderemos pronto." });
      } else {
        setToast({ open: true, type: "error", message: "Hubo un problema al enviar. Inténtalo de nuevo." });
      }
    } catch {
      setToast({ open: true, type: "error", message: "Error de red. Verifica tu conexión." });
    } finally {
      // El token de reCAPTCHA es de un solo uso: se reinicia haya salido bien o mal.
      setRecaptchaValue(null);
      recaptchaRef.current?.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="scroll-mt-14 border-t border-line bg-white py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Contacto"
          title="Contáctanos"
          description="¿Tienes preguntas o quieres registrar tu cancha? Escríbenos y te respondemos pronto."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h3 className="text-sm font-semibold text-fg-strong">Información de contacto</h3>
            </div>
            <div className="space-y-4 p-5">
              {contactInfo.map(({ icon: Icon, label, sub, href }) => (
                <div key={label} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-zinc-50 text-fg-subtle">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    {href ? (
                      <a href={href} className="break-words text-sm font-medium text-primary-600 hover:underline">
                        {label}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-fg">{label}</p>
                    )}
                    {sub && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{sub}</p>}
                  </div>
                </div>
              ))}
              <div className="h-48 overflow-hidden rounded-md border border-line">
                <iframe
                  title="Ubicación Universidad de La Guajira"
                  src="https://www.google.com/maps?q=Universidad+de+La+Guajira,+Bloque+8,+Riohacha,+Colombia&output=embed"
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h3 className="text-sm font-semibold text-fg-strong">Envíanos un mensaje</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <TextField
                label="Nombre"
                name="name"
                autoComplete="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <TextField
                label="Correo electrónico"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="nombre@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <Textarea
                label="Mensaje"
                name="message"
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />

              <div className="max-w-full overflow-x-auto">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  hl="es"
                  onChange={setRecaptchaValue}
                  onExpired={() => setRecaptchaValue(null)}
                />
              </div>

              <Button type="submit" size="lg" fullWidth loading={isSubmitting} disabled={!recaptchaValue}>
                {isSubmitting ? "Enviando…" : "Enviar mensaje"}
              </Button>
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
