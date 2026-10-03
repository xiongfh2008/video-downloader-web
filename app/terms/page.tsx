import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Video Downloader",
  description: "Read the terms and conditions for using Video Downloader.",
};

// 集中管理，未来修改联系方式只需改这里
const CONTACT_EMAIL = "support@mindsenta.com";
const LAST_UPDATED = "October 2026";

type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "email" };

interface TermsSection {
  title: string;
  blocks: TermsBlock[];
}

const SECTIONS: TermsSection[] = [
  {
    title: "Introduction",
    blocks: [
      {
        type: "paragraph",
        text: 'These Terms of Service ("Terms") govern your access to and use of Video Downloader (the "Service"), an online tool that allows you to submit video URLs, analyze video information, and download videos or audio files in MP4 or MP3 format. The Service is designed to work without registration: you do not need to create an account or sign in to use it.',
      },
    ],
  },
  {
    title: "Acceptance of Terms",
    blocks: [
      {
        type: "paragraph",
        text: "By accessing or using the Service, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you should not use the Service. You are responsible for ensuring that your use of the Service complies with all laws and regulations that apply to you.",
      },
    ],
  },
  {
    title: "Use of the Service",
    blocks: [
      {
        type: "paragraph",
        text: "The Service allows you to submit a video URL, view information associated with that video, and download the corresponding file in MP4 or MP3 format. The Service is intended for use with publicly accessible video links and is provided free of charge.",
      },
      {
        type: "paragraph",
        text: "We do not guarantee that every URL can be processed or that every platform is supported. Whether a video can be analyzed and downloaded depends on factors that are outside of our control, such as the availability of the content and the technical restrictions of the platform hosting it.",
      },
    ],
  },
  {
    title: "Video Content and User Responsibility",
    blocks: [
      {
        type: "paragraph",
        text: "The Service provides technical processing and downloading functionality only. We do not own, control, or claim any ownership over the video content referenced by the URLs you submit, and we do not host that content.",
      },
      {
        type: "paragraph",
        text: "You are solely responsible for the URLs you submit and for the way you use any information or files obtained through the Service. You must make sure that you have the right to download, store, and use the content you request, and that your use does not violate the rights of others or any applicable rules.",
      },
    ],
  },
  {
    title: "Copyright and Intellectual Property",
    blocks: [
      {
        type: "paragraph",
        text: "Videos available on online platforms are generally protected by copyright and other intellectual property laws and belong to their respective owners. Nothing in these Terms transfers any ownership of such content to you, and nothing in these Terms gives you the right to use protected content without permission from its rightful owner.",
      },
      {
        type: "paragraph",
        text: "You may not use the Service to infringe the copyright, privacy, or other legitimate rights of any person or entity. Downloading content without proper authorization may be unlawful in your jurisdiction or may violate the terms of the platform that hosts the content. You are responsible for obtaining any required permissions.",
      },
    ],
  },
  {
    title: "Prohibited Uses",
    blocks: [
      {
        type: "paragraph",
        text: "When using the Service, you agree not to:",
      },
      {
        type: "list",
        items: [
          "Infringe the copyright, privacy, publicity, or other legitimate rights of others.",
          "Download or process content that you are not authorized to access or use.",
          "Circumvent technical protections or access restrictions applied by the platform hosting the content.",
          "Violate any applicable local, national, or international law, or the terms and policies of the video platform you are using.",
          "Interfere with, overload, or disrupt the operation of the Service, or attempt to gain unauthorized access to its systems.",
          "Use automated tools to submit bulk requests or abuse the Service in any way.",
        ],
      },
      {
        type: "paragraph",
        text: "We may restrict or block access to the Service for users who engage in prohibited uses.",
      },
    ],
  },
  {
    title: "Service Availability",
    blocks: [
      {
        type: "paragraph",
        text: 'The Service is provided on an "as is" and "as available" basis. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free, and we do not make any commitment regarding the continued availability of any feature.',
      },
      {
        type: "paragraph",
        text: "We may modify, suspend, or discontinue any part of the Service at any time and without prior notice. Analysis and download results may fail for reasons beyond our control, and we are not obligated to complete any particular request.",
      },
    ],
  },
  {
    title: "Third-Party Platforms and Content",
    blocks: [
      {
        type: "paragraph",
        text: "The videos processed by the Service are hosted on third-party platforms that are not operated or controlled by us. We do not review, endorse, or take responsibility for any third-party content, and we have no control over the availability, quality, or policies of those platforms.",
      },
      {
        type: "paragraph",
        text: "Your use of any video content is also governed by the terms, policies, and technical rules of the platform that hosts it. We are not liable for any actions taken by a third-party platform, including the removal, restriction, or blocking of content.",
      },
    ],
  },
  {
    title: "Disclaimer",
    blocks: [
      {
        type: "paragraph",
        text: 'To the fullest extent permitted by applicable law, the Service is provided "as is" and "as available", without warranties or conditions of any kind, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      },
      {
        type: "paragraph",
        text: "We do not warrant that video information displayed by the Service is accurate, complete, or up to date, nor do we warrant the quality, legality, or reliability of any content obtained through the Service.",
      },
    ],
  },
  {
    title: "Limitation of Liability",
    blocks: [
      {
        type: "paragraph",
        text: "To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, profits, or goodwill, arising out of or relating to your use of, or inability to use, the Service or any content obtained through it.",
      },
      {
        type: "paragraph",
        text: "To the fullest extent permitted by applicable law, our total aggregate liability arising out of or relating to the Service shall not exceed the amount you paid to us, if any, in connection with your use of the Service.",
      },
      {
        type: "paragraph",
        text: "Some jurisdictions do not allow the exclusion or limitation of certain warranties or damages, so parts of this section may not apply to you.",
      },
    ],
  },
  {
    title: "Changes to These Terms",
    blocks: [
      {
        type: "paragraph",
        text: 'We may update these Terms from time to time to reflect changes in the Service or in applicable practices. When we do, we will revise the “Last updated” date at the top of this page. Your continued use of the Service after changes take effect constitutes your acceptance of the updated Terms. We encourage you to review this page periodically.',
      },
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      {
        type: "paragraph",
        text: "If you have questions, concerns, or feedback regarding these Terms or the Service, you can contact us at:",
      },
      { type: "email" },
    ],
  },
];

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function TermsBlockView({ block }: { block: TermsBlock }) {
  if (block.type === "list") {
    return (
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600 marker:text-blue-600">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "email") {
    return (
      <p className="mt-4">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-blue-600 transition hover:text-blue-700"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    );
  }

  return <p className="mt-4 leading-7 text-slate-600">{block.text}</p>;
}

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-md bg-blue-600"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Video Downloader
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Last updated: {LAST_UPDATED}
          </p>

          <div className="mt-12 space-y-12">
            {SECTIONS.map((section) => (
              <section
                key={section.title}
                id={slugify(section.title)}
                className="scroll-mt-24"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  {section.title}
                </h2>

                {section.blocks.map((block, index) => (
                  <TermsBlockView key={index} block={block} />
                ))}
              </section>
            ))}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Video Downloader. All rights reserved.</p>

          <Link href="/" className="transition hover:text-slate-900">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
