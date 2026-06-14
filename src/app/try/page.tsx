import ExcelDemoWorkspace from "@/components/demo/ExcelDemoWorkspace";

export const metadata = {
  title: "Document to Excel Demo",
  description: "Upload a document, review the extracted table, and export it to Excel.",
};

const TryPage: React.FC = () => {
  return <ExcelDemoWorkspace />;
};

export default TryPage;
