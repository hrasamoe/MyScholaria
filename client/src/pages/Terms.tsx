import GavelIcon from "@mui/icons-material/Gavel";
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

const Terms = () => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      py: { xs: 3, md: 6 },
    }}
  >
    <Container maxWidth="lg">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Home
        </Link>
        <Typography color="text.primary">Terms of Service</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GavelIcon />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Terms of Service
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip size="small" label="Version 2.1.0" />
                <Chip
                  size="small"
                  label="Effective: June 2026"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>

          <P>
            Welcome to <b>MyScholaria</b> (the "Service", "Platform", "we",
            "us", or "our"). These Terms of Service ("Terms") govern your access
            to and use of our school management platform, including its
            websites, dashboards, mobile views, APIs, messaging features and
            related services. By creating an account, accessing, browsing or
            otherwise using the Service, you ("you", "User", "Institution")
            agree to be legally bound by these Terms. If you do not agree,
            please do not use the Service.
          </P>

          <Divider sx={{ my: 3 }} />

          <Section n="1" title="Definitions">
            <P>
              <b>Institution</b> — any school, college, university or training
              organization that subscribes to MyScholaria.
            </P>
            <P>
              <b>End User</b> — any individual (administrator, teacher, student,
              parent, staff member) granted access to the Service by an
              Institution.
            </P>
            <P>
              <b>Content</b> — any data, text, files, images, grades, attendance
              records, instant messages, direct communications, or other
              materials uploaded, transmitted or generated through the Service.
            </P>
            <P>
              <b>Subscription</b> — the paid or trial plan under which the
              Institution accesses the Service.
            </P>
            <P>
              <b>Authentication Cookies</b> — secure, HttpOnly cookies used
              exclusively to maintain authenticated sessions. These cookies are
              never accessible from JavaScript and contain only encrypted
              session tokens.
            </P>
          </Section>

          <Section n="2" title="Eligibility & Account Registration">
            <P>
              To use MyScholaria you must be at least 16 years old, or have
              valid consent from a parent, legal guardian or educational
              institution. By registering, you represent and warrant that the
              information you provide is accurate, complete and up to date, and
              that you will maintain it as such.
            </P>
            <P>
              Authentication on MyScholaria is handled exclusively through{" "}
              <b>secure HttpOnly cookies</b>. Session tokens (access token and
              refresh token) are never exposed to client-side JavaScript, stored
              in localStorage, or included in API response bodies. This design
              prevents token theft via XSS attacks. You are responsible for
              protecting access to your device and for promptly notifying us of
              any unauthorized access or security breach.
            </P>
            <P>
              Institutions are responsible for managing the accounts of their
              End Users, including provisioning, role assignment, and timely
              deactivation when access is no longer required.
            </P>
          </Section>

          <Section n="3" title="Acceptable Use">
            <P>You agree NOT to:</P>
            <P>
              • Use the Service for any unlawful, fraudulent, harmful,
              defamatory or discriminatory purpose;
            </P>
            <P>
              • Upload viruses, malware, or any code intended to disrupt, damage
              or gain unauthorized access to the Service or its users;
            </P>
            <P>
              • Attempt to reverse-engineer, decompile, scrape, or otherwise
              extract source code, data models, or proprietary algorithms;
            </P>
            <P>
              • Impersonate another person, falsify your identity, or
              misrepresent your affiliation;
            </P>
            <P>
              • Attempt to manipulate, forge or bypass authentication cookies or
              session tokens;
            </P>
            <P>
              • Harass, bully, threaten, stalk, or abuse other users —
              particularly minors — through internal messages, comments or any
              communication tool;
            </P>
            <P>
              • Use the messaging features to distribute unsolicited commercial
              content, mass marketing, or chain letters (spam);
            </P>
            <P>
              • Share, transmit, or request private contact information or
              sensitive personal data unnecessarily through the messaging
              system;
            </P>
            <P>
              • Use the Service to send unsolicited bulk messages (spam) or to
              violate any applicable export control or sanctions law.
            </P>
          </Section>

          <Section n="4" title="Subscriptions, Fees & Billing">
            <P>
              Access to MyScholaria is offered through subscription plans billed
              monthly or annually. Fees are detailed at the time of purchase.
              Unless otherwise stated, all fees are exclusive of taxes, which
              will be added where applicable. Subscriptions renew automatically
              at the end of each billing cycle unless cancelled at least 14 days
              prior to the renewal date through the Settings page or by written
              request to billing@myscholaria.app.
            </P>
            <P>
              Late payments may result in suspension or termination of access.
              Refunds are issued at our sole discretion and only in cases of
              duplicate billing, technical failure preventing meaningful use of
              the Service, or as required by applicable consumer protection
              laws.
            </P>
          </Section>

          <Section n="5" title="Intellectual Property">
            <P>
              The Service, including its software, design, logos, trademarks,
              documentation and underlying technology, is owned by MyScholaria
              and its licensors and is protected by copyright, trademark and
              other intellectual property laws. We grant you a limited,
              non-exclusive, non-transferable, revocable license to use the
              Service strictly for its intended educational management purposes
              during the term of your Subscription.
            </P>
            <P>
              You retain ownership of all Content you upload. You grant us a
              worldwide, royalty-free license to host, process, transmit,
              display and back up such Content solely as necessary to operate,
              maintain and improve the Service.
            </P>
          </Section>

          <Section n="6" title="User Roles & Permissions">
            <P>
              The Service uses role-based access control (Administrator,
              Director, Teacher, Staff, Student, Parent). Each role grants
              different capabilities. Access rights are enforced server-side on
              every request — client-side state (including approval status) is
              always verified against the database and cannot be bypassed by
              modifying browser data. The Institution is solely responsible for
              the proper assignment of roles and for ensuring that confidential
              data (grades, financial information, disciplinary records) is only
              made visible to authorized parties.
            </P>
          </Section>

          <Section n="7" title="In-App Messaging & Communications">
            <P>
              The Platform provides messaging features to facilitate educational
              collaboration between End Users. MyScholaria acts merely as a
              technical provider for these communications. The Institution is
              fully responsible for monitoring and moderating the communications
              exchanged within its network.
            </P>
            <P>
              We do not routinely screen or monitor private messages, but we
              reserve the right to access, read, preserve, and disclose any
              messaging data if we reasonably believe it is necessary to (a)
              satisfy any applicable law or legal request, (b) enforce these
              Terms, or (c) protect the safety and rights of our users or the
              public. The messaging system must NOT be used as a primary tool
              for reporting critical emergencies or time-sensitive life safety
              events.
            </P>
          </Section>

          <Section n="8" title="Session Management & Cookie Policy">
            <P>
              MyScholaria uses two types of authentication cookies to manage
              your session securely:
            </P>
            <P>
              • <b>accessToken</b> — a short-lived token (15 minutes) used to
              authenticate API requests. It is set as an HttpOnly, Secure,
              SameSite cookie and is never readable by JavaScript.
            </P>
            <P>
              • <b>refreshToken</b> — a longer-lived token (7 days) used to
              silently renew the access token when it expires, without requiring
              you to log in again. It is equally protected as an HttpOnly,
              Secure, SameSite cookie.
            </P>
            <P>
              These cookies are strictly necessary for the operation of the
              Service and cannot be disabled without preventing login. They
              contain no personal information beyond an encrypted user
              identifier. No advertising, tracking or third-party cookies are
              set by our platform. Signing out immediately revokes both tokens
              server-side, regardless of their remaining validity period.
            </P>
          </Section>

          <Section n="9" title="Data Protection & Privacy">
            <P>
              Our handling of personal data is described in detail in our{" "}
              <Link component={RouterLink} to="/policy">
                Privacy Policy
              </Link>
              , which forms an integral part of these Terms. We act as a data
              processor on behalf of Institutions for student, parent and staff
              data, including chat histories, and we comply with applicable data
              protection laws including the GDPR, FERPA (where relevant), and
              local equivalents.
            </P>
          </Section>

          <Section n="10" title="Service Availability & Support">
            <P>
              We aim for 99.5% monthly uptime, excluding scheduled maintenance
              windows announced at least 48 hours in advance. While we make
              commercially reasonable efforts to maintain a continuous, secure
              and error-free Service, we do not guarantee uninterrupted access.
              Support is provided through the in-app help center and at
              support@myscholaria.app during business hours (Mon–Fri, 9:00–18:00
              CET).
            </P>
          </Section>

          <Section n="11" title="Suspension & Termination">
            <P>
              We may suspend or terminate your access immediately and without
              prior notice if you breach these Terms, if your use endangers the
              security or integrity of the Service or other users, or if
              required by law. Upon termination, your right to use the Service
              ceases. Institutions may export their Content for 30 days after
              termination, after which data may be permanently deleted from
              active systems.
            </P>
          </Section>

          <Section n="12" title="Disclaimers">
            <P>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
              LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL MEET
              YOUR REQUIREMENTS OR THAT IT WILL BE UNINTERRUPTED, TIMELY, SECURE
              OR ERROR-FREE.
            </P>
          </Section>

          <Section n="13" title="Limitation of Liability">
            <P>
              To the maximum extent permitted by applicable law, MyScholaria
              shall not be liable for any indirect, incidental, special,
              consequential or punitive damages, or any loss of profits,
              revenues, data, or goodwill, arising out of or in connection with
              your use of the Service. Our total aggregate liability shall not
              exceed the amount paid by the Institution to MyScholaria during
              the twelve (12) months preceding the event giving rise to the
              claim.
            </P>
          </Section>

          <Section n="14" title="Indemnification">
            <P>
              You agree to indemnify and hold harmless MyScholaria, its
              officers, directors, employees and affiliates from and against any
              claims, damages, liabilities, losses and expenses (including
              reasonable attorneys' fees) arising out of: (a) your breach of
              these Terms; (b) your Content; (c) your violation of any law or
              third-party right.
            </P>
          </Section>

          <Section n="15" title="Modifications">
            <P>
              We may revise these Terms from time to time. Material changes will
              be communicated by email or through an in-app notice at least 30
              days before they take effect. Your continued use of the Service
              after the effective date constitutes acceptance of the revised
              Terms.
            </P>
          </Section>

          <Section n="16" title="Governing Law & Jurisdiction">
            <P>
              These Terms are governed by the laws of the jurisdiction in which
              MyScholaria is headquartered, without regard to its
              conflict-of-laws principles. Any dispute shall be submitted to the
              exclusive jurisdiction of the competent courts of that
              jurisdiction, unless mandatory consumer protection laws provide
              otherwise.
            </P>
          </Section>

          <Section n="17" title="Contact">
            <P>
              For any question regarding these Terms, please contact us at:
              <br />
              📧 herysamuelpljv@gmail.com
              <br />
              MyScholaria — Legal Department
            </P>
          </Section>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Last updated: June 17, 2026 — By using MyScholaria, you acknowledge
            that you have read, understood and agreed to these Terms of Service.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  </Box>
);

export default Terms;
