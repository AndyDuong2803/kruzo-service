import ExcelDemoWorkspace from "@/components/demo/ExcelDemoWorkspace";
import StructuredData from "@/components/StructuredData";
import { createMetadata, seoRoutes, tryWebApplicationJsonLd } from "@/lib/seo";

export const metadata = createMetadata(seoRoutes.try);

const TryPage: React.FC = () => {
  return (
    <>
      <StructuredData data={tryWebApplicationJsonLd} />
      <ExcelDemoWorkspace />
    </>
  );
};

export default TryPage;
