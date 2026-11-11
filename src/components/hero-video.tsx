"use client";

import { useEffect, useRef, useState } from "react";
import { resolveLink } from "@/lib/link";
import { Icon } from "./icons";
import { Heading, PillLink } from "./ui";

export type HeroContent = {
  heading: string;
  subheading: string;
  buttonLabel: string;
  buttonLink: string;
  /** A photo or video the owner uploaded. Without one, the Guvira film plays. */
  media: string | null;
  /** Still shown while the video loads. */
  poster: string | null;
  /** A video for phones, and its still. */
  mobileMedia: string | null;
  mobilePoster: string | null;
};

// What the hero says until the owner writes their own in the admin.
const DEFAULT = {
  heading: "Anti tarnish boutique",
  subheading:
    "Curation for the elegant women. Anti-tarnish, waterproof jewellery, made to be worn every day.",
  buttonLabel: "Explore collection",
  buttonLink: "/shop",
};

// The Caelinex host resizes its own photos: ?w= takes 480, 960, 1600 or 2400
// and answers a WebP no wider than that.
const WIDTHS = [480, 960, 1600, 2400];
const resized = (src: string) =>
  src.includes("/retail-media/") && !src.includes("?")
    ? WIDTHS.map((w) => `${src}?w=${w} ${w}w`).join(", ")
    : undefined;

const isVideo = (src: string) => /\.(mp4|webm|mov)(\?|$)/i.test(src);

/** "Anti tarnish boutique" -> script "anti tarnish" over capitals "boutique". */
function splitHeading(text: string) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return { script: "", caps: text.trim() };
  const cut = Math.ceil(words.length / 2);
  return {
    script: words.slice(0, cut).join(" ").toLowerCase(),
    caps: words.slice(cut).join(" "),
  };
}

/**
 * Full-screen hero film. Plays muted and loops, pauses off screen, keeps still
 * for people who ask their device to reduce motion, and always offers pause.
 */
export function HeroVideo({ content }: { content: HeroContent }) {
  const own = content.media;
  const ownVideo = own ? isVideo(own) : false;
  const heading = splitHeading(content.heading || DEFAULT.heading);
  const subheading = content.heading ? content.subheading : DEFAULT.subheading;
  const label = content.buttonLabel || DEFAULT.buttonLabel;
  const link = resolveLink(content.buttonLink || DEFAULT.buttonLink);
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (matchMedia("(max-width: 767px)").matches) {
      const still =
        content.mobilePoster ??
        (content.media ? null : "/video/guvira-hero-mobile.jpg");
      if (still) v.poster = still;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      userPaused.current = true;
      v.pause();
    }
    const sync = () => setPaused(v.paused);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) v.pause();
        else if (!userPaused.current) v.play().catch(() => {});
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    sync();
    return () => {
      io.disconnect();
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
    };
  }, [content.media, content.mobilePoster]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <section className="vhero" aria-labelledby="hero-h">
      <div className="vhero-frame">
        {own && !ownVideo ? (
          // biome-ignore lint/performance/noImgElement: an owner-supplied photo from the Caelinex host
          <img
            className="vhero-video"
            src={own}
            srcSet={resized(own)}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
            alt=""
          />
        ) : (
          <video
            ref={ref}
            className="vhero-video"
            autoPlay
            muted
            loop
            playsInline
            preload={own ? "metadata" : "auto"}
            poster={
              own
                ? (content.poster ?? undefined)
                : "/video/guvira-hero-desktop.jpg"
            }
            aria-hidden="true"
            tabIndex={-1}
          >
            {own ? (
              <>
                {content.mobileMedia && isVideo(content.mobileMedia) && (
                  <source
                    src={content.mobileMedia}
                    media="(max-width: 767px)"
                  />
                )}
                <source src={own} />
              </>
            ) : (
              <>
                <source
                  src="/video/guvira-hero-mobile.webm"
                  type='video/webm; codecs="vp9"'
                  media="(max-width: 767px)"
                />
                <source
                  src="/video/guvira-hero-mobile.mp4"
                  type="video/mp4"
                  media="(max-width: 767px)"
                />
                <source
                  src="/video/guvira-hero-desktop.webm"
                  type='video/webm; codecs="vp9"'
                />
                <source src="/video/guvira-hero-desktop.mp4" type="video/mp4" />
              </>
            )}
          </video>
        )}
        <div className="vhero-copy">
          <Heading
            as="h1"
            id="hero-h"
            script={heading.script}
            caps={heading.caps}
            className="xl on-dark"
          />
          {subheading && <p>{subheading}</p>}
          <div className="vhero-actions">
            <PillLink href={link} className="vhero-cta">
              {label}
            </PillLink>
          </div>
        </div>
        {(!own || ownVideo) && (
          <button
            className="vhero-toggle"
            type="button"
            onClick={toggle}
            aria-pressed={paused}
            aria-label={paused ? "Play the video" : "Pause the video"}
          >
            <Icon name={paused ? "play" : "pause"} />
          </button>
        )}
      </div>
    </section>
  );
}
