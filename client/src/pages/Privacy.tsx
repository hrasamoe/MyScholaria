import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  Divider,
  Link,
  Breadcrumbs,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const Section = ({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) => (
  <Box id={`section-${n}`} sx={{ mb: 4 }}>
    <Typography variant="h6" fontWeight={700} gutterBottom>
      {n}. {title}
    </Typography>
    <Stack spacing={1.5}>{children}</Stack>
  </Box>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
    {children}
  </Typography>
);

const Privacy = () => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      py: { xs: 3, md: 6 },
    }}
  >
    <Container maxWidth="md">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        <Typography color="text.primary">Privacy Policy</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "success.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PrivacyTipIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Privacy Policy
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip
                  size="small"
                  label="GDPR compliant"
                  color="success"
                  variant="outlined"
                />
                <Chip size="small" label="Effective: May 2026" />
              </Stack>
            </Box>
          </Stack>

          <P>
            At <b>MyScholaria</b>, the privacy and security of personal data —
            especially data concerning minors — is a core priority. This Privacy
            Policy explains what information we collect, how and why we use it,
            with whom we share it, how long we keep it, and the rights you have
            over your personal data. It applies to all users of the MyScholaria
            platform: administrators, teachers, staff, students, parents and
            visitors.
          </P>

          <Divider sx={{ my: 3 }} />

          <Section n="1" title="Who we are (Data Controller / Processor)">
            <P>
              When an Institution (school, college, university) subscribes to
              MyScholaria,
              <b> the Institution acts as the Data Controller</b> for the
              personal data of its students, parents and staff.{" "}
              <b>MyScholaria acts as the Data Processor</b>, handling data
              strictly on the Institution's behalf and according to its
              documented instructions.
            </P>
            <P>
              For account registration, billing, marketing communications, and
              visitor data on our public website, MyScholaria acts as the Data
              Controller.
            </P>
          </Section>

          <Section n="2" title="Information We Collect">
            <P>
              <b>a) Identification data:</b> first name, last name, date of
              birth, gender, nationality, profile picture, national ID or
              student number.
            </P>
            <P>
              <b>b) Contact data:</b> email address, postal address, phone
              number, emergency contacts.
            </P>
            <P>
              <b>c) Academic data:</b> class, grade level, attendance records,
              grades, exam results, transcripts, diplomas, internship
              information, library loans.
            </P>
            <P>
              <b>d) Financial data:</b> tuition fees, invoices, payment status,
              scholarship records (no full credit card numbers are stored —
              payment processing is handled by certified PCI-DSS providers).
            </P>
            <P>
              <b>e) Communication data:</b> messages, announcements,
              notifications, parent-teacher conversations.
            </P>
            <P>
              <b>f) Technical data:</b> IP address, device type, browser,
              operating system, language preference, time zone, log files, pages
              visited, session duration.
            </P>
            <P>
              <b>g) Authentication cookies:</b> see Section 9.
            </P>
          </Section>

          <Section n="3" title="How We Use Your Data (Purposes)">
            <List dense>
              {[
                "Provide and operate the school management Service (core functionality).",
                "Authenticate users and maintain secure sessions via HttpOnly cookies.",
                "Verify approval status server-side on every request — never trusting client-side data.",
                "Manage academic records, grades, attendance, scheduling and reporting.",
                "Process tuition fees, invoices and scholarships.",
                "Communicate operational information (updates, security alerts, service changes).",
                "Improve the Service through aggregated, anonymized usage analytics.",
                "Comply with legal obligations (educational regulations, accounting, tax law).",
                "Detect, prevent and address fraud, abuse or security incidents.",
              ].map((t) => (
                <ListItem
                  key={t}
                  disableGutters
                  sx={{ alignItems: "flex-start" }}
                >
                  <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        {t}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Section>

          <Section n="4" title="Legal Basis for Processing (GDPR)">
            <P>
              <b>Contract:</b> processing necessary for the performance of the
              contract between the Institution and MyScholaria.
            </P>
            <P>
              <b>Legal obligation:</b> processing required to comply with
              educational, accounting, fiscal and regulatory laws.
            </P>
            <P>
              <b>Legitimate interest:</b> ensuring the security, performance and
              continuous improvement of the Service — including the use of
              strictly necessary authentication cookies.
            </P>
            <P>
              <b>Consent:</b> for optional features such as marketing emails or
              non-essential analytics. Consent can be withdrawn at any time.
            </P>
          </Section>

          <Section n="5" title="Special Protection for Minors">
            <P>
              MyScholaria is used by educational institutions where many End
              Users are minors. We apply enhanced safeguards: stricter access
              controls, reduced data retention windows, prohibition of
              behavioral advertising, mandatory parental consent for under-16
              users where required by local law, and additional encryption for
              sensitive academic and disciplinary records.
            </P>
          </Section>

          <Section n="6" title="Data Sharing & Recipients">
            <P>
              We do <b>not sell</b> personal data. We may share data with:
            </P>
            <P>
              • <b>Authorized Institution staff</b> (teachers, administrators)
              according to their assigned roles;
            </P>
            <P>
              • <b>Parents</b>, when the User is their child and where local law
              permits;
            </P>
            <P>
              • <b>Sub-processors</b> providing hosting, email delivery, payment
              processing, analytics or customer support — bound by data
              processing agreements (DPA) and equivalent confidentiality /
              security obligations;
            </P>
            <P>
              • <b>Public authorities</b> when legally required (court order,
              regulatory request);
            </P>
            <P>
              • <b>In case of merger or acquisition</b>, to the acquiring
              entity, with prior notice to Institutions.
            </P>
          </Section>

          <Section n="7" title="International Data Transfers">
            <P>
              Personal data is primarily stored within the European Economic
              Area (EEA). When a transfer outside the EEA is necessary (e.g. for
              cloud infrastructure or support), we rely on appropriate
              safeguards such as Standard Contractual Clauses approved by the
              European Commission, adequacy decisions, or equivalent legal
              mechanisms.
            </P>
          </Section>

          <Section n="8" title="Data Retention">
            <P>
              We retain personal data only for as long as necessary to fulfill
              the purposes described above and to comply with legal obligations.
              Indicative retention periods:
            </P>
            <P>
              • Active student records — duration of enrollment + 5 years (or as
              required by national education law);
            </P>
            <P>
              • Diplomas and final transcripts — long-term archival, often 30
              years or more;
            </P>
            <P>• Financial records (invoices, payments) — 10 years;</P>
            <P>• Login and security logs — 12 months;</P>
            <P>
              • Authentication cookies — accessToken: 15 minutes / refreshToken:
              7 days (both immediately revoked on sign-out);
            </P>
            <P>
              • Marketing data — until consent withdrawal or 3 years of
              inactivity;
            </P>
            <P>
              • Backups — automatically purged within 90 days of deletion from
              active systems.
            </P>
          </Section>

          <Section n="9" title="Cookies & Session Management">
            <P>
              MyScholaria uses <b>only strictly necessary cookies</b> — no
              advertising, tracking or third-party cookies are set by our
              platform. Authentication is handled exclusively through two secure
              cookies:
            </P>
            <P>
              • <b>accessToken</b> — HttpOnly, Secure, SameSite=Strict.
              Short-lived (15 minutes). Used to authenticate every API request.
              Never readable by JavaScript, never stored in localStorage or
              sessionStorage. Contains only an encrypted user identifier.
            </P>
            <P>
              • <b>refreshToken</b> — HttpOnly, Secure, SameSite=Strict. Valid
              for 7 days. Used solely to silently renew the access token when it
              expires, avoiding repeated logins. Stored server-side in a
              revocation table — signing out immediately invalidates it, even
              before its natural expiry.
            </P>
            <P>
              This architecture prevents session hijacking via XSS attacks, as
              tokens are inaccessible from client-side JavaScript. These cookies
              are strictly necessary for the Service to function and cannot be
              disabled without preventing authentication. No consent banner is
              required for strictly necessary cookies under GDPR Article 5(1)(f)
              and ePrivacy Directive recital 66.
            </P>
            <P>
              User profile data (name, email, roles, establishment) is stored
              only in React memory during the session and re-fetched from the
              server on each page load via the authenticated{" "}
              <code>/api/auth/me</code> endpoint. No sensitive data persists in
              localStorage or sessionStorage.
            </P>
          </Section>

          <Section n="10" title="Security Measures">
            <P>
              We implement industry-standard organizational and technical
              measures to protect personal data, including: TLS 1.3 encryption
              in transit, AES-256 encryption at rest, role-based access control
              enforced server-side on every request, HttpOnly cookie-based
              authentication (preventing XSS token theft), server-side approval
              status verification (preventing client-side privilege escalation),
              multi-factor authentication for administrators, regular security
              audits and penetration tests, automated vulnerability scanning,
              segregated environments (development / staging / production), and
              a documented incident response procedure. In the event of a
              personal data breach likely to result in a risk to the rights and
              freedoms of individuals, we will notify the competent supervisory
              authority within 72 hours and affected users without undue delay.
            </P>
          </Section>

          <Section n="11" title="Your Rights">
            <P>Subject to applicable law, you have the right to:</P>
            <P>
              • <b>Access</b> the personal data we hold about you;
            </P>
            <P>
              • <b>Rectify</b> inaccurate or incomplete data;
            </P>
            <P>
              • <b>Erase</b> your data ("right to be forgotten") where legally
              applicable;
            </P>
            <P>
              • <b>Restrict</b> or <b>object</b> to certain processing;
            </P>
            <P>
              • <b>Port</b> your data in a structured, commonly used,
              machine-readable format;
            </P>
            <P>
              • <b>Withdraw consent</b> at any time, without affecting the
              lawfulness of prior processing;
            </P>
            <P>
              • <b>Lodge a complaint</b> with your national data protection
              authority.
            </P>
            <P>
              To exercise these rights, contact your Institution (for data they
              control) or write to us at <b>privacy@myscholaria.app</b>. We
              respond within 30 days.
            </P>
          </Section>

          <Section n="12" title="Automated Decision-Making">
            <P>
              MyScholaria does not make decisions producing legal or similarly
              significant effects based solely on automated processing. Grade
              calculations, attendance summaries and report generation are tools
              that assist human decision-makers (teachers, staff) and never
              replace them. Access approval for new members is always decided by
              a human administrator — our platform only enforces that decision.
            </P>
          </Section>

          <Section n="13" title="Third-Party Links">
            <P>
              The Service may contain links to external websites or integrations
              (e.g. payment providers, video conferencing). We are not
              responsible for the privacy practices of these third parties. We
              encourage you to review their privacy policies before using them.
            </P>
          </Section>

          <Section n="14" title="Changes to this Policy">
            <P>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements or for
              other operational reasons. The "Effective" date at the top will be
              updated and, for material changes, we will notify users via in-app
              message or email at least 30 days before the changes take effect.
            </P>
          </Section>

          <Section n="15" title="Contact our Data Protection Officer">
            <P>
              Privacy: <b>hrasamoevj@gmail.com</b>
              <br />
              Leader: <b>herysamuelpljv@gmail.com</b>
              <br />
              MyScholaria — Data Protection Office
            </P>
            <P>
              See also our{" "}
              <Link component={RouterLink} to="/terms">
                Terms of Service
              </Link>
              .
            </P>
          </Section>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Last updated: May 28, 2026 — Your trust matters. We are committed to
            transparency and to protecting the personal data of every member of
            the MyScholaria community.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

export default Privacy;
