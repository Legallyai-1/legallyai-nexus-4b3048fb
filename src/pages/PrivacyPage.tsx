import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
          </Button>
          
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: October 29, 2026</p>
          
          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p>LegallyAI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service, including our web application, mobile applications (iOS and Android), AI assistants, and all related features.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-foreground mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Billing and payment information (processed securely via Stripe)</li>
                <li>Professional credentials (for attorneys and law firms)</li>
                <li>Account login credentials</li>
                <li>Profile information and preferences</li>
              </ul>
              
              <h3 className="text-xl font-medium text-foreground mt-4 mb-2">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Documents generated through the Service</li>
                <li>AI chat conversations and legal queries</li>
                <li>Case information (for law firm users)</li>
                <li>Communication through the platform</li>
                <li>Time tracking and location data (if enabled by your organization)</li>
                <li>Voice input data (when using speech-to-text features)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address, browser type, device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data and analytics</li>
                <li>Mobile device identifiers and app usage data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. AI Processing and Subprocessors</h2>
              <p>When you chat with Lee or a topic guide or generate a document, the text you submit is sent to the AI providers below to produce a response. Depending on availability, your request may be routed to any of them: Anthropic (Claude), Google (Gemini, including Google Search grounding), Groq, OpenRouter and the model providers it routes to, xAI (Grok), a custom OpenAI-compatible model endpoint we operate or contract, and Supabase. Some providers may keep request logs for a limited time under their own terms.</p>
              <p className="mt-2">We don&apos;t use your conversations to train AI models. Where offered, voice input uses your browser&apos;s built-in speech recognition, which your browser provider handles under its own privacy policy.</p>
              <p className="mt-2"><strong>Sensitive information:</strong> Don&apos;t enter names, case numbers, Social Security numbers, financial account numbers, health information, or information about children unless you need to. Legal questions can reveal sensitive facts, so share only what you need. Conversations with an AI are not protected by attorney-client privilege.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Advertising and Cookies</h2>
              <p>We show ads to free-plan visitors on a few public pages through Google AdSense. Google and its partners use cookies and device identifiers to serve and measure ads and, where you allow it, to personalize them. Paid subscribers don&apos;t see ads. You can manage ad personalization at <a href="https://adssettings.google.com" className="underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>. Learn how Google uses data: <a href="https://policies.google.com/technologies/partner-sites" className="underline" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Generate legal documents and AI-powered assistance</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative notices and updates</li>
                <li>Respond to inquiries and support requests</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
                <li>Display relevant advertisements (for free tier users)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With your consent:</strong> When you authorize us to share information</li>
                <li><strong>Service providers:</strong> Third parties that help us operate the Service (payment processors, cloud hosting, AI providers)</li>
                <li><strong>Advertising partners:</strong> Google AdSense receives cookie, device and IP data to serve and measure ads (see section 4)</li>
                <li><strong>Legal requirements:</strong> When required by law, subpoena, or legal process</li>
                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Protection of rights:</strong> To protect our rights, privacy, safety, or property</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Payment Processing</h2>
              <p>We use Stripe for payment processing:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment information is securely handled by Stripe and subject to their privacy policy</li>
                <li>We do not store full credit card numbers on our servers</li>
                <li>Transaction records are maintained for accounting and legal purposes</li>
                <li>Refunds and disputes are handled in accordance with our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit (TLS/SSL)</li>
                <li>Hosting and database providers (Vercel, Supabase) that apply their own documented security controls</li>
              </ul>
              <p className="mt-2">However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Retention</h2>
              <p>We keep personal data only as long as we need it for the purposes in this policy, unless the law requires longer. To delete your data, email <a href="mailto:support@legallyai.ai" className="underline">support@legallyai.ai</a>.</p>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm text-left">
                  <thead><tr className="border-b border-border"><th scope="col" className="py-2 pr-4">Data</th><th scope="col" className="py-2">Kept for</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Account profile</td><td className="py-2 align-top">While your account is open, and up to 30 days after you ask us to delete it</td></tr>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Chat history</td><td className="py-2 align-top">While your account is open, or until you ask us to delete it</td></tr>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Generated documents and case files</td><td className="py-2 align-top">Until you delete them or close your account</td></tr>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Anonymous free-question counters (hashed IP)</td><td className="py-2 align-top">Only as long as needed to apply the free-question limit</td></tr>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Billing records</td><td className="py-2 align-top">As long as tax and accounting law requires (generally up to 7 years)</td></tr>
                    <tr className="border-b border-border/60"><td className="py-2 pr-4 align-top">Server and security logs</td><td className="py-2 align-top">As set by our hosting providers, typically 90 days or less</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Request transfer of your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications and personalized advertising</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at support@legallyai.ai</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. California Privacy Rights (CCPA)</h2>
              <p>California residents have additional rights under the CCPA:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to know what personal information is collected, used, and shared</li>
                <li>Right to know if personal information is sold or disclosed for business purposes</li>
                <li>Right to opt out of sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
                <li>Right to limit use of sensitive personal information</li>
              </ul>
              <p className="mt-2 font-medium">We do not sell your personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. GDPR Compliance (European Users)</h2>
              <p>For users in the European Economic Area, we comply with GDPR requirements:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We process data based on legitimate interest, consent, or contractual necessity</li>
                <li>You have the right to lodge a complaint with your local data protection authority</li>
                <li>International data transfers are protected by appropriate safeguards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Location Data</h2>
              <p>For law firm users with geo-tracking enabled for time clock features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Location data is collected only during clock-in/clock-out events when enabled</li>
                <li>Organization administrators can enable or disable this feature</li>
                <li>Employees are notified when location tracking is active</li>
                <li>Location data is stored securely and accessible only to authorized personnel</li>
                <li>You may disable location services in your device settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Voice Input and Speech Recognition</h2>
              <p>When using voice input features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Speech is converted to text by your browser's built-in speech recognition</li>
                <li>We do not store raw audio recordings</li>
                <li>Text transcriptions are processed like other text inputs</li>
                <li>You can choose not to use voice input at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Children's Privacy</h2>
              <p>The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a minor, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">16. Third-Party Links and Services</h2>
              <p>The Service may contain links to third-party websites and integrations with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies. Third-party services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Stripe (payment processing)</li>
                <li>Google (AdSense advertising). Manage ad personalization at <a href="https://adssettings.google.com" className="underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a></li>
                <li>AI providers listed in section 3 (Anthropic, Google, Groq, OpenRouter, xAI, a custom model endpoint, Supabase)</li>
                <li>Supabase (database and authentication) and Vercel (hosting)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">17. Mobile Applications</h2>
              <p>Our iOS and Android applications may collect additional information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device identifiers and push notification tokens</li>
                <li>App usage analytics and crash reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">18. Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page, updating the "Last Updated" date, and sending an email notification for significant changes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">19. Contact Us</h2>
              <p>For questions about this Privacy Policy or our data practices, contact us at:</p>
              <p className="mt-2">Email: support@legallyai.ai</p>
              <p>Address: San Francisco, CA, United States</p>
            </section>

            <section className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                By using LegallyAI, you acknowledge that you have read and understood this Privacy Policy. For questions about your specific legal rights, please consult a licensed attorney.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
