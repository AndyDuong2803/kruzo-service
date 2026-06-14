import Link from "next/link";
import { FiAlertCircle, FiCheckCircle, FiKey, FiLock } from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import Container from "@/components/Container";
import { createMetadata, seoRoutes } from "@/lib/seo";

export const metadata = createMetadata(seoRoutes.apiKeys);

const ApiKeysPage: React.FC = () => {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Developer access</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">API Keys</h1>
            <p className="mt-3 text-muted">
              Manage keys for Kruzo Document AI API access.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="min-w-0 space-y-5">
              <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
                <div className="brand-icon mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <FiAlertCircle size={22} aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-semibold">Beta access notice</h2>
                <p className="mt-3 break-words text-muted">
                  API keys are available for controlled beta workflows. Request access with a real document workflow so we can validate file types, fields, and review needs.
                </p>
                <Link href="/#audit" className="brand-button brand-button-primary button-pop mt-5 gap-2 px-5 py-2.5">
                  Request API access
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </div>

              <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
                <div className="brand-icon mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <FiLock size={22} aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-semibold">API key format</h2>
                <div className="mt-4 rounded-xl border border-border bg-card-muted p-4 font-mono text-sm">
                  kruzo_sk_live_xxxxxxxxxxxxxxxxx
                </div>
                <ul className="mt-4 grid gap-3 text-muted">
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-secondary" aria-hidden="true" />
                    Keep keys private.
                  </li>
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-secondary" aria-hidden="true" />
                    Do not expose production keys in frontend client code.
                  </li>
                  <li className="flex gap-3">
                    <FiCheckCircle className="mt-1 flex-shrink-0 text-secondary" aria-hidden="true" />
                    Use server-side calls for production workflows.
                  </li>
                </ul>
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              <div className="brand-card min-w-0 overflow-hidden rounded-2xl">
                <div className="border-b border-border bg-card-muted p-5">
                  <div className="flex items-center gap-3">
                    <FiKey className="text-secondary" size={22} aria-hidden="true" />
                    <h2 className="text-2xl font-semibold">Key management</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted">Backend key creation is coming later. This table shows the intended management surface.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-card-muted text-muted">
                      <tr>
                        <th className="border-b border-border px-4 py-3">Name</th>
                        <th className="border-b border-border px-4 py-3">Key</th>
                        <th className="border-b border-border px-4 py-3">Created</th>
                        <th className="border-b border-border px-4 py-3">Last used</th>
                        <th className="border-b border-border px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 font-semibold">Beta test key</td>
                        <td className="px-4 py-3 font-mono text-secondary">kruzo_sk_............</td>
                        <td className="px-4 py-3 text-muted">Not created yet</td>
                        <td className="px-4 py-3 text-muted">-</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-border bg-card-muted px-3 py-1 font-semibold text-muted">
                            Waiting for access
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row">
                  <button type="button" disabled className="brand-button brand-button-secondary cursor-not-allowed px-5 py-2.5 opacity-70">
                    Create new key - Coming soon
                  </button>
                  <button type="button" disabled className="brand-button brand-button-secondary cursor-not-allowed px-5 py-2.5 opacity-70">
                    Revoke - Coming soon
                  </button>
                </div>
              </div>

              <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
                <h2 className="text-2xl font-semibold">Usage example</h2>
                <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card-muted p-4 font-mono text-sm">
                  KRUZO_API_KEY=kruzo_sk_live_xxxxxxxxxxxxxxxxx
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/try/api" className="brand-button brand-button-primary button-pop px-5 py-2.5">
                    Open API Playground
                  </Link>
                  <Link href="/docs" className="brand-button brand-button-secondary button-pop px-5 py-2.5">
                    Read Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ApiKeysPage;
