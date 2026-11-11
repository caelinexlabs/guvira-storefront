import Image from "next/image";
import Link from "next/link";
import { newsletterOpen } from "@/lib/caelinex/shopper";
import type { Category } from "@/lib/commerce/types";
import { Icon } from "./icons";
import { Newsletter } from "./newsletter";
import { Heading } from "./ui";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section className="sec wrap" id="categories" aria-labelledby="cat-h">
      <div className="sec-head">
        <Heading script="shop by" caps="Category" id="cat-h" />
      </div>
      <ul className="tiles">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link className="tile" href={`/shop/${c.slug}`}>
              <span className="arch">
                {c.image ? (
                  <Image
                    src={c.image.src}
                    alt=""
                    fill
                    sizes="(max-width: 860px) 44vw, 16vw"
                    style={{ objectPosition: c.image.position }}
                  />
                ) : (
                  <Icon name={c.glyph ?? "necklace"} className="" />
                )}
              </span>
              <span className="row">
                {c.name}
                <Icon name="arrow" />
              </span>
              <small>{c.blurb}</small>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The owner's trust strip: short lines of reassurance, one per item. */
export function TrustStrip({ items }: { items: string[] }) {
  return (
    <section className="sec wrap" aria-label="Why shop with us">
      <ul className="promise-strip">
        {items.map((t) => (
          <li key={t}>
            <span className="ic">
              <Icon name="check" />
            </span>
            <div>
              <b>{t}</b>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One photo with a heading and a line, from the owner's story banner. */
export function StoryBanner({
  media,
  heading,
  text,
}: {
  media: string | null;
  heading: string;
  text: string;
}) {
  return (
    <section className="sec wrap story-banner" aria-labelledby="story-h">
      {media && (
        <Image
          src={media}
          alt=""
          width={1200}
          height={800}
          sizes="(max-width: 860px) 100vw, 50vw"
        />
      )}
      <div>
        {heading && <h2 id="story-h">{heading}</h2>}
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}

/** A row of the owner's photos. */
export function Gallery({
  heading,
  media,
}: {
  heading: string;
  media: string[];
}) {
  return (
    <section className="sec wrap" aria-label={heading || "Gallery"}>
      {heading && (
        <div className="sec-head">
          <h2 className="h2plain">{heading}</h2>
        </div>
      )}
      <ul className="strip">
        {media.map((src) => (
          <li key={src}>
            <Image
              src={src}
              alt=""
              width={480}
              height={640}
              sizes="(max-width: 860px) 58vw, 20vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <section className="sec wrap" aria-labelledby="faq-h">
      <Heading script="questions," caps="Answered" id="faq-h" />
      <div className="faq">
        {items.map((f, i) => (
          <details key={f.question} open={i === 0}>
            <summary>
              {f.question}
              <Icon name="plus" />
            </summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** The newsletter block, with the owner's heading and text. */
export function NewsletterSection({
  heading,
  text,
  instagram,
}: {
  heading: string;
  text: string;
  instagram?: string;
}) {
  return (
    <section className="sec wrap" aria-label="Newsletter">
      <Newsletter
        open={newsletterOpen}
        heading={heading}
        text={text}
        instagram={instagram}
      />
    </section>
  );
}

export function Closing({ script, caps }: { script: string; caps: string }) {
  return (
    <section className="closing wrap" aria-label={`${script} ${caps}`}>
      <Heading as="p" script={script} caps={caps} className="center xl" />
    </section>
  );
}
