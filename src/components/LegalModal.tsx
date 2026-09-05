import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

type LegalDocument = 'terms' | 'privacy';

interface LegalModalProps {
  document: LegalDocument;
  onBack: () => void;
  onClose: () => void;
  isDark: boolean;
}

const termsSections = [
  ['1. About NeoMart', 'NeoMart is an online marketplace that allows users to browse, purchase, and, where enabled, sell products through the Platform. NeoMart may provide the technology and services that connect buyers and sellers. Unless specifically stated otherwise, NeoMart is not the manufacturer of products listed by independent sellers.'],
  ['2. User Accounts', 'To use certain NeoMart features, you may be required to create an account. You agree to provide accurate and up-to-date information, keep your login information secure, not share your password or account access with unauthorized persons, notify NeoMart if you believe your account has been compromised, use only one account unless NeoMart permits otherwise, and not create an account using false or misleading information. You are responsible for activities performed through your account. NeoMart may suspend or terminate accounts involved in fraud, abuse, illegal activity, or violations of these Terms.'],
  ['3. Buying Products', 'When placing an order, you agree that you have provided accurate delivery and contact information, are authorized to use the selected payment method, understand the product description, price, and applicable delivery charges, and understand that placing an order constitutes a request to purchase the product. An order is not necessarily accepted until NeoMart or the relevant seller confirms it. NeoMart may cancel an order where there is suspected fraud, an obvious pricing error, product unavailability, payment failure, or another legitimate reason.'],
  ['4. Product Information', 'Sellers are responsible for ensuring that product listings are accurate and not misleading. Product descriptions, images, prices, availability, specifications, and other information may be provided by sellers. NeoMart does not guarantee that every product listing is completely accurate or that product colors, sizes, or appearance will exactly match images displayed on every device.'],
  ['5. Prices and Payments', 'Prices displayed on NeoMart may change at any time before an order is confirmed. The total amount payable may include the product price, delivery charges, applicable taxes or fees, and other charges clearly displayed before payment. Payments must be made using methods supported by NeoMart. NeoMart may use third-party payment providers, which may have their own terms and privacy policies.'],
  ['6. Delivery', 'NeoMart or the relevant seller may arrange delivery through available delivery partners. Estimated delivery times are provided for guidance and are not guaranteed unless expressly stated. Delays may occur because of weather, transportation problems, incorrect addresses, public holidays, third-party delivery services, or circumstances beyond reasonable control. Customers are responsible for providing a valid delivery address and being available to receive orders.'],
  ['7. Order Cancellation', 'Cancellation may be available before an order reaches a certain stage of processing. Once an order has been shipped or otherwise processed, cancellation may no longer be possible. NeoMart may cancel orders where products are unavailable, payment cannot be verified, fraudulent activity is suspected, or other legitimate circumstances require cancellation.'],
  ['8. Returns and Refunds', 'NeoMart may provide returns and refunds in accordance with its applicable return policy. Depending on the circumstances, a customer may be eligible where the wrong product was delivered, the product arrived damaged, the product materially differs from its listing, the product is defective, or another reason covered by NeoMart policy applies. Certain products may not be eligible because of their nature, condition, hygiene requirements, personalization, or applicable law. Customers may be required to provide photographs, videos, order information, or other evidence. Refunds may take additional time depending on the payment provider or financial institution.'],
  ['9. Sellers', 'If you sell products through NeoMart, you agree that you have the legal right to sell the products, your products are genuine and accurately described, your listings are not false or misleading, your products comply with applicable laws, you fulfill accepted orders within the required timeframe, you do not manipulate ratings, reviews, orders, or sales, and you do not sell prohibited or illegal products. NeoMart may remove listings, restrict seller accounts, suspend selling privileges, or take other appropriate action when a seller violates these Terms.'],
  ['10. Prohibited Products and Activities', 'Users may not use NeoMart to sell, purchase, promote, or distribute illegal or prohibited goods or services, including illegal drugs, stolen goods, counterfeit products, fraudulent documents, weapons or other prohibited items, products that infringe intellectual property rights, sexually exploitative material, products prohibited by applicable law, or any other item or service prohibited by NeoMart. NeoMart may remove prohibited listings and report illegal activity where required or permitted by law.'],
  ['11. Reviews and Ratings', 'Customers may leave reviews and ratings based on their genuine experience. Reviews must not contain false information, be posted in exchange for undisclosed payment or benefits, harass or threaten another person, contain illegal or abusive content, or attempt to manipulate product ratings. NeoMart may remove reviews that violate these Terms.'],
  ['12. User Content', 'If you upload photographs, videos, reviews, product descriptions, comments, or other content to NeoMart, you must have the necessary rights to upload it. You grant NeoMart a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute that content as reasonably necessary to operate and promote the Platform. You remain responsible for the content you upload.'],
  ['13. Intellectual Property', 'The NeoMart name, logo, branding, software, design, graphics, text, and other Platform materials may be owned by NeoMart or its licensors. You may not copy, modify, distribute, reverse engineer, reproduce, or commercially exploit NeoMart intellectual property without appropriate permission.'],
  ['14. Fraud and Abuse', 'NeoMart may investigate suspicious activities, including fake accounts, payment fraud, false refund claims, fake reviews, coupon or promotional abuse, chargeback abuse, account manipulation, seller fraud, and attempts to bypass NeoMart security systems. NeoMart may suspend accounts, cancel transactions, withhold or reverse benefits, or take other lawful action where appropriate.'],
  ['15. Third-Party Services', 'NeoMart may integrate with third-party services such as payment processors, delivery companies, authentication providers, analytics services, or other technology providers. Third-party services may have separate terms and privacy policies. NeoMart is not responsible for matters solely within the control of those third parties.'],
  ['16. Privacy', 'Your use of NeoMart is also subject to our Privacy Policy, which explains how we collect, use, store, and protect personal information. By using NeoMart, you acknowledge that you have reviewed the applicable Privacy Policy.'],
  ['17. Platform Availability', 'NeoMart aims to keep the Platform available and functioning properly, but we do not guarantee that it will always be uninterrupted, error-free, secure, or available. The Platform may occasionally be unavailable because of maintenance, technical problems, updates, security incidents, or circumstances outside our control.'],
  ['18. Limitation of Liability', 'To the extent permitted by applicable law, NeoMart will not be responsible for indirect, incidental, special, or consequential losses arising from your use of the Platform. Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.'],
  ['19. Changes to These Terms', 'NeoMart may update these Terms from time to time. When significant changes are made, NeoMart may provide notice through the Platform or other reasonable means. Your continued use of NeoMart after updated Terms become effective means you accept the revised Terms.'],
  ['20. Termination', 'NeoMart may suspend or terminate your access to the Platform if you violate these Terms, engage in fraudulent or illegal activity, or create a risk to NeoMart or other users. You may stop using your account at any time, subject to outstanding transactions or obligations.'],
  ['21. Governing Law', 'These Terms shall be governed by the applicable laws of the jurisdiction in which NeoMart operates, subject to any mandatory consumer protection rights that apply to you.'],
  ['22. Contact Us', 'If you have questions, complaints, or concerns regarding these Terms, contact NeoMart through the customer support channels provided within the Platform. NeoMart.'],
];

const privacySections = [
  ['Information We Collect', 'NeoMart may collect information you provide, including your name, email address, phone number, delivery address, account details, order information, and messages sent to customer support. We may also collect device, browser, usage, and technical information needed to operate and secure the Platform.'],
  ['How We Use Information', 'We use information to create and manage accounts, process orders and payments, arrange delivery, provide customer support, improve products and services, prevent fraud and abuse, send important service messages, and comply with legal obligations.'],
  ['Sharing Information', 'We may share information with sellers, delivery partners, payment providers, authentication services, hosting providers, analytics providers, customer support providers, and authorities where required by law. We do not sell personal information for unrelated purposes.'],
  ['Storage and Security', 'We use reasonable technical and organizational measures to protect personal information. No online service can guarantee absolute security. You are responsible for protecting your password and notifying NeoMart if you believe your account has been compromised.'],
  ['Cookies and Local Storage', 'NeoMart may use cookies, local storage, and similar technologies to remember preferences, keep you signed in, maintain carts, improve performance, and understand how the Platform is used. You can manage storage through your browser settings, although some features may not work correctly if it is disabled.'],
  ['Your Choices', 'You may review or update some account information through the Platform. You may also contact NeoMart support about access, correction, or deletion requests, subject to applicable law and legitimate business needs.'],
  ['Children and Changes', 'NeoMart is not intended for children who cannot legally use online marketplace services. We may update this Privacy Policy from time to time and will provide reasonable notice of significant changes.'],
  ['Contact', 'For privacy questions or requests, contact NeoMart through the customer support channels provided within the Platform.'],
];

export const LegalModal: React.FC<LegalModalProps> = ({ document, onBack, onClose, isDark }) => {
  const sections = document === 'terms' ? termsSections : privacySections;
  const title = document === 'terms' ? 'NeoMart Terms & Conditions' : 'NeoMart Privacy Policy';
  const panel = isDark ? 'bg-[#1a1a1a] text-[#f3f3f3]' : 'bg-white text-[#211e1d]';
  const muted = isDark ? 'text-[#bdbdbd]' : 'text-[#77716e]';
  const border = isDark ? 'border-[#363636]' : 'border-[#e5e1df]';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6">
      <div className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl ${panel}`}>
        <header className={`flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-7 ${border}`}>
          <button type="button" onClick={onBack} className={`inline-flex items-center gap-2 text-sm font-bold transition hover:text-[#f4510b] cursor-pointer ${muted}`}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className={`rounded-full p-2 cursor-pointer ${isDark ? 'bg-[#2a2a2a] text-white' : 'bg-[#f5f5f3] text-[#5d5a58]'}`}>
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          <p className={`mt-2 text-sm ${muted}`}>Last Updated: September 5, 2026</p>
          <p className={`mt-6 text-sm leading-6 ${muted}`}>
            {document === 'terms'
              ? 'Welcome to NeoMart. These Terms govern your use of the NeoMart website, mobile application, and related services. By creating an account, browsing, purchasing, selling, or otherwise using NeoMart, you agree to these Terms.'
              : 'This Privacy Policy explains how NeoMart collects, uses, stores, and protects information when you use the NeoMart Platform.'}
          </p>
          <div className="mt-7 space-y-6">
            {sections.map(([heading, text]) => (
              <section key={heading}>
                <h2 className="text-base font-extrabold text-[#f4510b]">{heading}</h2>
                <p className={`mt-2 text-sm leading-6 ${muted}`}>{text}</p>
              </section>
            ))}
          </div>
          {document === 'terms' && <p className={`mt-8 border-t pt-6 text-sm leading-6 ${border} ${muted}`}>By using NeoMart, you confirm that you have read, understood, and agreed to these Terms & Conditions.</p>}
        </main>
      </div>
    </div>
  );
};
