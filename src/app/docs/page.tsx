import DocsShell from "@/components/docs/DocsShell";
import { createMetadata, seoRoutes } from "@/lib/seo";

export const metadata = createMetadata(seoRoutes.docs);

const DocsPage: React.FC = () => {
  return <DocsShell />;
};

export default DocsPage;
