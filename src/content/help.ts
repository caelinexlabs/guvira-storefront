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
    summary: "How we ship, how long it takes, and how to send a piece back.",
    sections: [
      {
        heading: "Where we ship",
        body: [
          "Across India, and to the United Arab Emirates, Europe and Canada. Prices show in your own currency: rupees, dirhams, euros, Canadian or US dollars.",
        ],
      },
      {
        heading: "Delivery times and charges",
        body: [
          "The delivery time and charge for your address are shown at checkout, before you pay. Both depend on where you live. Some orders qualify for free delivery once the basket passes a set amount, and checkout shows when that applies.",
        ],
      },
      {
        heading: "Packing and dispatch",
        body: [
          "We pack each order and hand it to the courier. You get an email with your tracking link as soon as it ships. An order with several pieces can leave in more than one parcel, and each parcel has its own tracking link.",
        ],
      },
      {
        heading: "Tracking your order",
        body: [
          "Use the link in your shipping email, or the Track your order page with your order number and the email or mobile you ordered with. If you have an account, every order is listed there too.",
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
          "You can return a piece within 14 days of it being dispatched. To qualify, the piece must be unused, in its original condition and in its original packaging.",
          "Tell us if a piece arrives damaged or is not what you ordered. We will put it right, or refund it in full.",
        ],
      },
      {
        heading: "How to return an order",
        body: [
          "Sign in, open the order from your account and choose Return a piece. Pick the pieces and a reason, then send the request. The reasons are: it arrived damaged, I received the wrong piece, it isn’t as described, size or fit, I changed my mind, or something else.",
          "We review each request and email you the result. When we approve it, we email you how to send the parcel back. Please wait for that email before posting anything.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "We refund a return once the parcel reaches us and we have checked it. The refund covers what you paid for the returned pieces, with any discount on the order shared out fairly between them.",
          "Online payments go back to the card, UPI or bank account you paid with. Your bank can take a few working days to show it. For cash on delivery, we arrange the refund with you directly. You receive a credit note by email for every refund.",
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
          "Write to us from the Contact us page and quote your order number. We reply as soon as we can.",
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
