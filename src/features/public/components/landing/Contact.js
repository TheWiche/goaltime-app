import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Button, TextField, Textarea, Toast } from "shared/components/ui";
import { reveal, Section, SectionIntro } from "features/public/components/landing/primitives";

// Configurables por entorno (REACT_APP_*); los valores por defecto son los de producción actual.
const RECAPTCHA_SITE_KEY =
  process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LfAcwgsAAAAAEZJBVAhHWN1xjmipXMjRk7qkUPw";
const FORMSPREE_ENDPOINT =
  process.env.REACT_APP_FORMSPREE_ENDPOINT || "https://formspree.io/f/mrbrzboy";

const MAPS_URL = "https://www.google.com/maps?q=Universidad+de+La+Guajira,+Bloque+8,+Riohacha,+Colombia";

const EMPTY_FORM = { name: "", email: "", message: "" };

function Contact() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const recaptchaRef = useRef(null);
  // En pantallas muy estrechas el widget normal (304px) no cabe: se usa el compacto.
  const [compactCaptcha, setCompactCaptcha] = useState(false);
  useEffect(() => {
    setCompactCaptcha(Boolean(window.matchMedia?.("(max-width: 359px)").matches));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !recaptchaValue) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...formData, "g-recaptcha-response": recaptchaValue }),
      });
      if (res.ok) {
        setFormData(EMPTY_FORM);
        setToast({ open: true, type: "success", message: "Mensaje enviado. Gracias por escribirnos." });
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
    <Section id="contacto" labelledBy="contacto-title" tone="canvas">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <SectionIntro index="06" eyebrow="Contacto" titleId="contacto-title" title="Escríbenos." stacked>
            ¿Dudas sobre una reserva o quieres publicar tu cancha? Si eres dueño, indícalo en el mensaje para
            activar tu perfil de asociado.
          </SectionIntro>

          <ul className="mt-10 divide-y divide-line border-y border-line" {...reveal(60)}>
            <li className="flex gap-4 py-5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-fg-subtle">Correo</p>
                <a
                  href="mailto:equipo@goaltime.site"
                  className="mt-0.5 inline-block break-all rounded-sm text-[15px] font-medium text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                >
                  equipo@goaltime.site
                </a>
              </div>
            </li>
            <li className="flex gap-4 py-5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs text-fg-subtle">Dónde estamos</p>
                <p className="mt-0.5 text-[15px] font-medium text-fg">Universidad de La Guajira</p>
                <p className="text-[13px] leading-5 text-fg-muted">Bloque 8 – Ingeniería · Riohacha, La Guajira, Colombia</p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                >
                  Ver en Google Maps
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(se abre en una pestaña nueva)</span>
                </a>
              </div>
            </li>
          </ul>
        </div>

        <div className="min-w-0 lg:col-span-7" {...reveal(100)}>
          <form
            onSubmit={handleSubmit}
            aria-labelledby="contact-form-title"
            className="rounded-lg border border-line bg-white"
          >
            <div className="border-b border-line px-5 py-4 sm:px-6">
              <h3 id="contact-form-title" className="text-sm font-semibold text-fg-strong">
                Envíanos un mensaje
              </h3>
            </div>
            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <Textarea
                label="Mensaje"
                name="message"
                rows={5}
                placeholder="¿En qué podemos ayudarte?"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <div className="max-w-full overflow-x-auto">
                <ReCAPTCHA
                  key={compactCaptcha ? "compact" : "normal"}
                  ref={recaptchaRef}
                  size={compactCaptcha ? "compact" : "normal"}
                  sitekey={RECAPTCHA_SITE_KEY}
                  hl="es"
                  onChange={setRecaptchaValue}
                  onExpired={() => setRecaptchaValue(null)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-line bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-fg-subtle">Completa la verificación para poder enviar.</p>
              <Button type="submit" size="lg" loading={isSubmitting} disabled={!recaptchaValue}>
                {isSubmitting ? "Enviando…" : "Enviar mensaje"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Section>
  );
}

export default Contact;
