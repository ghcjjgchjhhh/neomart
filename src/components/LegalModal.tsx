import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

type LegalDocument = 'terms' | 'privacy';

interface LegalModalProps {
  document: LegalDocument;
  onBack: () => void;
  onClose: () => void;
  isDark: boolean;
}

const termsText = `NeoMart Terms & Conditions

Last Updated: September 5, 2026

Welcome to NeoMart. These Terms & Conditions ("Terms") govern your use of the NeoMart website, mobile application, and related services ("Platform").

By creating an account, browsing, purchasing, selling, or otherwise using NeoMart, you agree to these Terms. If you do not agree, please do not use the Platform.

1. About NeoMart

NeoMart is an online marketplace that allows users to browse, purchase, and, where enabled, sell products through the Platform.

NeoMart may provide the technology and services that connect buyers and sellers. Unless specifically stated otherwise, NeoMart is not the manufacturer of products listed by independent sellers.

2. User Accounts

To use certain NeoMart features, you may be required to create an account.

You agree to:

- Provide accurate and up-to-date information.
- Keep your login information secure.
- Not share your password or account access with unauthorized persons.
- Notify NeoMart if you believe your account has been compromised.
- Use only one account unless NeoMart permits otherwise.
- Not create an account using false or misleading information.

You are responsible for activities performed through your account.

NeoMart may suspend or terminate accounts involved in fraud, abuse, illegal activity, or violations of these Terms.

3. Buying Products

When placing an order, you agree that:

- You have provided accurate delivery and contact information.
- You are authorized to use the selected payment method.
- You understand the product description, price, and applicable delivery charges.
- Placing an order constitutes a request to purchase the product.

An order is not necessarily accepted until NeoMart or the relevant seller confirms it.

NeoMart may cancel an order where there is suspected fraud, an obvious pricing error, product unavailability, payment failure, or another legitimate reason.

4. Product Information

Sellers are responsible for ensuring that product listings are accurate and not misleading.

Product descriptions, images, prices, availability, specifications, and other information may be provided by sellers.

NeoMart does not guarantee that every product listing is completely accurate or that product colors, sizes, or appearance will exactly match images displayed on every device.

5. Prices and Payments

Prices displayed on NeoMart may change at any time before an order is confirmed.

Depending on the transaction, the total amount payable may include:

- Product price
- Delivery charges
- Applicable taxes or fees
- Other charges clearly displayed before payment

Payments must be made using payment methods supported by NeoMart.

NeoMart may use third-party payment providers to process payments. Payment providers may have their own terms and privacy policies.

6. Delivery

NeoMart or the relevant seller may arrange delivery through available delivery partners.

Estimated delivery times are provided for guidance and are not guaranteed unless expressly stated.

Delays may occur because of weather, transportation problems, incorrect addresses, public holidays, third-party delivery services, or circumstances beyond reasonable control.

Customers are responsible for providing a valid delivery address and being available to receive their orders.

7. Order Cancellation

Cancellation may be available before an order reaches a certain stage of processing.

Once an order has been shipped or otherwise processed, cancellation may no longer be possible.

NeoMart may cancel orders where products are unavailable, payment cannot be verified, fraudulent activity is suspected, or other legitimate circumstances require cancellation.

8. Returns and Refunds

NeoMart may provide returns and refunds in accordance with its applicable return policy.

Depending on the circumstances, a customer may be eligible for a return or refund where:

- The wrong product was delivered.
- The product arrived damaged.
- The product materially differs from its listing.
- The product is defective.
- Another reason covered by NeoMart's return policy applies.

Certain products may not be eligible for return because of their nature, condition, hygiene requirements, personalization, or applicable law.

Customers may be required to provide photographs, videos, order information, or other evidence when submitting a return or refund request.

Refunds may take additional time to appear depending on the payment provider or financial institution.

9. Sellers

If you sell products through NeoMart, you agree that:

- You have the legal right to sell the products you list.
- Your products are genuine and accurately described.
- Your listings do not contain false or misleading information.
- Your products comply with applicable laws and regulations.
- You will fulfill accepted orders within the required timeframe.
- You will not manipulate ratings, reviews, orders, or sales.
- You will not sell prohibited or illegal products.

Sellers are responsible for the products they list and for complying with applicable laws.

NeoMart may remove listings, restrict seller accounts, suspend selling privileges, or take other appropriate action when a seller violates these Terms.

10. Prohibited Products and Activities

Users may not use NeoMart to sell, purchase, promote, or distribute illegal or prohibited goods or services.

Examples include:

- Illegal drugs
- Stolen goods
- Counterfeit products
- Fraudulent documents
- Weapons or other prohibited items
- Products that infringe intellectual property rights
- Sexually exploitative material
- Products prohibited by applicable law
- Any other item or service prohibited by NeoMart

NeoMart may remove prohibited listings and report illegal activity to appropriate authorities where required or permitted by law.

11. Reviews and Ratings

Customers may be allowed to leave reviews and ratings based on their genuine experience.

Reviews must not:

- Contain false information.
- Be posted in exchange for undisclosed payment or benefits.
- Harass or threaten another person.
- Contain illegal or abusive content.
- Attempt to manipulate product ratings.

NeoMart may remove reviews that violate these Terms.

12. User Content

If you upload photographs, videos, reviews, product descriptions, comments, or other content to NeoMart, you must have the necessary rights to upload that content.

You grant NeoMart a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute such content as reasonably necessary to operate and promote the Platform.

You remain responsible for the content you upload.

13. Intellectual Property

The NeoMart name, logo, branding, software, design, graphics, text, and other Platform materials may be owned by NeoMart or its licensors.

You may not copy, modify, distribute, reverse engineer, reproduce, or commercially exploit NeoMart's intellectual property without appropriate permission.

14. Fraud and Abuse

NeoMart takes fraud and abuse seriously.

We may investigate suspicious activities, including:

- Fake accounts
- Payment fraud
- False refund claims
- Fake reviews
- Coupon or promotional abuse
- Chargeback abuse
- Account manipulation
- Seller fraud
- Attempts to bypass NeoMart's security systems

NeoMart may suspend accounts, cancel transactions, withhold or reverse benefits, or take other lawful action where appropriate.

15. Third-Party Services

NeoMart may integrate with third-party services such as payment processors, delivery companies, authentication providers, analytics services, or other technology providers.

Third-party services may have separate terms and privacy policies. NeoMart is not responsible for matters solely within the control of those third parties.

16. Privacy

Your use of NeoMart is also subject to our Privacy Policy, which explains how we collect, use, store, and protect personal information.

By using NeoMart, you acknowledge that you have reviewed the applicable Privacy Policy.

17. Platform Availability

NeoMart aims to keep the Platform available and functioning properly, but we do not guarantee that it will always be uninterrupted, error-free, secure, or available.

The Platform may occasionally be unavailable because of maintenance, technical problems, updates, security incidents, or circumstances outside our control.

18. Limitation of Liability

To the extent permitted by applicable law, NeoMart will not be responsible for indirect, incidental, special, or consequential losses arising from your use of the Platform.

Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.

19. Changes to These Terms

NeoMart may update these Terms from time to time.

When significant changes are made, NeoMart may provide notice through the Platform or other reasonable means.

Your continued use of NeoMart after updated Terms become effective means you accept the revised Terms.

20. Termination

NeoMart may suspend or terminate your access to the Platform if you violate these Terms, engage in fraudulent or illegal activity, or create a risk to NeoMart or other users.

You may stop using your account at any time, subject to any outstanding transactions or obligations.

21. Governing Law

These Terms shall be governed by the applicable laws of the jurisdiction in which NeoMart operates, subject to any mandatory consumer protection rights that apply to you.

22. Contact Us

If you have questions, complaints, or concerns regarding these Terms, you can contact NeoMart through the customer support channels provided within the Platform.

NeoMart

Email: [Insert your official support email]

Website: [Insert your official website]

By using NeoMart, you confirm that you have read, understood, and agreed to these Terms & Conditions.`;

export const LegalModal: React.FC<LegalModalProps> = ({ document, onBack, onClose, isDark }) => {
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
          {document === 'terms' ? (
            <pre className={`mt-6 whitespace-pre-wrap font-sans text-sm leading-6 ${muted}`}>{termsText}</pre>
          ) : <pre className={`mt-6 whitespace-pre-wrap font-sans text-sm leading-6 ${muted}`}>{termsText}</pre>}
        </main>
      </div>
    </div>
  );
};
