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
          <p className="text-muted-foreground mb-8">Last Updated: December 10, 2024</p>
          
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
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. AI and Machine Learning</h2>
              <p>Our Service uses artificial intelligence (AI) and machine learning technologies to provide legal document generation, chat assistance, and other features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>AI Processing:</strong> Your inputs (text, voice, documents) are processed by AI systems to generate responses and documents</li>
                <li><strong>Data Use:</strong> We may use anonymized, aggregated data to improve our AI models</li>
                <li><strong>No Training on Personal Data:</strong> We do not use your personal legal documents or case details to train our AI models without explicit consent</li>
                <li><strong>Third-Party AI:</strong> We use third-party AI services (including Google Gemini and OpenAI) which have their own privacy practices</li>
                <li><strong>Voice Data:</strong> When using voice input, audio is converted to text and may be processed by third-party speech recognition services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Advertising and Analytics</h2>
              <p>We use advertising services to support our free tier and analytics to improve our Service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google AdSense:</strong> We display targeted advertisements through Google AdSense. Google may use cookies and other tracking technologies to serve relevant ads</li>
                <li><strong>Ad Personalization:</strong> You may opt out of personalized advertising through your Google account settings or browser privacy settings</li>
                <li><strong>Analytics:</strong> We use analytics tools to understand how users interact with our Service</li>
                <li><strong>Premium Users:</strong> Paid subscribers may experience reduced or no advertising</li>
              </ul>
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
                <li><strong>Advertising partners:</strong> To display relevant advertisements (anonymized data only)</li>
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
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication (including optional 2FA)</li>
                <li>Secure data centers with industry-standard protections</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-2">However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Data Retention</h2>
              <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account data is retained while your account is active</li>
                <li>Legal documents and case files may be retained for the applicable statute of limitations period</li>
                <li>Chat history is retained for service improvement and may be deleted upon request</li>
                <li>Payment records are retained as required for tax and legal compliance</li>
              </ul>
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
              <p className="mt-2">To exercise these rights, contact us at privacy@legallyai.ai</p>
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
                <li>Audio is converted to text using speech recognition technology</li>
                <li>We do not store raw audio recordings</li>
                <li>Text transcriptions are processed like other text inputs</li>
                <li>You can disable voice features in app settings</li>
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
                <li>Google (AdSense, speech recognition)</li>
                <li>AI providers (document and chat processing)</li>
                <li>Cloud infrastructure providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">17. Mobile Applications</h2>
              <p>Our iOS and Android applications may collect additional information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device identifiers and push notification tokens</li>
                <li>App usage analytics and crash reports</li>
                <li>Microphone access for voice input (only when granted permission)</li>
                <li>Camera access for document scanning (only when granted permission)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">18. Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page, updating the "Last Updated" date, and sending an email notification for significant changes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">19. Contact Us</h2>
              <p>For questions about this Privacy Policy or our data practices, contact us at:</p>
              <p className="mt-2">Email: privacy@legallyai.ai</p>
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
