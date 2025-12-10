import { Layout } from "@/components/layout/Layout";

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: December 10, 2024</p>
          
          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p>LegallyAI ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-foreground mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Billing and payment information</li>
                <li>Professional credentials (for attorneys)</li>
                <li>Account login credentials</li>
              </ul>
              
              <h3 className="text-xl font-medium text-foreground mt-4 mb-2">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Documents generated through the Service</li>
                <li>Case information (for law firm users)</li>
                <li>Communication through the platform</li>
                <li>Time tracking and location data (if enabled)</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address, browser type, device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative notices and updates</li>
                <li>Respond to inquiries and support requests</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With your consent:</strong> When you authorize us to share information</li>
                <li><strong>Service providers:</strong> Third parties that help us operate the Service</li>
                <li><strong>Legal requirements:</strong> When required by law, subpoena, or legal process</li>
                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>Protection of rights:</strong> To protect our rights, privacy, safety, or property</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers</li>
              </ul>
              <p className="mt-2">However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
              <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. For legal documents and case files, data may be retained for the applicable statute of limitations period.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at privacy@legallyai.ai</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. California Privacy Rights (CCPA)</h2>
              <p>California residents have additional rights under the CCPA:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt out of sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
              <p className="mt-2 font-medium">We do not sell your personal information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Location Data</h2>
              <p>For law firm users with geo-tracking enabled for time clock features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Location data is collected only during clock-in/clock-out events</li>
                <li>Administrators can enable or disable this feature</li>
                <li>Employees are notified when location tracking is active</li>
                <li>Location data is stored securely and accessible only to authorized personnel</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
              <p>The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Third-Party Links</h2>
              <p>The Service may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review their privacy policies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
              <p>For questions about this Privacy Policy or our data practices, contact us at:</p>
              <p className="mt-2">Email: privacy@legallyai.ai</p>
            </section>

            <section className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                By using LegallyAI, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
