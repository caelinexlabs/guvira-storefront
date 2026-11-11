// Help pages. Anything Guvira hasn't decided yet is stated as such, never invented.
export type HelpTopic = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string[] }[];
};

export const HELP: HelpTopic[] = [
  {
    slug: "shipping",
    title: "Shipping and returns",
    summary: "Where we ship, and what happens after you order.",
    sections: [
      {
        heading: "Where we ship",
        body: [
          "Across India, and to the United Arab Emirates, Europe and Canada. Prices show in your own currency: rupees, dirhams, euros, Canadian or US dollars.",
        ],
      },
      {
        heading: "Delivery times and costs",
        body: [
          "Delivery times and charges for your address are shown at checkout, before you pay.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "Our returns policy is being finalised and will be published here before online orders open.",
        ],
      },
    ],
  },
  {
    slug: "sizes",
    title: "Ring size guide",
    summary: "Find your size before you order a ring.",
    sections: [
      {
        heading: "Measure a ring you already wear",
        body: [
          "Take a ring that fits the finger you want to wear it on. Measure straight across the inside, from edge to edge, in millimetres.",
          "Match that measurement to the size chart shown with each ring.",
        ],
      },
      {
        heading: "Between sizes?",
        body: [
          "Choose the larger size. Fingers are slightly bigger at the end of the day and in warm weather.",
        ],
      },
    ],
  },
  {
    slug: "care",
    title: "Jewellery care",
    summary: "Keep every piece bright for longer.",
    sections: [
      {
        heading: "Anti-tarnish gold",
        body: [
          "Waterproof, so washing your hands or a sweaty day won’t dull it. Pat it dry after water and store it dry.",
          "Keep perfume, lotion and hairspray off the piece: put jewellery on last and take it off first.",
        ],
      },
      {
        heading: "Gold and silver oxidised",
        body: [
          "Keep oxidised pieces dry and wipe them with a soft, dry cloth so the antique finish stays even. Avoid polishing cloths and cleaners, which lift the darkened detail.",
        ],
      },
      {
        heading: "AD stones",
        body: [
          "Wipe stones with a soft cloth to bring back their sparkle. Store pieces apart so stones don’t scratch other jewellery.",
        ],
      },
    ],
  },
  {
    slug: "orders",
    title: "Track your order",
    summary: "Follow your order from packing to delivery.",
    sections: [
      {
        heading: "Order tracking",
        body: [
          "Enter your order number and the email or mobile you ordered with on the Track your order page to see its status, parcels and tracking links.",
        ],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact us",
    summary: "Questions about a piece, a size or an order.",
    sections: [
      {
        heading: "Write to us",
        body: [
          "Ask about sizes, finishes, gifting or an order and we’ll help you choose.",
        ],
      },
    ],
  },
];

export const helpTopic = (slug: string) => HELP.find((h) => h.slug === slug);
