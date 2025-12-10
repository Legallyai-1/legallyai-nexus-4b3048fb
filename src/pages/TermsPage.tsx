import { Layout } from "@/components/layout/Layout";

const TermsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: December 10, 2024</p>
          
          <div className="prose prose-invert max-w-none space-y-8 text-foreground/90">
            
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using LegallyAI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
              <p>LegallyAI provides AI-powered legal document generation, law firm management tools, and related services. <strong>THE SERVICE DOES NOT PROVIDE LEGAL ADVICE.</strong> All documents generated are templates for informational purposes only.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. No Attorney-Client Relationship</h2>
              <p className="font-semibold text-destructive">IMPORTANT: Use of LegallyAI does NOT create an attorney-client relationship between you and LegallyAI. We are a technology platform, not a law firm. We do not provide legal advice, representation, or services.</p>
              <p>You should always consult with a licensed attorney in your jurisdiction for legal matters.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Platform Fee & Revenue Share</h2>
              <p>By using LegallyAI's paid services, you acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>LegallyAI charges a <strong>1% platform fee</strong> on all revenue generated through the platform by law firms, lawyers, and business users</li>
                <li>This fee applies to: client payments processed through the platform, subscription fees, and any other monetized services facilitated by LegallyAI</li>
                <li>The platform fee is automatically calculated and deducted from transactions</li>
                <li>This fee helps maintain and improve the platform for all users</li>
              </ul>
              <p className="mt-4 font-medium">This revenue share clause is binding upon acceptance of these terms and applies in all U.S. states where the Service is available.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Disclaimer of Warranties</h2>
              <p className="uppercase font-semibold">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Implied warranties of merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Accuracy, reliability, or completeness of content</li>
              </ul>
              <p>We do not warrant that the Service will be uninterrupted, error-free, or completely secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitation of Liability</h2>
              <p className="uppercase font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>LegallyAI shall NOT be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>LegallyAI shall NOT be liable for any loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>LegallyAI shall NOT be liable for any damages resulting from your use of or inability to use the Service</li>
                <li>LegallyAI shall NOT be liable for any legal outcomes resulting from use of generated documents</li>
                <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless LegallyAI, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses arising from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any legal actions, proceedings, or judgments related to documents generated through the Service</li>
                <li>Your use of generated documents in any legal matter</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. User Responsibilities</h2>
              <p>As a user of LegallyAI, you are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifying all generated documents with a licensed attorney before use</li>
                <li>Ensuring compliance with applicable laws in your jurisdiction</li>
                <li>Maintaining confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring that your use complies with professional ethical obligations (for attorneys)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. For Licensed Attorneys</h2>
              <p>If you are a licensed attorney using LegallyAI:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You remain solely responsible for all legal work product provided to clients</li>
                <li>You must review all AI-generated content before use</li>
                <li>You are responsible for compliance with your state bar's ethical rules</li>
                <li>LegallyAI is a tool to assist your practice, not a replacement for professional judgment</li>
                <li>Client confidentiality remains your responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Dispute Resolution & Arbitration</h2>
              <p><strong>PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.</strong></p>
              <p>Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Arbitration shall be conducted in Delaware, USA</li>
                <li>The arbitrator's decision shall be final and binding</li>
                <li>You waive any right to a jury trial</li>
                <li>Class action lawsuits and class-wide arbitration are prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Governing Law</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Intellectual Property</h2>
              <p>All content, features, and functionality of LegallyAI, including but not limited to software, text, graphics, logos, and design, are the exclusive property of LegallyAI and are protected by copyright, trademark, and other intellectual property laws.</p>
              <p className="mt-2">You may not copy, modify, distribute, sell, or lease any part of the Service without express written permission.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Termination</h2>
              <p>We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service ceases immediately.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact Information</h2>
              <p>For questions about these Terms, contact us at:</p>
              <p className="mt-2">Email: legal@legallyai.ai</p>
            </section>

            <section className="border-t border-border pt-8 mt-8">
              <p className="text-sm text-muted-foreground">
                By using LegallyAI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
