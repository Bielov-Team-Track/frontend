import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Volleyer",
  description: "Terms of Service for Volleyer volleyball community application",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto sm:px-4 sm:py-8">
        <div className="max-w-4xl mx-auto bg-base-100 rounded-lg shadow-xl sm:p-8 p-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold  mb-2">Terms of Service</h1>
            <p className="text-base-content/70">
              Last updated: September 19, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6">
            {/* Introduction */}
            <div className="bg-base-200 sm:p-6 p-4 rounded-lg">
              <h2 className="text-2xl font-semibold  mb-4">
                Agreement to Our Legal Terms
              </h2>
              <p className="text-lg mb-4">
                We are <strong>Volleyer</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;).
                We operate the Volleyer volleyball community platform at{" "}
                <a
                  href="https://www.volleyer.app"
                  className="link link-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.volleyer.app
                </a>
                , as well as any other related products and services that refer
                or link to these legal terms (the &quot;Legal Terms&quot;) (collectively,
                the &quot;Services&quot;).
              </p>
              <p className="mb-4">
                You can contact us by email at{" "}
                <a
                  href="mailto:denys.bielov@gmail.com"
                  className="link link-primary"
                >
                  denys.bielov@gmail.com
                </a>
                .
              </p>
              <div className="alert alert-warning">
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
                  <h4 className="font-bold">Important Notice</h4>
                  <p className="text-sm">
                    These Legal Terms constitute a legally binding agreement.{" "}
                    <strong>
                      IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN
                      YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND
                      YOU MUST DISCONTINUE USE IMMEDIATELY.
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <section>
              <h2 className="text-2xl font-semibold  mb-4">
                Table of Contents
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                <a href="#section1" className="link link-primary">
                  1. Our Services
                </a>
                <a href="#section2" className="link link-primary">
                  2. Intellectual Property Rights
                </a>
                <a href="#section3" className="link link-primary">
                  3. User Representations
                </a>
                <a href="#section4" className="link link-primary">
                  4. Prohibited Activities
                </a>
                <a href="#section5" className="link link-primary">
                  5. User Generated Contributions
                </a>
                <a href="#section6" className="link link-primary">
                  6. Contribution License
                </a>
                <a href="#section7" className="link link-primary">
                  7. Services Management
                </a>
                <a href="#section8" className="link link-primary">
                  8. Term and Termination
                </a>
                <a href="#section9" className="link link-primary">
                  9. Modifications and Interruptions
                </a>
                <a href="#section10" className="link link-primary">
                  10. Governing Law
                </a>
                <a href="#section11" className="link link-primary">
                  11. Dispute Resolution
                </a>
                <a href="#section12" className="link link-primary">
                  12. Corrections
                </a>
                <a href="#section13" className="link link-primary">
                  13. Disclaimer
                </a>
                <a href="#section14" className="link link-primary">
                  14. Limitations of Liability
                </a>
                <a href="#section15" className="link link-primary">
                  15. Indemnification
                </a>
                <a href="#section16" className="link link-primary">
                  16. User Data
                </a>
                <a href="#section17" className="link link-primary">
                  17. Electronic Communications
                </a>
                <a href="#section18" className="link link-primary">
                  18. Miscellaneous
                </a>
                <a href="#section19" className="link link-primary">
                  19. Contact Us
                </a>
              </div>
            </section>

            {/* Section 1 */}
            <section id="section1" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">1. Our Services</h2>
              <div className="card bg-base-200 p-4">
                <p className="mb-4">
                  The Volleyer platform provides volleyball community services
                  including event creation, player matching, team management,
                  and tournament organization. The information provided when
                  using the Services is not intended for distribution to or use
                  by any person or entity in any jurisdiction or country where
                  such distribution or use would be contrary to law or
                  regulation.
                </p>
                <p>
                  Those persons who choose to access the Services from other
                  locations do so on their own initiative and are solely
                  responsible for compliance with local laws, if and to the
                  extent local laws are applicable.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section2" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                2. Intellectual Property Rights
              </h2>

              <h3 className="text-xl font-medium  mb-3">
                Our Intellectual Property
              </h3>
              <p className="mb-4">
                We are the owner or the licensee of all intellectual property
                rights in our Services, including all source code, databases,
                functionality, software, website designs, audio, video, text,
                photographs, and graphics in the Services (collectively, the
               &quot;Content&quot;), as well as the trademarks, service marks, and logos
                contained therein (the &quot;Marks&quot;).
              </p>

              <div className="bg-info/20 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Your Use of Our Services</h4>
                <p className="text-sm mb-2">
                  Subject to your compliance with these Legal Terms, we grant
                  you a non-exclusive, non-transferable, revocable license to:
                </p>
                <ul className="list-disc pl-6 text-sm">
                  <li>Access the volleyball community Services</li>
                  <li>
                    Download or print a copy of any portion of the Content to
                    which you have properly gained access
                  </li>
                  <li>
                    Use the Services for personal, non-commercial volleyball
                    activities
                  </li>
                </ul>
              </div>

              <div className="alert alert-warning">
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
                  <h4 className="font-bold">Important</h4>
                  <p className="text-sm">
                    No part of the Services may be copied, reproduced, or
                    otherwise exploited for any commercial purpose whatsoever,
                    without our express prior written permission.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section3" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                3. User Representations
              </h2>
              <p className="mb-4">
                By using the Services, you represent and warrant that:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>
                    You have the legal capacity and agree to comply with these
                    Legal Terms
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>
                    You are not a minor in the jurisdiction in which you reside
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>
                    You will not access the Services through automated or
                    non-human means
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>
                    You will not use the Services for any illegal or
                    unauthorized purpose
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>
                    Your use of the Services will not violate any applicable law
                    or regulation
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section4" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                4. Prohibited Activities
              </h2>
              <p className="mb-4">
                You may not access or use the Services for any purpose other
                than that for which we make the Services available. As a user of
                the volleyball community Services, you agree not to:
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="card bg-error/10 p-4">
                  <h4 className="font-semibold mb-2 text-error">
                    🚫 System Abuse
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Systematically retrieve data without permission</li>
                    <li>• Circumvent security features</li>
                    <li>• Use automated systems or scripts</li>
                    <li>• Upload viruses or malicious code</li>
                  </ul>
                </div>
                <div className="card bg-error/10 p-4">
                  <h4 className="font-semibold mb-2 text-error">
                    🚫 User Misconduct
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Trick, defraud, or mislead other users</li>
                    <li>• Harass, annoy, or threaten users</li>
                    <li>• Impersonate another user</li>
                    <li>• Submit false reports</li>
                  </ul>
                </div>
                <div className="card bg-error/10 p-4">
                  <h4 className="font-semibold mb-2 text-error">
                    🚫 Content Violations
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Copy or adapt our software</li>
                    <li>• Delete copyright notices</li>
                    <li>• Reverse engineer our code</li>
                    <li>• Use content for commercial purposes</li>
                  </ul>
                </div>
                <div className="card bg-error/10 p-4">
                  <h4 className="font-semibold mb-2 text-error">
                    🚫 Service Interference
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Interfere with service operation</li>
                    <li>• Create undue burden on systems</li>
                    <li>• Compete with our services</li>
                    <li>• Collect user data improperly</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section5" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                5. User Generated Contributions
              </h2>
              <p className="mb-4">
                The Services may provide you with the opportunity to create,
                submit, post, display, transmit, perform, publish, distribute,
                or broadcast content and materials to us or on the Services,
                including but not limited to text, writings, video, audio,
                photographs, graphics, comments, suggestions, or personal
                information or other material related to volleyball events,
                teams, and community activities (collectively, &quot;Contributions&quot;).
              </p>
              <div className="alert alert-info">
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
                  <h4 className="font-bold">Note</h4>
                  <p className="text-sm">
                    Contributions may be viewable by other users of the Services
                    and through third-party websites. Please ensure your content
                    is appropriate for the volleyball community.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section6" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                6. Contribution License
              </h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="mb-4">
                  You and Services agree that we may access, store, process, and
                  use any information and personal data that you provide and
                  your choices (including settings).
                </p>
                <p className="mb-4">
                  By submitting suggestions or other feedback regarding the
                  Services, you agree that we can use and share such feedback
                  for any purpose without compensation to you.
                </p>
                <p>
                  <strong>Important:</strong> You retain full ownership of all
                  of your Contributions and any intellectual property rights
                  associated with your Contributions. You are solely responsible
                  for your Contributions to the Services.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section7" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                7. Services Management
              </h2>
              <p className="mb-4">
                We reserve the right, but not the obligation, to:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="">1</span>
                  <span>
                    Monitor the Services for violations of these Legal Terms
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="">2</span>
                  <span>Take appropriate legal action against violators</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="">3</span>
                  <span>
                    Refuse, restrict access to, or disable any of your
                    Contributions
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="">4</span>
                  <span>
                    Remove files that are excessive in size or burdensome to our
                    systems
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="">5</span>
                  <span>
                    Manage the Services to protect our rights and facilitate
                    proper functioning
                  </span>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section8" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">
                8. Term and Termination
              </h2>
              <div className="alert alert-error">
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
                  <h4 className="font-bold">Termination Rights</h4>
                  <p className="text-sm">
                    WE RESERVE THE RIGHT TO DENY ACCESS TO AND USE OF THE
                    SERVICES TO ANY PERSON FOR ANY REASON OR FOR NO REASON,
                    INCLUDING BREACH OF ANY REPRESENTATION, WARRANTY, OR
                    COVENANT CONTAINED IN THESE LEGAL TERMS.
                  </p>
                </div>
              </div>
              <p className="mt-4">
                If we terminate or suspend your account, you are prohibited from
                registering and creating a new account under your name, a fake
                or borrowed name, or the name of any third party.
              </p>
            </section>

            {/* Section 13 */}
            <section id="section13" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">13. Disclaimer</h2>
              <div className="card bg-warning/20 p-4">
                <p className="font-semibold mb-2">
                  THE SERVICES ARE PROVIDED ON AN &quot;AS-IS&quot; AND &quot;AS-AVAILABLE&quot;
                  BASIS.
                </p>
                <p className="text-sm">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
                  WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE
                  SERVICES AND YOUR USE THEREOF. We make no warranties about the
                  accuracy or completeness of the Services&apos; content and assume
                  no liability for:
                </p>
                <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
                  <li>
                    Errors, mistakes, or inaccuracies of content and materials
                  </li>
                  <li>
                    Personal injury or property damage resulting from your
                    access to the Services
                  </li>
                  <li>Unauthorized access to our secure servers</li>
                  <li>
                    Interruption or cessation of transmission to or from the
                    Services
                  </li>
                  <li>
                    Bugs, viruses, or similar issues transmitted by third
                    parties
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 16 */}
            <section id="section16" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">16. User Data</h2>
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="mb-4">
                  We will maintain certain data that you transmit to the
                  Services for the purpose of managing the performance of the
                  Services, as well as data relating to your use of the
                  Services. Although we perform regular routine backups of data,
                  you are solely responsible for all data that you transmit or
                  that relates to any volleyball activities you have undertaken
                  using the Services.
                </p>
                <p>
                  <strong>Important:</strong> You agree that we shall have no
                  liability to you for any loss or corruption of any such data,
                  and you hereby waive any right of action against us arising
                  from any such loss or corruption of such data.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="section19" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold  mb-4">19. Contact Us</h2>
              <div className="card bg-primary/10 p-6">
                <p className="mb-4">
                  In order to resolve a complaint regarding the Services or to
                  receive further information regarding use of the Services,
                  please contact us at:
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
                  These Terms of Service are tailored for the Volleyer
                  volleyball community application. Please review them carefully
                  and consult legal counsel for any specific compliance
                  requirements. We reserve the right to update these terms as
                  necessary to stay compliant with relevant laws.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
