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
    summary: "How and when we ship, and what we do if a piece arrives damaged.",
    sections: [
      {
        heading: "Where we ship",
        body: [
          "Across India, and to the United Arab Emirates, Europe and Canada. Prices show in your own currency: rupees, dirhams, euros, Canadian or US dollars.",
        ],
      },
      {
        heading: "Dispatch",
        body: [
          "We dispatch every order within 24 hours of it being placed. After that, delivery takes the standard shipping time for your address.",
          "You get an email with your tracking link as soon as it ships. An order with several pieces can leave in more than one parcel, and each parcel has its own tracking link.",
        ],
      },
      {
        heading: "Delivery times and charges",
        body: [
          "The delivery time and charge for your address are shown at checkout, before you pay. Both depend on where you live. Some orders qualify for free delivery once the basket passes a set amount, and checkout shows when that applies.",
        ],
      },
      {
        heading: "Tracking your order",
        body: [
          "Use the link in your shipping email, or the [Track your order](/orders/track) page with your order number and the email or mobile you ordered with. If you have an account, every order is listed there too.",
        ],
      },
      {
        heading: "Customs and duties",
        body: [
          "Orders to the United Arab Emirates, Europe and Canada may be charged import duty or taxes by the destination country. These are set by customs, not by us, and are paid by the person receiving the parcel.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "We do not accept returns at the moment. Please check the size and finish of a piece before you order, and write to us if you want help choosing.",
        ],
      },
      {
        heading: "Damaged or wrong pieces",
        body: [
          "If a piece arrives damaged, or is not the piece you ordered, we will replace it. The replacement ships to you within the same delivery time as your original order.",
          "To make a claim, record a video as you unbox the parcel. Film the sealed package first, then open it and show every piece inside, so we can see its condition and check it against your order. Then write to us from the [Contact us](/help/contact) page with your order number and the video.",
          "Without an unboxing video we cannot verify a claim, so please record it for every order.",
        ],
      },
      {
        heading: "Cancelling an order",
        body: [
          "An order that is still unpaid can be cancelled from the order page, and its stock goes back on sale. An unpaid order is cancelled automatically after a day. To cancel a paid order before it ships, contact us straight away.",
        ],
      },
      {
        heading: "Questions",
        body: [
          "Write to us from the [Contact us](/help/contact) page and quote your order number. We reply as soon as we can.",
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
