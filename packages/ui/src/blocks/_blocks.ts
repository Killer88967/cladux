// The blocks shown on /blocks and published to the registry. Each one is
// packages/ui/src/blocks/<name>.tsx with a default export.

export interface BlockMeta {
  name: string;
  title: string;
  description: string;
  category: "Marketing" | "Authentication" | "Application";
}

export const blocks: BlockMeta[] = [
  {
    name: "navbar-01",
    title: "Navbar",
    description: "A header with links, a call to action and a mobile menu.",
    category: "Marketing",
  },
  {
    name: "hero-01",
    title: "Centered hero",
    description: "Announcement, headline, two buttons and a product preview.",
    category: "Marketing",
  },
  {
    name: "hero-02",
    title: "Split hero",
    description: "Copy and an email sign-up on one side, a product card on the other.",
    category: "Marketing",
  },
  {
    name: "features-01",
    title: "Feature grid",
    description: "Six features with icons in a bordered grid.",
    category: "Marketing",
  },
  {
    name: "stats-01",
    title: "Stats",
    description: "Key numbers with trends and sparklines.",
    category: "Marketing",
  },
  {
    name: "pricing-01",
    title: "Pricing",
    description: "Three plans with a monthly and yearly switch.",
    category: "Marketing",
  },
  {
    name: "testimonials-01",
    title: "Testimonials",
    description: "Two rows of quotes scrolling in opposite directions.",
    category: "Marketing",
  },
  {
    name: "faq-01",
    title: "FAQ",
    description: "Common questions in an accordion next to a contact prompt.",
    category: "Marketing",
  },
  {
    name: "cta-01",
    title: "Call to action",
    description: "A closing banner with a headline and two buttons.",
    category: "Marketing",
  },
  {
    name: "footer-01",
    title: "Footer",
    description: "Link columns, a newsletter form and the small print.",
    category: "Marketing",
  },
  {
    name: "login-01",
    title: "Login card",
    description: "A centered sign-in card with social sign-in.",
    category: "Authentication",
  },
  {
    name: "login-02",
    title: "Split login",
    description: "A sign-in form next to a brand panel with a quote.",
    category: "Authentication",
  },
  {
    name: "signup-01",
    title: "Sign up",
    description: "Create an account with a live password strength meter.",
    category: "Authentication",
  },
  {
    name: "dashboard-01",
    title: "Dashboard",
    description: "A sidebar, stats, a chart and recent activity.",
    category: "Application",
  },
];
