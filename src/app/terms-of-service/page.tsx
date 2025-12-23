'use client';

import Link from 'next/link';
import NavBar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

export default function TermsOfServicePage() {
  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen w-screen"
      style={{
        background: "linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)",
      }}
    >
      <NavBar />
      
      <div className="w-full max-w-4xl px-6 py-12 text-white">
        <div className="p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              Welcome to AeroML. These Terms of Service ("Terms") govern your access to and use of our website, 
              services, and applications (collectively, the "Service") operated by AeroML ("we," "us," or "our").
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
              part of these Terms, you may not access the Service.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Please read these Terms carefully before using our Service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Changes to Terms</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. 
              If we make material changes to these Terms, we will notify you by:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Sending you an email notification (if applicable)</li>
              <li>Displaying a prominent notice on our Service</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              Your continued use of the Service after any changes constitutes your acceptance of the new Terms. 
              If you do not agree to the changes, you must stop using the Service.
            </p>
          </section>

          {/* Privacy Policy Link */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. Privacy Policy</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
              information when you use our Service. By using our Service, you agree to the collection and use of 
              information in accordance with our Privacy Policy.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Please review our{' '}
              <Link href="/policy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </Link>
              {' '}to understand our practices.
            </p>
          </section>

          {/* User Behavior Rules */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Rules for User Behavior</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              When using our Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information when creating an account</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
              <li>Not violate any applicable local, state, national, or international law or regulation</li>
              <li>Not transmit any malicious code, viruses, or harmful data</li>
              <li>Not attempt to gain unauthorized access to any portion of the Service</li>
              <li>Not interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Not use the Service to harass, abuse, or harm other users</li>
              <li>Not impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Not use the Service to transmit spam, unsolicited messages, or promotional materials</li>
              <li>Not reverse engineer, decompile, or disassemble any part of the Service</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              We reserve the right to suspend or terminate your account and access to the Service if you violate 
              any of these rules or engage in any behavior that we deem harmful to the Service or other users.
            </p>
          </section>

          {/* Copyright Rules */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Copyright and Intellectual Property</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              The Service and its original content, features, and functionality are owned by AeroML and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              You may not:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Copy, modify, or create derivative works of the Service</li>
              <li>Reproduce, distribute, or publicly display any content from the Service without our prior written consent</li>
              <li>Remove any copyright, trademark, or other proprietary notices from the Service</li>
              <li>Use our trademarks, logos, or other proprietary information without our express written consent</li>
            </ul>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">User Content:</strong> You retain ownership of any content you submit, 
              post, or display on or through the Service ("User Content"). By submitting User Content, you grant us 
              a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and 
              distribute your User Content for the purpose of operating and providing the Service.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              You represent and warrant that you own or have the necessary rights to grant us the license described 
              above and that your User Content does not infringe upon the rights of any third party.
            </p>
          </section>

          {/* Limitations and Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Limitations of Liability and Disclaimers</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Disclaimer of Warranties:</strong> The Service is provided on an "AS IS" 
              and "AS AVAILABLE" basis. We disclaim all warranties, express or implied, including but not limited to 
              warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant 
              that the Service will be uninterrupted, secure, or error-free.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Limitation of Liability:</strong> To the maximum extent permitted by law, 
              AeroML and its officers, directors, employees, and agents shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              Our total liability to you for all claims arising from or related to the Service shall not exceed the 
              amount you paid to us in the twelve (12) months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          {/* Payment and Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Payment and Refund Details</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Payment Terms:</strong> If you purchase any paid features or subscriptions 
              through the Service, you agree to pay all fees associated with such purchases. All fees are stated in 
              the currency specified at the time of purchase and are non-refundable except as required by law or as 
              expressly stated in these Terms.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Billing:</strong> You are responsible for providing accurate billing 
              information. We reserve the right to change our pricing with reasonable notice. If we change our pricing, 
              we will notify you in advance, and your continued use of the Service after the price change constitutes 
              your agreement to pay the new price.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Refunds:</strong> Refund requests must be submitted within 30 days of the 
              original purchase date. Refunds will be considered on a case-by-case basis and may be granted at our sole 
              discretion. To request a refund, please contact us at{' '}
              <a href="mailto:alphachongs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                alphachongs@gmail.com
              </a>
              .
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-white">Subscription Cancellation:</strong> You may cancel your subscription at 
              any time. Cancellation will take effect at the end of your current billing period. You will continue to 
              have access to paid features until the end of your billing period.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Dispute Resolution</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Governing Law:</strong> These Terms shall be governed by and construed in 
              accordance with the laws of the jurisdiction in which AeroML operates, without regard to its conflict of 
              law provisions.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Informal Resolution:</strong> Before filing a claim, you agree to contact 
              us at{' '}
              <a href="mailto:alphachongs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                alphachongs@gmail.com
              </a>
              {' '}to attempt to resolve the dispute informally. We will try to resolve the dispute within 30 days.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              <strong className="text-white">Binding Arbitration:</strong> If we cannot resolve the dispute informally, 
              you agree that any dispute arising out of or relating to these Terms or the Service shall be settled by 
              binding arbitration in accordance with the rules of the arbitration organization designated by AeroML. 
              The arbitration shall be conducted in the jurisdiction where AeroML operates.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              <strong className="text-white">Class Action Waiver:</strong> You agree that any dispute resolution 
              proceedings will be conducted only on an individual basis and not in a class, consolidated, or 
              representative action.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Contact Information</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-300">
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:alphachongs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                  alphachongs@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Severability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Severability</h2>
            <p className="text-zinc-300 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited 
              or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and 
              effect and enforceable.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Entire Agreement</h2>
            <p className="text-zinc-300 leading-relaxed">
              These Terms constitute the entire agreement between you and AeroML regarding the use of the Service and 
              supersede all prior agreements and understandings, whether written or oral.
            </p>
          </section>

          {/* Acknowledgment */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm">
              By using our Service, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

