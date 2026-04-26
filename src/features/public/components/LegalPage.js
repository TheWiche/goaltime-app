import PublicLayout from "shared/components/layout/PublicLayout";

function LegalPage({ title, children }) {
  return (
    <PublicLayout>
      <div className="bg-dark min-h-[25vh] flex items-center justify-center">
        <h1 className="text-white font-bold text-3xl md:text-4xl">{title}</h1>
      </div>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          {children}
        </div>
      </div>
    </PublicLayout>
  );
}

export default LegalPage;
