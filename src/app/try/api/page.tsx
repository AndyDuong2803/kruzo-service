import ApiPlayground from "@/components/demo/ApiPlayground";
import { createMetadata, seoRoutes } from "@/lib/seo";

export const metadata = createMetadata(seoRoutes.apiPlayground);

const ApiPlaygroundPage: React.FC = () => {
  return <ApiPlayground />;
};

export default ApiPlaygroundPage;
