type StructuredDataProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

const StructuredData: React.FC<StructuredDataProps> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

export default StructuredData;
