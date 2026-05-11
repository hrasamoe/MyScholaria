import { Link as RouterLink } from "react-router-dom";
import { Box, Card, CardContent, Container, Typography, Stack, Divider, Link, Breadcrumbs, Chip } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";

const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
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

const Terms = () => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 3, md: 6 } }}>
    <Container maxWidth="md">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">Home</Link>
        <Typography color="text.primary">Terms of Service</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "primary.main", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GavelIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>Terms of Service</Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip size="small" label="Version 1.0" />
                <Chip size="small" label="Effective: May 2026" color="primary" variant="outlined" />
              </Stack>
            </Box>
          </Stack>

          <P>
            Welcome to <b>MyScholaria</b> (the "Service", "Platform", "we", "us", or "our"). These Terms of
            Service ("Terms") govern your access to and use of our school management platform, including
            its websites, dashboards, mobile views, APIs and related services. By creating an account,
            accessing, browsing or otherwise using the Service, you ("you", "User", "Institution") agree
            to be legally bound by these Terms. If you do not agree, please do not use the Service.
          </P>

          <Divider sx={{ my: 3 }} />

          <Section n="1" title="Definitions">
            <P><b>Institution</b> — any school, college, university or training organization that subscribes to MyScholaria.</P>
            <P><b>End User</b> — any individual (administrator, teacher, student, parent, staff member) granted access to the Service by an Institution.</P>
            <P><b>Content</b> — any data, text, files, images, grades, attendance records, communications, or other materials uploaded, transmitted or generated through the Service.</P>
            <P><b>Subscription</b> — the paid or trial plan under which the Institution accesses the Service.</P>
          </Section>

          <Section n="2" title="Eligibility & Account Registration">
            <P>
              To use MyScholaria you must be at least 16 years old, or have valid consent from a parent,
              legal guardian or educational institution. By registering, you represent and warrant that
              the information you provide is accurate, complete and up to date, and that you will
              maintain it as such. You are solely responsible for safeguarding your credentials, for
              any activity occurring under your account, and for promptly notifying us of any
              unauthorized access or security breach.
            </P>
            <P>
              Institutions are responsible for managing the accounts of their End Users, including
              provisioning, role assignment, and timely deactivation when access is no longer required.
            </P>
          </Section>

          <Section n="3" title="Acceptable Use">
            <P>You agree NOT to:</P>
            <P>• Use the Service for any unlawful, fraudulent, harmful, defamatory or discriminatory purpose;</P>
            <P>• Upload viruses, malware, or any code intended to disrupt, damage or gain unauthorized access to the Service or its users;</P>
            <P>• Attempt to reverse-engineer, decompile, scrape, or otherwise extract source code, data models, or proprietary algorithms;</P>
            <P>• Impersonate another person, falsify your identity, or misrepresent your affiliation;</P>
            <P>• Harass, bully, threaten, or abuse other users — particularly minors — through messages, comments or any communication tool;</P>
            <P>• Use the Service to send unsolicited bulk messages (spam) or to violate any applicable export control or sanctions law.</P>
          </Section>

          <Section n="4" title="Subscriptions, Fees & Billing">
            <P>
              Access to MyScholaria is offered through subscription plans billed monthly or annually.
              Fees are detailed at the time of purchase. Unless otherwise stated, all fees are
              exclusive of taxes, which will be added where applicable. Subscriptions renew
              automatically at the end of each billing cycle unless cancelled at least 14 days prior to
              the renewal date through the Settings page or by written request to billing@myscholaria.app.
            </P>
            <P>
              Late payments may result in suspension or termination of access. Refunds are issued at
              our sole discretion and only in cases of duplicate billing, technical failure preventing
              meaningful use of the Service, or as required by applicable consumer protection laws.
            </P>
          </Section>

          <Section n="5" title="Intellectual Property">
            <P>
              The Service, including its software, design, logos, trademarks, documentation and
              underlying technology, is owned by MyScholaria and its licensors and is protected by
              copyright, trademark and other intellectual property laws. We grant you a limited,
              non-exclusive, non-transferable, revocable license to use the Service strictly for its
              intended educational management purposes during the term of your Subscription.
            </P>
            <P>
              You retain ownership of all Content you upload. You grant us a worldwide, royalty-free
              license to host, process, transmit, display and back up such Content solely as necessary
              to operate, maintain and improve the Service.
            </P>
          </Section>

          <Section n="6" title="User Roles & Permissions">
            <P>
              The Service uses role-based access control (Administrator, Director, Teacher, Staff,
              Student, Parent). Each role grants different capabilities. The Institution is solely
              responsible for the proper assignment of roles and for ensuring that confidential data
              (grades, financial information, disciplinary records) is only made visible to authorized
              parties.
            </P>
          </Section>

          <Section n="7" title="Data Protection & Privacy">
            <P>
              Our handling of personal data is described in detail in our <Link component={RouterLink} to="/privacy">Privacy Policy</Link>,
              which forms an integral part of these Terms. We act as a data processor on behalf of
              Institutions for student, parent and staff data, and we comply with applicable data
              protection laws including the GDPR, FERPA (where relevant), and local equivalents.
            </P>
          </Section>

          <Section n="8" title="Service Availability & Support">
            <P>
              We aim for 99.5% monthly uptime, excluding scheduled maintenance windows announced at
              least 48 hours in advance. While we make commercially reasonable efforts to maintain a
              continuous, secure and error-free Service, we do not guarantee uninterrupted access.
              Support is provided through the in-app help center and at support@myscholaria.app
              during business hours (Mon–Fri, 9:00–18:00 CET).
            </P>
          </Section>

          <Section n="9" title="Suspension & Termination">
            <P>
              We may suspend or terminate your access immediately and without prior notice if you
              breach these Terms, if your use endangers the security or integrity of the Service or
              other users, or if required by law. Upon termination, your right to use the Service
              ceases. Institutions may export their Content for 30 days after termination, after
              which data may be permanently deleted from active systems.
            </P>
          </Section>

          <Section n="10" title="Disclaimers">
            <P>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL MEET
              YOUR REQUIREMENTS OR THAT IT WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE.
            </P>
          </Section>

          <Section n="11" title="Limitation of Liability">
            <P>
              To the maximum extent permitted by applicable law, MyScholaria shall not be liable for
              any indirect, incidental, special, consequential or punitive damages, or any loss of
              profits, revenues, data, or goodwill, arising out of or in connection with your use of
              the Service. Our total aggregate liability shall not exceed the amount paid by the
              Institution to MyScholaria during the twelve (12) months preceding the event giving
              rise to the claim.
            </P>
          </Section>

          <Section n="12" title="Indemnification">
            <P>
              You agree to indemnify and hold harmless MyScholaria, its officers, directors,
              employees and affiliates from and against any claims, damages, liabilities, losses and
              expenses (including reasonable attorneys' fees) arising out of: (a) your breach of
              these Terms; (b) your Content; (c) your violation of any law or third-party right.
            </P>
          </Section>

          <Section n="13" title="Modifications">
            <P>
              We may revise these Terms from time to time. Material changes will be communicated by
              email or through an in-app notice at least 30 days before they take effect. Your
              continued use of the Service after the effective date constitutes acceptance of the
              revised Terms.
            </P>
          </Section>

          <Section n="14" title="Governing Law & Jurisdiction">
            <P>
              These Terms are governed by the laws of the jurisdiction in which MyScholaria is
              headquartered, without regard to its conflict-of-laws principles. Any dispute shall be
              submitted to the exclusive jurisdiction of the competent courts of that jurisdiction,
              unless mandatory consumer protection laws provide otherwise.
            </P>
          </Section>

          <Section n="15" title="Contact">
            <P>
              For any question regarding these Terms, please contact us at:
              <br />📧 legal@myscholaria.app
              <br />📍 MyScholaria — Legal Department
            </P>
          </Section>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Last updated: May 11, 2026 — By using MyScholaria, you acknowledge that you have read,
            understood and agreed to these Terms of Service.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

export default Terms;
