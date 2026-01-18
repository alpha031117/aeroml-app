'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import NavBar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';

// Force dynamic rendering to avoid prerender errors
export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen w-screen"
      style={{
        background: "linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)",
      }}
    >
      <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
        <NavBar />
      </Suspense>
      
      <div className="w-full max-w-4xl px-6 py-12 text-white">
        <div className="p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-zinc-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              At AeroML (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our website, services, 
              and applications (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of 
              information in accordance with this policy. If you do not agree with our policies and practices, do not 
              use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.1 Information You Provide to Us</h3>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Account Information:</strong> Name, email address, password, and other registration details</li>
              <li><strong className="text-white">Profile Information:</strong> Profile picture, bio, and other optional information you choose to provide</li>
              <li><strong className="text-white">Content:</strong> Data, files, models, datasets, and other content you upload or create through the Service</li>
              <li><strong className="text-white">Communications:</strong> Messages, feedback, and other communications you send to us</li>
              <li><strong className="text-white">Payment Information:</strong> Billing address, payment method details (processed through secure third-party payment processors)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.2 Information We Collect Automatically</h3>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              When you use our Service, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Usage Data:</strong> How you interact with the Service, features used, pages visited, and time spent</li>
              <li><strong className="text-white">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong className="text-white">Log Data:</strong> Access times, pages viewed, clicks, and other actions taken on the Service</li>
              <li><strong className="text-white">Cookies and Tracking Technologies:</strong> Information collected through cookies, web beacons, and similar technologies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-white mt-6">2.3 Information from Third Parties</h3>
            <p className="text-zinc-300 leading-relaxed">
              We may receive information about you from third-party services, such as when you sign in using Google OAuth 
              or other authentication providers. This information may include your name, email address, and profile picture.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Personalize your experience and provide content and features relevant to your interests</li>
              <li>Send you marketing communications (with your consent, where required by law)</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">4. How We Share Your Information</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Service Providers:</strong> With third-party vendors, consultants, and other service providers who perform services on our behalf</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition of all or a portion of our business</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights, property, or safety, or that of our users or others</li>
              <li><strong className="text-white">With Your Consent:</strong> When you have given us explicit consent to share your information</li>
              <li><strong className="text-white">Aggregated Data:</strong> We may share aggregated or anonymized data that cannot be used to identify you</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Security</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive 
              to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights and Choices</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
              <li><strong className="text-white">Portability:</strong> Request transfer of your data to another service</li>
              <li><strong className="text-white">Opt-Out:</strong> Opt out of certain data processing activities, such as marketing communications</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:alphachongs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                alphachongs@gmail.com
              </a>
              . We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          {/* Cookies and Tracking Technologies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Cookies and Tracking Technologies</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information. 
              Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if 
              you do not accept cookies, you may not be able to use some portions of our Service.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              We use cookies for:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Authentication and session management</li>
              <li>Remembering your preferences and settings</li>
              <li>Analyzing usage patterns and improving our Service</li>
              <li>Providing personalized content and features</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Data Retention</h2>
            <p className="text-zinc-300 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy 
              Policy, unless a longer retention period is required or permitted by law. When we no longer need your 
              information, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">9. Children&apos;s Privacy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information 
              from children under 13. If you are a parent or guardian and believe your child has provided us with personal 
              information, please contact us immediately. If we become aware that we have collected personal information 
              from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">10. International Data Transfers</h2>
            <p className="text-zinc-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have data protection laws that differ from those in your country. By using our Service, 
              you consent to the transfer of your information to these countries.
            </p>
          </section>

          {/* Changes to This Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to This Privacy Policy</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-2 ml-4">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the &quot;Last updated&quot; date at the top of this page</li>
              <li>Sending you an email notification (if applicable)</li>
              <li>Displaying a prominent notice on our Service</li>
            </ul>
            <p className="text-zinc-300 leading-relaxed">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy 
              are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
            <p className="text-zinc-300 mb-4 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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

          {/* Links to Terms */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm">
              For information about our terms and conditions, please review our{' '}
              <Link href="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

