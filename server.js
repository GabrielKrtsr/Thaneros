const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const site = require("./config/site.config");

require("dotenv").config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public"), { maxAge: "7d" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "connect-src": ["'self'"],
        "frame-ancestors": ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.currentPath = req.path;
  next();
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.redirect("/contact?status=rate-limited");
  }
});

const sanitize = (value) =>
  String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const buildMailTransport = () => {
  const {
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    SMTP_REJECT_UNAUTHORIZED,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS
  } = process.env;

  const rejectUnauthorized = SMTP_REJECT_UNAUTHORIZED !== "false";

  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized
      },
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });
  }

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === "true",
      tls: {
        rejectUnauthorized
      },
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return null;
};

app.get("/", (req, res) => {
  res.render("pages/home", {
    title: "Thaneros | Site web et visibilite Google",
    description: "Je cree des sites web qui attirent des clients sur Google, avec un accompagnement simple et humain.",
    status: req.query.status || ""
  });
});

app.get("/services", (req, res) => {
  res.render("pages/services", {
    title: "Services | Thaneros",
    description: "Creation de site, refonte et SEO integre pour t'aider a etre trouve et choisi."
  });
});

app.get("/realisations", (req, res) => {
  res.render("pages/realisations", {
    title: "Realisations | Thaneros",
    description: "Des exemples de sites penses pour rassurer, convaincre et transformer les visites en prises de contact."
  });
});

app.get("/a-propos", (req, res) => {
  res.render("pages/about", {
    title: "A propos | Thaneros",
    description: "Une approche simple, humaine et orientee resultat pour creer un site utile a ton activite."
  });
});

app.get("/contact", (req, res) => {
  res.render("pages/contact", {
    title: "Contact | Thaneros",
    description: "Parle-moi de ton projet et je t'expliquerai ce qu'il est possible de faire, simplement.",
    status: req.query.status || ""
  });
});

app.post("/contact", contactLimiter, async (req, res) => {
  try {
    const fullname = sanitize(req.body.fullname);
    const email = sanitize(req.body.email);
    const company = sanitize(req.body.company);
    const projectType = sanitize(req.body.projectType);
    const message = sanitize(req.body.message);
    const website = sanitize(req.body.website);

    if (website) {
      return res.redirect("/contact?status=ok");
    }

    if (!fullname || !email) {
      return res.redirect("/contact?status=invalid");
    }

    if (!isValidEmail(email)) {
      return res.redirect("/contact?status=invalid");
    }

    const transporter = buildMailTransport();
    const to = process.env.CONTACT_TO || site.email;
    const from = process.env.CONTACT_FROM || process.env.GMAIL_USER || "no-reply@thaneros.fr";

    const text = [
      "Nouveau message reçu depuis le site Thaneros",
      "==========================================",
      "",
      `Nom: ${fullname}`,
      `Email: ${email}`,
      `Entreprise : ${company || "Non renseignée"}`,
      `Type de projet : ${projectType || "Non renseigné"}`,
      "",
      "Message:",
      message,
      "",
      `Envoyé depuis le site ${site.companyName}.`
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
        <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a;">Nouveau message depuis le site Thaneros</h1>
        <p style="margin:0 0 24px;color:#475569;">Une nouvelle demande a été envoyée via le formulaire de contact.</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
          <tr>
            <td style="padding:8px 0;font-weight:700;width:180px;">Nom</td>
            <td style="padding:8px 0;">${fullname}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:700;">Email</td>
            <td style="padding:8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:700;">Entreprise</td>
            <td style="padding:8px 0;">${company || "Non renseignée"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:700;">Type de projet</td>
            <td style="padding:8px 0;">${projectType || "Non renseigné"}</td>
          </tr>
        </table>
        <div style="padding:16px;border:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0 0 8px;font-weight:700;">Message</p>
          <p style="margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="margin:24px 0 0;color:#64748b;font-size:14px;">Envoyé depuis le site ${site.companyName}.</p>
      </div>
    `;

    if (transporter) {
      await transporter.sendMail({
        to,
        from,
        subject: `[Thaneros] Nouveau message de ${fullname}`,
        replyTo: email,
        text,
        html
      });
    } else {
      console.log("[CONTACT] SMTP non configuré. Message reçu :\n" + text);
    }

    return res.redirect("/contact?status=ok");
  } catch (error) {
    console.error("Erreur formulaire :", error);
    return res.redirect("/contact?status=error");
  }
});

app.use((req, res) => {
  res.status(404).render("pages/404", {
    title: "Page introuvable | Thaneros",
    description: "La page demandee est introuvable."
  });
});

app.listen(port, () => {
  console.log(`Thaneros en ligne sur http://localhost:${port}`);
});
