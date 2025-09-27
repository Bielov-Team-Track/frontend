import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Volleyer",
  description: "Privacy policy for Volleyer volleyball community application",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto sm:px-4 sm:py-8">
        <div className="max-w-4xl mx-auto bg-base-100 rounded-lg shadow-xl sm:p-8 p-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Privacy Policy
            </h1>
            <p className="text-base-content/70">
              Last updated: September 19, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6">
            {/* Introduction */}
            <div className="bg-base-200 sm:p-6 rounded-lg">
              <p className="text-lg">
                This Privacy Notice for <strong>Volleyer</strong>{" "}
                (&lsquo;we&rsquo;, &lsquo;us&rsquo;, or &lsquo;our&rsquo;),
                describes how and why we might access, collect, store, use,
                and/or share (&lsquo;process&rsquo;) your personal information
                when you use our services (&lsquo;Services&rsquo;), including
                when you:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  Visit our website at{" "}
                  <a
                    href="https://www.volleyer.app"
                    className="link link-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.volleyer.app
                  </a>{" "}
                  or any website of ours that links to this Privacy Notice
                </li>
                <li>
                  Download and use our mobile application (Volleyer), or any
                  other application of ours that links to this Privacy Notice
                </li>
                <li>
                  Engage with us in other related ways, including any sales,
                  marketing, or events
                </li>
              </ul>
              <div className="mt-4 p-4 bg-info/20 rounded border-l-4 border-info">
                <p>
                  <strong>Questions or concerns?</strong> Reading this Privacy
                  Notice will help you understand your privacy rights and
                  choices. If you do not agree with our policies and practices,
                  please do not use our Services. If you still have any
                  questions or concerns, please contact us at{" "}
                  <a
                    href="mailto:denys.bielov@gmail.com"
                    className="link link-primary"
                  >
                    denys.bielov@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Summary of Key Points */}
            <section>
              <h2 className="text-2xl font-semibold  mb-4">
                Summary of Key Points
              </h2>
              <p className="mb-4">
                This summary provides key points from our Privacy Notice, but
                you can find out more details about any of these topics by using
                our table of contents below to find the section you are looking
                for.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2">
                    What personal information do we process?
                  </h3>
                  <p className="text-sm">
                    When you visit, use, or navigate our Services, we may
                    process personal information depending on how you interact
                    with us and the Services, the choices you make, and the
                    products and features you use.
                  </p>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2">
                    Do we process any sensitive personal information?
                  </h3>
                  <p className="text-sm">
                    We do not process sensitive personal information.
                  </p>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2">
                    Do we collect any information from third parties?
                  </h3>
                  <p className="text-sm">
                    We do not collect any information from third parties.
                  </p>
                </div>
                <div className="card bg-base-200 p-4">
                  <h3 className="font-semibold mb-2">
                    How do we keep your information safe?
                  </h3>
                  <p className="text-sm">
                    We have adequate organisational and technical processes and
                    procedures in place to protect your personal information.
                  </p>
                </div>
              </div>
            </section>

            {/* Table of Contents */}
            <section>
              <h2 className="text-2xl font-semibold  mb-4">
                Table of Contents
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                <a href="#section1" className="link link-primary">
                  1. What information do we collect?
                </a>
                <a href="#section2" className="link link-primary">
                  2. How do we process your information?
                </a>
                <a href="#section3" className="link link-primary">
                  3. What legal bases do we rely on to process your information?
                </a>
                <a href="#section4" className="link link-primary">
                  4. When and with whom do we share your information?
                </a>
                <a href="#section5" className="link link-primary">
                  5. Do we use cookies and other tracking technologies?
                </a>
                <a href="#section6" className="link link-primary">
                  6. How do we handle your social logins?
                </a>
                <a href="#section7" className="link link-primary">
                  7. How long do we keep your information?
                </a>
                <a href="#section8" className="link link-primary">
                  8. How do we keep your information safe?
                </a>
                <a href="#section9" className="link link-primary">
                  9. Do we collect information from minors?
                </a>
                <a href="#section10" className="link link-primary">
                  10. What are your privacy rights?
                </a>
                <a href="#section11" className="link link-primary">
                  11. Controls for do-not-track features
                </a>
                <a href="#section12" className="link link-primary">
                  12. Do we make updates to this notice?
                </a>
                <a href="#section13" className="link link-primary">
                  13. How can you contact us about this notice?
                </a>
                <a href="#section14" className="link link-primary">
                  14. How can you review, update, or delete data?
                </a>
              </div>
            </section>

            {/* Section 1 */}
            <section id="section1" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                1. What Information Do We Collect?
              </h2>

              <h3 className="text-xl font-medium  mb-3">
                Personal Information You Disclose to Us
              </h3>
              <p className="mb-4">
                <strong>In Short:</strong> We collect personal information that
                you provide to us.
              </p>
              <p className="mb-4">
                We collect personal information that you voluntarily provide to
                us when you register on the Services, express an interest in
                obtaining information about us or our products and Services,
                when you participate in activities on the Services, or otherwise
                when you contact us.
              </p>

              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">
                  Personal Information Provided by You:
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <span className="badge badge-outline">Names</span>
                  <span className="badge badge-outline">Email addresses</span>
                  <span className="badge badge-outline">Passwords</span>
                  <span className="badge badge-outline">
                    Contact preferences
                  </span>
                  <span className="badge badge-outline">Billing addresses</span>
                  <span className="badge badge-outline">
                    Debit/credit card numbers
                  </span>
                  <span className="badge badge-outline">
                    Contact or authentication data
                  </span>
                </div>
              </div>

              <div className="alert alert-info mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h4 className="font-bold">Payment Data</h4>
                  <p className="text-sm">
                    We may collect data necessary to process your payment if you
                    choose to make purchases. All payment data is handled and
                    stored by{" "}
                    <a
                      href="https://stripe.com/gb/privacy"
                      className="link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Stripe
                    </a>
                    .
                  </p>
                </div>
              </div>

              <h4 className="font-semibold mb-2">Application Data</h4>
              <p className="mb-2">
                If you use our application(s), we also may collect the following
                information if you choose to provide us with access or
                permission:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Geolocation Information:</strong> We may request
                  access to track location-based information from your mobile
                  device to provide location-based services.
                </li>
                <li>
                  <strong>Mobile Device Access:</strong> We may request access
                  to certain features from your mobile device, including
                  calendar, reminders, social media accounts, and other
                  features.
                </li>
                <li>
                  <strong>Push Notifications:</strong> We may request to send
                  you push notifications regarding your account or certain
                  features of the application(s).
                </li>
              </ul>

              <h4 className="font-semibold mb-2 mt-6">
                Information Automatically Collected
              </h4>
              <p className="mb-4">
                <strong>In Short:</strong> Some information — such as your
                Internet Protocol (IP) address and/or browser and device
                characteristics — is collected automatically when you visit our
                Services.
              </p>
              <p className="mb-4">
                We automatically collect certain information when you visit,
                use, or navigate the Services. This information does not reveal
                your specific identity but may include device and usage
                information, such as your IP address, browser and device
                characteristics, operating system, language preferences,
                referring URLs, device name, country, location, and other
                technical information.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section2" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                2. How Do We Process Your Information?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We process your information to
                provide, improve, and administer our Services, communicate with
                you, for security and fraud prevention, and to comply with law.
              </p>

              <div className="card bg-base-200 p-4">
                <h4 className="font-semibold mb-2">
                  We process your personal information for a variety of reasons,
                  including:
                </h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    To facilitate account creation and authentication and
                    otherwise manage user accounts
                  </li>
                  <li>
                    To save or protect an individual&rsquo;s vital interest,
                    such as to prevent harm
                  </li>
                  <li>
                    To provide, improve, and administer our volleyball community
                    services
                  </li>
                  <li>
                    To facilitate event creation, management, and participation
                  </li>
                  <li>To process payments for events and tournaments</li>
                  <li>
                    To connect you with other volleyball players and events
                  </li>
                  <li>
                    To send notifications about events, matches, and community
                    updates
                  </li>
                  <li>To improve our services and develop new features</li>
                  <li>To provide customer support and respond to inquiries</li>
                  <li>To ensure platform safety and prevent misuse</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section3" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                3. What Legal Bases Do We Rely On?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We only process your personal
                information when we believe it is necessary and we have a valid
                legal reason to do so under applicable law.
              </p>

              <div className="space-y-4">
                <div className="card bg-base-200 p-4">
                  <h4 className="font-semibold mb-2">🔒 Consent</h4>
                  <p className="text-sm">
                    We may process your information if you have given us
                    permission to use your personal information for a specific
                    purpose. You can withdraw your consent at any time.
                  </p>
                </div>
                <div className="card bg-base-200 p-4">
                  <h4 className="font-semibold mb-2">⚖️ Legal Obligations</h4>
                  <p className="text-sm">
                    We may process your information where we believe it is
                    necessary for compliance with our legal obligations, such as
                    to cooperate with law enforcement or regulatory agencies.
                  </p>
                </div>
                <div className="card bg-base-200 p-4">
                  <h4 className="font-semibold mb-2">🛡️ Vital Interests</h4>
                  <p className="text-sm">
                    We may process your information where we believe it is
                    necessary to protect your vital interests or the vital
                    interests of a third party, such as situations involving
                    potential threats to safety.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section4" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                4. When and With Whom Do We Share Your Information?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We may share information in specific
                situations described in this section and/or with the following
                third parties.
              </p>

              <div className="alert alert-warning mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
                <div>
                  <h4 className="font-bold">Important Note</h4>
                  <p className="text-sm">
                    Your profile information is visible to other players in
                    volleyball events you join. Contact details may be shared
                    with event organizers for coordination purposes.
                  </p>
                </div>
              </div>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Business Transfers:</strong> We may share or transfer
                  your information in connection with any merger, sale of
                  company assets, financing, or acquisition of all or a portion
                  of our business to another company.
                </li>
                <li>
                  <strong>Google Maps Platform APIs:</strong> We may share your
                  information with certain Google Maps Platform APIs (e.g.
                  Google Maps API, Places API) to provide location-based
                  services.
                </li>
                <li>
                  <strong>Payment Processors:</strong> Payment information is
                  processed securely through Stripe according to their privacy
                  policy.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="section5" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                5. Do We Use Cookies and Other Tracking Technologies?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We may use cookies and other tracking
                technologies to collect and store your information.
              </p>
              <p className="mb-4">
                We may use cookies and similar tracking technologies to gather
                information when you interact with our Services. Some online
                tracking technologies help us maintain the security of our
                Services and your account, prevent crashes, fix bugs, save your
                preferences, and assist with basic site functions.
              </p>
            </section>

            {/* Section 6 */}
            <section id="section6" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                6. How Do We Handle Your Social Logins?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> If you choose to register or log in
                to our Services using a social media account, we may have access
                to certain information about you.
              </p>
              <p className="mb-4">
                Our Services offer you the ability to register and log in using
                your third-party social media account details (like your
                Facebook or X logins). Where you choose to do this, we will
                receive certain profile information about you from your social
                media provider.
              </p>
            </section>

            {/* Section 7 */}
            <section id="section7" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                7. How Long Do We Keep Your Information?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We keep your information for as long
                as necessary to fulfil the purposes outlined in this Privacy
                Notice unless otherwise required by law.
              </p>
              <p className="mb-4">
                We will only keep your personal information for as long as it is
                necessary for the purposes set out in this Privacy Notice,
                unless a longer retention period is required or permitted by
                law. When we have no ongoing legitimate business need to process
                your personal information, we will either delete or anonymise
                such information.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Active account data: Retained while account is active</li>
                <li>Deleted account data: Removed within 30 days</li>
                <li>Payment records: 7 years for legal compliance</li>
                <li>Event history: 2 years after event completion</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="section8" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                8. How Do We Keep Your Information Safe?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We aim to protect your personal
                information through a system of organisational and technical
                security measures.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="card bg-success/20 p-4">
                  <h4 className="font-semibold mb-2">🔐 Security Measures</h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • Encryption of sensitive data in transit and at rest
                    </li>
                    <li>• Secure JWT authentication</li>
                    <li>• Regular security audits and updates</li>
                    <li>
                      • Limited access to personal data by authorized personnel
                    </li>
                  </ul>
                </div>
                <div className="card bg-warning/20 p-4">
                  <h4 className="font-semibold mb-2">
                    ⚠️ Important Disclaimer
                  </h4>
                  <p className="text-sm">
                    No electronic transmission over the Internet can be
                    guaranteed to be 100% secure. You should only access our
                    Services within a secure environment.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section9" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                9. Do We Collect Information From Minors?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> We do not knowingly collect data from
                or market to children under 18 years of age.
              </p>
              <p className="mb-4">
                We do not knowingly collect, solicit data from, or market to
                children under 18 years of age, nor do we knowingly sell such
                personal information. By using the Services, you represent that
                you are at least 18 or that you are the parent or guardian of
                such a minor and consent to such minor dependent&rsquo;s use of
                the Services.
              </p>
            </section>

            {/* Section 10 */}
            <section id="section10" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                10. What Are Your Privacy Rights?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> In some regions, you have rights that
                allow you greater access to and control over your personal
                information.
              </p>

              <div className="bg-base-200 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Your Rights Include:</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Request access to your personal information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Request rectification or erasure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Restrict processing of your information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Data portability rights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Withdraw consent at any time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-success">✓</span>
                    <span>Update or terminate your account</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-info/20 rounded">
                  <p className="text-sm">
                    <strong>Account Management:</strong> You can log in to your
                    account settings and update your user account. Upon your
                    request to terminate your account, we will deactivate or
                    delete your account and information from our active
                    databases.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="section11" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                11. Controls for Do-Not-Track Features
              </h2>
              <p className="mb-4">
                Most web browsers and some mobile operating systems include a
                Do-Not-Track (&lsquo;DNT&rsquo;) feature or setting. At this
                stage, no uniform technology standard for recognising and
                implementing DNT signals has been finalised. As such, we do not
                currently respond to DNT browser signals or any other mechanism
                that automatically communicates your choice not to be tracked
                online.
              </p>
            </section>

            {/* Section 12 */}
            <section id="section12" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                12. Do We Make Updates to This Notice?
              </h2>
              <p className="mb-4">
                <strong>In Short:</strong> Yes, we will update this notice as
                necessary to stay compliant with relevant laws.
              </p>
              <p className="mb-4">
                We may update this Privacy Notice from time to time. The updated
                version will be indicated by an updated &lsquo;Revised&rsquo;
                date at the top of this Privacy Notice. If we make material
                changes to this Privacy Notice, we may notify you either by
                prominently posting a notice of such changes or by directly
                sending you a notification.
              </p>
            </section>

            {/* Contact Section */}
            <section id="section13" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                13. How Can You Contact Us About This Notice?
              </h2>
              <div className="card bg-primary/10 p-6">
                <p className="mb-4">
                  If you have questions or comments about this notice, you may
                  contact us at:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:denys.bielov@gmail.com"
                      className="link link-primary"
                    >
                      denys.bielov@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href="https://www.volleyer.app"
                      className="link link-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.volleyer.app
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14 */}
            <section id="section14" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                14. How Can You Review, Update, or Delete Data?
              </h2>
              <div className="card bg-base-200 p-4">
                <p className="mb-4">
                  Based on the applicable laws of your country, you may have the
                  right to request access to the personal information we collect
                  from you, details about how we have processed it, correct
                  inaccuracies, or delete your personal information.
                </p>
                <p>
                  To request to review, update, or delete your personal
                  information, please contact us using the information provided
                  above or through your account settings.
                </p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="alert alert-info mt-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 className="font-bold">Legal Notice</h3>
                <div className="text-sm">
                  This privacy policy is tailored for the Volleyer volleyball
                  community application. Please review it carefully and consult
                  legal counsel for any specific compliance requirements. We are
                  committed to protecting your privacy and ensuring compliance
                  with applicable data protection laws.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
