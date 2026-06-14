import ApiPlayground from "@/components/demo/ApiPlayground";

export const metadata = {
  title: "API Playground",
  description: "Configure extraction options, send a test request, and inspect the JSON response.",
};

const ApiPlaygroundPage: React.FC = () => {
  return <ApiPlayground />;
};

export default ApiPlaygroundPage;
