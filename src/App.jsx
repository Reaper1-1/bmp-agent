import AutocompleteEditor from "./components/AutocompleteEditor";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <main className="space-y-8 max-w-5xl mx-auto">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Better Man Project – Site Kit
          </h1>
          <p className="text-sm text-gray-600">
            AS2 autocomplete wired into your custom editor.
          </p>
        </header>

        <section>
          <AutocompleteEditor />
        </section>
      </main>
    </div>
  );
}
