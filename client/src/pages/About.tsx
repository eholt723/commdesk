import { Link } from 'react-router-dom';

const PIPELINE_STEPS = [
  {
    label: 'A user connects',
    desc: 'When you open the app, a WebSocket connection is established instantly. The server sends you the last 50 events and the list of everyone currently online — no page reload needed.',
  },
  {
    label: 'Events come in',
    desc: 'Business events arrive continuously — orders, payments, support tickets, shipments, refunds. Each one is saved to a PostgreSQL database and broadcast to every connected user at the same time.',
  },
  {
    label: 'Every screen updates live',
    desc: 'All connected users see the same event appear in real time, without refreshing. The event stream, presence bar, and health stats all update the moment something happens.',
  },
  {
    label: 'The dashboard stays honest',
    desc: 'The health panel tracks real error rates — not simulated ones. If the database goes down mid-operation, that failure shows up immediately in the error rate.',
  },
];

const USE_CASES = [
  {
    title: 'E-Commerce Operations',
    desc: 'A fulfillment team needs every shift lead watching the same order stream. CommDesk puts orders, payments, and shipments on one shared screen — if a refund spike starts, everyone sees it at the same moment.',
  },
  {
    title: 'Support Center Management',
    desc: 'Support managers track ticket volume and incoming requests in real time. When a new ticket arrives, the whole team\'s dashboard updates instantly — no one is working off a stale queue.',
  },
  {
    title: 'Warehouse & Fulfillment',
    desc: 'Floor supervisors monitor shipment dispatches and flag delays as they happen. A live error rate on the health panel immediately surfaces when a processing step starts failing upstream.',
  },
  {
    title: 'Payment Processing Teams',
    desc: 'Finance and ops teams watch transaction success rates without pulling reports. The error rate counter reflects only real failures — so a rising number means something is actually wrong, not noise.',
  },
  {
    title: 'Startup Ops Dashboards',
    desc: 'Early-stage teams need a shared view of what\'s happening across the business without building custom internal tooling. CommDesk gives a live feed of key events to anyone with a browser tab open.',
  },
  {
    title: 'Sales Engineering & Demos',
    desc: 'Show a prospect a live system with real data flowing during a call. Open two windows, fire events in one, and watch both update — it\'s a concrete demonstration of real-time architecture without a slide deck.',
  },
];

const ACHIEVEMENTS = [
  'Real-time multi-user sync via WebSocket — all connected clients see every update instantly',
  'Live presence tracking — avatar chips appear and disappear as users connect and disconnect',
  'Event replay on connect — new users receive the last 50 events so no one starts with a blank screen',
  'Real error rate tracking — only genuine DB failures increment the error counter',
  'Full test suite: unit tests with mocked DB and integration tests against a live Neon database',
  'Automated CI/CD — Jest runs on every push; passing builds deploy automatically to Hugging Face Spaces',
  'Docker multi-stage build — client compiled, server transpiled, single production image',
  'Dark/light mode with localStorage persistence',
  'TypeScript strict mode end-to-end — no `any`, no implicit types',
];

const STACK = [
  { name: 'Node.js + Express', role: 'HTTP and WebSocket server' },
  { name: 'TypeScript', role: 'Strict types across the full stack' },
  { name: 'React 19 + Vite', role: 'Frontend UI' },
  { name: 'Tailwind CSS 4', role: 'Styling and dark mode' },
  { name: 'WebSockets (ws)', role: 'Real-time bidirectional messaging' },
  { name: 'PostgreSQL (Neon)', role: 'Serverless event persistence' },
  { name: 'Jest + ts-jest', role: 'Unit and integration testing' },
  { name: 'Docker', role: 'Multi-stage production build' },
  { name: 'GitHub Actions', role: 'CI/CD pipeline' },
  { name: 'Hugging Face Spaces', role: 'Hosted deployment' },
];

export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-14">

      {/* Hero */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          CommDesk
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          CommDesk is a live operations dashboard where multiple people can watch the same
          data update at the same time. Open it in two browser tabs and fire an event in
          one — both screens update instantly, without refreshing. Think of it as a shared
          scoreboard for a business's day-to-day activity.
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
          Built as a portfolio project to demonstrate real-time architecture, full-stack
          TypeScript, and production-grade deployment — the kind of system that shows up
          inside ops teams, support dashboards, and trading floors.
        </p>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
          How It Works
        </h2>
        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">{step.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Where This Gets Used */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Where This Gets Used
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          Any team that needs more than one person watching the same live data — without building
          custom infrastructure — is the target. Here are the contexts where a system like
          CommDesk fits naturally.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{uc.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What Was Built */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          What Was Built
        </h2>
        <ul className="space-y-2">
          {ACHIEVEMENTS.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-cyan-500 shrink-0 mt-0.5">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STACK.map((tech) => (
            <div
              key={tech.name}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tech.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tech.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Try the App
        </Link>
        <a
          href="https://github.com/eholt723/commdesk"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          View on GitHub
        </a>
      </section>

    </main>
  );
}
