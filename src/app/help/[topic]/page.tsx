import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HELP, helpTopic } from "@/content/help";
import { getContact } from "@/lib/contact";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return HELP.map((h) => ({ topic: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = helpTopic((await params).topic);
  return t ? { title: t.title, description: t.summary } : {};
}

export default async function HelpPage({ params }: Props) {
  const topic = helpTopic((await params).topic);
  if (!topic) notFound();
  const contact = await getContact();
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap help">
        <nav className="help-nav" aria-label="Help topics">
          {HELP.map((h) => (
            <Link
              key={h.slug}
              href={`/help/${h.slug}`}
              aria-current={h.slug === topic.slug ? "page" : undefined}
            >
              {h.title}
            </Link>
          ))}
        </nav>
        <article className="help-body">
          <h1 className="h2plain">{topic.title}</h1>
          <p className="help-summary">{topic.summary}</p>
          {topic.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          {topic.slug === "orders" && (
            <p>
              <Link href="/orders/track">Track your order</Link>
            </p>
          )}
          {topic.slug === "contact" && (
            <section>
              <h2>How to reach us</h2>
              {contact.email && (
                <p>
                  Email <a href={`mailto:${contact.email}`}>{contact.email}</a>.
                </p>
              )}
              {contact.phone && <p>Call or message {contact.phone}.</p>}
              {contact.social.map((l) => (
                <p key={l.icon}>
                  Find us on <a href={l.href}>{l.label}</a>.
                </p>
              ))}
              {contact.address && <p>{contact.address}</p>}
              {!contact.email &&
                !contact.phone &&
                contact.social.length === 0 && (
                  <p>
                    Contact details will be listed here before the shop opens.
                  </p>
                )}
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
