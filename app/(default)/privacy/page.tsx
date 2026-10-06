import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Vidsavey",
  description:
    "Learn how Vidsavey handles information, video URLs, privacy, and data security. No account required, no ads, no tracking cookies.",
  keywords:
    "vidsavey privacy policy, privacy policy, data protection, video downloader privacy, no tracking, online video downloader privacy",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy - Vidsavey",
    description:
      "Learn how Vidsavey handles information, video URLs, privacy, and data security. No account required, no ads, no tracking cookies.",
    type: "website",
  },
};

// 集中管理，未来修改联系方式只需改这里
const CONTACT_EMAIL = "support@mindsenta.com";
const LAST_UPDATED = "October 2026";

type PolicyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "email" };

interface PolicySection {
  title: string;
  blocks: PolicyBlock[];
}

const SECTIONS: PolicySection[] = [
  {
    title: "Introduction",
    blocks: [
      {
        type: "paragraph",
        text: 'This Privacy Policy explains how Vidsavey ("we", "us") handles information when you use our website and online video downloading service. The service is designed to work without registration: you do not need to create an account or sign in to use it. By using the service, you agree to the practices described in this policy.',
      },
    ],
  },
  {
    title: "Information We Collect",
    blocks: [
      {
        type: "paragraph",
        text: "Because the service does not require an account, we do not ask you to provide personal profile information such as your name, email address, or payment details. The information we may process includes:",
      },
      {
        type: "list",
        items: [
          "The video URLs that you voluntarily submit for analysis and downloading.",
          "Standard technical information that your browser automatically sends to our servers when you visit the site, such as your IP address, browser type, and the pages you request.",
          "Basic operational data that helps us keep the service reliable and secure.",
        ],
      },
      {
        type: "paragraph",
        text: "The service currently does not include user accounts or history features, so no account data or browsing history is created.",
      },
    ],
  },
  {
    title: "How We Use Information",
    blocks: [
      {
        type: "paragraph",
        text: "We use the information described above to:",
      },
      {
        type: "list",
        items: [
          "Analyze the video URL you submit and display video information such as the title, uploader, duration, and thumbnail.",
          "Prepare and deliver the MP4 or MP3 file you request.",
          "Operate, maintain, and improve the service.",
          "Protect the service against abuse, misuse, and technical threats.",
        ],
      },
      {
        type: "paragraph",
        text: "We do not sell your information, and we do not use it to create advertising profiles.",
      },
    ],
  },
  {
    title: "Video URLs and Processing",
    blocks: [
      {
        type: "paragraph",
        text: "When you submit a video URL, the URL is sent to our servers so that the backend can analyze it and process your download request. This means we necessarily receive and temporarily handle the exact URL you provide, together with basic technical data associated with the request.",
      },
      {
        type: "paragraph",
        text: "The service is intended to be used only with publicly accessible video links. We process the URL solely to complete the task you requested and do not use submitted URLs for unrelated purposes.",
      },
      {
        type: "paragraph",
        text: "You are responsible for making sure that you have the right to download and use the content you request, and that your use complies with the terms of the platform hosting the video.",
      },
    ],
  },
  {
    title: "Cookies and Similar Technologies",
    blocks: [
      {
        type: "paragraph",
        text: "The website is designed to function without advertising or tracking cookies. Like most websites, certain necessary browser technologies may be used to keep the service working properly, such as standard browser storage or session mechanisms required for basic functionality and security.",
      },
      {
        type: "paragraph",
        text: "The specific technologies used may change as the service evolves, and this policy will be updated to reflect any significant changes. You can control or delete cookies and site data at any time through your browser settings.",
      },
    ],
  },
  {
    title: "Third-Party Services",
    blocks: [
      {
        type: "paragraph",
        text: "To analyze and download videos, our backend needs to communicate with the video platform that hosts the content you linked. These platforms are operated by independent third parties, and their handling of any request data is governed by their own policies and terms.",
      },
      {
        type: "paragraph",
        text: "The service also relies on general infrastructure and hosting providers to operate the website and its backend. These providers may process standard technical data, such as IP addresses and server logs, as part of delivering the service.",
      },
      {
        type: "paragraph",
        text: "We do not sell or share your information with third parties for their own marketing purposes.",
      },
    ],
  },
  {
    title: "Data Retention",
    blocks: [
      {
        type: "paragraph",
        text: "Video URLs and related request data are processed on our servers for the time needed to complete your request. Server and security logs may be kept for a limited period for operational, security, and legal purposes, after which they are deleted or anonymized.",
      },
      {
        type: "paragraph",
        text: "The service currently does not offer account or history features, so we do not maintain a browsable history of the links you have submitted.",
      },
    ],
  },
  {
    title: "Data Security",
    blocks: [
      {
        type: "paragraph",
        text: "We apply reasonable technical and organizational measures to protect the information processed by the service. However, no method of transmission over the internet or method of electronic storage is completely secure, and we cannot guarantee absolute security. We encourage you to keep this in mind when using the service.",
      },
    ],
  },
  {
    title: "Children's Privacy",
    blocks: [
      {
        type: "paragraph",
        text: "The service is not directed to children, and we do not knowingly collect personal information from children under the age of 13 or any higher minimum age required by applicable law. If you believe that a child has provided us with personal information, please contact us so that we can take appropriate action.",
      },
    ],
  },
  {
    title: "International Users",
    blocks: [
      {
        type: "paragraph",
        text: "The service may be operated using infrastructure located in countries other than your own. If you access the service from another region, the information described in this policy may be transferred to and processed in those locations in accordance with this policy.",
      },
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    blocks: [
      {
        type: "paragraph",
        text: "We may update this Privacy Policy from time to time to reflect changes in the service or in applicable practices. When we do, we will revise the “Last updated” date at the top of this page. We encourage you to review this page periodically to stay informed about how we handle information.",
      },
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      {
        type: "paragraph",
        text: "If you have questions, concerns, or requests regarding this Privacy Policy or the way the service handles information, you can contact us at:",
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

function PolicyBlockView({ block }: { block: PolicyBlock }) {
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

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/vidsavey-logo.png"
              alt="Vidsavey"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="text-[22px] font-bold tracking-tight text-slate-900">
              Vidsavey
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
            Privacy Policy
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
                  <PolicyBlockView key={index} block={block} />
                ))}
              </section>
            ))}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Vidsavey. All rights reserved.</p>

          <Link href="/" className="transition hover:text-slate-900">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
